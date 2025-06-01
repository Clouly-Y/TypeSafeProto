export class TypeMarkError extends Error {
    constructor(typeMark: number) {
        super("Unknown Type Mark:" + typeMark.toString());
    }
}