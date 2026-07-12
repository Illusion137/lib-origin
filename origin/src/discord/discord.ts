import { base_post_headers } from "@common/headers_base";
import rozfetch from '@common/rozfetch';

export namespace Discord {
    const webook_api_version = 'v10';
    function transform_webhook_url(webhook_url: string){
        return webhook_url.replace('/api/webhooks/', `/api/${webook_api_version}/webhooks/`) + '?wait=true';
    }
    export async function send_message_webhook(webhook_url: string, content: string){
        const payload = {
            content: content,
            embeds: null,
            attachments: []
        };
        return await rozfetch(transform_webhook_url(webhook_url), {
            method: "POST", 
            body: JSON.stringify(payload),
            headers: {
                ...base_post_headers({}),
                "accept": "application/json",
                "content-type": "application/json",
                "Referer": "https://discohook.org/",
            }
        });
    }
};