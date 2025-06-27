import { StreamReader } from "../DataViewStream/StreamReader";
import { TypeMarkError } from "../Error/TypeMarkError";
import Mark from "../Mark";

export class BinaryDecoder {
    private readonly streamReader: StreamReader;

    constructor(bytes: Uint8Array) {
        this.streamReader = new StreamReader(bytes);
    }

    public get currentPos() { return this.streamReader.currentPos; }

    public peek(): number {
        return this.streamReader.lookU8();
    }

    public skip(num: number) {
        this.streamReader.skip(num);
    }

    public decodeNil(): null {
        this.streamReader.skip(1);
        return null;
    }

    public decodeBoolean(): boolean {
        return this.decodeNumber() == 1;
    }

    public decodeNumber(): number {
        const firstU8 = this.streamReader.readU8();
        if (firstU8 >= Mark.POSITIVE_FIX_INT_START && firstU8 <= Mark.POSITIVE_FIX_INT_END) {
            return firstU8 - Mark.POSITIVE_FIX_INT_START;
        }
        else if (firstU8 >= Mark.NEGATIVE_FIX_INT_START && firstU8 <= Mark.NEGATIVE_FIX_INT_END) {
            return -firstU8 + Mark.NEGATIVE_FIX_INT_START - 1;
        }
        else switch (firstU8) {
            case Mark.FLOAT32: return this.streamReader.readF32();
            case Mark.POSSITIVE_INT_8: return this.streamReader.readU8();
            case Mark.POSSITIVE_INT_16: return this.streamReader.readU16();
            case Mark.POSSITIVE_INT_32: return this.streamReader.readU32();
            case Mark.POSSITIVE_INT_64: return this.streamReader.readU64();
            case Mark.NEGATIVE_INT_8: return -this.streamReader.readU8();
            case Mark.NEGATIVE_INT_16: return -this.streamReader.readU16();
            case Mark.NEGATIVE_INT_32: return -this.streamReader.readU32();
            case Mark.NEGATIVE_INT_64: return -this.streamReader.readU64();
            default: throw new TypeMarkError(firstU8);
        }
    }

    public decodeVarHeader(): number {
        const firstU8 = this.streamReader.readU8();
        if (firstU8 >= Mark.FIX_VAR_START && firstU8 <= Mark.FIX_VAR_END) {
            return firstU8 - Mark.FIX_VAR_START;
        } else switch (firstU8) {
            case Mark.VAR_8: return this.streamReader.readU8();
            case Mark.VAR_16: return this.streamReader.readU16();
            case Mark.VAR_32: return this.streamReader.readU32();
            case Mark.VAR_64: return this.streamReader.readU64();
            default: throw new TypeMarkError(firstU8);
        }
    }

    public decodeString(byteLength: number): string {
        return this.streamReader.readStrng(byteLength);
    }
}