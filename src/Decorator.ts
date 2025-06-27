import { getOrCreateClassMeta, getOrCreateFieldMeta } from "./ClassMeta";
import { PotentialType } from "./TypeDef";
import { ArrayTypeLog, BasicTypeLog, CustomTypeLog, MapTypeLog, TypeLog } from "./TypeLog";

/** mark a field as protomember @example "@proto.member(0 ,Map ,KeyType,ValueType)" */
export function protoMember(index: number, type: PotentialType, ...subTypes: PotentialType[]): PropertyDecorator
/** mark a field as protomember @example @proto.member(0) */
export function protoMember(index: number, ...typeArr: PotentialType[]): PropertyDecorator {
    if (index < 0)
        throw new Error("index must >=0");

    return function (classType: object, fieldName: string | symbol | undefined): void {
        if (typeof fieldName !== "string")
            throw new Error("fieldName must be a string");

        const classMeta = getOrCreateClassMeta(classType.constructor);
        const fieldMeta = getOrCreateFieldMeta(classMeta, fieldName);

        fieldMeta.index = index;
        fieldMeta.typeLog = genTypeLog(typeArr);
    }
}

/** set default value to a field
 * @example 
 * "@proto.member(5)@proto.def(0)"
 * "public index:number"
 */
export function defValue(defValue: unknown): PropertyDecorator {
    return function (classType: object, fieldName: string | symbol | undefined): void {
        if (typeof fieldName !== "string")
            throw new Error("fieldName must be a string");
        if (defValue === undefined)
            throw new Error("defValue must not be undefined");

        const classMeta = getOrCreateClassMeta(classType.constructor);
        const fieldMeta = getOrCreateFieldMeta(classMeta, fieldName);

        fieldMeta.defValue = defValue;
    }
}


function genTypeLog(typeArr: PotentialType[], index?: { value: number }): TypeLog {
    index = index ?? { value: 0 };
    const firstType = typeArr[index.value];
    ++index.value;
    switch (firstType) {
        case String:
        case Boolean:
        case Number:
        case Date:
            return new BasicTypeLog(firstType as any);
        case Array:
            return new ArrayTypeLog(genTypeLog(typeArr, index));
        case Map:
            return new MapTypeLog(genTypeLog(typeArr, index), genTypeLog(typeArr, index));
        case Set:
            return new ArrayTypeLog(genTypeLog(typeArr, index));
        default:
            return new CustomTypeLog(firstType as any);

    }

}

