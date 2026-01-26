export function expect_error(value: unknown){
    expect(value).toHaveProperty("error");
}
export function expect_no_error(value: unknown){
    // const is_error = typeof value === "object" && value !== null && "error" in value; 
    // expect(is_error).toBe(false);
    expect(value).not.toHaveProperty("error");
}
test("Test Utils Fosholi Works", () => {
    expect(true).toBe(true);
});