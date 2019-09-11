import * as path from 'path'
import * as puppeteer from 'puppeteer'
import { Manager } from './Extensions'
import { Extension, Logger } from "./types"
import { DownloadGenerator } from './Download'

const PACKAGE_JSON = require( path.join( __dirname, '../package.json' ) );

export const Version = PACKAGE_JSON.version;

export class MediaDownloader
{
	private logger: Logger;
	private manager: Manager;
	private browser: puppeteer.Browser;
	private dl: ( url: string, file?: string ) => Promise<void>;

	constructor( dir: string | null, quiet?: boolean )
	{
		this.dl = DownloadGenerator(  dir === null ? path.join( __dirname,'../media' ) : ( path.isAbsolute( dir ) ? dir : path.join( process.cwd(), dir ) ) );
		this.logger = quiet ?
		{
			log: () => {},
			error: () => {},
		}: {
			log: ( ... messages: any[] ) => { console.log( ... messages ); },
			error: ( ... messages: any[] ) => { console.error( ... messages ); },
		};
		this.manager = new Manager();
	}

	public load()
	{
		return this.manager.load( this.logger ).then( () => { return puppeteer.launch(
		{
			args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
		} ) } ).then( ( browser ) =>
		{
			this.browser = browser;
		} );
	}

	public close() { this.browser.close(); }

	public download( url: string | string[] ): Promise<{ url: string, error: null | any }[]>
	{
		if ( !Array.isArray( url ) ) { url = [ url ]; }
		return Promise.all( url.map( ( url ) =>
		{
			return this.manager.extension( url ).then( ( extension ) =>
			{
				return this.scraping( extension, url );
			} ).then( () =>
			{
				this.logger.log( 'Success:', url );
				return { url: url , error: null};
			} ).catch( ( error ) =>
			{
				this.logger.error( 'Failure:', url );
				return { url: url, error: error };
			} );
		} ) );
	}

	public async scraping( extension: Extension, url: string )
	{
		const page = await this.browser.newPage();
	
		await page.goto( extension.before( page, url ) );
		//await Promise.all(
		//[
		//	page.waitForNavigation( { waitUntil: 'networkidle0' } ),
		//	page.waitForNavigation( { waitUntil: 'domcontentloaded' } ),
		//] );
		//await new Promise((r)=>{setTimeout(r,2000);});
		//await page.waitForNavigation();
		const files = await extension.after( page );
		if ( files.length <= 0 ) { await page.close(); throw new Error( 'No download files.' ); }
		const errors: string[] = [];
		for ( let url of files )
		{
			try
			{
				await this.dl( url );
				this.logger.log( 'Success:', url );
			} catch ( error )
			{
				this.logger.error( 'Failure:', url );
			}
		}
		await page.close();
		if ( 0 < errors.length )
		{
			throw new Error( errors.length === files.length ?
				'Download failure: all.' :
				'Download failure: ' + errors.length + '/' + files.length );
		}
	}
}
