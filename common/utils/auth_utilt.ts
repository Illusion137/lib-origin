import * as sha1 from 'sha1-uint8array'
import type { YTCFG } from './YTCFG';

export function sapisid_hash_auth0(SAPISID: string, epoch: Date, ORIGIN: string) {
    const time_stamp_seconds_str = String(epoch.getTime()).slice(0, 10);
    const data_string = [time_stamp_seconds_str, SAPISID, ORIGIN].join(' ');
    const data = Uint8Array.from(Array.from(data_string).map(letter => letter.charCodeAt(0)));
    const sha_digest = sha1.createHash().update(data).digest("hex");
    const SAPISIDHASH = `SAPISIDHASH ${time_stamp_seconds_str}_${sha_digest}`
    return SAPISIDHASH;
}
// https://stackoverflow.com/questions/79378674/figuring-out-google-hashing-algorithm-for-sapisidhash-used-on-youtube-subscribe
/*
    Here's how the hash is generated:
    sha1([DATASYNC_ID, TIMESTAMP, SAPISID, ORIGIN].join(" "))
    WITH:
    DATASYNC_ID = ytcfg.data_.DATASYNC_ID.split('||')[0]
    TIMESTAMP = Math.floor(Date.now() / 1E3)
    SAPISID = cookies['SAPISID']
    ORIGIN = "https://www.youtube.com"
    The authorization header seems to be a repeat of {TIMESTAMP}_{sha1_hash}_u for each of SAPISIDHASH, SAPISID1PHASH and SAPISID3PHASH:
    authorization: SAPISIDHASH {TIMESTAMP}_{sha1_hash}_u SAPISID1PHASH {TIMESTAMP}_{sha1_hash}_u SAPISID3PHASH {TIMESTAMP}_{sha1_hash}_u
*/
export function sapisid_hash_auth1(SAPISID: string, epoch: Date, ytcfg: YTCFG, ORIGIN: string) {
    const time_stamp_seconds_str = Math.floor(epoch.getTime() / 1E3);
    const datasync_id = (ytcfg.DATASYNC_ID ?? (ytcfg as any).data_.DATASYNC_ID).split('||')[0];

    const data_string = [datasync_id, time_stamp_seconds_str, SAPISID, ORIGIN].join(' ');
    const data = Uint8Array.from(Array.from(data_string).map(letter => letter.charCodeAt(0)));
    const sha_digest = sha1.createHash().update(data).digest("hex");
    const SAPISIDHASH = `SAPISIDHASH ${time_stamp_seconds_str}_${sha_digest}_u SAPISID1PHASH ${time_stamp_seconds_str}_${sha_digest}_u SAPISID3PHASH ${time_stamp_seconds_str}_${sha_digest}_u`
    return SAPISIDHASH;
}