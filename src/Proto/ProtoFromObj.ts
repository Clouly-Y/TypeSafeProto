import { getOrCreateRemixClassMeta } from "../ClassMeta";
import { Basic } from "../Decorator";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { CombinedTypeRecord, Constructor, PotentialType, TypeRecord } from "../TypeDef";

export function protoFromObj<T extends object>(object: Object, type: Constructor<T> | TypeRecord<T>): T {
    return recordFromObj(object, type);
}

function recordFromObj<T extends object>(object: any, type: PotentialType<T>): T {
    if (type === Basic)
        throw new Error("Basic type not supported");

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

        const obj = decodeUnknown(object[key], remixFieldMeta.typeArr);
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


function decodeUnknown(object: unknown, typeArr: PotentialType[]): unknown {
    if (object instanceof Date || object == null || typeof object === "string" || typeof object === "number" || typeof object === "boolean")
        return object;
    if (Array.isArray(object)) {
        if (typeArr[0] === Map)
            return mapFromObj(object, typeArr[1], typeArr[2]);
        else if (typeArr[0] === Set)
            return setFromObj(object, typeArr[1]);
        else
            return arrayFromObj(object, typeArr[0]);
    }
    return recordFromObj(object, typeArr[0]);
}

function arrayFromObj(obj: Array<unknown>, type: PotentialType): Array<unknown> {
    const res: unknown[] = [];
    const typeArr = [type];
    for (const ele of obj)
        res.push(decodeUnknown(ele, typeArr));
    return res;
}

function mapFromObj(obj: Array<unknown>, keyType: PotentialType, valueType: PotentialType): Map<unknown, unknown> {
    const res: Map<unknown, unknown> = new Map();
    const keyTypeArr = [keyType];
    const valueTypeArr = [valueType];
    for (let i = 0; i < obj.length; i += 2) {
        const key = decodeUnknown(obj[i], keyTypeArr);
        const value = decodeUnknown(obj[i + 1], valueTypeArr);
        res.set(key, value);
    }
    return res;
}

function setFromObj(obj: Array<unknown>, valueType: PotentialType): Set<unknown> {
    const res: Set<unknown> = new Set();
    const typeArr = [valueType];
    for (const ele of obj)
        res.add(decodeUnknown(ele, typeArr));
    return res;
}

function isTypeRecord<T extends object>(type: PotentialType<T>): type is TypeRecord<T> | CombinedTypeRecord<T> {
    return typeof type != "function" && type != null;
}