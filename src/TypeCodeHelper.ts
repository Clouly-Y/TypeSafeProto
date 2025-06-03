import { CombinedTypeRecord, Constructor, TypeRecord } from "./TypeDef";

type TypeToCodeMap = Map<Function, number[]>;
type CodeToTypeMap<T extends object> = Map<number, Constructor<T> | CombinedTypeRecord<T>>;

export class TypeCodeHelper<T extends object, TCombined extends boolean = true | false> {
    private static typeCodeHelperMap: Map<object, TypeCodeHelper<object>> = new Map();
    public static get<T extends object>(record: TypeRecord<T>): TypeCodeHelper<T, false>
    public static get<T extends object>(record: CombinedTypeRecord<T>): TypeCodeHelper<T, true>
    public static get<T extends object>(record: TypeRecord<T>): TypeCodeHelper<T, true | false> {
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

    public readonly combined: boolean = false;
    private typeToCodeMap: TypeToCodeMap = new Map();
    private codeToTypeMap: CodeToTypeMap<T> = new Map();

    public codeToType(code: number): Constructor<T> | TypeCodeHelper<T> {
        const typeOrRecord = this.codeToTypeMap.get(code);
        if (typeOrRecord === undefined)
            throw new Error("Record missing code " + code);
        else if (typeof typeOrRecord === "object")
            return TypeCodeHelper.get(typeOrRecord);
        else
            return typeOrRecord;
    }

    public typeToCode(aimType: Constructor<T>): TCombined extends true ? number[] : number {
        const code = this.typeToCodeMap.get(aimType);
        if (code === undefined)
            throw new Error("Record missing type " + aimType.name)
        if (this.combined)
            return code as any;
        else
            return code[0] as any;
    }

    private constructor(record: CombinedTypeRecord<T>) {
        for (const code in record) {
            const typeRecord = record[code];
            if (typeof typeRecord === "object")
                this.combined = true;
            this.codeToTypeMap.set(Number(code), record[code]);
        }

        for (const obj of this.getTypeCodeArr(record))
            this.typeToCodeMap.set(obj.type, obj.codeArr);
    }

    private * getTypeCodeArr(record: CombinedTypeRecord<T>): Iterable<{ codeArr: number[], type: Constructor<T> }> {
        for (const strCode in record) {
            const code = Number(strCode);
            const type = record[strCode];
            if (typeof type == "function")
                yield { codeArr: [code], type: type };
            else for (const obj of this.getTypeCodeArr(type)) {
                obj.codeArr.unshift(code);
                yield obj;
            }
        }
    }
}