import { BinaryEncoder } from "../Binary/BinaryEncoder";
import { getOrCreateRemixClassMeta } from "../ClassMeta";
import EncoderPool from "../EncoderPool";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { BaiscType, CombinedTypeRecord, Constructor, PotentialType, TypeRecord } from "../TypeDef";

export function protoEncode<T extends object>(classInstance: T, typecodeRecord: TypeRecord<T> | CombinedTypeRecord<T> | null = null): Uint8Array {
    if (classInstance.constructor === Object)
        throw new Error("classInstance must be a custom class!");

    return encodeRecord(classInstance, typecodeRecord);
}

function encodeRecord<T extends object>(object: T, type: PotentialType): Uint8Array {
    const encoder = EncoderPool.spawn();
    const classType = object.constructor as Constructor<T>;
    /** 有record: +类型号 */
    if (typeof type === "object" && type != null) {
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
        if (value == null && remixFieldMeta.defValue == null)
            continue;
        /** +层级? +标号 +长度？ +数据*/
        if (remixFieldMeta.hierarchy < 0)
            encoder.encodeNumber(remixFieldMeta.hierarchy);
        encoder.encodeNumber(remixFieldMeta.index);
        encodeUnknown(encoder, value, remixFieldMeta.typeArr);
    }
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}


function encodeUnknown(encoder: BinaryEncoder, object: unknown, typeArr: PotentialType[]) {
    if (object instanceof Date || object == null || typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
        encoder.encodeBasicType(object);
        return;
    }

    let buffer: Uint8Array;
    if (object instanceof Map) {
        buffer = encodeMap(object, typeArr[1], typeArr[2]);
        encoder.encodeArrayHeader(buffer.length);
    }
    else if (object instanceof Set) {
        buffer = encodeSet(object, typeArr[1]);
        encoder.encodeArrayHeader(buffer.length);
    }
    else if (object instanceof Uint8Array) {
        buffer = object;
        encoder.encodeArrayHeader(buffer.length);
    }
    else if (Array.isArray(object)) {
        buffer = encodeArray(object, typeArr[0]);
        encoder.encodeArrayHeader(buffer.length);
    }
    else {
        buffer = encodeRecord(object, typeArr[0]);
        encoder.encodeRecordHeader(buffer.length);
    }

    encoder.encodeUint8Array(buffer);
}

function encodeArray(array: Array<BaiscType | object> | Uint8Array, type: PotentialType): Uint8Array {
    const encoder = EncoderPool.spawn();
    const typeArr = [type];
    for (const ele of array)
        encodeUnknown(encoder, ele, typeArr);
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}

function encodeMap(map: Map<BaiscType | object, BaiscType | object>, keyType: PotentialType, valueType: PotentialType): Uint8Array {
    const encoder = EncoderPool.spawn();
    const keyTypeArr = [keyType];
    const valueTypeArr = [valueType];
    for (const [key, value] of map) {
        encodeUnknown(encoder, key, keyTypeArr);
        encodeUnknown(encoder, value, valueTypeArr);
    }
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}

function encodeSet(set: Set<BaiscType | object>, valueType: PotentialType): Uint8Array {
    const encoder = EncoderPool.spawn();
    const typeArr = [valueType];
    for (const ele of set)
        encodeUnknown(encoder, ele, typeArr);
    const res = encoder.toArray();
    EncoderPool.despawn(encoder);
    return res;
}