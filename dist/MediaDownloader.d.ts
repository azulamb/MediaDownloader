import { Extension } from "./types";
export declare const Version: any;
export declare class MediaDownloader {
    private logger;
    private manager;
    private browser;
    private dl;
    constructor(dir: string | null, quiet?: boolean);
    load(): Promise<void>;
    close(): void;
    download(url: string | string[]): Promise<{
        url: string;
        error: null | any;
    }[]>;
    scraping(extension: Extension, url: string): Promise<void>;
}
