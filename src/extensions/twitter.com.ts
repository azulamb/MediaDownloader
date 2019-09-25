import { Extension, Page, Logger } from "../types";
import { URL } from 'url'

type ADVERTISER_ACCOUNT_TYPE = 'none' | 'promotable_user';
type ADVERTISER_ACCOUNT_SERVICE_LEVELS = 'analytics';

interface TimelineItem
{
	item:
	{
		content:
		{
			tweet:{
				id: string;
				displayType: string;
				hasModeratedReplies: boolean;
			};
		};
	};
};

interface TimelineModule
{
	timelineModule:
	{
		items:
		{
			entryId: string;
			item:
			{
				content:
				{
					tweet:
					{
						id: string;
						displayType: 'Tweet';
					};
				};
				clientEventInfo:
				{
					details:
					{
						timelinesDetails:
						{
							controllerData: string;
						};
						conversationDetails:
						{
							conversationSection: 'HighQuality';
						};
					};
				};
			};
		}[];
		displayType: 'VerticalConversation';
		clientEventInfo:
		{
			details:
			{
				conversationDetails:
				{
					conversationSection: 'HighQuality';
				};
			};
		};
	};
}

interface TimelineOperation
{
	operation:
	{
		cursor:
		{
			value: string;
			cursorType: 'Bottom';
		};
	};
}

interface ColorPalette
{
	rgb:
	{
		red: number;
		green: number;
		blue: number;
	};
	percentage:number;
}

interface MediaStats
{
	r:
	{
		missing: null;
		ok?: {
			viewCount: number;
		};
	};
	ttl: number;
};

interface URLData
{
	url: string;
	expanded_url: string;
	display_url: string;
	indices: number[];
}

interface TwitterUser
{
	id_str: string;
	name: string;
	screen_name: string;
	location: string;
	description: string;
	url?: string;
	entities:
	{
		url?:
		{
			urls: URLData[];
		};
		description: {
			urls?: URLData[];
		};
	};
	followers_count: number;
	fast_followers_count: number;
	normal_followers_count: number;
	friends_count: number;
	listed_count: number;
	created_at: string;
	favourites_count: number;
	geo_enabled?: boolean;
	statuses_count: number
	media_count: number;
	profile_image_url_https: string;
	profile_banner_url: string;
	profile_image_extensions_alt_text: null;
	profile_image_extensions_media_availability: null;
	profile_image_extensions_media_color:
	{
		palette: ColorPalette[];
	};
	profile_image_extensions:
	{
		mediaStats: MediaStats;
	};
	profile_banner_extensions_alt_text: null;
	profile_banner_extensions_media_availability: null;
	profile_banner_extensions_media_color:
	{
		palette: ColorPalette[];
	};
	profile_banner_extensions:
	{
		mediaStats: MediaStats;
		profile_link_color?: string;
		has_extended_profile?: boolean;
		default_profile?: boolean;
		pinned_tweet_ids?: number[];
		pinned_tweet_ids_str?: string[];
		has_custom_timelines?: boolean;
		advertiser_account_type?: ADVERTISER_ACCOUNT_TYPE;
		advertiser_account_service_levels?: ADVERTISER_ACCOUNT_SERVICE_LEVELS[];
		profile_interstitial_type?: 'sensitive_media' | '';
		business_profile_state?: 'none';
		translator_type?: 'none';
	};
	profile_link_color?: string;
	has_extended_profile?: boolean;
	pinned_tweet_ids?: number[];
	pinned_tweet_ids_str?: string[];
	has_custom_timelines?: boolean;
	advertiser_account_type?: ADVERTISER_ACCOUNT_TYPE;
	advertiser_account_service_levels?: ADVERTISER_ACCOUNT_SERVICE_LEVELS[];
	profile_interstitial_type?: string;
	business_profile_state: 'none';
	translator_type: 'none';
}

interface SimpleUserData
{
	screen_name: string;
	name: string;
	id_str: string;
	indices: number[];
}

interface ImageSize
{
	w: number;
	h: number;
	resize: 'fit' | 'crop';
}

interface FaceData
{
	faces: [];
}

interface MediaData
{
	id_str: string;
	indices: number[];
	media_url: string;
	media_url_https: string;
	url: string;
	display_url: string;
	expanded_url: string;
	type: 'photo' | 'video' | 'animated_gif';
	original_info:
	{
		width: number;
		height: number;
		focus_rects: {
			x: number;
			y: number;
			h: number;
			w: number;
		}[];
	};
	sizes:
	{
		small: ImageSize;
		large: ImageSize;
		thumb: ImageSize;
		medium: ImageSize;
	};

	features?:
	{
		small: FaceData;
		large: FaceData;
		orig: FaceData;
		medium: FaceData;
	};
	video_info?:
	{
		aspect_ratio: number[];
		duration_millis: number;
		variants:
		{
			bitrate?: number;
			content_type: 'video/mp4' | 'application/x-mpegURL';
			url: string;
		}[];
	};
	media_key?: string;
	ext_media_color?:
	{
		palette: ColorPalette;
	} | null;
	ext_media_availability?:
	{
		status: 'available';
	}
	ext_alt_text?: null;
	ext?:
	{
		mediaStats: MediaStats;
	};
	additional_media_info?:
	{
		monetizable: boolean;
	}
}

interface TweetData
{
	created_at: string;
	id_str: string;
	full_text: string;
	display_text_range: number[];
	entities:
	{
		user_mentions: SimpleUserData[];
		hashtags?:
		{
			text: string;
			indices: number[];
		}[];
		media: MediaData[];
	};
	extended_entities:
	{
		media: MediaData[];
	};
	source: string;
	in_reply_to_status_id_str?: string;
	in_reply_to_user_id_str?: string;
	in_reply_to_screen_name?: string;
	user_id_str: string;
	retweet_count: number;
	favorite_count: number;
	reply_count: number;
	conversation_id_str: string;
	possibly_sensitive_editable?: boolean;
	lang: 'ja';
}

interface TweetPageData
{
	globalObjects:
	{
		tweets: { [ key: string ]: TweetData };
		users: { [ key: string ]: TwitterUser };
		moments: {};
		cards: {};
		places: {};
		media: {};
		broadcasts: {};
	};
	timeline:
	{
		id: string;
		instructions:
		{
			addEntries:
			{
				entries:
				{
					entryId: string;
					sortIndex: string;
					content: TimelineItem | TimelineModule | TimelineOperation;
				}[];
			};
		}[];
		responseObjects:
		{
			feedbackActions: {};
		};
	},
}

export default class implements Extension
{
	private p: Promise<TweetPageData>;

	private logger: Logger;

	public init( logger: Logger )
	{
		this.logger = logger;
		return Promise.resolve();
	}

	public isTarget( url: string ) { return new URL( url ).hostname.match( 'twitter.com' ) !== null; }

	public before( page: Page, url: string )
	{
		this.p = new Promise<TweetPageData>( ( resolve, reject ) =>
		{
			page.on('requestfinished', ( request ) =>
			{
				if ( !request.url().match( /^https\:\/\/api.twitter.com\/2\/timeline\/conversation\/\d+\.json/ ) ) { return; }
				const response = request.response();
				if ( !response ) { return; }
				response.json().then( resolve ).catch( reject );
			} );
		} );
		const u = new URL( url );
		u.hostname = 'mobile.twitter.com';
		u.pathname = u.pathname.replace( /\/photo\/(\d+)$/, '' );
		this.logger.log( url, '=>', u.toString() );
		return u.toString();
	}

	public async after( page: Page )
	{
		return this.p.then( ( data ) =>
		{
			this.logger.debug( data );
			const tweets = data.globalObjects.tweets;
			const images: string[] = [];
			Object.keys( tweets ).map( ( key ) => { return tweets[ key ]; } ).filter( ( tweet ) =>
			{
				return !!tweet.extended_entities;
			} ).map( ( tweet ) =>
			{
				this.logger.debug( tweet );
				const iparams = '?name=large';
				for ( let media of tweet.extended_entities.media )
				{
					if ( media.type === 'video' || media.type === 'animated_gif' )
					{
						if ( !media.video_info ) { continue; }
						const list = media.video_info.variants;
						let max = 0;
						for ( let i = 1 ; i < list.length ; ++i )
						{
							if ( ( list[ max ].bitrate || 0 ) < ( list[ i ].bitrate || 0 ) )
							{
								max = i;
							}
						}
						images.push( list[ max ].url );
					} else
					{
						images.push( media.media_url_https + iparams );
					}
				}
			} );
			return images;
		} );
	}

}
