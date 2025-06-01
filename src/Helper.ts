import { Constructor } from "./TypeDef";

export function* getAllParentClasses(cls: Constructor): Iterable<Constructor> {
    let current = cls;
    while (current && current != Object) {
        yield current;
        current = Object.getPrototypeOf(current);
    }
}

export function isSameArray(arr1: unknown, arr2: unknown): boolean {
    if (!Array.isArray(arr1) || !Array.isArray(arr2))
        return false;
    if (arr1.length !== arr2.length)
        return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}