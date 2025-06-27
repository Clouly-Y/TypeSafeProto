export default class Mark {
    //可支配256位
    //非fix数字头部与null占用10位
    //非fix可变长头部占用4位
    //剩下241位
    //fix正整数占用128
    //fix负数占用32
    //fix可变占用82

    public static readonly POSITIVE_FIX_INT_START = 0;
    public static readonly POSITIVE_FIX_INT_END = 127;
    public static readonly NEGATIVE_FIX_INT_START = 128;
    public static readonly NEGATIVE_FIX_INT_END = 159;

    public static readonly POSSITIVE_INT_8 = 160;
    public static readonly POSSITIVE_INT_16 = 161;
    public static readonly POSSITIVE_INT_32 = 162;
    public static readonly POSSITIVE_INT_64 = 163;
    public static readonly NEGATIVE_INT_8 = 164;
    public static readonly NEGATIVE_INT_16 = 165;
    public static readonly NEGATIVE_INT_32 = 166;
    public static readonly NEGATIVE_INT_64 = 167;
    public static readonly FLOAT32 = 168;
    public static readonly NIL = 169;

    public static readonly FIX_VAR_START = 170;
    public static readonly FIX_VAR_END = 251;

    public static readonly VAR_8 = 252;
    public static readonly VAR_16 = 253;
    public static readonly VAR_32 = 254;
    public static readonly VAR_64 = 255;

    public static readonly MAX_UINT_8 = 0x100;
    public static readonly MAX_UINT_16 = 0x10000;
    public static readonly MAX_UINT_32 = 0x100000000;
}