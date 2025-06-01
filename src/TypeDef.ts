export type Constructor<T = object> = new (...args: any[]) => T;
export type TypeRecord<T extends object = object> = Record<number, Constructor<T>>;
export type BaiscType = null | undefined | string | number | boolean | Date;
export type PotentialType<T extends object = object> = null | Constructor<T> | TypeRecord<T>;