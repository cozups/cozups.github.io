---
title: "20. 제네레이터와 async/await"
date: "2023-02-15"
description: "모던 자바스크립트 Deep Dive [46장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# 제네레이터란?

<aside>
💡 코드 블록의 실행을 일시 중지했다가 필요한 시점에 재개할 수 있는 특수한 함수

</aside>

- 제네레이터 함수는 **함수 호출자에게 함수 실행의 제어권을 양도**할 수 있다.
  ⇒ 함수 호출자가 함수 실행을 일시 중지시키거나 재개할 수 있다. - 일반 함수 호출의 경우, 제어권이 함수에게 넘어가므로 함수 호출자는 함수 실행을 제어할 수 없다.
- 제네레이터 함수는 함수 호출자와 함수의 상태를 주고받을 수 있다.
  ⇒ 함수 호출자와 **양방향으로** 함수의 상태를 주고받을 수 있다. - 제네레이터 함수를 호출하면 제네레이터 객체(이터러블이면서 이터레이터)를 반환한다. - 일반 함수 호출의 경우, 함수 코드를 일괄 실행하고 값을 반환한다. - 일반 함수 호출의 경우, 함수가 실행되고 있는 동안에는 함수 외부에서 함수 내부로 값을 전달하여 함수의 상태를 변경할 수 없다.

---

# 제네레이터 함수의 정의

제네레이터 함수는 `function*` 키워드로 선언한다.

그리고 하나 이상의 yield 표현식을 포함한다.

```js
// 제너레이터 함수 선언문
function* genDecFunc() {
  yield 1;
}

// 제너레이터 함수 표현식
const genExpFunc = function* () {
  yield 1;
};

// 제너레이터 메서드
const obj = {
  *genObjMethod() {
    yield 1;
  },
};

// 제너레이터 클래스 메서드
class MyClass {
  *genClsMethod() {
    yield 1;
  }
}
```

⚠️제네레이터 함수는 화살표 함수로 정의할 수 없다. (SyntaxError)

⚠️제네레이터 함수는 new 연산자와 함께 생성자 함수로 호출할 수 없다. (TypeError)

---

# 제네레이터 객체

제네레이터 함수를 호출하면 함수 코드 블록을 실행하는 것이 아니라 제네레이터 객체를 생성해 반환한다.

제네레이터 객체는 이터러블(iterable)이면서 이터레이터(iterator)이다.

- `Symbol.iterator` 메서드를 상속받는 이터러블
- `next` 메서드를 소유하는 이터레이터
  - next 메서드: `value`, `done` 프로퍼티를 갖는 이터레이터 리절트 객체를 반환

```js
// 제너레이터 함수
function* genFunc() {
  yield 1;
  yield 2;
  yield 3;
}

// 제너레이터 함수를 호출하면 제너레이터 객체를 반환한다.
const generator = genFunc();

// 제너레이터 객체는 이터러블이면서 동시에 이터레이터다.
// 이터러블은 Symbol.iterator 메서드를 직접 구현하거나 프로토타입 체인을 통해 상속받은 객체다.
console.log(Symbol.iterator in generator); // true
// 이터레이터는 next 메서드를 갖는다.
console.log("next" in generator); // true
```

제네레이터 객체는 next 메서드를 갖는 이터레이터이지만 이터레이터에는 없는 `return`, `throw` 메서드를 갖는다.

- `next`: 제네레이터 함수의 `yield` 표현식까지 코드 블록 실행
  - 반환: `{ value: yield된 값, done: false }`
- `return`

  - 반환: `{ value: 인수로 전달받은 값, done: true }`

  ```js
  function* genFunc() {
    try {
      yield 1;
      yield 2;
      yield 3;
    } catch (e) {
      console.error(e);
    }
  }

  const generator = genFunc();

  console.log(generator.next()); // {value: 1, done: false}
  console.log(generator.return("End!")); // {value: "End!", done: true}
  ```

- `throw`: 인수로 전달받은 에러를 발생

  - 반환: `{ value: undefined, done: true }`

  ```js
  function* genFunc() {
    try {
      yield 1;
      yield 2;
      yield 3;
    } catch (e) {
      console.error(e);
    }
  }

  const generator = genFunc();

  console.log(generator.next()); // {value: 1, done: false}
  console.log(generator.throw("Error!")); // {value: undefined, done: true}
  ```

---

# 제네레이터의 일시 중지와 재개

제네레이터는 함수 호출자에게 제어권을 양도하여 필요한 시점에 `yield` 키워드와 `next` 메서드를 통해 실행을 일시 중지했다가 재개할 수 있다.

- 제네레이터 객체의 `next` 메서드를 호출하면 제네레이터 함수의 코드 블록을 실행한다.
  - 단, `yield` 표현식까지만 실행한다.
- `yield` 키워드는 제네레이터 함수의 실행을 일시 중지시키거나 `yield` 키워드 뒤에 오는 표현식의 평과 결과를 제네레이터 함수 호출자에게 반환한다.

```js
// 제너레이터 함수
function* genFunc() {
  yield 1;
  yield 2;
  yield 3;
}

const generator = genFunc();

// 처음 next 메서드를 호출하면 첫 번째 yield 표현식까지 실행되고 일시 중지된다.
// done 프로퍼티에는 제너레이터 함수가 끝까지 실행되었는지를 나타내는 false가 할당된다.
console.log(generator.next()); // {value: 1, done: false}

// 다시 next 메서드를 호출하면 두 번째 yield 표현식까지 실행되고 일시 중지된다.
console.log(generator.next()); // {value: 2, done: false}

// 다시 next 메서드를 호출하면 세 번째 yield 표현식까지 실행되고 일시 중지된다.
console.log(generator.next()); // {value: 3, done: false}

// 다시 next 메서드를 호출하면 남은 yield 표현식이 없으므로 제너레이터 함수의 마지막까지 실행한다.
// next 메서드는 이터레이터 리절트 객체({value, done})를 반환한다.
// value 프로퍼티에는 제너레이터 함수의 반환값 undefined가 할당된다.
// done 프로퍼티에는 제너레이터 함수가 끝까지 실행되었음을 나타내는 true가 할당된다.
console.log(generator.next()); // {value: undefined, done: true}
```

⚠️제네레이터 객체의 next 메서드에는 인수를 전달할 수 없다.

제네레이터 객체의 next 메서드에 전달한 인수는 제네레이터 함수의 yield 표현식을 할당받는 변수에 할당한다.

```js
function* genFunc() {
  // 처음 next 메서드를 호출하면 첫 번째 yield 표현식까지 실행되고 일시 중지된다.
  // 이때 yield된 값 1은 next 메서드가 반환한 이터레이터 리절트 객체의 value 프로퍼티에 할당된다.
  // x 변수에는 아직 아무것도 할당되지 않았다. x 변수의 값은 next 메서드가 두 번째 호출될 때 결정된다.
  const x = yield 1;

  // 두 번째 next 메서드를 호출할 때 전달한 인수 10은 첫 번째 yield 표현식을 할당받는 x 변수에 할당된다.
  // 즉, const x = yield 1;은 두 번째 next 메서드를 호출했을 때 완료된다.
  // 두 번째 next 메서드를 호출하면 두 번째 yield 표현식까지 실행되고 일시 중지된다.
  // 이때 yield된 값 x + 10은 next 메서드가 반환한 이터레이터 리절트 객체의 value 프로퍼티에 할당된다.
  const y = yield x + 10;

  // 세 번째 next 메서드를 호출할 때 전달한 인수 20은 두 번째 yield 표현식을 할당받는 y 변수에 할당된다.
  // 즉, const y = yield (x + 10);는 세 번째 next 메서드를 호출했을 때 완료된다.
  // 세 번째 next 메서드를 호출하면 함수 끝까지 실행된다.
  // 이때 제너레이터 함수의 반환값 x + y는 next 메서드가 반환한 이터레이터 리절트 객체의 value 프로퍼티에 할당된다.
  // 일반적으로 제너레이터의 반환값은 의미가 없다.
  // 따라서 제너레이터에서는 값을 반환할 필요가 없고 return은 종료의 의미로만 사용해야 한다.
  return x + y;
}

// 제너레이터 함수를 호출하면 제너레이터 객체를 반환한다.
// 이터러블이며 동시에 이터레이터인 제너레이터 객체는 next 메서드를 갖는다.
const generator = genFunc(0);

// 처음 호출하는 next 메서드에는 인수를 전달하지 않는다.
// 만약 처음 호출하는 next 메서드에 인수를 전달하면 무시된다.
// next 메서드가 반환한 이터레이터 리절트 객체의 value 프로퍼티에는 첫 번째 yield된 값 1이 할당된다.
let res = generator.next();
console.log(res); // {value: 1, done: false}

// next 메서드에 인수로 전달한 10은 genFunc 함수의 x 변수에 할당된다.
// next 메서드가 반환한 이터레이터 리절트 객체의 value 프로퍼티에는 두 번째 yield된 값 20이 할당된다.
res = generator.next(10);
console.log(res); // {value: 20, done: false}

// next 메서드에 인수로 전달한 20은 genFunc 함수의 y 변수에 할당된다.
// next 메서드가 반환한 이터레이터 리절트 객체의 value 프로퍼티에는 제너레이터 함수의 반환값 30이 할당된다.
res = generator.next(20);
console.log(res); // {value: 30, done: true}
```

---

# 제네레이터의 활용

## 1. 이터러블의 구현

제네레이터 함수를 사용하면 이터레이션 프로토콜을 준수해 이터러블을 생성하는 방식보다 간단히 이터러블을 구현할 수 있다.

```js
// 무한 이터러블을 생성하는 함수
const infiniteFibonacci = (function () {
  let [pre, cur] = [0, 1];

  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      [pre, cur] = [cur, pre + cur];
      // 무한 이터러블이므로 done 프로퍼티를 생략한다.
      return { value: cur };
    },
  };
})();

// infiniteFibonacci는 무한 이터러블이다.
for (const num of infiniteFibonacci) {
  if (num > 10000) break;
  console.log(num); // 1 2 3 5 8...2584 4181 6765
}
```

```js
// 무한 이터러블을 생성하는 제너레이터 함수
const infiniteFibonacci = (function* () {
  let [pre, cur] = [0, 1];

  while (true) {
    [pre, cur] = [cur, pre + cur];
    yield cur;
  }
})();

// infiniteFibonacci는 무한 이터러블이다.
for (const num of infiniteFibonacci) {
  if (num > 10000) break;
  console.log(num); // 1 2 3 5 8...2584 4181 6765
}
```

## 2. 비동기 처리

프로미스를 사용한 비동기 처리를 동기 처리처럼 구현할 수 있다.

⇒ 프로미스의 후속 처리 메서드 then/catch/finally 없이 비동기 처리 결과를 반환하도록 구현할 수 있다.

```js
// node-fetch는 node.js 환경에서 window.fetch 함수를 사용하기 위한 패키지다.
// 브라우저 환경에서 이 예제를 실행한다면 아래 코드는 필요 없다.
// https://github.com/node-fetch/node-fetch
const fetch = require("node-fetch");

// 제너레이터 실행기
const async = generatorFunc => {
  const generator = generatorFunc(); // ②

  const onResolved = arg => {
    const result = generator.next(arg); // ⑤

    return result.done
      ? result.value // ⑨
      : result.value.then(res => onResolved(res)); // ⑦
  };

  return onResolved; // ③
};

async(function* fetchTodo() {
  // ①
  const url = "https://jsonplaceholder.typicode.com/todos/1";

  const response = yield fetch(url); // ⑥
  const todo = yield response.json(); // ⑧
  console.log(todo);
  // {userId: 1, id: 1, title: 'delectus aut autem', completed: false}
})(); // ④
```

---

# async / await

<aside>
💡 async/await를 사용하면 프로미스의 후속 처리 메서드 없이 마치 동기 처리처럼 프로미스가 처리 결과를 반환하도록 구현할 수 있다.

</aside>

```js
const fetch = require("node-fetch");

async function fetchTodo() {
  const url = "https://jsonplaceholder.typicode.com/todos/1";

  const response = await fetch(url);
  const todo = await response.json();
  console.log(todo);
  // {userId: 1, id: 1, title: 'delectus aut autem', completed: false}
}

fetchTodo();
```

## 1. async 함수

`await` 키워드는 반드시 async 함수 내부에서 사용해야 한다.

async 함수가 명시적으로 프로미스를 반환하지 않더라도 async 함수는 **암묵적으로 반환값을 resolve하는 프로미스를 반환한다.**

```js
// async 함수 선언문
async function foo(n) {
  return n;
}
foo(1).then(v => console.log(v)); // 1

// async 함수 표현식
const bar = async function (n) {
  return n;
};
bar(2).then(v => console.log(v)); // 2

// async 화살표 함수
const baz = async n => n;
baz(3).then(v => console.log(v)); // 3

// async 메서드
const obj = {
  async foo(n) {
    return n;
  },
};
obj.foo(4).then(v => console.log(v)); // 4

// async 클래스 메서드
class MyClass {
  async bar(n) {
    return n;
  }
}
const myClass = new MyClass();
myClass.bar(5).then(v => console.log(v)); // 5
```

⚠️클래스의 constructor 메서드는 async 메서드가 될 수 없다. 클래스의 constructor 메서드는 인스턴스를 반환해야 하지만 async 함수는 언제나 프로미스를 반환해야하기 때문이다.

## 2. await 키워드

`await` 키워드는 프로미스가 settled 상태가 되면 프로미스가 resolve한 처리 결과를 반환한다.

```js
const fetch = require("node-fetch");

const getGithubUserName = async id => {
  const res = await fetch(`https://api.github.com/users/${id}`); // ①
  const { name } = await res.json(); // ②
  console.log(name); // Ungmo Lee
};

getGithubUserName("ungmo2");
```

```js
async function foo() {
  const a = await new Promise(resolve => setTimeout(() => resolve(1), 3000));
  const b = await new Promise(resolve => setTimeout(() => resolve(2), 2000));
  const c = await new Promise(resolve => setTimeout(() => resolve(3), 1000));

  console.log([a, b, c]); // [1, 2, 3]
}

foo(); // 약 6초 소요된다.
```

```js
async function foo() {
  const res = await Promise.all([
    new Promise(resolve => setTimeout(() => resolve(1), 3000)),
    new Promise(resolve => setTimeout(() => resolve(2), 2000)),
    new Promise(resolve => setTimeout(() => resolve(3), 1000)),
  ]);

  console.log(res); // [1, 2, 3]
}

foo(); // 약 3초 소요된다.
```

서로 연관없이 개별적으로 수행되는 비동기 처리는 await 키워드를 사용하는 것보다 Promise.all 메서드를 사용하는 것이 더 효율적이다.

비동기 처리 순서가 보장되어야 할 때는 모든 프로미스에 await 키워드를 써서 처리한다.

## 3. 에러 처리

```js
try {
  setTimeout(() => {
    throw new Error("Error!");
  }, 1000);
} catch (e) {
  // 에러를 캐치하지 못한다
  console.error("캐치한 에러", e);
}
```

async/await에서 에러 처리는 `try...catch` 문을 사용할 수 있다.

콜백 함수를 인수로 전달받는 비동기 함수와는 달리 프로미스를 반환하는 비동기 함수는 명시적으로 호출할 수 있기 때문에 호출자가 명확하다.

```js
const fetch = require("node-fetch");

const foo = async () => {
  try {
    const wrongUrl = "https://wrong.url";

    const response = await fetch(wrongUrl);
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error(err); // TypeError: Failed to fetch
  }
};

foo();
```

이 예제의 catch문은 HTTP 통신에서 발생한 네트워크 에러뿐 아니라 try 코드 블록 내의 모든 문에서 발생한 일반적인 에러까지 모두 캐치할 수 있다.

async 함수 내에서 catch문을 사용하여 에러 처리를 하지 않으면 async 함수는 발생한 에러를 reject하는 프로미스를 반환한다.

따라서 Promise.prototype.catch 후속 처리 메서드를 통해 에러를 캐치할 수도 있다.

```js
const fetch = require("node-fetch");

const foo = async () => {
  const wrongUrl = "https://wrong.url";

  const response = await fetch(wrongUrl);
  const data = await response.json();
  return data;
};

foo().then(console.log).catch(console.error); // TypeError: Failed to fetch
```
