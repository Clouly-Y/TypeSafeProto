
export class StreamReader {
    private offset: number;
    private readonly view: DataView;

    public get currentPos() { return this.offset; }

    constructor(bytes: Uint8Array) {
        this.view = new DataView(bytes.buffer);
        this.offset = 0;
    }

    public skip(num: number) {
        this.offset += num;
    }

    public lookU8(): number {
        return this.view.getUint8(this.offset);
    }

    public readU8(): number {
        const value = this.view.getUint8(this.offset);
        this.offset++;
        return value;
    }

    public readU16(): number {
        const value = this.view.getUint16(this.offset);
        this.offset += 2;
        return value;
    }

    public readU32(): number {
        const value = this.view.getUint32(this.offset);
        this.offset += 4;
        return value;
    }

    public readU64(): number {
        const high = this.readU32();
        const low = this.readU32();
        return high * 0x1_0000_0000 + low;
    }

    public readF32() {
        const value = this.view.getFloat32(this.offset);
        this.offset += 4;
        return value;
    }

    public readStrng(byteLength: number): string {
        const end = this.offset + byteLength;
        const units: Array<number> = [];
        let result = "";
        while (this.offset < end) {
            const byte1 = this.readU8();
            if ((byte1 & 0x80) === 0) {
                // 1 byte
                units.push(byte1);
            } else if ((byte1 & 0xe0) === 0xc0) {
                // 2 bytes
                const byte2 = this.readU8() & 0x3f;
                units.push(((byte1 & 0x1f) << 6) | byte2);
            } else if ((byte1 & 0xf0) === 0xe0) {
                // 3 bytes
                const byte2 = this.readU8() & 0x3f;
                const byte3 = this.readU8() & 0x3f;
                units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
            } else if ((byte1 & 0xf8) === 0xf0) {
                // 4 bytes
                const byte2 = this.readU8() & 0x3f;
                const byte3 = this.readU8() & 0x3f;
                const byte4 = this.readU8() & 0x3f;
                let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
                if (unit > 0xffff) {
                    unit -= 0x10000;
                    units.push(((unit >>> 10) & 0x3ff) | 0xd800);
                    unit = 0xdc00 | (unit & 0x3ff);
                }
                units.push(unit);
            } else {
                units.push(byte1);
            }

            if (units.length >= 0x1_000) {
                result += String.fromCharCode(...units);
                units.length = 0;
            }
        }

        if (units.length > 0)
            result += String.fromCharCode(...units);

        return result;
    }
}