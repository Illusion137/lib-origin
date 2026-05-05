export interface AssignmentSummary {
    data: Data
    result: string
}

export interface Data {
    assignmentAttempts: AssignmentAttempt[]
    assignment_id: string
    authenticated: number
    canAdjustSettings: number
    category: string
    completed_date: CompletedDate
    currentAttemptNo: number
    due: Due
    extended_date: any
    grading_policy: GradingPolicy
    hasEssay: number
    isRubric: number
    is_exempt: number
    is_extra_credit_only: number
    is_late_penalty_available: number
    is_past_due: number
    items: Item2[]
    noOfAssignmentAttempts: number
    pooledAssignmentInfoMessage: any
    print_allowed: number
    print_uri: string
    relatedAssignment: any[]
    score: string
    scorePendingCount: number
    show_item_score: number
    show_rework_header: number
    status: string
    time_estimate: any
    timed_assignment_id: string
    title: string
    type: string
    view_uri: number
}

export interface AssignmentAttempt {
    attemptNo: number
    completed: string
    items: Item[]
    score: any
    scoreInPoints: any
    totalLatePenalty: any
}

export interface Item {
    apIterationID: string
    creditGranted: number
    credit_type: string
    finishedAt: string
    id: string
    item_uri: string
    latePenaltyDisplay: any
    point_credit: string
    problemScore: string
    rework: number
    score: number
    scorePending: string
    status: string
    title: string
    type: string
}

export interface CompletedDate {
    date: string
    period: string
    time: string
}

export interface Due {
    date: string
    period: string
    time: string
}

export interface GradingPolicy {
    default_policy: DefaultPolicy
    extended_policy: ExtendedPolicy
}

export interface DefaultPolicy {
    details: Details
    summary: string
}

export interface Details {
    attemptsAllowed: string
    creditHint: string
    displayHintInfo: number
    hintBonus: string
    hintBonusPercent: string
    hintPenalty: string
    hintPenaltyPercent: string
    mcWrongAnswerPenalty: string
    mcWrongAnswerPenaltyPercent: string
    partialCredit: number
    partialCreditDuration: string
    partialCreditMax: string
    partialCreditMaxPercent: string
    partialCreditPercent: string
    penalizeHint: string
    showHint: string
    showLateSubmissionMsg: number
    testOut: any
    wrongAnswerPenalty: string
    wrongAnswerPenaltyPercent: string
}

export interface ExtendedPolicy {
    details: string
    summary: string
}

export interface Item2 {
    apIterationID: string
    creditGranted: number
    credit_type: string
    finishedAt: string
    id: string
    item_uri: string
    latePenaltyDisplay: any
    point_credit: string
    problemScore: string
    rework: number
    score: number
    scorePending: string
    status: string
    title: string
    type: string
}
