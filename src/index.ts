import { BinaryDecoder } from "./Binary/BinaryDecoder";
import { BinaryEncoder } from "./Binary/BinaryEncoder";
import { defValue, protoMember } from "./Decorator";
import { protoDecode } from "./Proto/ProtoDecoder";
import { protoEncode } from "./Proto/ProtoEncoder";
import { TypeCodeHelper } from "./TypeCodeHelper";
import { isProtomember, protoClone, releaseCaches } from "./Utils";

export type { BaiscType, TypeRecord } from "./TypeDef";
export type { BinaryDecoder, BinaryEncoder, TypeCodeHelper };

const proto = {
    def: defValue,
    member: protoMember,
    decode: protoDecode,
    encode: protoEncode,
    releaseCaches: releaseCaches,
    isMember: isProtomember,
    clone: protoClone,

    BinaryDecoder: BinaryDecoder,
    BinaryEncoder: BinaryEncoder,
    TypeCodeHelper: TypeCodeHelper,
}

export default proto;