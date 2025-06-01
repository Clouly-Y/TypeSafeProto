import { StreamWriter } from "../DataViewStream/StreamWriter";
import Mark from "../Mark";
import { BaiscType } from "../TypeDef";
import { utf8ByteLength } from "../utf8";

export class BinaryEncoder {
    private readonly streanmWriter: StreamWriter;

    constructor() {
        this.streanmWriter = new StreamWriter();
    }

    public clear() {
        this.streanmWriter.clear();
    }

    public toArray(): Uint8Array {
        return this.streanmWriter.toArray();
    }

    public encodeBasicType(object: BaiscType) {
        if (object == null) {
            this.encodeNil();
        } else if (typeof object === "boolean") {
            this.encodeBoolean(object);
        } else if (typeof object === "number") {
            this.encodeNumber(object);
        } else if (typeof object === "string") {
            this.encodeString(object);
        } else if (object instanceof Date) {
            this.encodeDate(object);
        } else
            throw new TypeError("Unknown Type:" + object)
    }

    public encodeNil() {
        this.streanmWriter.writeU8(Mark.NIL);
    }

    public encodeBoolean(object: boolean) {
        if (object === false)
            this.streanmWriter.writeU8(Mark.FALSE);
        else
            this.streanmWriter.writeU8(Mark.TRUE);
    }


    public encodeNumber(object: number): void {
        if (!Number.isSafeInteger(object)) {
            this.streanmWriter.writeU8(Mark.FLOAT32);
            this.streanmWriter.writeF32(object);
            return;
        }
        if (object >= 0) {
            if (object < Mark.MAX_POSITIVE_FIX_INT) {
                // positive fixint
                this.streanmWriter.writeU8(object);
            } else if (object < Mark.MAX_UINT_8) {
                // uint 8
                this.streanmWriter.writeU8(Mark.P_INT_8);
                this.streanmWriter.writeU8(object);
            } else if (object < Mark.MAX_UINT_16) {
                // uint 16
                this.streanmWriter.writeU8(Mark.P_INT_16);
                this.streanmWriter.writeU16(object);
            } else if (object < Mark.MAX_UINT_32) {
                // uint 32
                this.streanmWriter.writeU8(Mark.P_INT_32);
                this.streanmWriter.writeU32(object);
            } else {
                // uint 64
                this.streanmWriter.writeU8(Mark.P_INT_64);
                this.streanmWriter.writeU64(object);
            }
        } else {
            if (object >= Mark.MIN_NEGATIVE_FIX_INT) {
                // negative fixint 0xe0-0xff
                this.streanmWriter.writeU8(Mark.NEGATIVE_FIX_INT_START | (object + 0x20));
            } else if (object >= -Mark.MAX_UINT_8) {
                // int 8
                this.streanmWriter.writeU8(Mark.N_INT_8);
                this.streanmWriter.writeU8(-object);
            } else if (object >= -Mark.MAX_UINT_16) {
                // int 16
                this.streanmWriter.writeU8(Mark.N_INT_16);
                this.streanmWriter.writeU16(-object);
            } else if (object >= -Mark.MAX_UINT_32) {
                // int 32
                this.streanmWriter.writeU8(Mark.N_INT_32);
                this.streanmWriter.writeU32(-object);
            } else {
                // int 64
                this.streanmWriter.writeU8(Mark.N_INT_64);
                this.streanmWriter.writeU64(-object);
            }
        }
    }

    public encodeString(object: string) {
        const byteLength = utf8ByteLength(object);

        if (byteLength < Mark.MAX_FIX_STR_LENGTH) {
            // fixstr
            this.streanmWriter.writeU8(0xa0 + byteLength);
        } else if (byteLength < Mark.MAX_UINT_8) {
            // str 8
            this.streanmWriter.writeU8(Mark.STR_8);
            this.streanmWriter.writeU8(byteLength);
        } else if (byteLength < Mark.MAX_UINT_16) {
            // str 16
            this.streanmWriter.writeU8(Mark.STR_16);
            this.streanmWriter.writeU16(byteLength);
        } else if (byteLength < Mark.MAX_UINT_32) {
            // str 32
            this.streanmWriter.writeU8(Mark.STR_32);
            this.streanmWriter.writeU32(byteLength);
        } else {
            throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }

        this.streanmWriter.writeString(object);
    }

    public encodeDate(value: Date) {
        this.streanmWriter.writeU8(Mark.DATE);
        this.streanmWriter.writeU64(value.getTime());
    }

    public encodeRecordHeader(byteLength: number) {
        this.streanmWriter.writeU8(Mark.RECORD);
        this.encodeNumber(byteLength);
    }

    public encodeArrayHeader(byteLength: number) {
        if (byteLength < Mark.MAX_FIX_ARR_LENGTH) {
            // fixarray
            this.streanmWriter.writeU8(Mark.FIX_ARR + byteLength);
        } else if (byteLength < Mark.MAX_UINT_8) {
            // array 8
            this.streanmWriter.writeU8(Mark.ARR_8);
            this.streanmWriter.writeU8(byteLength);
        } else if (byteLength < Mark.MAX_UINT_16) {
            // array 16
            this.streanmWriter.writeU8(Mark.ARR_16);
            this.streanmWriter.writeU16(byteLength);
        } else if (byteLength < Mark.MAX_UINT_32) {
            // array 32
            this.streanmWriter.writeU8(Mark.ARR_32);
            this.streanmWriter.writeU32(byteLength);
        } else {
            throw new Error(`Too large array, byteLength:${byteLength}`);
        }
    }

    public encodeUint8Array(uint8Array: Uint8Array) {
        this.streanmWriter.writeU8Array(uint8Array);
    }
}