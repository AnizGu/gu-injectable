# gu-injectable

> 使用 Typescript+Decorators 写的一个依赖注入库。

[![NPM](https://img.shields.io/npm/v/gu-injectable.svg)](https://www.npmjs.com/package/gu-injectable) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## 安装

```bash
npm install --save gu-injectable
```

**or**

```bash
yarn add gu-injectable
```

## 使用

开发前配置 tsconfig.ts

```json

{
  "compilerOptions": {
    ...
    "experimentalDecorators": true, //开启
    "emitDecoratorMetadata": true //开启
  }
}
```

按照以下流程小试牛刀（以循环依赖为例）。

### 第一步

创建`src/test/named.ts`文件，此文件内容用于提供函数的名称。

```ts
export const Nameds = {
    GET_STUDENT: Symbol.for("get-student"),
    GET_NAME: Symbol.for("name"),
    GET_AGE: Symbol.for("age"),
    GET_TEACHER: Symbol.for("get-teacher")
}
```

### 第二步

创建`src/test/student.ts`。

```ts
import { Inject, LazyProvider, Singleton } from "gu-injectable";
import { Nameds } from "./nameds";
import Teacher from "./teacher";
@Singleton
class Student {
    @Inject(Nameds.GET_TEACHER)
    teacher!: LazyProvider<Teacher>;
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

export default Student;
```

### 第三步

创建`src/test/teacher.ts`

```ts
import { Inject, Singleton } from "gu-injectable";
import { Nameds } from "./nameds";
import Student from "./student";

@Singleton
class Teacher {
    @Inject(Nameds.GET_STUDENT)
    student!: Student;
}

export default Teacher;
```

### 第四步

使用`@Module`、`@Provides`、`@Named`、`@ReturnType`、`@Parameter`装饰器创建注入模型，创建`src/test/modules.ts`

```ts
import { Module, Named, Parameter, Provides, ReturnType } from "gu-injectable";
import { Nameds } from "./nameds";
import Student from "./student";
import Teacher from "./teacher";

@Module
export class StudentModule {

    @Provides
    @Named(Nameds.GET_STUDENT)
    @ReturnType(Student)
    provideStudent(@Parameter(Nameds.GET_NAME) name: string, @Parameter(Nameds.GET_AGE) age: number) {
        return new Student(name, age);
    }

    @Provides
    @Named(Nameds.GET_NAME)
    @ReturnType(String)
    provideName() {
        return "Jhon";
    }

    @Provides
    @Named(Nameds.GET_AGE)
    @ReturnType(Number)
    provideAge() {
        return 12;
    }

    @Provides
    @Named(Nameds.GET_TEACHER)
    @ReturnType(Teacher)
    provideTeacher() {
        return new Teacher();
    }
}
```

### 第五步

查看结果

```ts
const teacher = new Teacher();
console.log(teacher.student);
// 结果为 Student {name: "Jhon", age: 12}
```

**or**

```ts
class Test {
    @Inject(Nameds.GET_TEACHER)
    teacher!:Teacher;
}

const test = new Test();
console.log(test.teacher.student);
// 结果为 Student {name: "Jhon", age: 12}
```

## License

MIT © [AnizGu](https://github.com/AnizGu)
