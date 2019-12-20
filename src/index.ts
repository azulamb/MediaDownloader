import * as mdl from './MediaDownloader'

export const Version = mdl.Version;
export const MediaDownloader = mdl.MediaDownloader;

if ( require.main === module ) { Exec(); }

function Help()
{
	console.log( `SNS Media downloader.
Version ${ Version }

Target SNS: Twitter

Syntax:   mdl [options] [url ...]
Options:
 -h, --help     Print this message.
 -q             No output log.
 -d DIR         Save download directory. Default ./media
 --debug        Debug mode.
 -v, --version  Print version.
` );
	process.exit( 0 );
}

function Ver()
{
	console.log( 'Version ' + Version );
	process.exit( 0 );
}

export async function Exec()
{
	const arg = ( () =>
	{
		const arg = { url: <string[]>[], dir: <string|null>null, quiet: false, debug: false };
		for ( let i = 2 ; i < process.argv.length; ++i )
		{
			if ( process.argv[ i ].indexOf( 'http' ) === 0 )
			{
				arg.url.push( process.argv[ i ] );
			} else
			{
				switch ( process.argv[ i ] )
				{
					case '-q': arg.quiet = true; break;
					case '-d': { const d = process.argv[ ++i ]; if ( d !== undefined ) { arg.dir = d; } } break;
					case '--debug': arg.debug = true; break;
					case '-h':
					case '--help': Help(); break;
					case '-v':
					case '--version': Ver(); break;
				}
			}
		}
		return arg;
	} )();

	const m = new mdl.MediaDownloader( arg.dir, arg.quiet, arg.debug );

	if ( arg.url.length <= 0 )
	{
		if ( !arg.quiet ) { console.error( 'No url...' ); }
		process.exit( 1 );
	}
	const ErrorExit = async () =>
	{
		await m.close();
		process.exit( 2 );
	};
	process.on( 'SIGHUP', ErrorExit );
	process.on( 'SIGINT', ErrorExit );
	process.on( 'SIGBREAK', ErrorExit );
	//process.on( 'SIGKILL', ErrorExit );
	process.on( 'SIGTERM', ErrorExit );

	await m.load().catch( ( error ) => { console.error( error ); } );
	await m.download( arg.url ).catch( ( error ) => { console.error( error ); } );
	await m.close();
}
