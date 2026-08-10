import Innertube, { ClientType, Log, Platform, type Types } from 'youtubei.js';
import {
    fs,
    load_native_fs
} from '@native/fs/fs';
import { jseval } from '@native/jseval/jseval';
import { RCache } from '../youtube_dl/rcache';
import type {
    CreatorVideo,
    FeatureRateLimit,
    ListCreatorVideosOpts,
    ListCreatorVideosResult,
    PathOrBuffer,
    StudioFeature,
    StudioVisibility,
    UploadVideoDetails,
    UploadVideoSuccessfulResult
} from './types';
import type { PromiseResult, ResponseError, ResponseSuccess } from '@common/types';
import { generror, generror_catch } from '@common/utils/error_util';
import { gen_uuid, is_empty, milliseconds_of } from '@common/utils/util';
import { get_native_platform } from '@native/native_mode';
import { reinterpret_cast } from '@common/cast';
import rozfetch from '@common/rozfetch';
import pathlib from 'path-browserify';
import { load_native_studio_attestation, studio_attestation } from '@native/studio_attestation/studio_attestation';
import type { BotGuardChallenge } from '@native/studio_attestation/studio_attestation.base';
import { FSCache } from '@common/fs_cache';
import type { ContinuationsUploadFeedback } from './types/ContinuationUploadFeedback';
import type { CreateVideoResponse } from './types/CreateVideoResponse';
import { wait } from '@common/utils/timed_util';

export type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

Platform.shim.eval = async (data: Types.BuildScriptResult, _: Record<string, Types.VMPrimative>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jseval().eval_in_webview(data.output);
};

export namespace YouTubeStudio {
    export interface Chapter { title: string, start_time: number };
    let innertube_client: Innertube;
    let preloaded_cookies: string | undefined;
    let resolved_cookies: string | undefined;
    let cached_unbound: UnboundChallenge | undefined;
    let cached_session_token: string | undefined;
    let attestation_retry_after_ms = 0;
    const ATTESTATION_FAILURE_COOLDOWN_MS = milliseconds_of({ minutes: 5 });

    const USER_AGENT_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';
    const STUDIO_ORIGIN = "https://studio.youtube.com";
    const UPLOAD_VIDEO_URL = "https://upload.youtube.com/upload/studio";
    const UPLOAD_THUMBNAIL_URL = "https://upload.youtube.com/upload/studiothumbnail";
    const UPLOAD_CHUNK_SIZE_BYTES = 8 * 1024 * 1024;

    const SESSION_TOKEN_CACHE_PAYLOAD = "SESSION_TOKEN_CACHE_PAYLOAD";
    // TODO maybe 7 days
    const SESSION_TOKEN_CACHE_DURATION_MS = milliseconds_of({days: 6});

    const creator_video_category_ids = {
        FILM: 1, AUTOS: 2, MUSIC: 10, PETS: 15, SPORTS: 17, TRAVEL: 19, GADGETS: 20,
        PEOPLE: 22, COMEDY: 23, ENTERTAINMENT: 24, NEWS: 25, HOWTO: 26, EDUCATION: 27,
        SCIENCE: 28, GOVERNMENT: 29
    } as const;
    const allow_comments_modes = {
        NONE: "ALL_COMMENTS",
        BASIC: "AUTOMATED_COMMENTS",
        STRICT: "AUTO_MODERATED_COMMENTS_HOLD_MORE",
        HOLD_ALL: "APPROVED_COMMENTS"
    } as const;
    const comment_enabled_states = {
        ON: "MDE_COMMENT_ENABLED_STATE_ON",
        OFF: "MDE_COMMENT_ENABLED_STATE_OFF",
        PAUSE: "MDE_COMMENT_ENABLED_STATE_PAUSED"
    } as const;
    const allowed_commenter_modes = {
        ANYONE: "MDE_ALLOWED_COMMENTER_MODE_ANYONE",
        SUBSCRIBERS_AND_MEMBERS: "MDE_ALLOWED_COMMENTER_MODE_SUBSCRIBERS_MEMBERS_APPROVED_USERS"
    } as const;
    const comment_sort_orders = {
        TOP: "MDE_COMMENT_SORT_ORDER_TOP",
        NEWEST: "MDE_COMMENT_SORT_ORDER_LATEST"
    } as const;
    const remix_source_options = {
        ALLOW_VIDEO_AND_AUDIO: "MDE_REMIX_SOURCE_OPTION_OPT_IN",
        ALLOW_ONLY_AUDIO: "MDE_REMIX_SOURCE_OPTION_VISUAL_OPT_OUT_AND_PERFORM_ACTIONS",
        DONT_ALLOW: "MDE_REMIX_SOURCE_OPTION_OPT_OUT_AND_MUTE_DERIVATIVES"
    } as const;

    const video_read_mask = {
        videoId: true,
        channelId: true,
        title: true,
        description: true,
        privacy: true,
        status: true,
        draftStatus: true,
        shareUrl: true,
        lengthSeconds: true,
        videoDurationMs: true,
        timeCreatedSeconds: true,
        timePublishedSeconds: true,
        thumbnailDetails: { all: true },
        responseStatus: { all: true },
        statusDetails: { all: true }
    } as const;

    interface StudioRequestContext {
        useSsl?: boolean;
        internalExperimentFlags: unknown[];
        consistencyTokenJars?: unknown[];
        sessionInfo?: { token: string };
        attestationResponseData?: { challenge: string, webResponse: string };
        reauthRequestInfo?: { encodedReauthProofToken: string };
        eats?: string;
        returnLogEntry?: boolean;
    }
    interface AttestationResponseData { challenge: string, webResponse: string }
    interface UnboundChallenge { challenge: string, bg_challenge: BotGuardChallenge, eats: string, expires_at_ms: number }
    interface ScottyUploadResult { status?: string, scottyResourceId?: string }
    /** payload shape only, the operations that go up are built per field by build_metadata_update */
    type MetadataUpdatePayload = Record<string, unknown>;

    interface AttestationEsrResponse { ctx?: string, shouldFetchReauthSessionToken?: boolean }
    interface WebReauthResponse { encodedReauthProofToken?: string, sessionRiskCtx?: string, webReauthUrl?: string }
    interface SessionTokenResponse { sessionToken?: string }
    interface CheckFeatureRateLimitResponse { allowed?: object, remainingTokens?: string }
    interface MetadataUpdateResponse { videos?: CreatorVideo[] }
    interface CreateCaptionsResponse { translation?: { captionsTranslations?: { contentUpdateTime?: string }[] } }
    interface ParseCaptionsResponse { captionSegments?: object }
    interface UpdateCaptionsResponse { framework_updates?: object }
    interface DeleteVideoResponse { success?: boolean }
    interface GetCreatorVideosResponse { videos?: CreatorVideo[] }
    interface ListCreatorVideosResponse { videos?: CreatorVideo[], nextPageToken?: string, videosTotalSize?: {size: string, accuracy: "ACCURACY_EXACT", achievedTotalSizeAccuracy: "CREATOR_ACHIEVED_TOTAL_SIZE_ACCURACY_EXACT"} }

    export function preload_cookies(cookie?: string){
        preloaded_cookies = cookie ?? process?.env?.YOUTUBE_COOKIE_JAR;
    }

    export async function get_innertube_client(cookie?: string): Promise<Innertube> {
        // paradigm switch, but like this is just genuinely bad if you dont pass cookies
        if(preloaded_cookies === undefined && cookie === undefined) throw new Error("No cookies passed for YouTube Studio");
        Log.setLevel(Log.Level.NONE);
        if (innertube_client) return innertube_client;
        await load_native_fs();
        await load_native_studio_attestation();
        resolved_cookies = preloaded_cookies ?? cookie;
        innertube_client = await Innertube.create({
            client_type: ClientType.WEB,
            cache: new RCache(true, await fs().temp_directory()),
            cookie: resolved_cookies,
            retrieve_player: false
        });
        return innertube_client;
    }

    function challenge_expiry_ms(challenge: string): number {
        const params = new URLSearchParams(challenge);
        const issued_seconds = Number(params.get("c"));
        const ttl_seconds = Number(params.get("t"));
        if (isNaN(issued_seconds) || isNaN(ttl_seconds) || issued_seconds === 0) return Date.now();
        return (issued_seconds + ttl_seconds) * 1000;
    }

    interface RawStudioAttestationChallengeResponse {
        success: boolean;
        status_code: number;
        data: {
            responseContext: {},
            challenge: string,
            botguardData: {
                program: string;
                interpreterSafeUrl: {
                    privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string;
                };
            }
            eats: string;
        }
    }
    interface RawBotguardChallengeData {
        program: string;
        globalName: string;
        interpreterHash?: string;
        interpreterUrl?: { privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string };
    }

    interface RawUnboundAttestationChallengeResponse {
        success: boolean;
        status_code: number;
        data: {
            responseContext: {},
            challenge: string,
            bgChallenge: RawBotguardChallengeData,
            eats: string;
        }
    }

    const studio_client_name = 'WEB_CREATOR';
    const studio_client_version = '1.20260728.03.00';
    // TODO actually extract this from the ytcfg prolly
    const YTCFG_EATS = "AeCS5zA8mwKJA3VzvwD--o2-ZsGbWYFt6LMN2EuOPJLQrg6MIuKxBpbf9WNlMPlARBhbMM-hSWg982LQDZEnOBj-yHFw1TDTzIUdINTExUA6U5lOgLtxyv6guJS9HQ==";

    async function with_studio_client<T>(client: Innertube, call: () => Promise<T>, eats: string = YTCFG_EATS): Promise<T> {
        const context_client = client.session.context.client;
        const request_context = studio_request_context(client);
        request_context.eats = eats;
        request_context.returnLogEntry = true;
        const previous_name = context_client.clientName;
        const previous_version = context_client.clientVersion;
        context_client.clientName = studio_client_name;
        context_client.clientVersion = studio_client_version;
        try {
            return await call();
        } finally {
            context_client.clientName = previous_name;
            context_client.clientVersion = previous_version;
        }
    }

    async function att_get_unbound(client: Innertube): Promise<RawUnboundAttestationChallengeResponse> {
        return await with_studio_client(client, async() => reinterpret_cast<RawUnboundAttestationChallengeResponse>(await client.actions.execute('/att/get', {
            engagementType: "ENGAGEMENT_TYPE_UNBOUND"
        })));
    }

    async function att_get_creator_studio_action(client: Innertube, ids: Record<"externalChannelId", string>[], unbound_eats: string): Promise<RawStudioAttestationChallengeResponse> {
        return await with_studio_client(client, async() => reinterpret_cast<RawStudioAttestationChallengeResponse>(await client.actions.execute('/att/get', {
            engagementType: "ENGAGEMENT_TYPE_CREATOR_STUDIO_ACTION",
            ids: ids
        })), unbound_eats);
    }

    function bg_challenge_of(bg_challenge: RawBotguardChallengeData | undefined): BotGuardChallenge | undefined {
        if (bg_challenge === undefined) return undefined;
        return {
            program: bg_challenge.program,
            global_name: bg_challenge.globalName,
            interpreter_hash: bg_challenge.interpreterHash,
            interpreter_url: bg_challenge.interpreterUrl?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue
        };
    }

    async function get_unbound_challenge(client: Innertube, force_refresh = false): PromiseResult<UnboundChallenge> {
        try {
            if (!force_refresh && cached_unbound !== undefined && cached_unbound.expires_at_ms > Date.now()) return cached_unbound;

            const attestation = await att_get_unbound(client);
            if (!attestation.success) return generror("Failed to get the YouTube Studio attestation challenge", "CRITICAL", { status_code: attestation.status_code });
            const challenge = attestation.data.challenge;
            if (challenge === undefined || challenge === "") return generror("No challenge returned by /att/get", "CRITICAL");
            const bg_challenge = bg_challenge_of(attestation.data.bgChallenge);
            if (bg_challenge === undefined) return generror("No bgChallenge returned by /att/get", "CRITICAL");
            const eats = attestation.data.eats;

            const unbound: UnboundChallenge = { challenge, bg_challenge, eats, expires_at_ms: challenge_expiry_ms(challenge) };
            cached_unbound = unbound;
            return unbound;
        } catch (error) { return generror_catch(error, "Failed to get the YouTube Studio attestation challenge", "MEDIUM"); }
    }

    async function mint_attestation(client: Innertube): PromiseResult<AttestationResponseData> {
        const unbound = await get_unbound_challenge(client);
        if ("error" in unbound) return unbound;

        const web_response = await studio_attestation().generate_studio_attestation(unbound.bg_challenge, {
            c: unbound.challenge,
            e: 'ENGAGEMENT_TYPE_UNBOUND'
        });
        if (typeof web_response === "object") return web_response;
        return { challenge: unbound.challenge, webResponse: web_response };
    }

    async function get_session_token(client: Innertube, channel_id: string, force_refresh = false): PromiseResult<string> {
        try {
            if (!force_refresh && cached_session_token !== undefined) return cached_session_token;
            const cache_hit = await FSCache.check_cache<string>(SESSION_TOKEN_CACHE_PAYLOAD, SESSION_TOKEN_CACHE_DURATION_MS, {serial_type: "stringable"});
            if(!force_refresh && cache_hit) return cache_hit;

            const unbound = await get_unbound_challenge(client);
            if ("error" in unbound) return unbound;

            // for some reason the attestation for this is just dumb
            const attestation = await att_get_creator_studio_action(client, [{ externalChannelId: channel_id }], unbound.eats);
            const challenge = attestation.data?.challenge;
            if (!attestation.success || challenge === undefined || challenge === "") return generror("No challenge returned by /att/get for the studio action", "CRITICAL", { channel_id, status_code: attestation.status_code });

            const botguard_response = await studio_attestation().generate_studio_attestation(unbound.bg_challenge, {
                c: challenge,
                e: 'ENGAGEMENT_TYPE_CREATOR_STUDIO_ACTION',
                externalChannelId: channel_id
            });
            if (typeof botguard_response === "object") return botguard_response;

            const esr_response = await with_studio_client(client, async() => await client.actions.execute('/att/esr', {
                challenge,
                botguardResponse: botguard_response,
                xguardClientStatus: 0
            }), unbound.eats);

            const esr_data = reinterpret_cast<AttestationEsrResponse>(esr_response.data);
            if (!esr_response.success || esr_data.ctx === undefined) return generror("/att/esr did not return a ctx", "CRITICAL", { status_code: esr_response.status_code });

            let grst_ctx = esr_data.ctx;
            let reauth_proof_token: string | undefined = undefined;
            if (esr_data.shouldFetchReauthSessionToken === true) {
                const reauth_response = await with_studio_client(client, async() => await client.actions.execute('/security/get_web_reauth_url', {
                    continueUrl: `${STUDIO_ORIGIN}/reauth`,
                    flow: "REAUTH_FLOW_YT_STUDIO_COLD_LOAD",
                    ivctx: esr_data.ctx,
                    challenge,
                    botguardResponse: botguard_response
                }), unbound.eats);
                const reauth_data = reinterpret_cast<WebReauthResponse>(reauth_response.data);
                // YouTube WANTS a sign in; but if they can ignore it so can I...
                // if (reauth_data.webReauthUrl !== undefined && reauth_data.encodedReauthProofToken === undefined) {
                //     session_token_available = false;
                //     return generror("YouTube Studio wants an interactive sign in before it will issue a session token", "INFO", { reauth_data });
                // }
                if (!reauth_response.success || reauth_data.encodedReauthProofToken === undefined || reauth_data.sessionRiskCtx === undefined) {
                    return generror("/security/get_web_reauth_url did not return a reauth proof", "MEDIUM", { status_code: reauth_response.status_code });
                }
                grst_ctx = reauth_data.sessionRiskCtx;
                reauth_proof_token = reauth_data.encodedReauthProofToken;
            }

            const request_context = studio_request_context(client);
            if (reauth_proof_token !== undefined) request_context.reauthRequestInfo = { encodedReauthProofToken: reauth_proof_token };
            try {
                const grst_response = await with_studio_client(client, async() => await client.actions.execute('/ars/grst', { ctx: grst_ctx }), unbound.eats);
                const grst_data = reinterpret_cast<SessionTokenResponse>(grst_response.data);
                if (!grst_response.success || grst_data.sessionToken === undefined) return generror("/ars/grst did not return a sessionToken", "CRITICAL", { status_code: grst_response.status_code });
                cached_session_token = grst_data.sessionToken;
                await FSCache.insert_cache(SESSION_TOKEN_CACHE_PAYLOAD, cached_session_token, {serial_type: "stringable"});
                return cached_session_token;
            } finally {
                // cleanup the context
                delete request_context.reauthRequestInfo;
            }
        } catch (error) { return generror_catch(error, "Failed to get a YouTube Studio session token", "MEDIUM", { channel_id }); }
    }

    function studio_request_context(client: Innertube): StudioRequestContext {
        client.session.context.request ??= { useSsl: true, internalExperimentFlags: [] };
        return reinterpret_cast<StudioRequestContext>(client.session.context.request);
    }

    type AttestationPlacement = "none" | "context" | "top_level";

    async function apply_studio_context(client: Innertube, channel_id?: string, placement: AttestationPlacement = "none"): Promise<AttestationResponseData | undefined> {
        if (channel_id !== undefined) {
            const user = reinterpret_cast<Record<string, unknown>>(client.session.context.user);
            user.delegationContext = {
                externalChannelId: channel_id,
                roleType: { channelRoleType: "CREATOR_CHANNEL_ROLE_TYPE_OWNER" }
            };
            user.serializedDelegationContext = serialize_delegation_context(channel_id);
        }

        const request_context = studio_request_context(client);
        delete request_context.attestationResponseData;

        if (channel_id !== undefined) {
            const session_token = await get_session_token(client, channel_id);
            if (typeof session_token === "string") request_context.sessionInfo = { token: session_token };
            else {
                delete request_context.sessionInfo;
            }
        }

        if (placement === "none" || attestation_retry_after_ms > Date.now()) return undefined;
        const attestation_response_data = await mint_attestation(client);
        if ("error" in attestation_response_data) {
            attestation_retry_after_ms = Date.now() + ATTESTATION_FAILURE_COOLDOWN_MS;
            return undefined;
        }
        if (placement === "context") {
            request_context.attestationResponseData = attestation_response_data;
            return undefined;
        }
        return attestation_response_data;
    }

    function serialize_delegation_context(channel_id: string): string {
        // context.user.serializedDelegationContext: proto field 2 = channel id, field 5.1 = owner role (8)
        const channel_bytes = Buffer.from(channel_id, "utf8");
        return Buffer.concat([
            Buffer.from([0x12, channel_bytes.byteLength]),
            channel_bytes,
            Buffer.from([0x2a, 0x02, 0x08, 0x08])
        ]).toString("base64");
    }

    export async function get_channel_id(index?: number): PromiseResult<string> {
        try {
            const client = await get_innertube_client();
            const channel_id_cache_key = {cookie: client.session.cookie, index};
            const channel_id_cache_hit = await FSCache.check_cache<string>(channel_id_cache_key, milliseconds_of({minutes: 15}), {serial_type: "stringable"});
            if(channel_id_cache_hit) return channel_id_cache_hit;

            const account_info = await client.account.getInfo(true);
            const account = account_info[index ?? 0];
            if (account === undefined) return generror("No accounts found", "LOW");
            const resolve_url = `https://www.youtube.com/${account.channel_handle.text}`;
            const cache_hit = await FSCache.check_cache<string>(resolve_url, milliseconds_of({months: 1}), {serial_type: "stringable"});
            if(cache_hit) return cache_hit;
            const resolved = await client.resolveURL(resolve_url);
            const channel_id = resolved.payload.browseId as string;
            await FSCache.insert_cache(resolve_url, channel_id, {serial_type: "stringable"});
            await FSCache.insert_cache(channel_id_cache_key, channel_id, {serial_type: "stringable"});
            return channel_id;
        } catch (error) { return generror_catch(error, "Failed to resolve the creator channel id", "CRITICAL"); }
    }

    async function studio_execute<T extends object>(endpoint: string, payload: object, channel_id?: string, placement: AttestationPlacement = "none"): PromiseResult<T> {
        try {
            const client = await get_innertube_client();
            const top_level = await apply_studio_context(client, channel_id, placement);
            const response = await with_studio_client(client, async() => await client.actions.execute(endpoint, {
                ...payload,
                ...(top_level === undefined ? {} : { attestationResponseData: top_level })
            }));
            if (!response.success) return generror(`YouTube Studio call to ${endpoint} failed`, "MEDIUM", { status_code: response.status_code });
            return reinterpret_cast<T>(response.data);
        } catch (error) { return generror_catch(error, `Failed to call YouTube Studio ${endpoint}`, "MEDIUM", { payload }); }
    }

    function cookie_headers(): Record<string, string> {
        if (resolved_cookies === undefined) return {};
        return get_native_platform() === "REACT_NATIVE" ? { "Cookies": resolved_cookies } : { "cookie": resolved_cookies };
    }
    function scotty_headers(file_name: string): Record<string, string> {
        return {
            ...cookie_headers(),
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            // scotty wants form-urlencoded even though the start body is json and the chunks are binary
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "origin": STUDIO_ORIGIN,
            "referer": `${STUDIO_ORIGIN}/`,
            "User-Agent": USER_AGENT_WINDOWS,
            "x-goog-upload-file-name": encodeURIComponent(file_name)
        };
    }

    async function read_path_or_buffer(data: PathOrBuffer): PromiseResult<Uint8Array> {
        if ("buffer" in data) return new Uint8Array(data.buffer);
        await load_native_fs();
        const contents = await fs().read_as_buffer(data.path);
        if ("error" in contents) return contents;
        return new Uint8Array(contents);
    }
    async function base64_of(data: PathOrBuffer): PromiseResult<string> {
        if ("buffer" in data) return data.buffer.toString("base64");
        await load_native_fs();
        return await fs().read_as_string(data.path, { encoding: "base64" });
    }
    function file_name_of(data: PathOrBuffer, fallback: string): string {
        return "path" in data ? pathlib.basename(data.path) : fallback;
    }

    interface ScottySource {
        byte_length: number;
        read_chunk: (position: number, length: number) => PromiseResult<Uint8Array>;
    }
    function scotty_source_of_bytes(bytes: Uint8Array): ScottySource {
        return {
            byte_length: bytes.byteLength,
            read_chunk: async (position, length) => bytes.subarray(position, position + length)
        };
    }
    async function scotty_source_of_file(file_path: string): PromiseResult<ScottySource> {
        await load_native_fs();
        const info = await fs().get_info(file_path);
        if (!info.exists || info.is_directory) return generror("Cannot upload a path that is not a readable file", "MEDIUM", { file_path });
        return {
            byte_length: info.size,
            read_chunk: async (position, length) => await fs().read_as_buffer_range(file_path, position, length)
        };
    }

    async function upload_to_scotty(start_url: string, file_name: string, source: ScottySource, start_payload: object, on_progress?: (written_bytes: number, total_bytes: number) => void): PromiseResult<string> {
        const total_bytes = source.byte_length;
        if (total_bytes === 0) return generror("Refusing to upload an empty file to scotty", "MEDIUM", { file_name, start_url });

        const start_response = await rozfetch(`${start_url}?authuser=0`, {
            method: "POST",
            headers: {
                ...scotty_headers(file_name),
                "x-goog-upload-command": "start",
                "x-goog-upload-header-content-length": String(total_bytes),
                "x-goog-upload-protocol": "resumable"
            },
            referrer: STUDIO_ORIGIN,
            body: JSON.stringify(start_payload)
        });
        if ("error" in start_response) return start_response;

        const upload_url = start_response.headers.get("x-goog-upload-url");
        if (upload_url === null || upload_url === "") return generror("Scotty did not return an upload url", "CRITICAL", { file_name, start_url });

        let offset = 0;
        while (offset < total_bytes) {
            // read the slice only once we're about to send it, so exactly one chunk is ever resident
            const chunk = await source.read_chunk(offset, Math.min(UPLOAD_CHUNK_SIZE_BYTES, total_bytes - offset));
            if ("error" in chunk) return chunk;
            if (chunk.byteLength === 0) return generror("Ran out of bytes before scotty finalized the upload", "CRITICAL", { file_name, offset, total_bytes });

            const is_final = offset + chunk.byteLength >= total_bytes;
            const chunk_response = await rozfetch<ScottyUploadResult>(upload_url, {
                method: "POST",
                headers: {
                    ...scotty_headers(file_name),
                    "x-goog-upload-command": is_final ? "upload, finalize" : "upload",
                    "x-goog-upload-offset": String(offset)
                },
                body: reinterpret_cast<BodyInit>(chunk)
            });
            if ("error" in chunk_response) return chunk_response;

            offset += chunk.byteLength;
            on_progress?.(offset, total_bytes);
            if (!is_final) continue;

            const result = await chunk_response.json();
            if ("error" in result) return result;
            if (result.status !== "STATUS_SUCCESS" || result.scottyResourceId === undefined) {
                return generror("Scotty did not finalize the upload", "CRITICAL", { file_name, status: result.status });
            }
            return result.scottyResourceId;
        }
        return generror("Scotty upload loop ended without finalizing", "CRITICAL", { file_name });
    }

    // TODO maybe implement this into the library fr
    export async function check_feature_rate_limit(feature: StudioFeature): PromiseResult<FeatureRateLimit> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;
        const response = await studio_execute<CheckFeatureRateLimitResponse>('/feature_eligibility/check_feature_rate_limit', { feature }, channel_id);
        if ("error" in response) return response;
        return {
            allowed: response.allowed !== undefined,
            remaining_tokens: Number(response.remainingTokens ?? 0)
        };
    }

    function build_metadata_update(details: Partial<UploadVideoDetails>, thumbnail_resource_id?: string): MetadataUpdatePayload {
        const payload: MetadataUpdatePayload = {};

        if (details.title !== undefined) payload.title = { newTitle: details.title, titleOperation: "MDE_TEXT_UPDATE_OPERATION_SET" };
        if (details.description !== undefined) payload.description = { newDescription: details.description, descriptionOperation: "MDE_TEXT_UPDATE_OPERATION_SET" };
        if (details.tags !== undefined) payload.tags = { newTags: details.tags };
        if (details.playlists !== undefined) payload.addToPlaylist = { addToPlaylistIds: details.playlists, deleteFromPlaylistIds: [] };
        if (details.audience !== undefined) {
            payload.madeForKids = {
                operation: "MDE_MADE_FOR_KIDS_UPDATE_OPERATION_SET",
                newMfk: details.audience === "MADE_FOR_KIDS" ? "MDE_MADE_FOR_KIDS_TYPE_MFK" : "MDE_MADE_FOR_KIDS_TYPE_NOT_MFK"
            };
        }
        if (details.paid_promotion !== undefined) payload.productPlacement = { newHasPaidProductPlacement: details.paid_promotion };
        if (details.ai_use !== undefined) {
            payload.alteredContent = {
                operation: "MDE_ALTERED_CONTENT_UPDATE_OPERATION_SET",
                newCreatorDisclosedHasAlteredContent: details.ai_use ? "MDE_HAS_ALTERED_CONTENT_YES" : "MDE_HAS_ALTERED_CONTENT_NO"
            };
        }
        // the studio models these three as opt outs, the details here read as opt ins
        if (details.automatic_chapters !== undefined) payload.autoChapter = { creatorOptOut: !details.automatic_chapters };
        if (details.featured_places !== undefined) payload.autoPlaces = { creatorOptOut: !details.featured_places };
        if (details.automatic_concepts !== undefined) payload.learningConcepts = { autoConceptsCreatorOptOut: !details.automatic_concepts };

        if (details.video_language !== undefined) payload.audioLanguage = { newAudioLanguage: details.video_language };
        if (details.title_and_description_language !== undefined) payload.metadataLanguage = { newMetadataLanguage: details.title_and_description_language };
        if (details.caption_certification !== undefined) payload.captionsCertificate = { newUncaptionedReason: details.caption_certification };

        if (details.recording_date !== undefined) {
            payload.recordedDate = {
                operation: "MDE_RECORDED_DATE_UPDATE_OPERATION_SET",
                newRecordedDate: {
                    year: details.recording_date.getFullYear(),
                    month: details.recording_date.getMonth() + 1,
                    day: details.recording_date.getDate()
                }
            };
        }
        if (details.video_location !== undefined) {
            payload.location = { operation: "MDE_LOCATION_UPDATE_OPERATION_SET_LOCATION", description: details.video_location };
        }

        if (details.license !== undefined) payload.license = { newLicenseId: details.license };
        if (details.allow_embedding !== undefined) payload.distributionOptions = { newAllowEmbedding: details.allow_embedding };
        if (details.publish_to_subscriptions_feed_and_notify_subscribers !== undefined) {
            payload.publishingOptions = { newPostToFeed: details.publish_to_subscriptions_feed_and_notify_subscribers };
        }
        if (details.shorts_remixing !== undefined) {
            payload.remix = { operation: "MDE_REMIX_UPDATE_OPERATION_SET", newRemixSourceOption: remix_source_options[details.shorts_remixing] };
        }
        if (details.category !== undefined) {
            const category_id = is_number_string(details.category) ? Number(details.category) : creator_video_category_ids[details.category.toUpperCase()];
            if (category_id !== undefined) payload.category = { newCategoryId: category_id };
        }

        const comment_options = build_comment_options(details);
        if (comment_options !== undefined) payload.commentOptions = comment_options;

        if (thumbnail_resource_id !== undefined) {
            payload.videoStill = {
                operation: "UPLOAD_CUSTOM_THUMBNAIL",
                image: {
                    encryptedScottyResourceId: thumbnail_resource_id,
                    name: "CUSTOM_THUMBNAIL_IMAGE_NAME_DEFAULT",
                    format: "CUSTOM_THUMBNAIL_IMAGE_FORMAT_JPEG"
                }
            };
        }
        return payload;
    }

    function is_number_string(value: string): boolean {
        return !is_empty(value) && !isNaN(Number(value));
    }

    function build_comment_options(details: Partial<UploadVideoDetails>): MetadataUpdatePayload | undefined {
        // studio only sends the moderation and commenter fields while comments are actually on
        const enabled_state = details.allow_comments === undefined ? undefined : comment_enabled_states[details.allow_comments];
        const has_options = enabled_state !== undefined
            || details.sort_comments_by !== undefined
            || details.show_how_many_viewers_like_this_video !== undefined
            || details.comment_moderation !== undefined
            || details.who_can_comment !== undefined;
        if (!has_options) return undefined;

        const comment_options: MetadataUpdatePayload = {};
        if (enabled_state !== undefined) comment_options.newCommentEnabledState = enabled_state;
        if (details.sort_comments_by !== undefined) comment_options.newDefaultSortOrder = comment_sort_orders[details.sort_comments_by];
        if (details.show_how_many_viewers_like_this_video !== undefined) comment_options.newCanViewRatings = details.show_how_many_viewers_like_this_video;
        if (enabled_state === undefined || enabled_state === comment_enabled_states.ON) {
            if (details.comment_moderation !== undefined) comment_options.newAllowCommentsMode = allow_comments_modes[details.comment_moderation];
            if (details.who_can_comment !== undefined) comment_options.newAllowedCommenterMode = allowed_commenter_modes[details.who_can_comment];
        }
        return comment_options;
    }

    async function metadata_update(video_id: string, payload: MetadataUpdatePayload): PromiseResult<MetadataUpdateResponse> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;
        return await studio_execute<MetadataUpdateResponse>('/video_manager/metadata_update', {
            encryptedVideoId: video_id,
            videoReadMask: video_read_mask,
            flowType: "MDE_FLOW_TYPE_UPLOAD",
            ...payload
        }, channel_id, "top_level");
    }

    export async function upload_thumbnail(video_id: string, thumbnail: PathOrBuffer): PromiseResult<ResponseSuccess> {
        return await update_video(video_id, { thumbnail });
    }

    async function upload_thumbnail_resource(video_id: string, thumbnail: PathOrBuffer): PromiseResult<string> {
        const bytes = await read_path_or_buffer(thumbnail);
        if ("error" in bytes) return bytes;
        return await upload_to_scotty(UPLOAD_THUMBNAIL_URL, file_name_of(thumbnail, `${video_id}.jpg`), scotty_source_of_bytes(bytes), {});
    }

    export async function upload_subtitles(video_id: string, subtitles: NonNullable<UploadVideoDetails["subtitles"]>, language = "en-US"): PromiseResult<ResponseSuccess> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;

        const data_base64 = await base64_of(subtitles.data);
        if (typeof data_base64 === "object") return data_base64;
        const file_name = file_name_of(subtitles.data, `${video_id}.srt`);
        const data_uri = `data:application/octet-stream;base64,${data_base64}`;
        const tts_track_id = { lang: language, kind: "", name: "" };

        const created = await studio_execute<CreateCaptionsResponse>('/globalization/create_captions', {
            videoId: video_id,
            channelId: channel_id,
            newTrack: tts_track_id,
            overwrite: true,
            autoTranslate: false
        }, channel_id);
        if ("error" in created) return created;

        const content_update_time = created.translation?.captionsTranslations?.[0]?.contentUpdateTime;
        if (content_update_time === undefined) return generror("create_captions did not return a contentUpdateTime", "MEDIUM", { video_id, language });

        // `synced` files already carry timings; unsynced transcripts get auto aligned server side
        const parsed = await studio_execute<ParseCaptionsResponse>('/globalization/parse_captions', {
            fileType: subtitles.synced ? "CAPTIONS_FILE_TYPE_TIMED_TEXT" : "CAPTIONS_FILE_TYPE_TRANSCRIPT",
            fileName: file_name,
            dataUri: data_uri
        }, channel_id);
        if ("error" in parsed) return parsed;

        const updated = await studio_execute<UpdateCaptionsResponse>('/globalization/update_captions', {
            videoId: video_id,
            channelId: channel_id,
            operations: [{
                ttsTrackId: tts_track_id,
                userIntent: "USER_INTENT_EDIT_LATEST_DRAFT",
                vote: "VOTE_PUBLISH",
                isContentEdited: false,
                contentUpdateTime: content_update_time,
                captionsFile: { dataUri: data_uri, fileName: file_name }
            }]
        }, channel_id);
        if ("error" in updated) return updated;
        return { success: true };
    }

    export async function update_video(video_id: string, details: Partial<UploadVideoDetails>): PromiseResult<ResponseSuccess> {
        let thumbnail_resource_id: string | undefined = undefined;
        if (details.thumbnail !== undefined) {
            const resource_id = await upload_thumbnail_resource(video_id, details.thumbnail);
            if (typeof resource_id === "object") return resource_id;
            thumbnail_resource_id = resource_id;
        }

        const payload = build_metadata_update(details, thumbnail_resource_id);
        if (!is_empty(payload)) {
            const response = await metadata_update(video_id, payload);
            if ("error" in response) return response;
        }
        if (details.subtitles !== undefined) {
            const response = await upload_subtitles(video_id, details.subtitles, details.video_language);
            if ("error" in response) return response;
        }
        return { success: true };
    }

    export async function publish_video(video_id: string, visibility: StudioVisibility = "PRIVATE"): PromiseResult<ResponseSuccess> {
        const response = await metadata_update(video_id, {
            privacyState: { newPrivacy: visibility },
            draftState: { operation: "MDE_DRAFT_STATE_UPDATE_OPERATION_REMOVE_DRAFT_STATE" }
        });
        if ("error" in response) return response;
        return { success: true };
    }

    function try_get_feedback_feedback_token(feedback: ContinuationsUploadFeedback): string|null {
        try {
            const feedback_token = feedback[0].uploadFeedbackItemContinuation.continuations[0].uploadFeedbackRefreshContinuation?.continuation;
            if(feedback_token) return feedback_token;
            const timed_token = feedback[0].uploadFeedbackItemContinuation.continuations[0].timedContinuationData?.continuation;
            if(timed_token) return timed_token;
            return null;
        }
        catch(_) {
            return null;
        }
    }
    function try_get_feedback_feedback_delay(feedback: ContinuationsUploadFeedback): number|null {
        try {
            const feedback_timeout = feedback[0].uploadFeedbackItemContinuation.continuations[0].uploadFeedbackRefreshContinuation?.continueInMs;
            if(feedback_timeout) return feedback_timeout;
            const timed_timeout = feedback[0].uploadFeedbackItemContinuation.continuations[0].timedContinuationData?.timeoutMs;
            if(timed_timeout) return timed_timeout;
            return null;
        }
        catch(_) {
            return null;
        }
    }

    interface UploadFeedbackResult {contents: ContinuationsUploadFeedback, next: () => PromiseResult<UploadFeedbackResult>}
    // from https://studio.youtube.com/youtubei/v1/creator/get_channel_dashboard?alt=json under interactionRecordingParams; prolly useless
    export async function upload_feedback(tokens: string[], type: "FEEDBACK_TOKENS"): PromiseResult<{isProcessed: boolean}>
    // initial from createvideo under uploadFeedbackRefreshContinuation
    export async function upload_feedback(tokens: string[], type: "CONTINUATION_TOKENS"): PromiseResult<UploadFeedbackResult>
    export async function upload_feedback(tokens: string[], type: "FEEDBACK_TOKENS"|"CONTINUATION_TOKENS"){
        if(tokens.filter(token => !is_empty(token)).length === 0) return generror("No non-empty tokens for feedback", "INFO", tokens);
        const client = await get_innertube_client();
        const feedback_response = await with_studio_client(client, async() => await client.actions.execute('upload/feedback?alt=json', 
            type === "CONTINUATION_TOKENS" ? {continuations: tokens} : {feedbackTokens: tokens}));
        if(!feedback_response.success) return generror("Failed to get upload_feedback", "INFO", { feedback_response });
        try {
            if(type === "FEEDBACK_TOKENS") return feedback_response.data.feedbackResponse as {isProcessed: boolean};
            const contents = feedback_response.data.continuationContents as ContinuationsUploadFeedback;
            return {contents, next: async() => await upload_feedback([try_get_feedback_feedback_token(contents) ?? ""], "CONTINUATION_TOKENS")};
        } catch(e) {
            return generror_catch(e, "failed to parse upload_feedback", "MEDIUM", {feedback_data: feedback_response.data})
        }
    }

    export async function upload_feedback_cycle(initial_tokens: (string|null)[], callback_continue: (content: ContinuationsUploadFeedback) => boolean){
        if(initial_tokens.some(token => token === null)) return;
        let feedback: ResponseError|UploadFeedbackResult = await upload_feedback(initial_tokens as string[], "CONTINUATION_TOKENS");
        if("error" in feedback) return;
        do {
            try {
                if(!callback_continue(feedback.contents)) break;
                const delay = try_get_feedback_feedback_delay(feedback.contents);
                if(delay === null) {
                    console.warn("upload feedback delay is null");
                    break;
                }
                if(delay < 1000) {
                    console.warn("upload feedback delay is unusually low");
                    break;
                }
                await wait(delay);
            } catch(_){}
        }
        while(!("error" in (feedback = await feedback.next())));
    }

    function try_get_upload_video_feedback_token(created: CreateVideoResponse): string|null {
        try {
            const feedback = created.contents.uploadFeedbackItemRenderer.continuations[0].uploadFeedbackRefreshContinuation?.continuation;
            if(feedback) return feedback;
            const timed = created.contents.uploadFeedbackItemRenderer.continuations[0].timedContinuationData?.continuation;
            if(timed) return timed;
            return null;
        }
        catch(_) {
            return null;
        }
    }

    export async function upload_video(file_path: string, details: Partial<UploadVideoDetails> = {}, on_scotty_progress?: (written_bytes: number, total_bytes: number) => void): PromiseResult<UploadVideoSuccessfulResult> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;

        // video can be big asl so chunk it
        const source = await scotty_source_of_file(file_path);
        if ("error" in source) return source;
        const file_name = pathlib.basename(file_path);

        const frontend_upload_id = `innertube_studio:${gen_uuid().toUpperCase()}:0`;
        const resource_id = await upload_to_scotty(UPLOAD_VIDEO_URL, file_name, source, { frontendUploadId: frontend_upload_id }, on_scotty_progress);
        if (typeof resource_id === "object") return resource_id;

        const created = await studio_execute<CreateVideoResponse>('/upload/createvideo', {
            channelId: channel_id,
            resourceId: { scottyResourceId: { id: resource_id } },
            frontendUploadId: frontend_upload_id,
            initialMetadata: {
                title: { newTitle: details.title ?? file_name },
                privacy: { newPrivacy: "PRIVATE" },
                draftState: { isDraft: true },
                ...(details.tags === undefined ? {} : { tags: { newTags: details.tags } }),
                // audience here is age restriction, not made for kids; details.audience goes up as madeForKids below
                targetedAudience: {
                    operation: "MDE_TARGETED_AUDIENCE_UPDATE_OPERATION_SET",
                    newTargetedAudience: "MDE_TARGETED_AUDIENCE_TYPE_ALL"
                }
            },
            contentLevelProtection: { enableRequiresContentLevelProtection: false },
            presumedShort: false
        }, channel_id, "context"); // createvideo reads its snapshot out of context.request
        if ("error" in created) return created;

        const video_id = created.videoId;
        if (video_id === undefined || video_id === "") {
            // a 200 with no videoId means youtube rejected the request in the body rather than the status, so surface what it actually said instead of just the missing field
            const raw = reinterpret_cast<Record<string, unknown>>(created);
            const { responseContext: _context, ...rest } = raw;
            return generror("createvideo did not return a videoId", "CRITICAL", {
                file_name,
                frontend_upload_id,
                response_keys: Object.keys(raw).join(", "),
                response: JSON.stringify(rest).slice(0, 600)
            });
        }

        // title and tags already went up with createvideo
        const { title: _title, tags: _tags, visibility, ...remaining_details } = details;
        const updated = await update_video(video_id, remaining_details);
        if ("error" in updated) return updated;

        const published = await publish_video(video_id, visibility);
        if ("error" in published) return published;

        return {
            video_link: `https://youtu.be/${video_id}`,
            file_name,
            feedback_token: try_get_upload_video_feedback_token(created)
        };
    }

    export async function delete_video(video_id: string): PromiseResult<ResponseSuccess> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;
        const response = await studio_execute<DeleteVideoResponse>('/video/delete', { videoId: video_id }, channel_id);
        if ("error" in response) return response;
        if (response.success !== true) return generror("video/delete did not report success", "MEDIUM", { video_id });
        return { success: true };
    }

    export async function get_creator_videos(video_ids: string[]): PromiseResult<CreatorVideo[]> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;
        const response = await studio_execute<GetCreatorVideosResponse>('/creator/get_creator_videos', {
            failOnError: true,
            videoIds: video_ids,
            mask: video_read_mask,
            criticalRead: false
        }, channel_id);
        if ("error" in response) return response;
        return response.videos ?? [];
    }

    export async function list_creator_videos(opts: ListCreatorVideosOpts = {}): PromiseResult<ListCreatorVideosResult> {
        const channel_id = await get_channel_id();
        if (typeof channel_id === "object") return channel_id;
        const response = await studio_execute<ListCreatorVideosResponse>('/creator/list_creator_videos', {
            filter: {
                and: {
                    operands: [
                        { channelIdIs: { value: channel_id } },
                        {
                            and: {
                                operands: [
                                    { videoOriginIs: { value: "VIDEO_ORIGIN_UPLOAD" } },
                                    { not: { operand: { contentTypeIs: { value: "CREATOR_CONTENT_TYPE_SHORTS" } } } }
                                ]
                            }
                        },
                        { not: { operand: { tvfilmTypeIs: { value: "VIDEO_TVFILM_TYPE_MOVIE" } } } },
                        { not: { operand: { tvfilmTypeIs: { value: "VIDEO_TVFILM_TYPE_EPISODE" } } } },
                        { not: { operand: { tvfilmTypeIs: { value: "VIDEO_TVFILM_TYPE_EVENT" } } } }
                    ]
                }
            },
            order: opts.order ?? "VIDEO_ORDER_DISPLAY_TIME_DESC",
            pageSize: opts.page_size ?? 32,
            mask: video_read_mask,
            ...(opts.page_token === undefined ? {} : { pageToken: opts.page_token })
        }, channel_id);
        if ("error" in response) return response;
        return {
            videos: response.videos ?? [],
            next_page_token: response.nextPageToken,
            estimated_total_size: isNaN(Number(response.videosTotalSize?.size)) ? undefined : Number(response.videosTotalSize?.size)
        };
    }
}
