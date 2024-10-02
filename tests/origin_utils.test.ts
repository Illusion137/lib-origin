import * as utils from "../origin/src/utils/util";

test("encode_params", () => {
    expect(utils.encode_params({q: "lelo camelot"})).toBe("q=lelo%20camelot");
    expect(utils.encode_params({e: ""})).toBe("e=");
    expect(utils.encode_params({n: 500})).toBe("n=500");
    expect(utils.encode_params({b: false})).toBe("b=false");
    expect(utils.encode_params({o: [0, 1]})).toBe("o=%5B0%2C1%5D");
})

test("", () => {
    expect(utils.is_empty("")).toBeTruthy();
    expect(utils.is_empty("   ")).toBeTruthy();
    expect(utils.is_empty(undefined)).toBeTruthy();
    expect(utils.is_empty(null)).toBeTruthy();
    expect(utils.is_empty(0)).toBeTruthy();
    expect(utils.is_empty([])).toBeTruthy();
    expect(utils.is_empty({})).toBeTruthy();
    expect(utils.is_empty("str")).toBeFalsy();
    expect(utils.is_empty(false)).toBeFalsy();
    expect(utils.is_empty(true)).toBeFalsy();
    expect(utils.is_empty(1)).toBeFalsy();
    expect(utils.is_empty(-1)).toBeFalsy();
    expect(utils.is_empty([0, 1])).toBeFalsy();
    expect(utils.is_empty([0])).toBeFalsy();
    expect(utils.is_empty([{a: "b"}])).toBeFalsy();
})