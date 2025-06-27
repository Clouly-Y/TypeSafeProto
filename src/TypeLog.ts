import { CombinedTypeRecord, Constructor, TypeRecord } from "./TypeDef";

export abstract class TypeLog { }

export class BasicTypeLog extends TypeLog {
    public type: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor;
    public constructor(type: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor) {
        super();
        this.type = type;
    }
}

export class CustomTypeLog extends TypeLog {
    public type: Constructor | TypeRecord | CombinedTypeRecord;
    public constructor(type: Constructor | TypeRecord | CombinedTypeRecord) {
        super();
        this.type = type;
    }
}

export class ArrayTypeLog extends TypeLog {
    public valueType: TypeLog;
    public constructor(valueType: TypeLog) {
        super();
        this.valueType = valueType;
    }
}

export class MapTypeLog extends TypeLog {
    public keyType: TypeLog;
    public valueType: TypeLog;
    public constructor(keyType: TypeLog, valueType: TypeLog) {
        super();
        this.keyType = keyType;
        this.valueType = valueType;
    }
}

export class SetTypeLog extends TypeLog {
    public valueType: TypeLog;
    public constructor(valueType: TypeLog) {
        super();
        this.valueType = valueType;
    }
}
