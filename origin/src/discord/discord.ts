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
        return await fetch(transform_webhook_url(webhook_url), {
            method: "POST", 
            body: JSON.stringify(payload),
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
                "accept": "application/json",
                "accept-language": "en",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://discohook.org/",
                "Referrer-Policy": "strict-origin"
            }
        });
    }
};