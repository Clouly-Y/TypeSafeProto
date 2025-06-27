import { BinaryDecoder } from "../Binary/BinaryDecoder";
import { getOrCreateRemixClassMeta } from "../ClassMeta";
import Mark from "../Mark";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { CombinedTypeRecord, Constructor, isTypeRecord, TypeRecord } from "../TypeDef";
import { ArrayTypeLog, BasicTypeLog, CustomTypeLog, MapTypeLog, SetTypeLog, TypeLog } from "../TypeLog";

export function protoDecode<T extends object>(data: Uint8Array, type: Constructor<T> | TypeRecord<T> | CombinedTypeRecord<T>): T {
    const decoder = new BinaryDecoder(data);
    return decodeRecord(decoder, data.length, type);
}

function decodeRecord<T extends object>(decoder: BinaryDecoder, byteLength: number, type: Constructor<T> | TypeRecord<T> | CombinedTypeRecord<T>): T {
    let aimPos = decoder.currentPos + byteLength;
    let classType: Constructor<T>;
    if (!isTypeRecord(type))
        classType = type;
    else {
        let typeOrHelper: Constructor<T> | TypeCodeHelper<T> = TypeCodeHelper.get(type);
        while (typeOrHelper instanceof TypeCodeHelper) {
            const nextCode = decoder.decodeNumber();
            typeOrHelper = typeOrHelper.codeToType(nextCode);
        }
        classType = typeOrHelper;
    }

    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    const res: Record<string, any> = new classType();
    const setted: string[] = [];
    while (decoder.currentPos < aimPos) {
        const hierarchy = decoder.decodeNumber();
        const index = decoder.decodeNumber();

        const remixFieldMeta = remixClassMeta.fieldIndexMap.get(hierarchy)?.get(index);
        const nextU8 = decoder.peek();
        if (remixFieldMeta === undefined) {
            if (nextU8 < Mark.NIL)
                decoder.decodeNumber();
            else if (nextU8 == Mark.NIL)
                decoder.skip(1);
            else
                decoder.skip(decoder.decodeVarHeader());
            continue;
        }
        const obj = decodeUnknown(decoder, remixFieldMeta.typeLog);
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


function decodeUnknown(decoder: BinaryDecoder, typeLog: TypeLog): unknown {
    if (decoder.peek() === Mark.NIL)
        return decoder.decodeNil();

    if (typeLog instanceof BasicTypeLog) {
        switch (typeLog.type) {
            case Number: return decoder.decodeNumber();
            case Boolean: return decoder.decodeBoolean();
            case Date: return new Date(decoder.decodeNumber());

            case String:
                const length = decoder.decodeVarHeader();
                return decoder.decodeString(length);
            default: throw new Error("Unknown Basic Type");
        }
    }
    else if (typeLog instanceof CustomTypeLog) {
        const length = decoder.decodeVarHeader();
        return decodeRecord(decoder, length, typeLog.type);
    }
    else if (typeLog instanceof ArrayTypeLog) {
        const length = decoder.decodeVarHeader();
        return decodeArray(decoder, length, typeLog.valueType);

    }
    else if (typeLog instanceof MapTypeLog) {
        const length = decoder.decodeVarHeader();
        return decodeMap(decoder, length, typeLog.keyType, typeLog.valueType);

    }
    else if (typeLog instanceof SetTypeLog) {
        const length = decoder.decodeVarHeader();
        return decodeSet(decoder, length, typeLog.valueType);
    }
    else throw new Error("Unknown Type Log");
}

function decodeArray(decoder: BinaryDecoder, byteLength: number, valueTypeLog: TypeLog): Array<unknown> {
    const res: unknown[] = [];
    const aimPos = decoder.currentPos + byteLength;
    while (decoder.currentPos < aimPos)
        res.push(decodeUnknown(decoder, valueTypeLog));
    return res;
}

function decodeMap(decoder: BinaryDecoder, byteLength: number, keyTypeLog: TypeLog, valueTypeLog: TypeLog): Map<unknown, unknown> {
    const res: Map<unknown, unknown> = new Map();
    const aimPos = decoder.currentPos + byteLength;
    while (decoder.currentPos < aimPos) {
        const key = decodeUnknown(decoder, keyTypeLog);
        const value = decodeUnknown(decoder, valueTypeLog);
        res.set(key, value);
    }
    return res;
}

function decodeSet(decoder: BinaryDecoder, byteLength: number, valueTypeLog: TypeLog): Set<unknown> {
    const res: Set<unknown> = new Set();
    const aimPos = decoder.currentPos + byteLength;
    while (decoder.currentPos < aimPos)
        res.add(decodeUnknown(decoder, valueTypeLog));
    return res;
}