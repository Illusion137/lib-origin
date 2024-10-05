type ReaderContentImage = { type: "image", src: string };
type ReaderContentText = { type: "text", text: string };
type ReaderContentChapter = { type: "chapter", title: string };
type ReaderContentSubChapter = { type: "sub_chapter", title: string };
export type ReaderContent = (ReaderContentImage|ReaderContentText|ReaderContentChapter|ReaderContentSubChapter)[];