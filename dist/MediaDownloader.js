"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const puppeteer = require("puppeteer");
const Extensions_1 = require("./Extensions");
const Download_1 = require("./Download");
const PACKAGE_JSON = require(path.join(__dirname, '../package.json'));
exports.Version = PACKAGE_JSON.version;
class MediaDownloader {
    constructor(dir, quiet) {
        this.dl = Download_1.DownloadGenerator(dir === null ? path.join(__dirname, '../media') : (path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir)));
        this.logger = quiet ?
            {
                log: () => { },
                error: () => { },
            } : {
            log: (...messages) => { console.log(...messages); },
            error: (...messages) => { console.error(...messages); },
        };
        this.manager = new Extensions_1.Manager();
    }
    load() {
        return this.manager.load(this.logger).then(() => {
            return puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }).then((browser) => {
            this.browser = browser;
        });
    }
    close() { this.browser.close(); }
    download(url) {
        if (!Array.isArray(url)) {
            url = [url];
        }
        return Promise.all(url.map((url) => {
            return this.manager.extension(url).then((extension) => {
                return this.scraping(extension, url);
            }).then((result) => {
                this.logger.log('Success:', url);
                return { url: url, files: result.files };
            }).catch((error) => {
                this.logger.error('Failure:', url);
                return { url: url, error: error };
            });
        }));
    }
    async scraping(extension, url) {
        const page = await this.browser.newPage();
        await page.goto(extension.before(page, url));
        const files = await extension.after(page);
        if (files.length <= 0) {
            await page.close();
            throw new Error('No download files.');
        }
        const urls = [];
        for (let url of files) {
            try {
                await this.dl(url);
                urls.push({ url: url });
                this.logger.log('Success:', url);
            }
            catch (error) {
                urls.push({ url: url, error: error });
                this.logger.error('Failure:', url);
            }
        }
        await page.close();
        return { url: url, files: urls };
    }
}
exports.MediaDownloader = MediaDownloader;
