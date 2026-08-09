import { catch_log } from "@common/utils/error_util";
import { YouTubeStudio } from "@origin/index";
import "dotenv/config";
import { TimeLog } from '@common/time_log';
import { refetch_env } from '@common/set_env_cookies';

const file_path = "C:\\Users\\raygo\\Videos\\2026-07-23 23-43-44.mp4";

// TODO cache session token for 7 days
async function main__upload_youtube_video(){
    await TimeLog.log_fn_async("refreshing env for convenience", refetch_env);
    YouTubeStudio.preload_cookies();
    const created = await YouTubeStudio.upload_video(file_path, {title: "Silly Test 2", description: "Rly", visibility: "PRIVATE"}, (written_bytes, total_bytes) => {
        console.log("Progress: ", {written_bytes, total_bytes, progress: written_bytes / total_bytes});
    });
    if("error" in created) throw created.error;
    console.log(created);
    await YouTubeStudio.upload_feedback_cycle([created.feedback_token], (content) => {
        if(content?.[0]?.uploadFeedbackItemContinuation?.contents?.[0]?.transferProgressBar)
            console.log(content?.[0]?.uploadFeedbackItemContinuation?.contents?.[0]?.transferProgressBar);
        else if(content?.[0]?.uploadFeedbackItemContinuation?.contents?.[0]?.uploadChecksRenderer)
            console.log(content?.[0]?.uploadFeedbackItemContinuation?.contents?.[0]?.uploadChecksRenderer);
        else console.log(content?.[0]?.uploadFeedbackItemContinuation?.contents?.[0])
    })
}

main__upload_youtube_video().catch(catch_log);