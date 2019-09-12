import * as puppeteer from 'puppeteer';
export declare type Page = puppeteer.Page;
export interface Logger {
    log: (...messages: any[]) => void;
    error: (...messages: any[]) => void;
}
export interface Extension {
    init(logger: Logger): Promise<void>;
    isTarget(url: string): boolean;
    before(page: Page, url: string): string;
    after(page: Page): Promise<string[]>;
}
