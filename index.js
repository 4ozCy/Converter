const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/convert', (req, res) => {
    const { youtubeUrl, format } = req.body;

    if (!youtubeUrl || !['mp3', 'mp4'].includes(format)) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const outputFile = path.resolve(__dirname, `output.${format}`);

    let stream = ytdl(youtubeUrl, { quality: 'highest' });

    if (format === 'mp3') {
        ffmpeg(stream)
            .audioCodec('libmp3lame')
            .toFormat('mp3')
            .save(outputFile)
            .on('end', () => {
                res.json({ success: true, downloadUrl: `/output.${format}` });
            })
            .on('error', (err) => {
                console.error(`Error: ${err.message}`);
                res.status(500).json({ success: false, message: 'Conversion failed' });
            });
    } else {
        stream.pipe(fs.createWriteStream(outputFile))
            .on('finish', () => {
                res.json({ success: true, downloadUrl: `/output.${format}` });
            })
            .on('error', (err) => {
                console.error(`Error: ${err.message}`);
                res.status(500).json({ success: false, message: 'Download failed' });
            });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
