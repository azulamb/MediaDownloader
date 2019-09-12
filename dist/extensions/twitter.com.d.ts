import { Extension, Page, Logger } from "../types";
export default class implements Extension {
    private p;
    private logger;
    init(logger: Logger): Promise<void>;
    isTarget(url: string): boolean;
    before(page: Page, url: string): string;
    after(page: Page): Promise<string[]>;
}
