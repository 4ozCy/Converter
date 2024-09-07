const express = require('express');
const path = require('path');
const ytdlp = require('yt-dlp-exec');
const fs = require('fs');
const { exec } = require('child_process');

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
    
    const formatFlag = format === 'mp3' ? '--extract-audio --audio-format mp3' : '--format mp4';

    const command = `yt-dlp ${formatFlag} -o ${outputFile} ${youtubeUrl}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).json({ success: false, message: 'Conversion failed' });
        }

        return res.json({ success: true, downloadUrl: `/output.${format}` });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
