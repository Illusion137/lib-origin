export type TypesAreEqual0<A, B> =
    (
        <T>() => T extends A ? 1 : 0
    ) extends
    (
        <T>() => T extends B ? 1 : 0
    )
    ? (A extends B
        ? (B extends A ? true : false)
        : false
      )
    : false;

// Fails for all string literals that are unions (more than one possible string)
export type TypesAreEqual1<T, U> = T extends U ? U extends T ? true : false : false;

// This works for all current test cases, except where the type is a union that includes `never`
export type TypesAreEqual2<T, U> = [T] extends [U] ? [U] extends [T] ? true : false : false;

// Change this next line to easily switch which solution is being tried:
export type TypesAreEqual<T, U> = TypesAreEqual2<T,U>;
export type StaticAssert<T extends true> = T;

export type TranslationMap = {
    from: RegExp;
    to: string;
}[];
export interface DurationImage { image_path: string; duration: number; }
export interface TimestampedContent { uuid: string; timestamp: string };
export interface TimestampedChapter { title: string; timestamp: string };