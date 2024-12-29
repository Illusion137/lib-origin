interface ReaderContentImage { type: "image", src: string }
interface ReaderContentText { type: "text", text: string }
interface ReaderContentChapter { type: "chapter", title: string }
interface ReaderContentSubChapter { type: "sub_chapter", title: string }
export type ReaderContent = (ReaderContentImage|ReaderContentText|ReaderContentChapter|ReaderContentSubChapter)[];