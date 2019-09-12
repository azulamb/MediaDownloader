export declare function Download(url: string, dir: string, file?: string): Promise<void>;
export declare function DownloadGenerator(dir: string): (url: string, file?: string | undefined) => Promise<void>;
