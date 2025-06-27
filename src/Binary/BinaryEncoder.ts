import { StreamWriter } from "../DataViewStream/StreamWriter";
import Mark from "../Mark";

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

    public encodeNil() {
        this.streanmWriter.writeU8(Mark.NIL);
    }

    public encodeBoolean(object: boolean) {
        if (object)
            this.encodeNumber(1);
        else
            this.encodeNumber(0);
    }


    public encodeNumber(object: number): void {
        if (!Number.isSafeInteger(object)) {
            this.streanmWriter.writeU8(Mark.FLOAT32);
            this.streanmWriter.writeF32(object);
            return;
        }
        if (object >= 0) {
            if (object <= Mark.POSITIVE_FIX_INT_END - Mark.FIX_VAR_START) {
                this.streanmWriter.writeU8(object - Mark.POSITIVE_FIX_INT_START);
            } else if (object < Mark.MAX_UINT_8) {
                this.streanmWriter.writeU8(Mark.POSSITIVE_INT_8);
                this.streanmWriter.writeU8(object);
            } else if (object < Mark.MAX_UINT_16) {
                this.streanmWriter.writeU8(Mark.POSSITIVE_INT_16);
                this.streanmWriter.writeU16(object);
            } else if (object < Mark.MAX_UINT_32) {
                this.streanmWriter.writeU8(Mark.POSSITIVE_INT_32);
                this.streanmWriter.writeU32(object);
            } else {
                this.streanmWriter.writeU8(Mark.POSSITIVE_INT_64);
                this.streanmWriter.writeU64(object);
            }
        } else {
            if (-object <= Mark.NEGATIVE_FIX_INT_END - Mark.NEGATIVE_FIX_INT_START + 1) {
                // negative fixint -1~-32
                this.streanmWriter.writeU8(-object + Mark.NEGATIVE_FIX_INT_START - 1);
            } else if (object >= -Mark.MAX_UINT_8) {
                this.streanmWriter.writeU8(Mark.NEGATIVE_INT_8);
                this.streanmWriter.writeU8(-object);
            } else if (object >= -Mark.MAX_UINT_16) {
                this.streanmWriter.writeU8(Mark.NEGATIVE_INT_16);
                this.streanmWriter.writeU16(-object);
            } else if (object >= -Mark.MAX_UINT_32) {
                this.streanmWriter.writeU8(Mark.NEGATIVE_INT_32);
                this.streanmWriter.writeU32(-object);
            } else {
                this.streanmWriter.writeU8(Mark.NEGATIVE_INT_64);
                this.streanmWriter.writeU64(-object);
            }
        }
    }

    public encodeVarHeader(byteLength: number) {
        if (byteLength <= Mark.FIX_VAR_END - Mark.FIX_VAR_START) {
            this.streanmWriter.writeU8(byteLength + Mark.FIX_VAR_START);
        } else if (byteLength < Mark.MAX_UINT_8) {
            this.streanmWriter.writeU8(Mark.VAR_8);
            this.streanmWriter.writeU8(byteLength);
        } else if (byteLength < Mark.MAX_UINT_16) {
            this.streanmWriter.writeU8(Mark.VAR_16);
            this.streanmWriter.writeU16(byteLength);
        } else if (byteLength < Mark.MAX_UINT_32) {
            this.streanmWriter.writeU8(Mark.VAR_32);
            this.streanmWriter.writeU32(byteLength);
        } else {
            this.streanmWriter.writeU8(Mark.VAR_64);
            this.streanmWriter.writeU64(byteLength);
        }
    }

    public encodeString(str: string) {
        this.streanmWriter.writeString(str);
    }

    public encodeUint8Array(uint8Array: Uint8Array) {
        this.streanmWriter.writeU8Array(uint8Array);
    }
}