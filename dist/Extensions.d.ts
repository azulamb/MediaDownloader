import { Extension, Logger } from "./types";
export declare class Manager {
    private extensions;
    constructor();
    load(logger: Logger): Promise<void>;
    extension(url: string): Promise<Extension>;
}
