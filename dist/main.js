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
app.get('/download', (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let videoUrl = request.query.url.toString();
        response.header('Content-Disposition', 'attachment;filename=video.mp4');
        (0, ytdl_core_1.default)(videoUrl).pipe(response);
    }
    catch (err) {
        next(err);
    }
}));
app.use(function uncaughtExceptionHandler(err, req, res, next) {
    console.log(`[Error] ${err.stack}`);
    return res.status(500).json({
        message: `something went wrong, reason: ${err.message}`
    });
});
app.listen(process.env.PORT || 4565, () => console.log("server started"));
//# sourceMappingURL=main.js.map