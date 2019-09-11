"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
;
;
class default_1 {
    init(logger) {
        this.logger = logger;
        return Promise.resolve();
    }
    isTarget(url) { return new url_1.URL(url).hostname.match('twitter.com') !== null; }
    before(page, url) {
        this.p = new Promise((resolve, reject) => {
            page.on('requestfinished', (request) => {
                if (!request.url().match(/^https\:\/\/api.twitter.com\/2\/timeline\/conversation\/\d+\.json/)) {
                    return;
                }
                const response = request.response();
                if (!response) {
                    return;
                }
                response.json().then(resolve).catch(reject);
            });
        });
        const u = new url_1.URL(url);
        u.hostname = 'mobile.twitter.com';
        u.pathname = u.pathname.replace(/\/photo\/(\d+)$/, '');
        this.logger.log(url, '=>', u.toString());
        return u.toString();
    }
    async after(page) {
        return this.p.then((data) => {
            const tweets = data.globalObjects.tweets;
            const images = [];
            Object.keys(tweets).map((key) => { return tweets[key]; }).filter((tweet) => {
                return !!tweet.extended_entities;
            }).map((tweet) => {
                for (let media of tweet.extended_entities.media) {
                    if (media.type === 'video') {
                        if (!media.video_info) {
                            continue;
                        }
                        const list = media.video_info.variants;
                        let max = 0;
                        for (let i = 1; i < list.length; ++i) {
                            if ((list[max].bitrate || 0) < (list[i].bitrate || 0)) {
                                max = i;
                            }
                        }
                        images.push(list[max].url);
                    }
                    else {
                        images.push(media.media_url_https);
                    }
                }
            });
            return images;
        });
    }
}
exports.default = default_1;
