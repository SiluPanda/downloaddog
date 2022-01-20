const express = require('express')
const ytdl = require('ytdl-core')
const path = require('path')
const idownloader =  require('@juliendu11/instagram-downloader')
const { downloadInstagram } = require('./instagram')

const app = express()
app.use('/static', express.static(path.resolve(__dirname + '/../static')));

app.get('/', async (request, response, next) => {
    try {
        response.sendFile(path.resolve(__dirname + '/../static/index.html'))
    } catch (err) {
        next(err)
    }
})

app.get('/validate', async (request, response, next) => {
    try {
        let { url } = request.query
        if (!url) {
            return response.status(400).json({
                message: `url is missing from the request, please add a valid url and try again.`
            })
        }

        url = url.toString()
        let websiteType = await findWebsiteType(url)
        if (websiteType === 'invalid') {
            return response.status(400).json({
                message: `website is either invalid or not supported yet`
            })
        }

        return response.send({
            message: "website looks good"
        })

    } catch (err) {
        next(err)
    }
})

app.get('/download', async (request, response, next) => {
    try {
        let { url } = request.query
        if (!url) {
            return response.status(400).json({
                message: `url is missing from request`
            })
        }

        url = url.toString()
        if (!url.startsWith('http')) {
            url = 'https://' + url
        }

        let websiteType = await findWebsiteType(url)
        if (websiteType === 'invalid') {
            return response.status(400).json({
                message: `provided URL ${url} is not currently supported`
            })
        }

        response.header('Content-Disposition', 'attachment;filename=video.mp4')
        if (websiteType === 'instagram') {
            return downloadInstagram(url, response, next)
        }

        else if (websiteType == 'youtube') {
            return downloadYoutube(url, response, next)
        }

        

    } catch (err) {
        next(err)
    }
})

async function downloadYoutube(url, response, next) {
    try {
        let res = ytdl(url)
        res.on('error', () => {
            return response.status(404).json({
                message: `error while finding video at url: ${url}`
            })
        })

        res.pipe(response)
    } catch (err) {
        next(err)
    }
}

async function findWebsiteType(url) {
    let urlObj = new URL(url)
    let origin = urlObj.origin

    if (origin.includes('instagram.com')) return 'instagram'
    else if (origin.includes('twitch.tv')) return 'twitch'
    else if (origin.includes('youtube.com')) return 'youtube'
    else return 'invalid'
}


app.use(function uncaughtExceptionHandler(err, req, res, next) {
    console.log(`[Error] ${err.stack}`)
    return res.status(500).json({
        message: `something went wrong, reason: ${err.message}`
    })
})
app.listen(process.env.PORT || 4565, () => console.log("server started"))
