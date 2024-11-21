---
title: "22. 모듈"
date: "2023-02-15"
description: "모던 자바스크립트 Deep Dive [48장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# 모듈의 일반적 의미

<aside>
💡 모듈이란 애플리케이션을 구성하는 개별적 요소로서 재사용 가능한 코드 조각을 말한다.

</aside>

- 일반적으로 기능을 기준으로 파일 단위로 분리한다.
- 모듈은 자신만의 **파일 스코프(모듈 스코프)**를 가질 수 있어야 한다.
  - 자신만의 파일 스코프를 갖는 모듈의 모든 자산(변수, 함수, 객체 등)은 **캡슐화**되어 다른 모듈에서 접근할 수 없다.
- 모듈은 공개가 필요한 자산에 한정하여 명시적으로 선택적 공개가 가능하다. **(export)**
- 모듈 사용자는 모듈이 공개한 자산 중 일부 또는 전체를 선택해 자신의 스코프 내로 불러들여 재사용할 수 있다. **(import)**

모듈은 기능별로 분리되어 개별적인 파일로 작성된다. 따라서,

- 코드의 단위를 명확히 분리하여 애플리케이션을 구성할 수 있고,
- 재사용성이 좋아서 개발 효율성과 유지보수성을 높일 수 있다.

---

# 자바스크립트와 모듈

자바스크립트는 웹페이지의 단순한 보조 기능을 처리하기 위한 제한적 용도를 목적으로 탄생했다.

클라이언트 사이드 자바스크립트는 script 태그를 통해 외부 자바스크립트 파일을 로드할 수 있지만 독립적인 파일 스코프를 갖지 않는다.

따라서 script 태그를 통해 분리된 자바스크립트 파일들을 로드해도 결국 하나의 자바스크립트 파일 내에 있는 것처럼 동작한다. 이것으로는 모듈을 구현할 수 없다.

브라우저 환경에 국한하지 않고 범용적으로 사용하려는 움직임이 생기면서 CommonJS, AMD가 제안되었고 Node.js는 CommonJS를 채택했다.

따라서 Node.js 환경에서는 파일별로 독립적인 파일 스코프(모듈 스코프)를 갖는다.

---

# ES6 모듈(ESM)

ES6에서는 클라이언트 사이드 자바스크립트에서도 동작하는 모듈 기능을 추가했다.

`script` 태그에 `type="module"` 어트리뷰트를 추가하면 로드된 자바스크립트 파일은 모듈로서 작동한다.

ESM임을 명확히하기 위해 ESM의 파일 확장자는 mjs를 사용할 것을 권장한다.

ESM에서는 기본적으로 strict mode가 적용된다.

## 1. 모듈 스코프

ESM은 독자적인 모듈 스코프를 갖는다.

일반적인 자바스크립트 파일은 하나의 전역을 공유한다.

그러나 ESM은 독자적인 모듈 스코프를 제공하므로

- 모듈 내에서 var 키워드로 선언한 변수는 더이상 전역 변수가 아니며 window 객체의 프로퍼티도 아니다.
- 모듈 내에서 선언한 식별자는 모듈 외부에서 참조할 수 없다.

## 2. export 키워드

모듈 내부에서 선언한 식별자를 외부에 공개하여 다른 모듈들이 재사용할 수 있게 하려면 export 키워드를 사용한다.

export 키워드는 선언문 앞에 사용한다.

```jsx
// lib.mjs
// 변수의 공개
export const pi = Math.PI;

// 함수의 공개
export function square(x) {
  return x * x;
}

// 클래스의 공개
export class Person {
  constructor(name) {
    this.name = name;
  }
}
```

export할 대상을 하나의 객체로 구성하여 한번에 export할 수도 있다.

```jsx
// lib.mjs
const pi = Math.PI;

function square(x) {
  return x * x;
}

class Person {
  constructor(name) {
    this.name = name;
  }
}

// 변수, 함수 클래스를 하나의 객체로 구성하여 공개
export { pi, square, Person };
```

## 3. import 키워드

다른 모듈에서 공개한 식별자를 자신의 모듈 스코프 내부로 로드하려면 import 키워드를 사용한다.

```jsx
// app.mjs
// 같은 폴더 내의 lib.mjs 모듈이 export한 식별자 이름으로 import한다.
// ESM의 경우 파일 확장자를 생략할 수 없다.
import { pi, square, Person } from "./lib.mjs";

console.log(pi); // 3.141592653589793
console.log(square(10)); // 100
console.log(new Person("Lee")); // Person { name: 'Lee' }
```

모듈이 export한 식별자 이름을 일일이 지정하지 않고 하나의 이름으로 한 번에 import할 수 있다.

이 경우 as 뒤에 지정한 이름의 객체에 프로퍼티로 할당된다.

```jsx
// app.mjs
// lib.mjs 모듈이 export한 모든 식별자를 lib 객체의 프로퍼티로 모아 import한다.
import * as lib from "./lib.mjs";

console.log(lib.pi); // 3.141592653589793
console.log(lib.square(10)); // 100
console.log(new lib.Person("Lee")); // Person { name: 'Lee' }
```

모듈이 export한 식별자 이름을 변경하여 import할 수도 있다.

```jsx
// app.mjs
// lib.mjs 모듈이 export한 식별자 이름을 변경하여 import한다.
import { pi as PI, square as sq, Person as P } from "./lib.mjs";

console.log(PI); // 3.141592653589793
console.log(sq(2)); // 4
console.log(new P("Kim")); // Person { name: 'Kim' }
```

모듈에서 하나의 값만 export 한다면 default 키워드를 사용할 수 있다.

default 키워드를 사용하는 경우 기본적으로 이름 없이 하나의 값을 export한다.

```jsx
// lib.mjs
export default x => x * x;
```

default 키워드를 사용하는 경우 var, let, const 키워드는 사용할 수 없다.

```jsx
// lib.mjs
export default const foo = () => {};
// => SyntaxError: Unexpected token 'const'
// export default () => {};
```

default 키워드와 함께 export한 모듈은 `{}` 없이 임의의 이름으로 import 한다.

```jsx
// app.mjs
import square from "./lib.mjs";

console.log(square(3)); // 9
```
