
export const INITIAL_CODE = "console.log('hello world!);";

export const mergeChange = (
    initialCode: string,
    fromA: number,
    toA: number,
    fromB: number,
    toB: number,
    inserted: string,
): string => {
    if (fromA !== fromB) {
        // maybe have to handle multiple changes at once?
        console.log(`skipped where ${fromA} !== ${fromB}`);
        return initialCode;
    }
    if (toB !== fromB + inserted.length) {
        console.log(`skipped where length of inserted doesn't match`);
        return initialCode;
    }
    const newCode = initialCode.slice(0, fromA) + inserted + initialCode.slice(toA);
    return newCode;
}
