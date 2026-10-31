export interface CreateVideoResponse {
	responseContext: ResponseContext;
	videoId: string;
	contents: Contents;
}

export interface ResponseContext {
	serviceTrackingParams: ServiceTrackingParam[];
	consistencyTokenJar: ConsistencyTokenJar;
	stateTags: StateTags;
	responseId: string;
	webResponseContextExtensionData: WebResponseContextExtensionData;
}

export interface ServiceTrackingParam {
	service: string;
	params: Param[];
}

export interface Param {
	key: string;
	value: string;
}

export interface ConsistencyTokenJar {
	encryptedTokenJarContents: string;
	expirationSeconds: string;
}

export interface StateTags {
	stateTagsModified: number[];
}

export interface WebResponseContextExtensionData {
	hasDecorated: boolean;
	challenge?: {type?: "CHALLENGE_PROMPT_TYPE_AUTHENTICATE"}
}

export interface Contents {
	uploadFeedbackItemRenderer: UploadFeedbackItemRenderer;
}

export interface UploadFeedbackItemRenderer {
	id: Id;
	continuations: Continuation[];
	dataFreshnessEntity: DataFreshnessEntity;
}

export interface Id {
	frontendUploadId: string;
	videoId: string;
}

export interface Continuation {
	timedContinuationData?: TimedContinuationData;
	uploadFeedbackRefreshContinuation?: UploadFeedbackRefreshContinuation;
}

export interface TimedContinuationData {
	timeoutMs: number;
	continuation: string;
	clickTrackingParams: string;
}

export interface UploadFeedbackRefreshContinuation {
	continuation: string;
	continueInMs: number;
	clickTrackingParams: string;
}

export interface DataFreshnessEntity {
	key: string;
	lastUpdated: LastUpdated;
}

export interface LastUpdated {
	seconds: string;
	nanos: number;
}
