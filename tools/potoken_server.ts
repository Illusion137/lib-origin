import { YouTubeDL } from '@origin/youtube/youtube_dl';
import express from 'express';
const app = express();
const port = 3000;

app.get('/potoken/:id', async (req, res) => {
    const video_id = req.params.id;

    const content_pot_result = await YouTubeDL.fetch_potoken(video_id);
    res.json(content_pot_result);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});