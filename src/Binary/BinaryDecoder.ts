import { StreamReader } from "../DataViewStream/StreamReader";
import { TypeMarkError } from "../Error/TypeMarkError";
import Mark from "../Mark";

export class BinaryDecoder {
    private readonly streamReader: StreamReader;

    constructor(bytes: Uint8Array) {
        this.streamReader = new StreamReader(bytes);
    }

    public get currentPos() { return this.streamReader.currentPos; }

    public getTypeMark() {
        return this.streamReader.readU8();
    }

    public skip(num: number) {
        this.streamReader.skip(num);
    }

    public decodeNil(typeMark: number | null): null {
        typeMark = typeMark ?? this.getTypeMark();
        return null;
    }

    public decodeBoolean(typeMark: number | null) {
        typeMark = typeMark ?? this.getTypeMark();
        if (typeMark == Mark.TRUE)
            return true;
        else
            return false;
    }

    public decodeNumber(typeMark: number | null): number {
        typeMark = typeMark ?? this.getTypeMark();
        if (typeMark < Mark.MAX_POSITIVE_FIX_INT)
            return typeMark;
        else if (typeMark >= Mark.NEGATIVE_FIX_INT_START)
            return typeMark - 0x100;
        else switch (typeMark) {
            case Mark.FLOAT32: return this.streamReader.readF32();
            case Mark.P_INT_8: return this.streamReader.readU8();
            case Mark.P_INT_16: return this.streamReader.readU16();
            case Mark.P_INT_32: return this.streamReader.readU32();
            case Mark.P_INT_64: return this.streamReader.readU64();
            case Mark.N_INT_8: return -this.streamReader.readU8();
            case Mark.N_INT_16: return -this.streamReader.readU16();
            case Mark.N_INT_32: return -this.streamReader.readU32();
            case Mark.N_INT_64: return -this.streamReader.readU64();
            default: throw new TypeMarkError(typeMark);
        }
    }
    public decodeStringHeader(typeMark: number | null): number {
        typeMark = typeMark ?? this.getTypeMark();
        if (typeMark < Mark.NIL)
            return typeMark - Mark.FIX_STR;
        else switch (typeMark) {
            case Mark.STR_8: return this.streamReader.readU8();
            case Mark.STR_16: return this.streamReader.readU16();
            case Mark.STR_32: return this.streamReader.readU32();
            case Mark.STR_64: return this.streamReader.readU64();
            default: throw new TypeMarkError(typeMark);
        }
    }

    public decodeArrayHeader(typeMark: number | null): number {
        typeMark = typeMark ?? this.getTypeMark();
        if (typeMark < Mark.FIX_STR)
            return typeMark - Mark.FIX_ARR;
        else
            switch (typeMark) {
                case Mark.ARR_8: return this.streamReader.readU8();
                case Mark.ARR_16: return this.streamReader.readU16();
                case Mark.ARR_32: return this.streamReader.readU32();
                case Mark.ARR_64: return this.streamReader.readU64();
                default: throw new TypeMarkError(typeMark);
            }
    }

    public decodeDate(typeMark: number | null): Date {
        typeMark = typeMark ?? this.getTypeMark();
        const timestamp = this.streamReader.readU64();
        return new Date(timestamp);
    }

    public decodeRecordHeader(typeMark: number | null): number {
        typeMark = typeMark ?? this.getTypeMark();
        return this.decodeNumber(null);
    }

    public decodeString(byteLength: number): string {
        return this.streamReader.readStrng(byteLength);
    }
}