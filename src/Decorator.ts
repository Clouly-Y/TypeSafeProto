import { getOrCreateClassMeta, getOrCreateFieldMeta } from "./ClassMeta";
import { PotentialType } from "./TypeDef";

/** null | undefined | string | number | boolean | Date */
export const Basic: null = null;
type PotentialOrBasic<T extends object> = PotentialType<T> | NumberConstructor | StringConstructor | BooleanConstructor | DateConstructor;
/** mark a field as protomember @example "@proto.member(0 ,Map ,KeyType,ValueType)" */
export function protoMember<T2 extends object = object, T3 extends object = object>(index: number, type: MapConstructor, keyType: PotentialOrBasic<T2>, valueType: PotentialOrBasic<T3>): PropertyDecorator
/** mark a field as protomember @example "@proto.member(0 ,Set ,ValueType)" */
export function protoMember<T2 extends object = object>(index: number, type: SetConstructor, valueType: PotentialOrBasic<T2>): PropertyDecorator
/** mark a field as protomember @example @proto.member(0 ,CustomClass) */
export function protoMember<T extends object = object>(index: number, type: PotentialOrBasic<T>): PropertyDecorator
/** mark a field as protomember @example @proto.member(0) */
export function protoMember(index: number): PropertyDecorator
export function protoMember<T1 extends object, T2 extends object, T3 extends object>(
    index: number,
    type1: PotentialOrBasic<T1> = null,
    type2: PotentialOrBasic<T2> = null,
    type3: PotentialOrBasic<T3> = null):
    PropertyDecorator {
    if (index < 0)
        throw new Error("index must >=0");

    if (type1 == Number || type1 == String || type1 == Boolean || type1 == Date)
        type1 = null;
    if (type2 == Number || type2 == String || type2 == Boolean || type2 == Date)
        type2 = null;
    if (type3 == Number || type3 == String || type3 == Boolean || type3 == Date)
        type3 = null;

    return function (classType: object, fieldName: string | symbol | undefined): void {
        if (typeof fieldName !== "string")
            throw new Error("fieldName must be a string");

        const classMeta = getOrCreateClassMeta(classType.constructor);
        const fieldMeta = getOrCreateFieldMeta(classMeta, fieldName);

        fieldMeta.index = index;
        fieldMeta.typeArr = [type1, type2, type3];
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


