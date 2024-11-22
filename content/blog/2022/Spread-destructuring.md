---
title: "2. Spread 문법과 destructuring 할당"
date: "2022-11-07"
description: "모던 자바스크립트 Deep Dive [35장][36장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# Spread 문법

<aside>
💡 `...` 을 사용하여 하나로 뭉쳐있는 여러 값들의 집합을 펼쳐 개별적인 값들의 목록으로 만든다. (ES6)
</aside>

rest 파라미터와 혼동할 수 있지만 rest 파라미터는 `...` 을 이용하여 인수들의 목록을 배열로 전달 받기 위해 사용하므로 spread 문법과는 반대의 개념이다.

`for...of` 문으로 순회할 수 있는 이터러블(**Array, String, Map, Set, DOM 컬렉션, arguments**)을 대상으로 한정

```js
console.log(...[1, 2, 3]);  // 1 2 3

console.log(...'Hello');  // H e l l o

console.log(...new Map([['a', '1'], ['b', '2']));  // ['a', '1'] ['b', '2']
console.log(...new Set([1, 2, 3]));  // 1 2 3

// 이터러블이 아닌 일반 객체는 스프레드 문법의 대상이 될 수 없다.
console.log(...{a: 1, b: 2});
```

⚠ **스프레드 문법의 결과는 값이 아니라 값들의 목록이므로 변수에 할당할 수 없다.**

```js
const list = ...[1, 2, 3];  // SyntaxError: Unexpected token ...
```

## 스프레드 문법의 사용

### 1. 함수 호출문의 인수 목록

배열을 펼쳐서 개별 값들의 목록으로 만든 후, 함수의 인수 목록으로 전달

```js
const arr = [1, 2, 3];

// Math.max()는 여러 개의 숫자를 인수로 전달 받아 최대값을 반환하는 가변 인자 함수
const max = Math.max(arr); // -> NaN

const max = Math.max(...arr); // -> 1, 2, 3으로 펼쳐서 Math.max()에 전달
```

스프레드 문법 이전에는 Function.prototype.apply를 이용하여 배열을 펼쳐 인수로 전달함.

```js
var arr = [1, 2, 3];

// apply의 두번째 인수는 apply함수가 호출하는 함수의 인수 목록
var max = Math.max.apply(null, arr); // 배열이 펼쳐져서 인수로 전달되는 효과
```

💡 **apply함수는 두번째 인자를 리스트로 받아 전달한다.**

### 2. 배열 리터럴 내부

#### 1. concat

```js
// ES5
var arr = [1, 2].concat([3, 4]);
```

```js
// ES6
const arr = [...[1,2], ...[3, 4]);
```

ES5에서 concat 메서드를 이용하여 배열을 결합한 것을 스프레드 문법을 통해 결합할 수 있다.

#### 2. splice

```js
// ES5
var arr1 = [1, 4];
var arr2 = [2, 3];

arr1.splice(1, 0, arr2); // NO! arr2 배열 자체가 들어가므로 [1, [2, 3], 4]가 된다.

// 따라서 arr2 배열을 해체하여 전달해야 한다.
// [1, 0].concat(arr2) -> [1, 0, 2, 3]
// [1, 0, 2, 3]이 펼쳐져 함수의 인자로 전달된다.
Array.prototype.apply(arr1, [1, 0].concat(arr2));
```

```js
// ES6
const arr1 = [1, 4];
const arr2 = [2, 3];

arr1.splice(1, 0, ...arr2);
```

#### 3. 배열 복사

```js
// ES5
var origin = [1, 2];
var copy = origin.slice();

console.log(copy); // [1, 2]
console.log(copy === origin); // false
```

```js
// ES6
const origin = [1, 2];
const copy = [...origin];

console.log(copy); // [1, 2]
console.log(copy === origin); // false
```

이 때, 배열의 복사는 얕은 복사(shallow copy)로 이루어진다.

💡 **얕은 복사(shallow copy)와 깊은 복사(deep copy)**

- 얕은 복사(shallow copy): **주소 값**을 복사하는 것
- 깊은 복사(deep copy): **실제 값**을 새로운 메모리 공간에 복사하는 것

#### 4. 이터러블을 배열로 변환

```js
// ES5
// 이터러블이면서 유사 배열 객체
// Function.prototype.call 또는 Function.prototype.apply 메서드를 사용하여 slice 호출
function sum() {
  var args = Array.prototype.slice.call(arguments);

  return args.reduce(function (pre, cur) {
    return pre + cur;
  }, 0);
}

console.log(sum(1, 2, 3)); // 6

// 이터러블이 아닌 유사 배열 객체
const arrayLike = {
  0: 1,
  1: 2,
  2: 3,
  length: 3,
};

const arr = Array.prototype.slice.call(ArrayLike); // -> [1, 2, 3]
console.log(Array.isArray(arr)); // true
```

```js
// ES6
// 1. 이터러블이면서 유사 배열 객체인 arguments를 배열로 변환
function sum() {
  return [...arguments].reduce((pre, cur) => pre + cur, 0);
}

console.log(sum(1, 2, 3)); // 6

// 2. rest 파라미터를 쓰는 방법
const sum = (...args) => args.reduce((pre, cur) => pre + cur, 0);

console.log(sum(1, 2, 3));

// 이터러블이 아닌 유사 배열 객체는 스프레드 문법의 대상이 될 수 없다.
const arrayLike = {
  0: 1,
  1: 2,
  2: 3,
  length: 3,
};

const arr = [...arrayLike];
// TypeError: object is not iterable (...)

// 이터러블이 아닌 유사 배열 객체를 배열로 변경하기 위해서 Array.from 메서드 사용
// Array.from 메서드는 유사 배열 객체 또는 이터러블을 배열로 변환
Array.from(arrayLike); // -> [1, 2, 3]
```

### 3. 객체 리터럴 내부

스프레드 문법의 대상은 이터러블이어야 하지만 스프레드 프로퍼티 제안으로 인해 일반 객체를 대상으로도 스프레드 문법을 사용할 수 있다.

```js
// 스프레드 프로퍼티
// 객체 복사
const obj = { x: 1, y: 2 };
const copy = { ...obj };
console.log(copy); // {x: 1, y: 2}
console.log(obj === copy); // false

// 객체 병합
const merged = { x: 1, y: 2, ...{ a: 3, b: 4 } };
console.log(merged); // {x: 1, y: 2, a: 3, b: 4}
```

스프레드 프로퍼티 제안 이전에는 Object.assign 메서드를 이용하여 객체를 병합하거나 프로퍼티를 변경, 추가하였다.

```js
// 객체 병합, 프로퍼티가 중복되면 뒤에 있는 프로퍼티가 우선
const merged = Object.assign({}, { x: 1, y: 2 }, { y: 10, z: 3 });
console.log(merged); // { x: 1, y: 10, z: 3 }

// 특정 프로퍼티 변경
const changed = Object.assign({}, { x: 1, y: 2 }, { y: 100 });
console.log(changed); // { x: 1, y: 100 }

// 프로퍼티 추가
const added = Object.assign({}, { x: 1, y: 2 }, { z: 0 });
console.log(added); // { x: 1, y: 2, z: 0 }
```

```js
// 스프레드 프로퍼티
// 객체 병합, 프로퍼티가 중복되면 뒤에 있는 프로퍼티가 우선
const merged = {...{ x: 1, y: 2 }, ...{ y: 10, z: 3 }};
console.log(merged);  // { x: 1, y: 10, z: 3 }

// 특정 프로퍼티 변경
const changed = {...{ x: 1, y: 2 }, y: 100 };
console.log(changed);  // { x: 1, y: 100 }

// 프로퍼티 추가
const added = {{ x: 1, y: 2 }, z: 0 };
console.log(added);  // { x: 1, y: 2, z: 0 }
```

# Destructuring 할당

<aside>
💡 배열과 같은 이터러블 또는 객체 리터럴에서 필요한 값만 추출하여 변수에 할당하는 방법

</aside>

## 1. 배열 디스트럭처링 할당

```js
// ES5
var arr = [1, 2, 3];

var one = arr[0];
var two = arr[1];
var three = arr[2];

console.log(one, two, three); // 1 2 3
```

배열 디스트럭처링 할당은 배열의 각 요소를 배열로부터 추출하여 1개 이상의 변수에 할당한다.

- 대상: 이터러블
- 기준: 배열의 인덱스. 즉, 순서대로 할당한다.

1. 할당 연산자 왼쪽은 배열 리터럴 형태로 선언해야 한다.

```js
const arr = [1, 2, 3];

const [one, two, three] = arr;
console.log(one, two, three); // 1 2 3
```

2. 우변에 이터러블을 할당하지 않으면 에러가 발생한다.

```js
const [x, y];  // SyntaxError: Missing initializer in destructuring declaration

const [a, b] = {};  // TypeError: {} is not iterable
```

3. 배열 디스트럭처링 할당의 기준은 배열의 인덱스이므로 순서대로 할당하고, 변수의 개수가 이터러블 요소 개수와 일치할 필요는 없다.

```js
const [a, b] = [1, 2];
console.log(a, b); // 1 2

const [c, d] = [1];
console.log(c, d); // 1 undefined

const [e, f] = [1, 2, 3];
console.log(e, f); // 1 2

const [g, , h] = [1, 2, 3];
console.log(g, h); // 1 3
```

4. 배열 디스트럭처링 할당을 위한 변수에 기본값을 설정할 수 있다.

```js
const [a, b, c = 3] = [1, 2];
console.log(a, b, c); // 1 2 3

// 기본값보다 할당된 값이 우선된다.
const [e, f = 10, g = 3] = [1, 2];
console.log(e, f, g); // 1 2 3
```

5. 배열 디스트럭처링 할당을 위한 변수에 rest 요소를 사용할 수 있다.

```js
const [x, ...y] = [1, 2, 3];
console.log(x, y); // 1 [2, 3]
```

## 2. 객체 디스트럭처링 할당

```js
// ES5
var user = { firstName: "cozups", lastName: "Kim" };

var firstName = user.firstName;
var lastName = user.lastName;

console.log(firstName, lastName); // cozups Kim
```

객체 디스트럭처링 할당은 객체의 각 프로퍼티를 객체로부터 추출하여 1개 이상의 변수에 할당한다.

- 대상: 객체
- 기준: 프로퍼티 키. 즉, 순서는 의미가 없으며 선언된 변수 이름과 프로퍼티 키가 일치하면 할당된다.

1. 할당 연산자 왼쪽은 객체 리터럴 형태로 선언해야 한다.

```js
const user = { firstName: "cozups", lastName: "Kim" };

const { lastName, firstName } = user;
console.log(firstName, lastName); // cozups Kim
```

2. 우변에 객체 또는 객체로 평가될 수 있는 표현식(문자열, 숫자, 배열 등)을 할당하지 않으면 에러가 발생한다.

```js
const {lastName, firstName};
// SyntaxError: Missing initializer in destructuring declaration

cosnt {lastName, firstName} = null;
// TypeError: Cannot destructure property 'lastName' of 'null' as it is null.
```

3. 객체의 프로퍼티 키와 다른 변수 이름으로 프로퍼티 값을 할당받으려면 다음과 같이 변수를 선언하면 된다.

```js
const user = { firstName: "cozups", lastName: "Kim" };

const { lastName: ln, firstName: fn } = user;
console.log(fn, ln); // cozups Kim
```

4. 객체 디스트럭처링 할당을 위한 변수에 기본값을 설정할 수 있다.

```js
const { firstName = "cozups", lastName } = { lastName: "Kim" };
console.log(firstName, lastName); // cozups Kim

const { firstName: fn = "cozups", lastName: ln } = { lastName: "Lee" };
console.log(fn, ln); // cozups Kim
```

5. 객체 디스트럭처링 할당을 위한 변수에 rest 프로퍼티를 사용할 수 있다.

```js
const { x, ...rest } = { x: 1, y: 2, z: 3 };
console.log(x, rest); // 1 {y: 2, z: 3}
```

### 객체 디스트럭처링 할당의 사용

1. 필요한 프로퍼티 값만 추출하여 변수에 할당

```js
const str = "Hello";
// String 래퍼 객체로부터 length 프로퍼티만 추출
const { length } = str;
console.log(length); // 5

const todo = { id: 1, content: "html", completed: true };
// todo 객체로부터 id 프로퍼티만 추출
const { id } = todo;
console.log(id); // 1
```

2. 객체를 인수로 전달받는 함수의 매개변수로 사용

```js
function printTodo(todo) {
  console.log(
    `할일 ${todo.content}은 ${todo.completed ? "완료" : "비완료"} 상태입니다.`
  );
}

printTodo({ id: 1, content: "html", completed: true }); // 할일 html을 완료 상태입니다.
```

```js
function printTodo({ content, completed }) {
  console.log(`할일 ${content}은 ${completed ? "완료" : "비완료"} 상태입니다.`);
}

printTodo({ id: 1, content: "html", completed: true });
```

3. 배열의 요소가 객체인 경우에 배열 디스트럭처링 할당과 객체 디스트럭처링 할당을 혼용할 수 있다.

```js
const todos = [
  { id: 1, content: "html", completed: true },
  { id: 2, content: "css", completed: false },
  { id: 3, content: "js", completed: false },
];

// todos 배열의 두번째 요소인 객체로부터 id 프로퍼티 추출
const [, { id }] = todos;
console.log(id); // 2
```

중첩 객체의 경우,

```js
const user = {
  name: "Lee",
  address: {
    zipCode: "03068",
    city: "Seoul",
  },
};

// address 프로퍼티 키로 객체를 추출하고 이 객체의 city 프로퍼티 키로 값을 추출한다.
const {
  address: { city },
} = user;
console.log(city); // Seoul
```
