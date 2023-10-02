const express = require('express');
const multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const app =express();
const port = 3000;

const streamsController = require('./app/controllers/StreamsController');

// get method to hls streaming file
app.get('/etravel/live/hls/:folder/:filename', streamsController.HlsStreaming);

// post method to convert file mp3 to m3u8
app.post('/upload',upload.single('mp3'), streamsController.convertFile);

// delete method to delete file m3u8 from server
app.delete('/remove', streamsController.RemoveFile);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})