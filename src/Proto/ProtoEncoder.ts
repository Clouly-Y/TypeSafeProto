import { BinaryEncoder } from "../Binary/BinaryEncoder";
import { getOrCreateRemixClassMeta } from "../ClassMeta";
import EncoderPool from "../EncoderPool";
import { isSameArray } from "../Helper";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { CombinedTypeRecord, Constructor, isTypeRecord, TypeRecord } from "../TypeDef";
import { ArrayTypeLog, BasicTypeLog, CustomTypeLog, MapTypeLog, SetTypeLog, TypeLog } from "../TypeLog";
import { utf8ByteLength } from "../utf8";

export function protoEncode<T extends object>(classInstance: T, typecodeRecord: TypeRecord | CombinedTypeRecord | null = null): Uint8Array {
    if (classInstance.constructor === Object)
        throw new Error("classInstance must be a custom class!");

    return encodeRecord(classInstance, typecodeRecord);
}

function encodeRecord(object: any, type: TypeRecord | CombinedTypeRecord | null): Uint8Array {
    const encoder = EncoderPool.spawn();
    const classType = object.constructor as Constructor;
    /** 有record: +类型号 */
    if (type) {
        let typeCode = TypeCodeHelper.get(type).typeToCode(classType);
        if (typeof typeCode === "number")
            encoder.encodeNumber(typeCode);
        else for (const code of typeCode)
            encoder.encodeNumber(code);
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
        /** +层级 +标号 +长度？ +数据*/
        encoder.encodeNumber(remixFieldMeta.hierarchy);
        encoder.encodeNumber(remixFieldMeta.index);
        encodeUnknown(encoder, value, remixFieldMeta.typeLog);
    }
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}


function encodeUnknown(encoder: BinaryEncoder, object: unknown, typeLog: TypeLog) {
    if (object == null) {
        encoder.encodeNil();
        return;
    }

    if (typeLog instanceof BasicTypeLog) {
        switch (typeLog.type) {
            case Number: encoder.encodeNumber(object as number); return;
            case Boolean: encoder.encodeBoolean(object as boolean); return;
            case Date: encoder.encodeNumber((object as Date).getTime()); return;
            case String:
                const length = utf8ByteLength(object as string);
                encoder.encodeVarHeader(length);
                encoder.encodeString(object as string);
                return;
            default: throw new Error("Unknown Basic Type");
        }
    }
    else if (typeLog instanceof CustomTypeLog) {
        let type = isTypeRecord(typeLog.type) ? typeLog.type : null;
        const u8arr = encodeRecord(object, type);
        encoder.encodeVarHeader(u8arr.length);
        encoder.encodeUint8Array(u8arr);
        return;
    }
    else if (typeLog instanceof ArrayTypeLog) {
        const u8arr = encodeArray(object as Array<unknown>, typeLog.valueType);
        encoder.encodeVarHeader(u8arr.length);
        encoder.encodeUint8Array(u8arr);
        return;
    }
    else if (typeLog instanceof MapTypeLog) {
        const u8arr = encodeMap(object as Map<unknown, unknown>, typeLog.keyType, typeLog.valueType);
        encoder.encodeVarHeader(u8arr.length);
        encoder.encodeUint8Array(u8arr);
        return;
    }
    else if (typeLog instanceof SetTypeLog) {
        const u8arr = encodeSet(object as Set<unknown>, typeLog.valueType);
        encoder.encodeVarHeader(u8arr.length);
        encoder.encodeUint8Array(u8arr);
        return;
    }
    else throw new Error("Unknown Type Log");
}

function encodeArray(array: Array<unknown>, typeLog: TypeLog): Uint8Array {
    const encoder = EncoderPool.spawn();
    for (const ele of array)
        encodeUnknown(encoder, ele, typeLog);
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}

function encodeMap(map: Map<unknown, unknown>, keyTypeLog: TypeLog, valueTypeLog: TypeLog): Uint8Array {
    const encoder = EncoderPool.spawn();
    for (const [key, value] of map) {
        encodeUnknown(encoder, key, keyTypeLog);
        encodeUnknown(encoder, value, valueTypeLog);
    }
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}

function encodeSet(set: Set<unknown>, valueTypeLog: TypeLog): Uint8Array {
    const encoder = EncoderPool.spawn();
    for (const ele of set)
        encodeUnknown(encoder, ele, valueTypeLog);
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}