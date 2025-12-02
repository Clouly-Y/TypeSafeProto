import { getAllParentClasses } from "./Helper";
import { Constructor, PotentialType } from "./TypeDef";

export const classMetaMap: Map<Function, ClassMeta> = new Map();

export class ClassMeta {
    public fieldMap: Map<string, FieldMeta> = new Map();
}

export class FieldMeta {
    public name: string;
    public index: number | undefined = undefined;
    public typeArr: Array<PotentialType> = [null, null, null];
    public defValue: unknown = undefined;
    constructor(name: string) {
        this.name = name;
    }
}

export const remixClassMetaMap: Map<Function, RemixClassMeta> = new Map();
export class RemixClassMeta {
    /** name/RemixFieldMeta */
    public fieldNameMap: Map<string, RemixFieldMeta> = new Map();
    /** hierarchy/index/RemixFieldMeta */
    public fieldIndexMap: Map<number, Map<number, RemixFieldMeta>> = new Map();
}

export class RemixFieldMeta {
    public name: string;
    public index: number;
    /** 继承层级<= -1；0为obejct */
    public hierarchy: number;
    public typeArr: Array<PotentialType>;
    public defValue: unknown;
    /** 同名的最父级字段的数据 */
    public parentFieldMeta: RemixFieldMeta | undefined;

    constructor(name: string, index: number, inheritanceHierarchy: number, typeArr: Array<PotentialType>, defValue: unknown) {
        this.name = name;
        this.index = index;
        this.hierarchy = inheritanceHierarchy;
        this.typeArr = typeArr;
        this.defValue = defValue;
    }
}

export function getOrCreateClassMeta(constructor: Function): ClassMeta {
    let classMeta = classMetaMap.get(constructor);
    if (classMeta === undefined) {
        classMeta = new ClassMeta();
        classMetaMap.set(constructor, classMeta);
    }
    return classMeta;
}


export function getOrCreateFieldMeta(classMeta: ClassMeta, fieldName: string): FieldMeta {
    let fieldMeta = classMeta.fieldMap.get(fieldName);
    if (fieldMeta === undefined) {
        fieldMeta = new FieldMeta(fieldName);
        classMeta.fieldMap.set(fieldName, fieldMeta);
    }
    return fieldMeta;
}

/** 整理类的所有字段及基类字段
 * 会给每个字段记录一个继承层级
 * object为0
 * 从-1开始，是第一个继承object的类class A
 * 然后-2是继承A的类class B extends A
 */
export function getOrCreateRemixClassMeta(classType: Constructor): RemixClassMeta {
    let remixClassMeta = remixClassMetaMap.get(classType);
    if (remixClassMeta !== undefined)
        return remixClassMeta;

    remixClassMeta = new RemixClassMeta();

    const types = [...getAllParentClasses(classType)].reverse();
    for (let hierarchy = -1; hierarchy >= -types.length; hierarchy--) {
        const type = types[-hierarchy - 1];
        const classMeta = classMetaMap.get(type);
        if (!classMeta)
            continue;

        for (const fieldMeta of classMeta.fieldMap.values()) {
            if (fieldMeta.index === undefined)
                continue;
            const remixFieldMeta = new RemixFieldMeta(fieldMeta.name, fieldMeta.index, hierarchy, fieldMeta.typeArr, fieldMeta.defValue);

            //允许子类覆盖基类的标签,并记录同名最父级字段的数据
            const parentField = remixClassMeta.fieldNameMap.get(fieldMeta.name);
            if (parentField)
                remixFieldMeta.parentFieldMeta = parentField.parentFieldMeta ?? parentField;
            remixClassMeta.fieldNameMap.set(fieldMeta.name, remixFieldMeta);

            let subMap = remixClassMeta.fieldIndexMap.get(hierarchy);
            if (subMap === undefined) {
                subMap = new Map();
                remixClassMeta.fieldIndexMap.set(hierarchy, subMap);
            }
            subMap.set(fieldMeta.index, remixFieldMeta);
        }
    }

    remixClassMetaMap.set(classType, remixClassMeta);
    return remixClassMeta;
}