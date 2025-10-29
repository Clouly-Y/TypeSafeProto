import { BinaryDecoder } from "../Binary/BinaryDecoder";
import { getOrCreateRemixClassMeta } from "../ClassMeta";
import { Basic } from "../Decorator";
import Mark from "../Mark";
import { TypeCodeHelper } from "../TypeCodeHelper";
import { CombinedTypeRecord, Constructor, PotentialType, TypeRecord } from "../TypeDef";

export function protoDecode<T extends object>(data: Uint8Array, type: Constructor<T> | CombinedTypeRecord<T> | TypeRecord<T>): T {
    const decoder = new BinaryDecoder(data);
    return decodeRecord(decoder, data.length, type);
}

function decodeRecord<T extends object>(decoder: BinaryDecoder, byteLength: number, type: PotentialType<T>): T {
    if (type === Basic)
        throw new Error("Basic type not supported");

    let aimPos = decoder.currentPos + byteLength;
    let classType: Constructor<T>;
    if (!isTypeRecord(type))
        classType = type;
    else {
        let typeOrHelper: Constructor<T> | TypeCodeHelper<T> = TypeCodeHelper.get(type);
        while (typeOrHelper instanceof TypeCodeHelper) {
            const nextCode = decoder.decodeNumber(null);
            typeOrHelper = typeOrHelper.codeToType(nextCode);
        }
        classType = typeOrHelper;
    }

    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    const res: Record<string, any> = new classType();
    const setted: string[] = [];
    while (decoder.currentPos < aimPos) {
        let hierarchy: number, index: number
        const firstNum = decoder.decodeNumber(null);
        if (firstNum < 0) {
            hierarchy = firstNum;
            index = decoder.decodeNumber(null);
        }
        else {
            hierarchy = 0;
            index = firstNum;
        }

        const remixFieldMeta = remixClassMeta.fieldIndexMap.get(hierarchy)?.get(index);
        const typeMark = decoder.getTypeMark();
        if (remixFieldMeta === undefined) {
            switch (Mark.markToType(typeMark)) {
                case null: break;
                case Boolean: break;
                case Number: decoder.decodeNumber(typeMark); break;
                case String: decoder.skip(decoder.decodeStringHeader(typeMark)); break;
                case Array: decoder.skip(decoder.decodeArrayHeader(typeMark)); break;
                case Date: decoder.skip(8); break;
                case Mark.RECORD: decoder.skip(decoder.decodeNumber(null)); break;
            }
            continue;
        }
        const obj = decodeUnknown(decoder, typeMark, remixFieldMeta.typeArr);
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


function decodeUnknown(decoder: BinaryDecoder, typeMark: number | null, typeArr: PotentialType[]): unknown {
    typeMark = typeMark ?? decoder.getTypeMark();
    switch (Mark.markToType(typeMark)) {
        case null: return decoder.decodeNil(typeMark);
        case Boolean: return decoder.decodeBoolean(typeMark);
        case Number: return decoder.decodeNumber(typeMark);
        case String: {
            const byteLength = decoder.decodeStringHeader(typeMark);
            return decoder.decodeString(byteLength);
        }
        case Array: {
            const byteLength = decoder.decodeArrayHeader(typeMark);
            switch (typeArr[0]) {
                case Map: return decodeMap(decoder, byteLength, typeArr[1], typeArr[2]);
                case Set: return decodeSet(decoder, byteLength, typeArr[1]);
                default: return decodeArray(decoder, byteLength, typeArr[0]);
            }
        }
        case Date: return decoder.decodeDate(typeMark);
        default: { //Mark.RECORD
            const byteLength = decoder.decodeRecordHeader(typeMark);
            return decodeRecord(decoder, byteLength, typeArr[0]);
        }
    }
}

function decodeArray(decoder: BinaryDecoder, byteLength: number, type: PotentialType): Array<unknown> | Uint8Array {
    const res: unknown[] = [];
    const aimPos = decoder.currentPos + byteLength;
    const typeArr = [type];
    if (type == Uint8Array)
        return decoder.decodeU8Array(byteLength);
    else {
        while (decoder.currentPos < aimPos)
            res.push(decodeUnknown(decoder, null, typeArr));
        return res;
    }
}

function decodeMap(decoder: BinaryDecoder, byteLength: number, keyType: PotentialType, valueType: PotentialType): Map<unknown, unknown> {
    const res: Map<unknown, unknown> = new Map();
    const aimPos = decoder.currentPos + byteLength;
    const keyTypeArr = [keyType];
    const valueTypeArr = [valueType];
    while (decoder.currentPos < aimPos) {
        const key = decodeUnknown(decoder, null, keyTypeArr);
        const value = decodeUnknown(decoder, null, valueTypeArr);
        res.set(key, value);
    }
    return res;
}

function decodeSet(decoder: BinaryDecoder, byteLength: number, valueType: PotentialType): Set<unknown> {
    const res: Set<unknown> = new Set();
    const aimPos = decoder.currentPos + byteLength;
    const valueTypeArr = [valueType];
    while (decoder.currentPos < aimPos)
        res.add(decodeUnknown(decoder, null, valueTypeArr));
    return res;
}

function isTypeRecord<T extends object>(type: PotentialType<T>): type is TypeRecord<T> | CombinedTypeRecord<T> {
    return typeof type != "function" && type != null;
}