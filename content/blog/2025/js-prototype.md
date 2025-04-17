---
title: "26. 프로토타입"
date: "2025-04-13"
description: "모던 자바스크립트 Deep Dive 19장"
category: "Study"
tags: ["JavaScript", "Study"]
---

# 1. 프로토타입

<cite>자바스크립트는 클래스 기반 객체지향 프로그래밍 언어보다 효율적이고 더 강력한 객체지향 프로그래밍 능력을 가지고 있는 '**프로토타입 기반의 객체지향 언어**'이다.</cite>

ES6에서 클래스가 도입되었지만, 프로토타입 기반 객체지향 모델을 폐지하는 것은 아니다. 기존 프로토타입 기반 패턴의 문법적 설탕이며 새로운 객체 생성 매커니즘이다.

자바스크립트에서 원시 타입의 값을 제외한 나머지 값들은 객체이다.

# 2. 객체지향 프로그래밍

프로그램을 여러 개의 독립적인 단위(객체)로 표현하려는 프로그래밍 패러다임을 뜻한다.

어떠한 개념에 대한 특징이나 성질을 **속성**으로 보고, 다양한 속성 중 필요한 속성만 간추려 내는 것을 **추상화**라고 한다.

이러한 속성을 통해 여러 개의 값을 하나의 단위로 구성한 복합적인 자료구조를 **객체**라고 한다. 객체의 상태 데이터를 **프로퍼티**, 동작을 **메서드**라 부른다.

# 3. 상속과 프로토타입

상속이란 어떤 객체의 프로퍼티 또는 메서드를 다른 객체가 상속받아 그대로 사용할 수 있는 것을 말한다.

```js
// 생성자 함수
function Circle(radius) {
  this.radius = radius;
  this.getArea = function () {
    // Math.PI는 원주율을 나타내는 상수다.
    return Math.PI * this.radius ** 2;
  };
}

// 반지름이 1인 인스턴스 생성
const circle1 = new Circle(1);
// 반지름이 2인 인스턴스 생성
const circle2 = new Circle(2);

// Circle 생성자 함수는 인스턴스를 생성할 때마다 동일한 동작을 하는
// getArea 메서드를 중복 생성하고 모든 인스턴스가 중복 소유한다.
// getArea 메서드는 하나만 생성하여 모든 인스턴스가 공유해서 사용하는 것이 바람직하다.
console.log(circle1.getArea === circle2.getArea); // false

console.log(circle1.getArea()); // 3.141592653589793
console.log(circle2.getArea()); // 12.566370614359172
```

이 코드는 radius 프로퍼티와 getArea 메서드를 갖는 Circle 인스턴스를 두 개 생성하는 코드이다. radius는 Circle마다 다르게 가지지만, getArea 메서드의 경우는 동일한 내용의 코드를 가진다.

<h4>🚨 문제점</h4>

그러나, 동일한 내용의 코드를 가진 메서드라 하더라도 인스턴스가 생성될 때마다 getArea 메서드가 중복 생성된다. 10개의 인스턴스를 생성하면 10개의 getArea 메서드도 생성되는 것이고 이는 성능에 악영향을 미친다.

자바스크립트는 <span class="pen-blue">프로토타입을 기반으로 상속을 구현</span>할 수 있다.

```js
// 생성자 함수
function Circle(radius) {
  this.radius = radius;
}

// Circle 생성자 함수가 생성한 모든 인스턴스가 getArea 메서드를
// 공유해서 사용할 수 있도록 프로토타입에 추가한다.
// 프로토타입은 Circle 생성자 함수의 prototype 프로퍼티에 바인딩되어 있다.
Circle.prototype.getArea = function () {
  return Math.PI * this.radius ** 2;
};

// 인스턴스 생성
const circle1 = new Circle(1);
const circle2 = new Circle(2);

// Circle 생성자 함수가 생성한 모든 인스턴스는 부모 객체의 역할을 하는
// 프로토타입 Circle.prototype으로부터 getArea 메서드를 상속받는다.
// 즉, Circle 생성자 함수가 생성하는 모든 인스턴스는 하나의 getArea 메서드를 공유한다.
console.log(circle1.getArea === circle2.getArea); // true

console.log(circle1.getArea()); // 3.141592653589793
console.log(circle2.getArea()); // 12.566370614359172
```

Circle.prototype에 getArea 메서드를 넣어 Circle 생성자 함수를 통해 생성된 인스턴스들이 getArea 메서드를 중복 생성하지 않고도 메서드를 사용할 수 있다. 이처럼 상속은 <span class="pen-blue">코드의 재사용 관점에서 매우 유용</span>하다.

# 4. 프로토타입 객체

프로토타입은 어떤 객체의 상위 객체 역할을 하는 객체로서 다른 객체에 공유 프로퍼티와 메서드를 제공한다. 객체가 생성될 때, 객체 생성 방식에 따라 프로토타입이 결정되고 [[Prototype]] 슬롯에 저장된다.

모든 객체는 하나의 프로토타입을 가지고, 모든 프로토타입은 생성자 함수와 연결되어 있다. [[Prototype]] 내부 슬롯에는 직접 접근할 수 없지만 `__proto__` 접근자 프로퍼티를 통해 [[Prototype]] 내부 슬롯이 가리키는 프로토타입에 간접적으로 접근할 수 있다.

## 4.1 `__proto__` 접근자 프로퍼티

모든 객체는 `__proto__` 접근자 프로퍼티를 통해 [[Prototype]] 내부 슬롯에 간접적으로 접근할 수 있다.

<div class="note">
  접근자 프로퍼티는 자체적으로 값을 갖지 않고 다른 데이터 프로퍼티의 값을 읽거나 저장할 수 있는 접근자 함수를 가진 프로퍼티이다.<br/> 
값을 취득할 때는 getter 함수가 호출되고 값을 저장할 땐 setter 함수가 호출된다.
</div>

#### 특징

1. `__proto__` 접근자 프로퍼티는 객체가 직접 소유하는 프로퍼티가 아니라 Object.prototype의 프로퍼티이다.
2. `__proto__` 접근자 프로퍼티를 통해 프로토타입에 접근하는 이유는 상호 참조에 의해 프로토타입 체인 사이클이 생성되는 것을 방지하기 위해서이다. 프로토타입 체인은 단방향 링크드 리스트로 구현되어야 한다.
3. `__proto__` 접근자 프로퍼티를 코드 내에서 직접 사용하는 것은 권장하지 않는다. 모든 객체에서 사용할 수 있는 것은 아니기 때문이다.

## 4.2 함수 객체의 prototype 프로퍼티

prototype 프로퍼티는 <span class="pen-blue">함수 객체만이 소유</span>하고, 생성자 함수가 생성할 인스턴스의 프로토타입을 가리킨다.

따라서, 인스턴스를 생성할 수 없는 non-constructor인 화살표 함수와 메서드 축약표현으로 정의한 메서드는 prototype 프로퍼티를 갖지 않는다.

모든 객체가 갖고 있는 `__proto__` 접근자 프로퍼티와 함수 객체만이 가지고 있는 prototype 프로퍼티는 결국 동일한 프로토타입을 가리킨다.

## 4.3 프로토타입의 constructor 프로퍼티와 생성자 함수

constructor 프로퍼티는 해당 프로토타입 객체를 생성한 생성자 함수를 가리킨다.

# 5. 리터럴 표기법에 의해 생성된 객체의 생성자 함수와 프로토타입

프로토타입과 생성자 함수는 언제나 쌍으로 존재하기 때문에 리터럴 표기법에 의해 생성된 객체도 가상적인 생성자 함수를 갖는다.

리터럴 표기법(객체 리터럴, 함수 리터럴, 배열 리터럴, 정규 표현식 리터럴 등)으로 생성된 객체는 생성자 함수에 의해 생성된 객체는 아니지만 약간의 차이가 있을 뿐 본질적인 면에서 큰 차이는 없다. 따라서 프로토타입의 constructor 프로퍼티를 통해 연결된 생성자 함수를 리터럴 표기법에 의해 생성된 객체의 생성자 함수로 생각해도 크게 무리는 없다.

| 리터럴 표기법      | 생성자 함수 | 프로토타입         |
| ------------------ | ----------- | ------------------ |
| 객체 리터럴        | Object      | Object.prototype   |
| 함수 리터럴        | Function    | Function.prototype |
| 배열 리터럴        | Array       | Array.prototype    |
| 정규 표현식 리터럴 | RegExp      | RegExp.prototype   |

# 6. 프로토타입의 생성 시점

프로토타입은 생성자 함수가 생성되는 시점에 더불어 생성된다. 단독으로 존재할 수 없고 언제나 쌍으로 존재하기 때문이다.

객체가 생성되기 이전에 생성자 함수와 프로토타입은 이미 객체화 되어 존재한다. 이후 객체를 생성하면 [[Prototype]] 내부 슬롯에 할당된다.

## 6.1 사용자 정의 생성자 함수와 프로토타입 생성 시점

생성자 함수로서 호출할 수 있는 constructor 함수는 <span class="pen-blue">함수 정의가 평가되어 함수 객체를 생성하는 시점</span>에 프로토타입도 생성된다. 생성자로서 호출할 수 없는 non-constructor 함수는 프로토타입이 생성되지 않는다.

프로토타입 객체도 프로토타입을 가지는데 항상 Object.prototype이다.

## 6.2 빌트인 생성자 함수와 프로토타입 생성 시점

Object, String, Number, Function, Array, RegExp, Date, Promise 등 빌트인 생성자 함수들도 빌트인 생성자 함수가 생성되는 시점에 프로토타입이 생성된다. 이 경우, <span class="pen-blue">전역 객체가 생성되는 시점</span>에 생성된다.

# 7. 객체 생성 방식과 프로토타입의 결정

1. 객체 리터럴 → Object.prototype
2. Object 생성자 함수 → Object.prototype
3. 생성자 함수 → 생성자 함수의 prototype 프로퍼티에 바인딩된 객체
   - ex) Person 생성자 함수 → Person.prototype
4. Object.create 메서드
5. 클래스(ES6)

# 8. 프로토타입 체인

자바스크립트는 객체의 프로퍼티에 접근하려고 할 때, 해당 객체에 접근하려는 프로퍼티가 없다면 [[Prototype]] 내부 슬롯의 참조를 따라 프로토타입의 프로퍼티를 순차적으로 검색한다.

프로토타입 체인의 최상위에 위치하는 객체는 언제나 Object.prototype이다.

프로토타입 체인은 상속과 프로퍼티 검색을 위한 매커니즘이다. 이에 반해, 스코프 체인은 식별자 검색을 위한 매커니즘이라고 할 수 있다.

```js
me.hasOwnProperty("name");
```

이 코드는 스코프 체인을 통해 me라는 식별자를 검색한 후, me 객체의 프로토타입 체인을 통해 hasOwnProperty 메서드를 검색한다.

# 9. 오버라이딩과 프로퍼티 섀도잉

오버라이딩이란 상위 클래스가 가지고 있는 메서드를 하위 클래스가 재정의하여 사용하는 방식이다. 상속 관계에 의해 프로퍼티가 가려지는 현상을 프로퍼티 섀도잉이라 한다.

```js
const Person = (function () {
  // 생성자 함수
  function Person(name) {
    this.name = name;
  }

  // 프로토타입 메서드
  Person.prototype.sayHello = function () {
    console.log(`Hi! My name is ${this.name}`);
  };

  // 생성자 함수를 반환
  return Person;
})();

const me = new Person("Lee");

// 인스턴스 메서드
me.sayHello = function () {
  console.log(`Hey! My name is ${this.name}`);
};

// 인스턴스 메서드가 호출된다. 프로토타입 메서드는 인스턴스 메서드에 의해 가려진다.
me.sayHello(); // Hey! My name is Lee
```

인스턴스 메서드 sayHello에 의해 프로토타입 메서드 sayHello가 가려지는 현상이 일어난다.

프로퍼티나 메서드를 삭제하는 경우 delete 키워드를 통해 삭제할 수 있는데, 이 경우 프로토타입의 프로퍼티나 메서드가 삭제되는 것이 아니라 인스턴스의 프로퍼티나 메서드가 삭제된다. 하위 객체를 통해 프로토타입의 프로퍼티를 변경하거나 삭제하는 것은 불가능하다. 프로토타입의 프로퍼티를 변경하거나 삭제하려면 프로토타입에 직접 접근해야한다.

# 10. 프로토타입의 교체

프로토타입은 생성자 함수를 통해 변경되거나 인스턴스에 의해 동적으로 변경될 수 있다.

## 10.1 생성자 함수에 의한 프로토타입 교체

```js
const Person = (function () {
  function Person(name) {
    this.name = name;
  }

  // ① 생성자 함수의 prototype 프로퍼티를 통해 프로토타입을 교체
  Person.prototype = {
    sayHello() {
      console.log(`Hi! My name is ${this.name}`);
    },
  };

  return Person;
})();

const me = new Person("Lee");
```

생성자 함수를 통해 프로토타입을 교체한 경우에는 Person.prototype이 교체된 프로토타입을 가리킨다. Person.prototype이 객체 리터럴로 변경되었기 때문에 me.constructor는 Person이 아니라 Object이다. 파괴된 연결을 되살리려면 교체할 객체리터럴에 constructor 프로퍼티를 추가하여 되살리면 된다.

## 10.2 인스턴스에 의한 프로토타입 교체

```js
function Person(name) {
  this.name = name;
}

const me = new Person("Lee");

// 프로토타입으로 교체할 객체
const parent = {
  sayHello() {
    console.log(`Hi! My name is ${this.name}`);
  },
};

// ① me 객체의 프로토타입을 parent 객체로 교체한다.
Object.setPrototypeOf(me, parent);
// 위 코드는 아래의 코드와 동일하게 동작한다.
// me.__proto__ = parent;

me.sayHello(); // Hi! My name is Lee
```

생성자 함수에 의해 프로토타입을 교체했을 때와 달리 이 경우에는 Person.prototype과 교체된 프로토타입의 연결이 끊긴다. 따라서 교체된 프로토타입 객체와 Person.prototype 프로퍼티를 연결하려면 교체한 객체 리터럴에 constructor 프로퍼티를 추가하고 Person.prototype이 교체할 프로토타입 객체와 연결되도록 재설정해야한다.

# 11. instanceof 연산자

```js
객체 instanceof 생성자 함수
```

우변 생성자 함수의 prototype 객체가 좌변 객체의 프로토타입 체인 상에 존재하면 true를 반환한다.

```js
me instanceof Person;
```

위 코드는 me의 프로토타입 체인에 Person.prototype에 바인딩 된 객체가 있는지 확인한다.

# 12. 직접 상속

## 12.1 Object.create에 의한 직접 상속

`Object.create` 메서드는 명시적으로 프로토타입을 지정하여 새로운 객체를 생성한다. 첫 번째 매개변수에 프로토타입으로 지정할 객체를 전달하고, 두 번째 매개변수에는 생성할 객체의 프로퍼티 키와 프로퍼티 디스크립터 객체로 이뤄진 객체를 전달한다.

```js
let obj = Object.create(Object.prototype, {
  x: { value: 1, writable: true, enumerable: true, configurable: true },
});

console.log(obj.x); // 1
consolg.log(Object.getPrototypeOf(obj) === Object.prototype); // true
```

#### ⚠️주의사항

ESLint에서는 객체가 직접 Object.prototype의 빌트인 메서드를 호출하는 것을 권장하지 않는다.

```js
// 프로토타입이 null인 객체, 즉 프로토타입 체인의 종점에 위치하는 객체를 생성한다.
const obj = Object.create(null);
obj.a = 1;

console.log(Object.getPrototypeOf(obj) === null); // true

// obj는 Object.prototype의 빌트인 메서드를 사용할 수 없다.
console.log(obj.hasOwnProperty("a")); // TypeError: obj.hasOwnProperty is not a function
```

이 같은 에러를 방지하기 위해 간접적으로 호출 하는 것을 권장한다.

```js
// Object.prototype의 빌트인 메서드는 객체로 직접 호출하지 않는다.
console.log(Object.prototype.hasOwnProperty.call(obj, "a")); // true
```

## 12.2 객체 리터럴 내부에서 `__proto__`에 의한 직접 상속

`Object.create`메서드에서 두 번째 인자로 프로퍼티를 정의하는 것이 번거롭기 때문에 사용할 수 있는 다른 방법이다.

```js
const myProto = { x: 10 };

// 객체 리터럴에 의해 객체를 생성하면서 프로토타입을 지정하여 직접 상속받을 수 있다.
const obj = {
  y: 20,
  // 객체를 직접 상속받는다.
  // obj → myProto → Object.prototype → null
  __proto__: myProto,
};
/* 위 코드는 아래와 동일하다.
const obj = Object.create(myProto, {
  y: { value: 20, writable: true, enumerable: true, configurable: true }
});
*/

console.log(obj.x, obj.y); // 10 20
console.log(Object.getPrototypeOf(obj) === myProto); // true
```

# 13. 정적 프로퍼티/메서드

생성자 함수로 인스턴스를 생성하지 않아도 참조/호출할 수 있는 프로퍼티/메서드를 말한다.

생성자 함수 자체가 갖는 프로퍼티/메서드로, 생성자 함수가 생성한 인스턴스에서는 이 프로퍼티/메서드를 참조하거나 호출할 수 없다.

```js
// 생성자 함수
function Person(name) {
  this.name = name;
}

// 프로토타입 메서드
Person.prototype.sayHello = function () {
  console.log(`Hi! My name is ${this.name}`);
};

// 정적 프로퍼티
Person.staticProp = "static prop";

// 정적 메서드
Person.staticMethod = function () {
  console.log("staticMethod");
};

const me = new Person("Lee");

// 생성자 함수에 추가한 정적 프로퍼티/메서드는 생성자 함수로 참조/호출한다.
Person.staticMethod(); // staticMethod

// 정적 프로퍼티/메서드는 생성자 함수가 생성한 인스턴스로 참조/호출할 수 없다.
// 인스턴스로 참조/호출할 수 있는 프로퍼티/메서드는 프로토타입 체인 상에 존재해야 한다.
me.staticMethod(); // TypeError: me.staticMethod is not a function
```

# 14. 프로퍼티 존재 확인

## 14.1 in 연산자

```js
key in object;
```

in 연산자는 객체 내에 특정 프로퍼티가 존재하는지 여부를 확인한다.
key는 문자열이어야 한다.

in 연산자는 확인 대상 객체뿐만 아니라 확인 대상 객체가 상속받은 모든 프로토타입의 프로퍼티를 확인하므로 주의가 필요하다.

```js
const person = {
  name: "Lee",
  address: "Seoul",
};

// person 객체에 name 프로퍼티가 존재한다.
console.log("name" in person); // true
// person 객체에 address 프로퍼티가 존재한다.
console.log("address" in person); // true
// person 객체에 age 프로퍼티가 존재하지 않는다.
console.log("age" in person); // false

console.log("toString" in person); // true
```

person 객체에 `toString` 프로퍼티가 존재하지 않지만 Object.prototype의 메서드이기 때문에 true를 반환하게 된다.

## 14.2 Object.prototype.hasOwnProperty 메서드

```js
console.log(person.hasOwnProperty("name")); // true
console.log(person.hasOwnProperty("age")); // false

console.log(person.hasOwnProperty("toString")); // false
```

`Object.prototype.hasOwnProperty` 메서드는 인수로 전달받은 프로퍼티 키가 <span class="pen-blue">객체 고유의 프로퍼티 키인 경우에만 true</span>를 반환하고 상속받은 프로토타입의 프로퍼티 키인 경우 false를 반환한다.

# 15. 프로퍼티 열거

## 15.1 for...in 문

```js
for (변수선언문 in 객체) {...}
```

객체의 모든 프로퍼티를 순회하며 열거한다. 객체의 프로퍼티 개수만큼 순회한다.

#### 특징

1. 순회 대상 객체뿐만 아니라 상속받은 프로토타입의 프로퍼티까지 열거한다. 객체 자신의 고유한 프로퍼티만 열거하고 싶으면 Object.prototype.hasOwnProperty 메서드를 이용하여 확인하는 추가 처리가 필요하다.
2. 그러나 순회할 수 있도록 정의된 프로퍼티만 순회한다. 즉, [[Enumerable]]의 값이 true인 프로퍼티만 순회한다.
3. 프로퍼티 키가 심벌인 프로퍼티는 열거하지 않는다.
4. 열거 순서를 보장하지는 않지만 대부분의 모던 브라우저에서는 순서를 보장하고 프로퍼티 키가 숫자인 경우엔 정렬을 실시한다.

## 15.2 Object.keys/values/entries 메서드

객체 자신의 고유 프로퍼티만 열거하기 위해서 권장되는 메서드들이다.

- `Object.keys`: 객체 자신의 열거 가능한 프로퍼티 키를 배열로 반환한다.
- `Object.values`: 객체 자신의 열거 가능한 프로퍼티 값을 배열로 반환한다.(ES8)
- `Object.entries`: 객체 자신의 열거 가능한 프로퍼티 키-값 쌍의 배열을 배열에 담아 반환한다.
