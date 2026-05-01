export interface ProblemDocumentResult {
    data: Data
    message: string
    result: string
}

export interface Data {
    aiTutorEnabled: number
    assignmentProblemID: string
    authToken: string
    correlationId: string
    format: string
    problemJSON: string
}

export interface ProblemJSON {
    description: string
    symbolicable: string
    state: State
    revision: string
    layout: string
    introduction: string
    sourceID: string
    config: Config
    id: string
    title: string
    sections: Section[]
}

export interface State {
    isFinished: number
}

export interface Config {
    assignmentProblemID: string
}

export interface Section {
    instructions: string
    answer: Answer
    followup: string
    stateMessage: string
    courseStats: CourseStats
    state: State2
    showAnswer: string
    text: string
    id: string
    type: string
}

export interface Answer {
    currentDisplay: string
    solveFor: string
    widgetConfig: WidgetConfig
    showAnswer: string
    type: string
    config: Config2
    typeAttributes: TypeAttributes
    units: string
}

export interface WidgetConfig { }

export interface Config2 {
    preText: string
    postText: string
}

export interface TypeAttributes {
    showAddlRoundingMsg?: string
    tolerance: string
}

export interface CourseStats {
    hasCreditGranted: string
}

export interface State2 {
    isStarted: number
    isDone: number
    isCorrect: number
}
