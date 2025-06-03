export type Constructor<T = object> = new (...args: any[]) => T;
export type TypeRecord<T extends object = object> = { [P in number]: Constructor<T> }
export type CombinedTypeRecord<T extends object = object> = { [P in number]: Constructor<T> | CombinedTypeRecord<T>; }
export type BaiscType = null | undefined | string | number | boolean | Date;
export type PotentialType<T extends object = object> = null | Constructor<T> | TypeRecord<T> | CombinedTypeRecord<T>;