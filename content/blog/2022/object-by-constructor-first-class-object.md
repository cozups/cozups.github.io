---
title: "1. 생성자 함수에 의한 객체 생성과 일급 객체"
date: "2022-11-01"
description: "모던 자바스크립트 Deep Dive [17장][18장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# 객체 생성 방식

- 객체 리터럴
- 생성자 함수

# 생성자 함수를 이용하여 객체 생성하기

## 1. Object 생성자 함수

```js
const person = new Object(); // 빈 객체 생성

// 프로퍼티 및 메서드 추가
person.name = "Lee";
person.sayHello = function () {
  console.log("Hi! My name is " + this.name);
};

console.log(person); // {name: 'Lee', sayHello: function}
person.sayHello(); // Hi! My name is Lee
```

`new` 연산자와 함께 `Object` 생성자를 이용하면 빈 객체를 생성하여 반환한다.

생성자 함수에 의해 생성된 객체를 **인스턴스**라 한다.

- 생성자 함수의 종류
  - `String`, `Number`, `Boolean`, `Function`, `Array`, `Date`, `RegExp`, `Promise` 등

## 2. 객체 리터럴을 이용한 객체 생성 방식의 문제점

객체를 생성할 때, 반드시 `Object` 생성자 함수를 이용해 객체를 생성할 필요는 없다.

객체 리터럴을 이용하여 객체를 생성하는 것이 더 직관적이고 간편하다.

그러나, **객체 리터럴**을 이용하여 객체를 생성하는 방식은 **단 하나의 객체만 생성**한다.

그렇기 때문에 동일한 프로퍼티를 갖는 **객체를 여러 개 생성해야 하는 경우 매번 같은 프로퍼티를 기술해야하기 때문에** 비효율적이다.

객체 리터럴에 의해 객체를 생성하는 경우 프로퍼티 구조가 동일함에도 불구하고 매번 같은 프로퍼티와 메서드를 기술해야 하므로 수십 개의 객체를 생성해야 하는 경우 문제가 크다.

🎈 예제

```js
const circle1 = {
  radius: 5,
  getDiameter() {
    return 2 * this.radius;
  },
};

console.log(circle1.getDiameter()); // 10

const circle2 = {
  radius: 10,
  getDiameter() {
    return 2 * this.radius;
  },
};

console.log(circle2.getDiameter()); // 20
```

## 3. 그렇다면 생성자 함수에 의한 객체 생성 방식의 장점은?

객체(인스턴스)를 생성하기 위한 템플릿(클래스)처럼 **프로퍼티 구조가 동일한 객체 여러 개를 간편하게 생성**할 수 있다.

```js
// 생성자 함수
function Circle(radius) {
  this.radius = radius;
  this.getDiameter = function () {
    return 2 * radius;
  };
}

// 인스턴스의 생성
const circle1 = new Circle(5); // 반지름 5짜리 Circle 객체 생성
const circle2 = new Circle(10); // 반지름 10짜리 Circle 객체 생성

console.log(circle1); // 10
console.log(circle2); // 20
```

💡 this

`this`는 객체 자신의 프로퍼티나 메서드를 참조하기 위한 **자기 참조 변수**이다.
this 바인딩은 함수 호출 방식에 따라 동적으로 결정된다.

| 함수 호출 방식       | this가 가리키는 값                              |
| -------------------- | ----------------------------------------------- |
| 일반 함수 호출       | 전역 객체 (브라우저 - window, Node.js - global) |
| 메서드 호출          | 메서드를 호출한 객체                            |
| 생성자 함수로서 호출 | 생성자 함수가 생성할 인스턴스                   |

자바와 같은 클래스 기반 객체지향 언어의 생성자와는 다르게 형식이 정해져 있지 않고, 일반 함수와 동일한 방법으로 생성자 함수를 정의하고 **`new` 연산자와 함께 호출하면 해당 함수는 생성자 함수로 동작한다.**

## 4. 생성자 함수의 인스턴스 생성 과정

생성자 함수의 역할

- 구조가 동일한 인스턴스를 생성하기 위한 템플릿(클래스)으로서 인스턴스 생성
- 생성된 인스턴스 초기화 (인스턴스 프로퍼티 추가 및 초기값 할당)

자바스크립트 엔진은 다음과 같은 과정을 거쳐 암묵적으로 인스턴스를 생성하고 초기화한다.

### 인스턴스 생성과 this 바인딩

런타임 이전에,

1. 생성자 함수에 의해 빈 객체가 암묵적으로 생성되고, 이것이 인스턴스가 된다.
2. 인스턴스는 this에 바인딩 된다.

### 인스턴스 초기화

1. 생성자 함수에 기술되어 있는 코드가 한 줄씩 실행되어 this에 바인딩되어 있는 인스턴스를 초기화한다.
2. 즉, 인스턴스에 프로퍼티나 메서드를 추가하고 초기값을 인스턴스에 프로퍼티에 할당하여 초기화하거나 고정값을 할당한다.

### 인스턴스 반환

생성자 함수 내부에서 모든 처리가 끝나면 완성된 인스턴스가 바인딩된 this를 암묵적으로 반환한다.

```js
// 생성자 함수
function Circle(radius) {
  // 1. 암묵적으로 빈 객체 생성 + this 바인딩

  // 2. 인스턴스 초기화
  this.radius = radius;
  this.getDiameter = function () {
    return 2 * radius;
  };

  // 3. 완성된 인스턴스가 바인딩된 this 반환
}

// 인스턴스 생성. Circle 함수는 암묵적으로 this 반환
const circle = new Circle(1);
console.log(circle); // Circle {radius: 1, getDiameter: function}
```

인스턴스 반환 시, this가 아닌 다른 객체를 명시적으로 반환하면 this가 반환되지 못하고 return 문에 명시한 객체가 반환된다.

그러나 원시 값을 명시적으로 반환하는 경우, 원시 값 반환은 무시되고 this가 반환된다.

명시적으로 this가 아닌 다른 값을 반환하는 것은 생성자 함수의 기본 동작을 훼손하므로 생성자 함수 내부에서 return 문을 반드시 생략해야 한다.

### new 연산자를 사용하지 않는다면?

```js
function Circle(radius) {
  this.radius = radius;
  this.getDiameter = function () {
    return 2 * radius;
  };
}

// new 연산자와 함께 호출하지 않으면 생성자 함수로서 동작하지 않는다.
// 즉, 일반 함수로서 호출되므로 circle3에 반환되는 값이 없다.
const circle3 = Circle(15);

console.log(circle3); // undefined

console.log(radius); // 15 (일반 함수로서 호출된 Circle의 this는 전역 객체를 가리킴)
```

`new` 연산자와 함께 호출하지 않으면 생성자 함수로서 동작하지 않는다.

생성자 함수로서 동작하지 않으므로 인스턴스가 생성되지 않는다.

일반 함수와 생성자 함수의 구분을 위해 생성자 함수는 파스칼 케이스(첫 글자 대문자)로 명명한다.

- `new.target`
  - 생성자 함수가 `new` 연산자 없이 호출되는 위험성을 회피하기 위해 사용한다.
    `new` 연산자와 함께 생성자 함수로서 호출되면 `new.target`은 함수 자신을 가리킨다.
    `new` 연산자 없이 일반 함수로서 호출된 경우 `new.target`은 undefined이다.
    이를 이용하여 `new.target`이 undefined인 경우 재귀적으로 `new 생성자함수` 를 호출하여 인스턴스를 반환하게 만들 수 있다.

```js
function Circle(radius) {
  if (!new.target) {
    return new Circle(radius);
  }

  this.radius = radius;
  this.getDiameter = function () {
    return 2 * radius;
  };
}
```

다만, IE에서는 `new.target`을 지원하지 않으므로 스코프 세이프 생성자 패턴을 사용할 수 있다.
자바스크립트 엔진이 암묵적으로 인스턴스를 만들고 this에 바인딩하는 것을 이용한 방법이다.

```js
function Circle(radius){
	if(!(this instanceOf Circle)) {
		return new Circle(radius);
	}

	this.radius = radius;
	this.getDiameter = function() {
		return 2 * radius;
	}
}
```

---

# 일급 객체

함수가 일급 객체이다. = 함수를 객체와 동일하게 사용할 수 있다.

## 일급 객체의 조건

1. 무명의 리터럴로 생성할 수 있다. 즉, 런타임에 생성될 수 있다.
2. 변수나 자료구조(객체, 배열 등)에 저장할 수 있다.
3. **함수의 매개변수에 전달될 수 있다.**
4. **함수의 반환값으로 사용할 수 있다.**

```js
// 1. 무명의 리터럴로 생성
// 2. 변수에 저장
const increase = function () {
  return ++num;
};

const decrease = function () {
  return --num;
};

// 2. 객체에 저장
const auxs = { increase, decrease };

// 3. 매개변수에 전달
function makeCounter(aux) {
  let num = 0;

  // 4. 반환값으로 사용
  return function () {
    num = aux(num);
    return num;
  };
}

const increser = makeCounter(auxs.increase);
console.log(increaser()); // 1
console.log(increaser()); // 2

const decreaser = makeCounter(auxs.decrease);
console.log(decreaser()); // -1
console.log(decreaser()); // -2
```

함수가 매개변수로 전달 가능하고, 반환 값으로 사용된다는 특징에 의하여 함수형 프로그래밍을 가능케 한다.

## 함수형 프로그래밍

**순수 함수를 통해 부수효과를 최대한 억제하여 오류를 피하고 프로그램의 안전성을 높이려는 프로그래밍 패러다임**

1. 순수 함수
   - 외부 상태에 의존하지도 않고 외부 상태를 변경하지도 않는 부수효과가 없는 함수
2. 비상태, 불변성
   - 함수형 프로그래밍에서 데이터는 불변성을 유지해야 한다.
3. 선언형 함수
4. 일급 객체와 고차함수

```js
// 1급 객체
const addTwo = num => num + 2;
const multiplyTwo = num => num * 2;
const transform = numbers => numbers.map(addTwo).map(multiplyTwo);

console.log(transform([1, 2, 3, 4])); // [6, 8, 10, 12]
```

**고차함수** - **함수를 인자로 받거나 결과로 반환하는 함수**

[https://jongminfire.dev/함수형-프로그래밍이란](https://jongminfire.dev/%ED%95%A8%EC%88%98%ED%98%95-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D%EC%9D%B4%EB%9E%80)

일반 객체와의 차이점으로는

- 함수는 일반 객체와 다르게 호출할 수 있다.
- 일반 객체에는 없는 고유한 프로퍼티를 소유한다.
