import { MediaDownloader, Version } from './MediaDownloader'

export const MDL = MediaDownloader;

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
		const arg = { url: <string[]>[], dir: <string|null>null, quiet: false };
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
					case '-h':
					case '--help': Help(); break;
					case '-v':
					case '--version': Ver(); break;
				}
			}
		}
		return arg;
	} )();

	const mdl = new MediaDownloader( arg.dir, arg.quiet );

	if ( arg.url.length <= 0 )
	{
		if ( !arg.quiet ) { console.error( 'No url...' ); }
		process.exit( 1 );
	}

	await mdl.load();
	await mdl.download( arg.url );
	await mdl.close();
}
