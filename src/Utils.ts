import { getOrCreateRemixClassMeta, remixClassMetaMap } from "./ClassMeta";
import EncoderPool from "./EncoderPool";
import { protoDecode } from "./Proto/ProtoDecoder";
import { protoEncode } from "./Proto/ProtoEncoder";
import { TypeCodeHelper } from "./TypeCodeHelper";
import { Constructor } from "./TypeDef";

/** release calculate cache */
export function releaseCaches() {
    EncoderPool.release();
    TypeCodeHelper.release();
    remixClassMetaMap.clear();
}

/** clone a class obj */
export function protoClone<T extends object>(object: T): T {
    return protoDecode(protoEncode(object), object.constructor as Constructor<T>);
}

/** Check if a field is marked as protomember
 * @param fieldName When fieldName is undefined, check if any protomember in the type.
  */
export function isProtomember(classType: Constructor, fieldName?: string): boolean {
    const remixClassMeta = getOrCreateRemixClassMeta(classType);
    if (fieldName === undefined)
        return remixClassMeta.filedNameMap.size > 0;
    else
        return remixClassMeta.filedNameMap.has(fieldName);
}