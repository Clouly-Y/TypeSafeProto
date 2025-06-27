export type Constructor<T = object> = new (...args: any[]) => T;
export type TypeRecord<T extends object = object> = { [P in number]: Constructor<T> }
export type CombinedTypeRecord<T extends object = object> = { [P in number]: Constructor<T> | CombinedTypeRecord<T>; }
export type PotentialType<T extends object = object> =
    StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor
    | ArrayConstructor | MapConstructor | SetConstructor
    | Constructor<T> | TypeRecord<T> | CombinedTypeRecord<T>;

export function isTypeRecord<T extends object>(type: PotentialType<T>): type is TypeRecord<T> | CombinedTypeRecord<T> {
    return typeof type != "function" && type != null;
}