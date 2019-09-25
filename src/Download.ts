import { URL } from 'url'
import * as path from 'path'
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'

function FileName( dir: string, headers: http.IncomingHttpHeaders )
{
	let file = '';

	if ( headers[ "content-disposition" ] )
	{
		for ( let value of headers[ "content-disposition" ].split( ';' ) )
		{
			if ( !value.includes( '=' ) ) { continue; }
			const kv = value.split( '=' );
			if ( kv[ 0 ].indexOf( 'filename' ) !== 0 ) { continue; }
			const f = kv.join( '=' );
			if ( kv.shift() === 'filename' )
			{
				file = f.replace( /\"(.+)\"/, '$1' );
			} else
			{
				// UTF-8
				file = f.replace( /[^\'']*\'\'(.*)/, '$1' );
			}
			if ( file === f ) { file = ''; }
		}

		if ( file ) { return file; }
	}

	let count = 0;
	do
	{
		file = path.join( dir, '_tmp' + count );
		try
		{
			const stat = fs.statSync( file );
		} catch ( error ) { break; }
	} while( ++count );

	return file;
}

export function Download( url: string, dir: string, file?: string )
{
	const u = new URL( url );
	if ( !file ) { file = u.pathname.split( '/' ).pop() || ''; }
	if ( file ) { file = path.join( dir, file ); }

	const htt = u.protocol === 'https:' ? https : http;

	return new Promise<void>( ( resolve, reject ) =>
	{
		const request = htt.get( url, ( response ) =>
		{
			if ( !file ) { file = FileName( dir, response.headers ); }
			const write = fs.createWriteStream( file );
			write.on( 'finish', () =>
			{
				write.close();
				resolve();
			} );
			response.pipe( write );
		} );
		request.on( 'abort', reject );
		request.on( 'timeout', reject );
	} );
}

export function DownloadGenerator( dir: string )
{
	try
	{
		try
		{
			const stat = fs.statSync( dir );
			if ( !stat.isDirectory() ) { fs.mkdirSync( dir ); }
		} catch ( error ) { fs.mkdirSync( dir ); }
	} catch ( error ) { console.error( error ); process.exit( 1 ); }

	return ( url: string, file?: string ) =>
	{
		return Download(  url, dir, file );
	};
}
