import * as puppeteer from 'puppeteer'

export type Page = puppeteer.Page;

export interface Logger
{
	log: ( ... messages: any[] ) => void;
	error: ( ... messages: any[] ) => void;
}

export interface Extension
{
	init( logger: Logger ): Promise<void>;

	/**
	 * @param url Get URL.
	 * @returns true is Scraping target.
	 */
	isTarget( url: string ): boolean;
	/**
	 * @param url Get URL.
	 * @param url Get URL.
	 */
	before( page: Page, url: string ): string;
	/**
	 * @param 
	*/
	after( page: Page ): Promise<string[]>;
}
