import { Extension, Logger } from "./types";
import * as path from 'path'
import * as fs from 'fs'

function Dirs( dir: string )
{
	return fs.promises.readdir( path.join( __dirname, dir ) ).then( ( files ) =>
	{
		return files.filter( ( file ) => { return file.match( '\.js$' ); } ).map( ( file ) => { return path.join( __dirname, dir, file ); } );
	} ).catch( ( error ) => { return <string[]>[]; } );
}

function LoadExtension( file: string, logger: Logger )
{
	return new Promise<Extension>( ( resolve, reject ) =>
	{
		try
		{
			const mod = require( file );
			if ( typeof mod.default !== 'function' ) { throw new Error( 'No class.' ); }
			const extension: Extension = new ( mod.default )();
			if ( typeof extension.isTarget !== 'function' || typeof extension.before !== 'function' || typeof extension.after !== 'function' ) { throw new Error( 'No Extension.method .' ); }
			resolve( extension );
		} catch( error ) { reject( error ); };
	} ).then( ( extension ) =>
	{
		return extension.init( logger ).then( () => { return extension; } );
	} ).catch( ( error ) => { return null; } );
}

export class Manager
{
	private extensions: Extension[];

	constructor()
	{
		this.extensions = [];
	}

	public load( logger: Logger )
	{
		return Dirs( './extensions' ).then( ( files ) =>
		{
			return Promise.all( files.map( ( file ) => { return LoadExtension( file, logger ); } ) );
		} ).then( ( extensions ) =>
		{
			for ( let extension of extensions )
			{
				if ( extension ) { this.extensions.push( extension ); }
			}
		} );
	}

	public extension( url: string )
	{
		for ( let extension of this.extensions )
		{
			if ( extension.isTarget( url ) ) { return Promise.resolve( extension ); }
		}
		return Promise.reject( new Error( 'No extension.' ) );
	}
}
