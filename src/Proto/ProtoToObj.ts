import { getOrCreateRemixClassMeta } from "../ClassMeta";
import { isSameArray } from "../Helper";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { CombinedTypeRecord, Constructor, isTypeRecord, TypeRecord } from "../TypeDef";
import { ArrayTypeLog, BasicTypeLog, CustomTypeLog, MapTypeLog, SetTypeLog, TypeLog } from "../TypeLog";

export function protoToObj<T extends object>(classInstance: T, typecodeRecord: TypeRecord<T> | CombinedTypeRecord<T> | null = null): object {
    if (classInstance.constructor === Object)
        throw new Error("classInstance must be a custom class!");

    return recordToObj(classInstance, typecodeRecord);
}

function recordToObj<T extends object>(object: T, type: TypeRecord<T> | CombinedTypeRecord<T> | null): object {
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
        res[remixFieldMeta.name] = unknownToObj(value, remixFieldMeta.typeLog);
    }
    return res;
}

function unknownToObj(object: unknown, typeLog: TypeLog): unknown {
    if (object == null)
        return object;
    if (typeLog instanceof BasicTypeLog)
        return object;
    else if (typeLog instanceof ArrayTypeLog)
        return arrayToObj(object as Array<unknown>, typeLog.valueType);
    else if (typeLog instanceof SetTypeLog)
        return setToObj(object as Set<unknown>, typeLog.valueType);
    else if (typeLog instanceof MapTypeLog)
        return mapToObj(object as Map<unknown, unknown>, typeLog.keyType, typeLog.valueType);
    else if (typeLog instanceof CustomTypeLog) {
        const type = isTypeRecord(typeLog.type) ? typeLog.type : null;
        return recordToObj(object, type);
    }
    else
        throw new Error("Unknown Type Log");
}

function arrayToObj(array: Array<unknown>, valueTypeLog: TypeLog): Array<unknown> {
    const res: unknown[] = [];
    for (const ele of array)
        res.push(unknownToObj(ele, valueTypeLog));
    return res;
}

function mapToObj(map: Map<unknown, unknown>, keyTypeLog: TypeLog, valueTypeLog: TypeLog): Array<unknown> {
    const res: unknown[] = [];
    for (const [key, value] of map) {
        res.push(unknownToObj(key, keyTypeLog));
        res.push(unknownToObj(value, valueTypeLog));
    }
    return res;
}

function setToObj(set: Set<unknown>, valueTypeLog: TypeLog): Array<unknown> {
    const res: unknown[] = [];
    for (const ele of set)
        res.push(unknownToObj(ele, valueTypeLog));
    return res;
}