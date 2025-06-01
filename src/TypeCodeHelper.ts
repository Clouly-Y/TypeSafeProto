import { Constructor, TypeRecord } from "./TypeDef";

export class TypeCodeHelper<T extends object> {
    private static typeCodeHelperMap: Map<object, TypeCodeHelper<object>> = new Map();
    public static get<T extends object>(record: TypeRecord<T>): TypeCodeHelper<T> {
        let helper = TypeCodeHelper.typeCodeHelperMap.get(record);
        if (helper === undefined) {
            helper = new TypeCodeHelper(record);
            TypeCodeHelper.typeCodeHelperMap.set(record, helper);
        }
        return helper as TypeCodeHelper<T>;
    }
    public static release() {
        TypeCodeHelper.typeCodeHelperMap.clear();
    }

    private typeToCodeMap: Map<Function, number> = new Map();
    private codeToTypeMap: Map<number, Constructor<T>> = new Map();

    public codeToType(code: number): Constructor<T> {
        const type = this.codeToTypeMap.get(code);
        if (type === undefined)
            throw new Error("Record missing code " + code);
        return type;
    }

    public typeToCode(aimType: Constructor<T>): number {
        const code = this.typeToCodeMap.get(aimType);
        if (code === undefined)
            throw new Error("Record missing type " + aimType.name)
        return code;
    }

    constructor(record: Record<number, Constructor<T>>) {
        for (const strCode in record) {
            const code = Number(strCode);
            const type = record[strCode];
            this.typeToCodeMap.set(type, code);
            this.codeToTypeMap.set(code, type);
        }
    }
}