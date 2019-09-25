import * as path from 'path'
import * as puppeteer from 'puppeteer'
import { Manager } from './Extensions'
import { Extension, Logger } from "./types"
import { DownloadGenerator } from './Download'

const PACKAGE_JSON = require( path.join( __dirname, '../package.json' ) );

export const Version = PACKAGE_JSON.version;

export interface SuccessResult
{
	url: string;
	files:
	{
		url: string;
		error?: any;
	}[];
}

export interface FailureResult
{
	url: string;
	error: any;
}

export class MediaDownloader
{
	private logger: Logger;
	private manager: Manager;
	private browser: puppeteer.Browser;
	private dl: ( url: string, file?: string ) => Promise<void>;

	constructor( dir: string | null, quiet?: boolean, debug?: boolean )
	{
		this.dl = DownloadGenerator(  dir === null ? path.join( __dirname,'../media' ) : ( path.isAbsolute( dir ) ? dir : path.join( process.cwd(), dir ) ) );
		this.logger = quiet ?
		{
			log: () => {},
			debug: () => {},
			error: () => {},
		}: {
			log: ( ... messages: any[] ) => { console.log( ... messages ); },
			debug: () => {},
			error: ( ... messages: any[] ) => { console.error( ... messages ); },
		};
		if ( debug )
		{
			this.logger.debug =  ( ... messages: any[] ) => { console.debug( ... messages ); };
		}
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

	public download( url: string | string[] ): Promise<(SuccessResult|FailureResult)[]>
	{
		if ( !Array.isArray( url ) ) { url = [ url ]; }
		return Promise.all( url.map( ( url ) =>
		{
			return this.manager.extension( url ).then( ( extension ) =>
			{
				return this.scraping( extension, url );
			} ).then( ( result ) =>
			{
				this.logger.log( 'Success:', url );
				return <SuccessResult>{ url: url, files: result.files };
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
		const urls: { url: string, error?: any }[] = [];
		for ( let url of files )
		{
			try
			{
				await this.dl( url );
				urls.push( { url: url } );
				this.logger.log( 'Success:', url );
			} catch ( error )
			{
				urls.push( { url: url, error: error } );
				this.logger.error( 'Failure:', url );
			}
		}
		await page.close();

		return { url: url, files: urls };
	}
}
