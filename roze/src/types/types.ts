type TextStyle = {
    font: string
    size: number
    italics: boolean
    bold: boolean
    underline: boolean
};
type ReaderContentImage = { type: "image", src: string };
type ReaderContentText = { type: "text", text: string, style: TextStyle };
type ReaderContentChapter = { type: "chapter", title: string, style: TextStyle };
export type ReaderContent = (ReaderContentImage|ReaderContentText|ReaderContentChapter)[];