"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadInstagram = void 0;
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = require("node-html-parser");
const https_1 = __importDefault(require("https"));
function getVideoLinkFromHtml(html) {
    return __awaiter(this, void 0, void 0, function* () {
        let crop = "{\"" + html.substring(html.search("video_url"), html.search("video_url") + 1000);
        crop = crop.substring(0, crop.search(",")) + "}";
        return JSON.parse(crop).video_url;
    });
}
function getPostLink(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // remove all query params from url
            let idxOfQues = -1;
            for (let i = 0; i < url.length; i++) {
                if (url[i] === '?') {
                    idxOfQues = i;
                    break;
                }
            }
            if (idxOfQues !== -1) {
                url = url.substring(0, idxOfQues);
            }
            if (url.endsWith('/')) {
                url += 'embed/captioned';
            }
            else
                url += '/embed/captioned';
            let res = yield axios_1.default.get(url);
            let link = '';
            let root = (0, node_html_parser_1.parse)(res.data);
            if (res.data.search("video_url") !== -1) {
                link = yield getVideoLinkFromHtml(res.data);
            }
            else {
                link = root.querySelector('img.EmbeddedMediaImage').getAttribute("src");
            }
            return link;
        }
        catch (err) {
            console.log(err.message);
            throw new Error(`error while getting instagram post link for html, reason: ${err.message}`);
        }
    });
}
function downloadInstagram(url, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let postLink = yield getPostLink(url);
            https_1.default.get(postLink, (res) => {
                res.pipe(response);
            });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.downloadInstagram = downloadInstagram;
//# sourceMappingURL=instagram.js.map