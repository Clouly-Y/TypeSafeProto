import { BinaryEncoder } from "./Binary/BinaryEncoder";

export default class EncoderPool {
    private static pool: BinaryEncoder[] = [];
    public static spawn(): BinaryEncoder {
        const encoder = this.pool.pop() || new BinaryEncoder();
        encoder.clear();
        return encoder;
    }
    public static despawn(encoder: BinaryEncoder) {
        this.pool.push(encoder);
    }
    public static release() {
        this.pool.length = 0;
    }
}