import axios from 'axios'
import { parse } from 'node-html-parser'
import https from 'https'
import { Response, NextFunction } from "express";


async function getVideoLinkFromHtml(html: string): Promise<string> {
    let crop = "{\"" + html.substring(html.search("video_url"), html.search("video_url") + 1000);
    crop = crop.substring(0, crop.search(",")) + "}";
    return JSON.parse(crop).video_url;
}

async function getPostLink(url: string): Promise<string> {
    try {
        // remove all query params from url
        let idxOfQues = -1
        for (let i = 0; i < url.length; i++) {
            if (url[i] === '?') {
                idxOfQues = i
                break
            }
        }
        if (idxOfQues !== -1) {
            url = url.substring(0, idxOfQues)
        }
        if (url.endsWith('/')) {
            url += 'embed/captioned'
        }
        else url += '/embed/captioned'
        let res = await axios.get(url)
        let link = ''
        let root = parse(res.data)
        if (res.data.search("video_url") !== -1) {
            link = await getVideoLinkFromHtml(res.data)
        }
        else {
            link = root.querySelector('img.EmbeddedMediaImage').getAttribute("src")
        }

        return link
    } catch (err) {
        console.log(err.message)
        throw new Error(`error while getting instagram post link for html, reason: ${err.message}`)
    }
}


export async function downloadInstagram(url: string, response: Response, next: NextFunction) {
    try {
        let postLink = await getPostLink(url)
        https.get(postLink, (res) => {
            res.pipe(response)
        })
    } catch (err) {
        next(err)
    }
}

