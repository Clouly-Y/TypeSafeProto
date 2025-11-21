import { getOrCreateRemixClassMeta, remixClassMetaMap } from "./ClassMeta";
import EncoderPool from "./EncoderPool";
import { protoDecode } from "./Proto/ProtoDecoder";
import { protoEncode } from "./Proto/ProtoEncoder";
import { TypeCodeHelper } from "./TypeCodeHelper";
import { CombinedTypeRecord, Constructor, TypeRecord } from "./TypeDef";

/** release calculate cache */
export function releaseCaches() {
    EncoderPool.release();
    TypeCodeHelper.release();
    remixClassMetaMap.clear();
}

/** clone a class obj */
export function protoClone<T extends object>(object: T): T {
    return protoDecode(protoEncode(object), object.constructor as Constructor<T>);
}

/** Check if a field is marked as protomember
 * @param fieldName When fieldName is undefined, check if any protomember in the type.
  */
export function isProtomember(classType: Constructor, fieldName?: string): boolean {
    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    if (fieldName === undefined)
        return remixClassMeta.fieldNameMap.size > 0;
    else
        return remixClassMeta.fieldNameMap.has(fieldName);
}

export function fieldNameToIndex(classType: Constructor, fieldName: string): Readonly<{ hierarchy: number, index: number }> | undefined {
    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    return remixClassMeta.fieldNameMap.get(fieldName);
}

export function indexToFieldName(classType: Constructor, hierarchy: number, index: number): string | undefined {
    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    return remixClassMeta.fieldIndexMap.get(hierarchy)?.get(index)?.name;
}

export function getAllFields(classType: Constructor) {
    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    return Array.from(remixClassMeta.fieldNameMap.keys());
}

export function codeToType<T extends object>(record: TypeRecord<T> | CombinedTypeRecord<T>, code: number | number[]): Constructor<T> {
    if (Array.isArray(code)) {
        let helper = TypeCodeHelper.get(record);
        for (const i of code) {
            helper = helper.codeToType(i) as TypeCodeHelper<T>;
        }
        return helper as any;
    }
    else
        return TypeCodeHelper.get(record).codeToType(code) as any;
}
export function typeToCode<T extends object>(record: TypeRecord<T>, aimType: Constructor<T>): number
export function typeToCode<T extends object>(record: CombinedTypeRecord<T>, aimType: Constructor<T>): number[]
export function typeToCode<T extends object>(record: TypeRecord<T> | CombinedTypeRecord<T>, aimType: Constructor<T>): number | number[] {
    return TypeCodeHelper.get(record).typeToCode(aimType);
}