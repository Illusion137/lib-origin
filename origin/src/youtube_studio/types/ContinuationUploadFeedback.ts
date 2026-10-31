export type ContinuationsUploadFeedback = ContinuationUploadFeedback[];

export interface ContinuationUploadFeedback {
	uploadFeedbackItemContinuation: UploadFeedbackItemContinuation;
}

export interface UploadFeedbackItemContinuation {
	id: Id;
	contents: Content[];
	continuations: Continuation[];
	dataFreshnessEntity: DataFreshnessEntity;
}

export interface Id {
	frontendUploadId: string;
	videoId: string;
}

export interface Content {
	transferProgressBar?: TransferProgressBar;
	uploadChecksRenderer?: UploadChecksRenderer;
}

export interface TransferProgressBar {
	fractionCompleted: number;
	progressMessage: ProgressMessage;
}

export interface ProgressMessage {
	simpleText: string;
}

export interface UploadChecksRenderer {
	checksDataVideoMonetized: ChecksDataVideoMonetized;
	checksDataVideoNotMonetized: ChecksDataVideoNotMonetized;
}

export interface ChecksDataVideoMonetized {
	checksSummary: ChecksSummary;
	copyrightCheck: CopyrightCheck;
	adSuitabilityCheck: AdSuitabilityCheck;
	communityGuidelinesCheck: CommunityGuidelinesCheck;
}

export interface ChecksSummary {
	status: string;
}

export interface CopyrightCheck {
	checkStatus: string;
}

export interface AdSuitabilityCheck {
	checkStatus: string;
}

export interface CommunityGuidelinesCheck {
	checkStatus: string;
}

export interface ChecksDataVideoNotMonetized {
	checksSummary: ChecksSummary2;
	copyrightCheck: CopyrightCheck2;
	adSuitabilityCheck: AdSuitabilityCheck2;
	communityGuidelinesCheck: CommunityGuidelinesCheck2;
}

export interface ChecksSummary2 {
	status: string;
}

export interface CopyrightCheck2 {
	checkStatus: string;
}

export interface AdSuitabilityCheck2 {
	checkStatus: string;
}

export interface CommunityGuidelinesCheck2 {
	checkStatus: string;
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
