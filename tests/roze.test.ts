import { timestamp_to_timecode } from "@roze/utils";

test("timestamp_to_string", () => {
    expect(timestamp_to_timecode(0)).toBe("00:00:00");
    expect(timestamp_to_timecode(-1)).toBe("00:00:00");
    expect(timestamp_to_timecode(60)).toBe("00:01:00");
    expect(timestamp_to_timecode(65)).toBe("00:01:05");
    expect(timestamp_to_timecode(600)).toBe("00:10:00");
    expect(timestamp_to_timecode(3600)).toBe("01:00:00");
    expect(timestamp_to_timecode(3600 * 99)).toBe("99:00:00");
    expect(timestamp_to_timecode(3600 * 100)).toBe("100:00:00");
});

// describe("roze-file-parser", () => {
// });

// describe("roze-jnovel", () => {
// });