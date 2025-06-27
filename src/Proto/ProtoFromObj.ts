import { getOrCreateRemixClassMeta } from "../ClassMeta";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { CombinedTypeRecord, Constructor, isTypeRecord, TypeRecord } from "../TypeDef";
import { ArrayTypeLog, BasicTypeLog, CustomTypeLog, MapTypeLog, SetTypeLog, TypeLog } from "../TypeLog";

export function protoFromObj<T extends object>(object: Object, type: Constructor<T> | TypeRecord<T> | CombinedTypeRecord<T>): T {
    return recordFromObj(object, type);
}

function recordFromObj<T extends object>(object: any, type: Constructor<T> | TypeRecord<T> | CombinedTypeRecord<T>): T {
    let classType: Constructor<T>;
    if (!isTypeRecord(type))
        classType = type;
    else {
        let typeOrHelper: Constructor<T> | TypeCodeHelper<T> = TypeCodeHelper.get(type);
        for (const typeCode of object["__typeCode"])
            typeOrHelper = (typeOrHelper as TypeCodeHelper<T>).codeToType(typeCode);
        classType = typeOrHelper as unknown as Constructor<T>;
    }

    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    const res: Record<string, any> = new classType();
    const setted: string[] = [];
    for (const key in object) {
        const remixFieldMeta = remixClassMeta.fieldNameMap.get(key);
        if (remixFieldMeta === undefined)
            continue;

        const obj = unknownFromObj(object[key], remixFieldMeta.typeLog);
        res[remixFieldMeta.name] = obj;
        setted.push(remixFieldMeta.name);
    }

    for (const remixFieldMeta of remixClassMeta.fieldNameMap.values()) {
        if (setted.indexOf(remixFieldMeta.name) > -1)
            continue;
        if (remixFieldMeta.defValue === undefined)
            continue;
        res[remixFieldMeta.name] = remixFieldMeta.defValue;
    }

    return res as T;
}


function unknownFromObj(object: unknown, typeLog: TypeLog): unknown {
    if (typeLog instanceof BasicTypeLog)
        return object;
    else if (typeLog instanceof ArrayTypeLog)
        return arrayFromObj(object as Array<unknown>, typeLog.valueType);
    else if (typeLog instanceof MapTypeLog)
        return mapFromObj(object as Array<unknown>, typeLog.keyType, typeLog.valueType);
    else if (typeLog instanceof SetTypeLog)
        return setFromObj(object as Array<unknown>, typeLog.valueType);
    else if (typeLog instanceof CustomTypeLog)
        return recordFromObj(object, typeLog.type);
    else
        throw new Error("unknown type log");
}

function arrayFromObj(obj: Array<unknown>, valueTypeLog: TypeLog): Array<unknown> {
    const res: unknown[] = [];
    for (const ele of obj)
        res.push(unknownFromObj(ele, valueTypeLog));
    return res;
}

function mapFromObj(obj: Array<unknown>, keyTypeLog: TypeLog, valueTypeLog: TypeLog): Map<unknown, unknown> {
    const res: Map<unknown, unknown> = new Map();
    for (let i = 0; i < obj.length; i += 2) {
        const key = unknownFromObj(obj[i], keyTypeLog);
        const value = unknownFromObj(obj[i + 1], valueTypeLog);
        res.set(key, value);
    }
    return res;
}

function setFromObj(obj: Array<unknown>, valuetypeLog: TypeLog): Set<unknown> {
    const res: Set<unknown> = new Set();
    for (const ele of obj)
        res.add(unknownFromObj(ele, valuetypeLog));
    return res;
}