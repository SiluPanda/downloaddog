import express, {Request, Response, NextFunction} from 'express'
import ytdl from 'ytdl-core'
import path from 'path'

const app = express()
app.use('/static', express.static(path.resolve(__dirname + '/../static')));

app.get('/', async (request: Request, response: Response, next: NextFunction) => {
    try {
        response.sendFile(path.resolve(__dirname + '/../static/index.html'))
    } catch (err) {
        next(err)
    }
})

app.get('/download', async (request: Request, response: Response, next: NextFunction) => {
    try {
        let videoUrl= request.query.url.toString()
        response.header('Content-Disposition', 'attachment;filename=video.mp4')
        ytdl(videoUrl).pipe(response)
    } catch (err) {
        next(err)
    }
})



app.use(function uncaughtExceptionHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(`[Error] ${err.stack}`)
    return res.status(500).json({
        message: `something went wrong, reason: ${err.message}`
    })
})
app.listen(process.env.PORT || 4565, () => console.log("server started"))
