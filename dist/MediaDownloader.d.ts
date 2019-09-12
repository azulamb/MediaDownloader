import { Extension } from "./types";
export declare const Version: any;
interface SuccessResult {
    url: string;
    files: {
        url: string;
        error?: any;
    }[];
}
interface FailureResult {
    url: string;
    error: any;
}
export declare class MediaDownloader {
    private logger;
    private manager;
    private browser;
    private dl;
    constructor(dir: string | null, quiet?: boolean);
    load(): Promise<void>;
    close(): void;
    download(url: string | string[]): Promise<(SuccessResult | FailureResult)[]>;
    scraping(extension: Extension, url: string): Promise<{
        url: string;
        files: {
            url: string;
            error?: any;
        }[];
    }>;
}
export {};
