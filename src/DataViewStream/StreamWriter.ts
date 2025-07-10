export class StreamWriter {
    private offset: number;
    private view: DataView;
    private bytes: Uint8Array;

    constructor(initSize: number = 2048) {
        initSize = Math.max(initSize, 0);
        const buffer = new ArrayBuffer(initSize);
        this.view = new DataView(buffer);
        this.bytes = new Uint8Array(buffer);
        this.offset = 0;
    }

    public clear() {
        this.offset = 0;
    }

    public toArray(): Uint8Array {
        return this.bytes.subarray(0, this.offset);
    }

    public writeU8(value: number) {
        this.ensureBufferSizeToWrite(1);
        this.view.setUint8(this.offset, value);
        this.offset++;
    }

    public writeU16(value: number) {
        this.ensureBufferSizeToWrite(2);
        this.view.setUint16(this.offset, value);
        this.offset += 2;
    }

    public writeU32(value: number) {
        this.ensureBufferSizeToWrite(4);
        this.view.setUint32(this.offset, value);
        this.offset += 4;
    }

    public writeU64(value: number) {
        const high = value / 0x1_0000_0000;
        const low = value;
        this.writeU32(high);
        this.writeU32(low);
    }

    public writeF64(value: number) {
        this.ensureBufferSizeToWrite(8);
        this.view.setFloat64(this.offset, value);
        this.offset += 8;
    }

    public writeString(str: string) {
        const strLength = str.length;
        let pos = 0;
        while (pos < strLength) {
            let value = str.charCodeAt(pos++);

            if ((value & 0xffffff80) === 0) {
                // 1-byte
                this.writeU8(value);
                continue;
            } else if ((value & 0xfffff800) === 0) {
                // 2-bytes
                this.writeU8(((value >> 6) & 0x1f) | 0xc0);
            } else {
                // handle surrogate pair
                if (value >= 0xd800 && value <= 0xdbff) {
                    // high surrogate
                    if (pos < strLength) {
                        const extra = str.charCodeAt(pos);
                        if ((extra & 0xfc00) === 0xdc00) {
                            ++pos;
                            value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                        }
                    }
                }

                if ((value & 0xffff0000) === 0) {
                    // 3-byte
                    this.writeU8(((value >> 12) & 0x0f) | 0xe0);
                    this.writeU8(((value >> 6) & 0x3f) | 0x80);
                } else {
                    // 4-byte
                    this.writeU8(((value >> 18) & 0x07) | 0xf0);
                    this.writeU8(((value >> 12) & 0x3f) | 0x80);
                    this.writeU8(((value >> 6) & 0x3f) | 0x80);
                }
            }

            this.writeU8((value & 0x3f) | 0x80);
        }
    }

    public writeU8Array(values: ArrayLike<number>) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this.bytes.set(values, this.offset);
        this.offset += size;
    }

    private ensureBufferSizeToWrite(sizeToWrite: number) {
        const requiredSize = this.offset + sizeToWrite;
        if (this.view.byteLength < requiredSize)
            this.resizeBuffer(requiredSize * 2);
    }

    private resizeBuffer(newSize: number) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);

        newBytes.set(this.bytes);

        this.view = newView;
        this.bytes = newBytes;
    }
}