import { getOrCreateRemixClassMeta } from "../ClassMeta";
import { isSameArray } from "../Helper";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { BaiscType, CombinedTypeRecord, Constructor, PotentialType, TypeRecord } from "../TypeDef";

export function protoToObj<T extends object>(classInstance: T, typecodeRecord: TypeRecord<T> | CombinedTypeRecord<T> | null = null): object {
    if (classInstance.constructor === Object)
        throw new Error("classInstance must be a custom class!");

    return recordToObj(classInstance, typecodeRecord);
}

function recordToObj<T extends object>(object: T, type: PotentialType): object {
    const res: any = {};
    const classType = object.constructor as Constructor<T>;
    /** 有record: +类型号 */
    if (typeof type === "object" && type != null) {
        let typeCode = TypeCodeHelper.get(type).typeToCode(classType);
        if (typeof typeCode === "number")
            res["__typeCode"] = [typeCode];
        else
            res["__typeCode"] = typeCode;
    }

    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    for (const key in object) {
        const remixFieldMeta = remixClassMeta.fieldNameMap.get(key);
        if (remixFieldMeta === undefined)
            continue;
        const value = object[key];
        if (value === remixFieldMeta.defValue)
            continue;
        if (isSameArray(value, remixFieldMeta.defValue))
            continue;
        if (value == null && remixFieldMeta.defValue == null)
            continue;
        res[remixFieldMeta.name] = encodeUnknown(value, remixFieldMeta.typeArr);
    }
    return res;
}

function encodeUnknown(object: unknown, typeArr: PotentialType[]): unknown {
    if (object instanceof Date || object == null || typeof object === "string" || typeof object === "number" || typeof object === "boolean")
        return object;
    if (object instanceof Map)
        return mapToObj(object, typeArr[1], typeArr[2]);
    else if (object instanceof Set)
        return setToObj(object, typeArr[1]);
    else if (Array.isArray(object))
        return arrayToObj(object, typeArr[0]);
    else
        return recordToObj(object, typeArr[0]);
}

function arrayToObj(array: Array<BaiscType | object>, type: PotentialType): Array<unknown> {
    const res: unknown[] = [];
    const typeArr = [type];
    for (const ele of array)
        res.push(encodeUnknown(ele, typeArr));
    return res;
}

function mapToObj(map: Map<BaiscType | object, BaiscType | object>, keyType: PotentialType, valueType: PotentialType): Array<unknown> {
    const res: unknown[] = [];
    const keyTypeArr = [keyType];
    const valueTypeArr = [valueType];
    for (const [key, value] of map) {
        res.push(encodeUnknown(key, keyTypeArr));
        res.push(encodeUnknown(value, valueTypeArr));
    }
    return res;
}

function setToObj(set: Set<BaiscType | object>, valueType: PotentialType): Array<unknown> {
    const res: unknown[] = [];
    const typeArr = [valueType];
    for (const ele of set)
        res.push(encodeUnknown(ele, typeArr));
    return res;
}