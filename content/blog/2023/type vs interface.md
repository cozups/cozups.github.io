---
title: "type vs interface"
date: "2023-04-06"
description: "type과 interface"
category: "TypeScript"
tags: ["TypeScript"]
---

# type alias와 interface

> _A type alias is exactly that - a name for any type. An interface declaration is another way to name an object type._

type alias는 모든 타입에 이름을 붙일 수 있지만, interface는 오로지 객체 타입만 가능하다.

그렇다면 type이 interface를 대체할 수 있는 것까?

# type alias와 interface의 차이점

> _Type aliases and interfaces are very similar, and in many cases you can choose between them freely. Almost all features of an interface are available in type, the key distinction is that a type cannot be re-opened to add new properties vs an interface which is always extendable._

type alias와 interface는 매우 유사하지만 큰 차이점은 **type alias는 interface와 달리 extendable하지 않다**는 것이다.

- interface는 다른 interface를 사용하여 `extends`, `implements`할 수 있지만 type은 그렇지 않다.
  - interface는 `type`, `interface`, `class`를 extends할 수 있다.
  ```tsx
  interface PersonNameInterface {
    name: string;
  }
  interface Person1 extends PersonNameInterface {
    age: number;
  }

  type PersonNameType = { name: string };
  interface Person2 extends PersonNameType {
    age: number;
  }

  class PersonClass {
    name = "Jhon";
  }
  interface Person3 extends PersonClass {
    age: number;
  }
  ```
- interface는 동일한 이름을 이용하여 정의할 수 있지만 type은 그렇지 않다.
  - 이 경우 두 interface가 합쳐진다.
  ```tsx
  interface Person {
    name: string;
  }

  interface Person {
    age: number;
  }

  const john: Person = {
    name: "John",
    age: 26,
  };
  ```
- 여러 개의 `type`과 `interface`를 `&`연산자를 이용하여 intersection type을 만들 수 있지만 intersection interface를 만들 수는 없다.
