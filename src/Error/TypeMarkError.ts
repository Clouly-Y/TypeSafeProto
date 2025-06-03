export class TypeMarkError extends Error {
    constructor(typeMark: number) {
        super("Unknown Type Mark:" + typeMark.toString());
    }
}
export class TypeRecordError extends Error {
    constructor(typeMark: number) {
        super("Record Less Code:" + typeMark.toString());
    }
}