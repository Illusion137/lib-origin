import { YouTubeDL } from '@origin/youtube_dl';
import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

// call with wf4kRfGzflo
app.get('/stream/:id', async (req, res) => {
    const video_id = req.params.id;
    const sabr_data = await YouTubeDL.resolve_sabr_url(video_id);
    res.json(sabr_data);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});