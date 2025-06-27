import { getAllParentClasses } from "./Helper";
import { Constructor } from "./TypeDef";
import { TypeLog } from "./TypeLog";

export const classMetaMap: Map<Function, ClassMeta> = new Map();

export class ClassMeta {
    public fieldMap: Map<string, FieldMeta> = new Map();
}

export class FieldMeta {
    public name: string;
    public index: number | undefined = undefined;
    public typeLog!: TypeLog;
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
    public hierarchy: number;
    public typeLog: TypeLog;
    public defValue: unknown;

    constructor(name: string, index: number, inheritanceHierarchy: number, typeLog: TypeLog, defValue: unknown) {
        this.name = name;
        this.index = index;
        this.hierarchy = inheritanceHierarchy;
        this.typeLog = typeLog;
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

export function getOrCreateRemixClassMeta(classType: Constructor): RemixClassMeta {
    let remixClassMeta = remixClassMetaMap.get(classType);
    if (remixClassMeta !== undefined)
        return remixClassMeta;

    remixClassMeta = new RemixClassMeta();

    let hierarchy = 0;
    for (const type of getAllParentClasses(classType)) {
        const classMeta = classMetaMap.get(type);
        if (classMeta !== undefined) {
            for (const fieldMeta of classMeta.fieldMap.values()) {
                if (fieldMeta.index === undefined)
                    continue;
                const remixFieldMeta = new RemixFieldMeta(fieldMeta.name, fieldMeta.index, hierarchy, fieldMeta.typeLog, fieldMeta.defValue);

                remixClassMeta.fieldNameMap.set(fieldMeta.name, remixFieldMeta);

                let subMap = remixClassMeta.fieldIndexMap.get(hierarchy);
                if (subMap === undefined) {
                    subMap = new Map();
                    remixClassMeta.fieldIndexMap.set(hierarchy, subMap);
                }
                subMap.set(fieldMeta.index, remixFieldMeta);
            }
        }
        hierarchy++;
    }

    remixClassMetaMap.set(classType, remixClassMeta);
    return remixClassMeta;
}