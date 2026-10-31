import { YouTubeDL } from '@origin/youtube_dl';
import express from 'express';
import "dotenv/config";
import type { ResponseError } from '@common/types';
import type { PoTokenResult } from '@native/potoken/potoken.base';

const app = express();
const port = 3000;

app.use(express.json());
YouTubeDL.preload_cookies();

const cache: Record<string, Awaited<ReturnType<typeof YouTubeDL.resolve_sabr_info>> & {po_token: PoTokenResult|ResponseError}> = {};
let i = 1;

// call with wf4kRfGzflo
app.get('/stream/:id', async (req, res) => {
    const video_id = req.params.id;
    console.log(`${i++}: ${video_id}`);
    if(cache[video_id]) {
        res.json(cache[video_id]);
        return;
    }
    const sabr_data = await YouTubeDL.resolve_sabr_info(video_id);
    const po_token = await YouTubeDL.fetch_potoken(video_id);
    cache[video_id] = {...sabr_data, po_token};
    res.json({...sabr_data, po_token});
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});