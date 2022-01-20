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
const express_1 = __importDefault(require("express"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const path_1 = __importDefault(require("path"));
const instagram_1 = require("./instagram");
const app = (0, express_1.default)();
app.use('/static', express_1.default.static(path_1.default.resolve(__dirname + '/../static')));
app.get('/', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        response.sendFile(path_1.default.resolve(__dirname + '/../static/index.html'));
    }
    catch (err) {
        next(err);
    }
}));
app.get('/validate', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { url } = request.query;
        if (!url) {
            return response.status(400).json({
                message: `url is missing from the request, please add a valid url and try again.`
            });
        }
        url = url.toString();
        let websiteType = yield findWebsiteType(url);
        if (websiteType === 'invalid') {
            return response.status(400).json({
                message: `website is either invalid or not supported yet`
            });
        }
        return response.send({
            message: "website looks good"
        });
    }
    catch (err) {
        next(err);
    }
}));
app.get('/download', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { url } = request.query;
        if (!url) {
            return response.status(400).json({
                message: `url is missing from request`
            });
        }
        url = url.toString();
        let websiteType = yield findWebsiteType(url);
        if (websiteType === 'instagram') {
            return (0, instagram_1.downloadInstagram)(url, response, next);
        }
        else if (websiteType == 'youtube') {
            return downloadYoutube(url, response, next);
        }
    }
    catch (err) {
        console.log("coming here");
        next(err);
    }
}));
function downloadYoutube(url, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            response.header('Content-Disposition', 'attachment;filename=video.mp4');
            let res = (0, ytdl_core_1.default)(url);
            res.on('error', () => {
                return response.status(404).json({
                    message: `error while finding video at url: ${url}`
                });
            });
            res.pipe(response);
        }
        catch (err) {
            next(err);
        }
    });
}
function findWebsiteType(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let urlObj = new URL(url);
        let origin = urlObj.origin;
        if (origin.includes('instagram.com'))
            return 'instagram';
        else if (origin.includes('twitch.tv'))
            return 'twitch';
        else if (origin.includes('youtube.com'))
            return 'youtube';
        else
            return 'invalid';
    });
}
app.use(function uncaughtExceptionHandler(err, req, res, next) {
    console.log(`[Error] ${err.stack}`);
    return res.status(500).json({
        message: `something went wrong, reason: ${err.message}`
    });
});
app.listen(process.env.PORT || 4565, () => console.log("server started"));
//# sourceMappingURL=main.js.map