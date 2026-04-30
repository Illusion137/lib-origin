export interface AssignmentsList {
    data: Daum[]
    message: string
    result: string
}

export interface Daum {
    assignmentID: string
    category: string
    currentAttemptNo: number
    dateDueArray: string[]
    isAccessible: number
    isAttemptStarted: number
    isComplete: number
    isExempt: number
    isPasswordProtected: number
    isRubric: number
    pastDue: number
    problemCompletedCount: number
    problemCount: number
    showScore: string
    timeLimit: string
    title: string
}
