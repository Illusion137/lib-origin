import { describe, expect, it, vi } from "vitest";
import { youtube_parse_videos } from "./youtube_parser";

vi.mock("youtubei.js/agnostic", () => ({ YTNodes: {} }));

function collaboratorItem(name: string, browseId: string, canonicalBaseUrl?: string) {
    return {
        listItemViewModel: {
            title: {
                content: name,
                commandRuns: [{
                    onTap: {
                        innertubeCommand: {
                            browseEndpoint: {
                                browseId,
                                canonicalBaseUrl,
                            },
                        },
                    },
                }],
            },
            rendererContext: {
                commandContext: {
                    onTap: {
                        innertubeCommand: {
                            browseEndpoint: { browseId },
                        },
                    },
                },
            },
        },
    };
}

describe("youtube_parse_videos", () => {
    it("parses collaborator artists from video renderer byline dialogs", () => {
        const [track] = youtube_parse_videos({
            video_renderer: [{
                videoId: "TOshH9f9l90",
                title: { runs: [{ text: "Nino Paid - Nun But Drums ft VonOff1700 (Official Video)" }] },
                lengthText: { simpleText: "2:16" },
                shortViewCountText: { simpleText: "255K views" },
                shortBylineText: {
                    runs: [{
                        text: "Nino Paid and VonOff1700",
                        navigationEndpoint: {
                            showDialogCommand: {
                                panelLoadingStrategy: {
                                    inlineContent: {
                                        dialogViewModel: {
                                            customContent: {
                                                listViewModel: {
                                                    listItems: [
                                                        collaboratorItem("Nino Paid", "UC2hFKZgVRe1b2CpULVgaCDA", "/@NinoPaid"),
                                                        collaboratorItem("VonOff1700", "UC023sB-A8vI7F3ByKMF9BGA"),
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    }],
                },
            } as any],
        });

        expect(track.title).toBe("Nun But Drums");
        expect(track.artists).toEqual([
            { name: "Nino Paid", uri: "youtube:/@NinoPaid" },
            { name: "VonOff1700", uri: "youtube:UC023sB-A8vI7F3ByKMF9BGA" },
        ]);
    });
});
