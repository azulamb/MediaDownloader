"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
function Dirs(dir) {
    return fs.promises.readdir(path.join(__dirname, dir)).then((files) => {
        return files.filter((file) => { return file.match('\.js$'); }).map((file) => { return path.join(__dirname, dir, file); });
    }).catch((error) => { return []; });
}
function LoadExtension(file, logger) {
    return new Promise((resolve, reject) => {
        try {
            const mod = require(file);
            if (typeof mod.default !== 'function') {
                throw new Error('No class.');
            }
            const extension = new (mod.default)();
            if (typeof extension.isTarget !== 'function' || typeof extension.before !== 'function' || typeof extension.after !== 'function') {
                throw new Error('No Extension.method .');
            }
            resolve(extension);
        }
        catch (error) {
            reject(error);
        }
        ;
    }).then((extension) => {
        return extension.init(logger).then(() => { return extension; });
    }).catch((error) => { return null; });
}
class Manager {
    constructor() {
        this.extensions = [];
    }
    load(logger) {
        return Dirs('./extensions').then((files) => {
            return Promise.all(files.map((file) => { return LoadExtension(file, logger); }));
        }).then((extensions) => {
            for (let extension of extensions) {
                if (extension) {
                    this.extensions.push(extension);
                }
            }
        });
    }
    extension(url) {
        for (let extension of this.extensions) {
            if (extension.isTarget(url)) {
                return Promise.resolve(extension);
            }
        }
        return Promise.reject(new Error('No extension.'));
    }
}
exports.Manager = Manager;
