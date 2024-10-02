export type Continuation = Continuation0[]

export interface Continuation0 {
  nextContinuationData: NextContinuationData
}

export interface NextContinuationData {
  continuation: string
  clickTrackingParams: string
}
