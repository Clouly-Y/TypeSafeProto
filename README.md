# TypeSafeProto
- [中文](#中文)
- [English](#english)

# 中文
**作者**: Clouly 943592084@qq.com  
**简介**: TypeScript中近乎完美的Class对象序列化解决方案。

## 适用项目

1、前后端语言均为TypeScript，并且共用相同的协议代码。  
2、协议传输的类中有需要保留的方法，或有泛型对象传输需求。

## 技术特点

1、在反序列化时恢复原型链（具体类型或泛型）  
2、字段名转为2个数字存储（继承层级+指定标号）  
3、变长数字编码（基于msgpack标准，略有改动）  
4、使用装饰器语法，无需额外定义schema  
5、二进制压缩，高效序列化  
6、无需创建中间对象，减少内存垃圾  
7、支持向前向后兼容  
8、无需像protobuf在外部定义原型  
9、不依赖TextEncoder，可以直接在小游戏中使用  
10、支持Map、Set、Date  
11、自由的类型继承  
12、超级轻量、开箱即用  

## 使用方法

### 引入项目
`npm i typesafeproto`  
`import proto from "typesafeproto"`;

### 基础类型
`type 基础类型 = number|boolean|string|Date|null|undefined`
#### 定义
``` TypeScript
class CustomClass{  
    @proto.member(1)//标号1，类型指定：无（基础类型）  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    //no proto.member
    otherField: number;  
}
```
没有被 `@proto.member` 标注的字段，如`otherField`,将不会被序列化。
#### 序列化
``` TypeScript
let obj=new CustomClass();  
//obj.anyBasicType = ..........  
const data = proto.encode(obj);  
const decoded = proto.decode(data, CustomClass);
```
### 自定义类型
``` TypeScript
class CustomClass2{  
    //.......  
}  
  
class CustomClass{  
    @proto.member(1)  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    @proto.member(2, CustomClass2)  
    class2: CustomClass2|null;  
}  
```
### Array、Map、Set
``` TypeScript
class CustomClass{  
    @proto.member(1)  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    @proto.member(2, CustomClass2)//标号2，类型指定：CustomClass2  
    class2: CustomClass2|null;  
    @proto.member(3, CustomClass2)  
    arr1: CustomClass2[];  
    @proto.member(3, CustomClass2)  
    arr2: CustomClass2[][][][][][][][];  
    @proto.member(4, Set, CustomClass2)//标号4，类型指定：Set<CustomClass2>  
    set: Set<CustomClass2>;  
    @proto.member(5, Map, Number, CustomClass2)  
    map: Map<number, CustomClass2>;  
}  
```
### 类继承
``` TypeScript
class CustomClass3 extends CustomClass{  
    @proto.member(1)  
    anyBasicType1: number|boolean|string|Date|null|undefined;  
}  
```
### 字段默认值
``` TypeScript
class CustomClass3 extends CustomClass{  
    @proto.member(1) @proto.def(0)  
    anyBasicType1: number|boolean|string|Date|null|undefined;  
}  
```  
字段值 === 默认值   
或  
默认值 === null && 字段值 == null  
时，该字段将不会被压缩，减小数据体积。  

### 泛型序列化
首先定义类型表  
``` TypeScript
//type TypeRecord<T extends object = object> = Record<number, Constructor<T>>;  
const record: TypeRecord<object> = {  
    0:CustomClass,  
    1:CustomClass1,  
    2:CustomClass2,  
    3:CustomClass3,  
    //......  
}  
```
然后,这个类型表可以用于proto.member的类型指定：  
``` TypeScript
class CustomClass{  
    @proto.member(1)  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    @proto.member(2, record)  
    class2: object;  
    @proto.member(3, record)  
    arr1: object[];  
    @proto.member(3, record)  
    arr2: object[][][][][][][][];  
    @proto.member(4, Set, record)  
    set: Set<object>;  
    @proto.member(5, Map, Number, record)  
    map: Map<number, object>;  
}  
```  
或者序列化、反序列化方法的类型指定：  
``` TypeScript
const data = proto.encode(obj, record);  
const decoded = proto.decode(data, record);  
```  
## Tips
`type 基础类型 = number|boolean|string|Date|null|undefined`   
对于类型指定：Number、Boolean、String、Date、null均会将字段指定为“基础类型”，实际使用上并无区别。  
存储自定义类型的位置，如果存储了基础类型对象，可以正确序列化。  
Set或Map即使存储基础类型，`@proto.member`的第一个类型指定也必须明确为Set或Map。  
  
## 注意
1、不支持BigInt。  
2、不支持Map、Array、Set互相嵌套(支持交错数组)。  
3、小数将压缩为float32，注意精度问题。  
4、`@proto.member` 指定的字段标号: >=0 ,不能重复（可以与基类字段重复）,尽量小。  
4、对于已经存在的数据，可以删除类定义中的`@proto.member`,但是字段标号不能重用。  
5、对于已经存在的数据，不能更改类继承关系。  
6、不区分 `null` `undefined`。  
7、反序列化时会执行类的构造函数，请保证参数全为`undefined`时不会抛出报错。  
8、不支持循环引用：内部有循环引用的对象，调用压缩函数会直接卡死。  
9、`proto.encode`只能压缩自定义类。

# english
**Author**: Clouly 943592084@qq.com  
**Description**: A near-perfect class object serialization solution for TypeScript.

## Ideal For

1、Full-stack TypeScript projects sharing protocol code between frontend and backend.  
2、Scenarios requiring preserved class methods or generic object transmission.

## Features

1、Prototype chain restoration during deserialization. (concrete types and generics)  
2、Field names compressed to two numbers. (inheritance level + index)  
3、Variable-length number encoding. (modified msgpack standard)  
4、Decorator syntax - no additional schema definitions required.  
5、Efficient binary compression.  
6、No intermediate objects created - reduces memory garbage.(unlike class-transformer)  
7、Forward and backward compatibility support.  
8、No external prototype definitions needed. (unlike protobuf)  
9、TextEncoder-independent - works directly in mini-games.  
10、Supports Map, Set, and Date.  
11、Flexible type inheritance.  
12、Ultra-lightweight and ready-to-use.  

## Usage

### Installation
`npm i typesafeproto`  
`import proto from "typesafeproto";`

### Basic Types
`type BasicType = number|boolean|string|Date|null|undefined`
#### Definition
``` TypeScript
class CustomClass{  
    @proto.member(1)//index:1,type:null(BasicType)  
    anyBasicType: number|boolean|string|Date|null|undefined;  

    // Fields without @proto.member won't be serialized
    otherField: number;  
}
```
#### Serialization
``` TypeScript
let obj=new CustomClass();  
//obj.anyBasicType = ..........  
const data = proto.encode(obj);  
const decoded = proto.decode(data, CustomClass);
```
### Custom Class Type
``` TypeScript
class CustomClass2{  
    //.......  
}  
  
class CustomClass{  
    @proto.member(1)  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    @proto.member(2, CustomClass2)  
    class2: CustomClass2|null;  
}  
```
### Array、Map、Set
``` TypeScript
class CustomClass{  
    @proto.member(1)  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    @proto.member(2, CustomClass2)//index:2,type:CustomClass2  
    class2: CustomClass2|null;  
    @proto.member(3, CustomClass2)  
    arr1: CustomClass2[];  
    @proto.member(3, CustomClass2)  
    arr2: CustomClass2[][][][][][][][];  
    @proto.member(4, Set, CustomClass2)//index:4,type:Set<CustomClass2>  
    set: Set<CustomClass2>;  
    @proto.member(5, Map, Number, CustomClass2)  
    map: Map<number, CustomClass2>;  
}  
```
### Class Inheritance
``` TypeScript
class CustomClass3 extends CustomClass{  
    @proto.member(1)  
    anyBasicType1: number|boolean|string|Date|null|undefined;  
}  
```
### Default Values
``` TypeScript
class CustomClass3 extends CustomClass{  
    @proto.member(1) @proto.def(0)  
    anyBasicType1: number|boolean|string|Date|null|undefined;  
}  
```  
Fields will be omitted during compression when:  
    Field value === default value, OR  
    Default value === null && field value == null  

### Generic Serialization
First define a type record:  
``` TypeScript
//type TypeRecord<T extends object = object> = Record<number, Constructor<T>>;  
const record: TypeRecord<object> = {  
    0:CustomClass,  
    1:CustomClass1,  
    2:CustomClass2,  
    3:CustomClass3,  
    //......  
}  
```
Usage in class fields:
``` TypeScript
class CustomClass{  
    @proto.member(1)  
    anyBasicType: number|boolean|string|Date|null|undefined;  
    @proto.member(2, record)  
    class2: object;  
    @proto.member(3, record)  
    arr1: object[];  
    @proto.member(3, record)  
    arr2: object[][][][][][][][];  
    @proto.member(4, Set, record)  
    set: Set<object>;  
    @proto.member(5, Map, Number, record)  
    map: Map<number, object>;  
}  
```  
Or during serialization:  
``` TypeScript
const data = proto.encode(obj, record);  
const decoded = proto.decode(data, record);  
```  
## Tips
`type BasicType = number|boolean|string|Date|null|undefined`   
Number, Boolean, String, Date, and null are all treated as BasicType.  
BasicType value stored in custom type fields will serialize correctly.  
For Sets or Maps, the first type parameter must explicitly be Set or Map.  
  
## Important Notes
1、BigInt not supported.  
2、No nested Map/Array/Set. (jagged arrays supported)  
3、Decimals compressed as float32 - note precision limitations.  
4、`@proto.member` index must be: ≥0, unique (can reuse index of parent class fields), and preferably small.
4、For existing data,can remove `@proto.member` but cannot reuse index.  
5、For existing data,cannot modify class inheritance.  
6、`null` and `undefined` are treated identically.  
7、Constructors must handle all-undefined parameters during deserialization.  
8、Circular references will cause infinite loops.  
9、`proto.encode` only works with custom classes.