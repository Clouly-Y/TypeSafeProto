import { TypeMarkError } from "./Error/TypeMarkError";

export default class Mark {
    //0x00<=  <0x80
    public static readonly MAX_POSITIVE_FIX_INT = 0x80;
    //0x90<=  <0xa0
    public static readonly FIX_ARR = 0x90;
    //0xa0<=  <0xbf
    public static readonly FIX_STR = 0xa0;

    public static readonly NIL = 0xc0;

    //0xc1

    public static readonly FALSE = 0xc2;
    public static readonly TRUE = 0xc3;

    public static readonly DOUBLE = 0xca;

    //0xcb

    public static readonly P_INT_8 = 0xcc;
    public static readonly P_INT_16 = 0xcd;
    public static readonly P_INT_32 = 0xce;
    public static readonly P_INT_64 = 0xcf;
    public static readonly N_INT_8 = 0xd0;
    public static readonly N_INT_16 = 0xd1;
    public static readonly N_INT_32 = 0xd2;
    public static readonly N_INT_64 = 0xd3;

    public static readonly STR_8 = 0xd4;
    public static readonly STR_16 = 0xd5;
    public static readonly STR_32 = 0xd6;
    public static readonly STR_64 = 0xd7;

    public static readonly ARR_8 = 0xd8;
    public static readonly ARR_16 = 0xd9;
    public static readonly ARR_32 = 0xda;
    public static readonly ARR_64 = 0xdb;

    //0xdc

    public static readonly DATE = 0xde;

    public static readonly RECORD = 0xdf;

    //0xe0<= <=0xff
    public static readonly NEGATIVE_FIX_INT_START = 0xe0;


    public static readonly MAX_FIX_STR_LENGTH = 32;
    public static readonly MAX_FIX_ARR_LENGTH = 16;
    public static readonly MIN_NEGATIVE_FIX_INT = -0x20;
    public static readonly MAX_UINT_8 = 0x100;
    public static readonly MAX_UINT_16 = 0x10000;
    public static readonly MAX_UINT_32 = 0x100000000;

    public static markToType(typeMark: number): DateConstructor | StringConstructor | BooleanConstructor | NumberConstructor | null | 0xdf | ArrayConstructor {
        if (typeMark < Mark.MAX_POSITIVE_FIX_INT)
            return Number;
        else if (typeMark < Mark.FIX_STR)
            return Array;
        else if (typeMark < Mark.NIL)
            return String;
        else if (typeMark >= Mark.NEGATIVE_FIX_INT_START)
            return Number;
        else {
            switch (typeMark) {
                case Mark.NIL: return null;

                case Mark.FALSE:
                case Mark.TRUE: return Boolean;

                case Mark.DOUBLE:
                case Mark.P_INT_8:
                case Mark.P_INT_16:
                case Mark.P_INT_32:
                case Mark.P_INT_64:
                case Mark.N_INT_8:
                case Mark.N_INT_16:
                case Mark.N_INT_32:
                case Mark.N_INT_64: return Number;

                case Mark.STR_8:
                case Mark.STR_16:
                case Mark.STR_32:
                case Mark.STR_64: return String;

                case Mark.ARR_8:
                case Mark.ARR_16:
                case Mark.ARR_32:
                case Mark.ARR_64: return Array;

                case Mark.DATE: return Date;

                case Mark.RECORD: return Mark.RECORD;

                default: throw new TypeMarkError(typeMark);
            }
        }
    }
}