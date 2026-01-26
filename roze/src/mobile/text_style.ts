import type { RozContentType } from "@roze/types/roz";
import type { TextStyle } from "react-native";

export const text_style_map: Record<RozContentType, (text_color: string) => TextStyle> = {
	TITLE: (text_color) => ({ color: text_color, fontWeight: "900", fontSize: 28 }),
	CHAPTER_TITLE: (text_color) => ({ color: text_color, fontWeight: "800", fontSize: 24 }),
	SECTION_TITLE: (text_color) => ({ color: text_color, fontWeight: "600", fontSize: 20 }),
	CHAPTER_SUBTITLE: (text_color) => ({ color: text_color, fontWeight: "600", fontSize: 20 }),
	TABLE_OF_CONTENTS_CHAPTER: (text_color) => ({ color: text_color, fontWeight: "400", fontSize: 16 }),
	HEADING: (text_color) => ({ color: text_color, fontWeight: "400", fontSize: 16 }),
	PARAGRAPH: (text_color) => ({ color: text_color, fontWeight: "400", fontSize: 14 }),
	IMAGE: () => ({}),
	LINE_BREAK: () => ({}),
	THEME_BREAK: () => ({})
};