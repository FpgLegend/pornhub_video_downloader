const express = require('express')
const path = require('path')
const axios = require('axios')
const HTMLParser = require('node-html-parser')

const app = express()
const port = 3000

app.use(express.urlencoded({
    extended: true
}))

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'ejs'))


const getPornHubData = async (url) => {
    try {
        const res = await axios.get(url)
        return res.data
    } catch (err) {
        console.error(err)
    }
}

const processPornHubData = (data) => {
    const root = HTMLParser.parse(data)
    const playerId = root.querySelector('#player')
    const videoId = playerId.getAttribute('data-video-id')
    // console.log('videoId:', videoId)
    const playerIdScript = playerId.querySelector('script')
    let playerIdScriptStr = playerIdScript.toString().replace('<script type="text/javascript">', '').replace('</script>', '').trim()
    playerIdScriptStr = playerIdScriptStr.substring(playerIdScriptStr.indexOf('var qualityItems_'), playerIdScriptStr.indexOf('}];') + 2)
    // console.log(playerIdScriptStr)
    // remove var qualityItems_153601082 =
    playerIdScriptStr = playerIdScriptStr.replace('var qualityItems_' + videoId + ' = ', '')
    // console.log(playerIdScriptStr)
    return playerIdScriptStr
}


// app.get('/', (req, res) => {
app.all('/', (req, res) => {
    // get form data
    const ph_url = req.body.ph_url

    getPornHubData(typeof ph_url != 'undefined' ? ph_url : 'https://www.pornhub.com/view_video.php?viewkey=ph5bc11f2612513')
        .then(data => {
            const playerIdScriptStr = processPornHubData(data)

            // convert to object
            const playerIdScriptObj = JSON.parse(playerIdScriptStr)
            // console.log(playerIdScriptObj)
            res.render('index', { results: playerIdScriptObj })
            // res.render('index', { data: playerIdScriptStr, results: playerIdScriptObj })
        })
        .catch(err => {
            console.error(err)
        })
})


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
