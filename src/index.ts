import { BinaryDecoder } from "./Binary/BinaryDecoder";
import { BinaryEncoder } from "./Binary/BinaryEncoder";
import { defValue, protoMember } from "./Decorator";
import Mark from "./Mark";
import { protoDecode } from "./Proto/ProtoDecoder";
import { protoEncode } from "./Proto/ProtoEncoder";
import { protoFromObj } from "./Proto/ProtoFromObj";
import { protoToObj } from "./Proto/ProtoToObj";
import { TypeCodeHelper } from "./TypeCodeHelper";
import { fieldNameToIndex, indexToFieldName, isProtomember, protoClone, releaseCaches } from "./Utils";

export type { BaiscType, CombinedTypeRecord, TypeRecord } from "./TypeDef";
export type { BinaryDecoder, BinaryEncoder, TypeCodeHelper };

const proto = {
    def: defValue,
    member: protoMember,
    decode: protoDecode,
    encode: protoEncode,
    toObj: protoToObj,
    fromObj: protoFromObj,
    releaseCaches: releaseCaches,
    isMember: isProtomember,
    clone: protoClone,
    fieldNameToIndex: fieldNameToIndex,
    indexToFieldName: indexToFieldName,

    Mark: Mark,
    BinaryDecoder: BinaryDecoder,
    BinaryEncoder: BinaryEncoder,
    TypeCodeHelper: TypeCodeHelper,
}

export default proto;