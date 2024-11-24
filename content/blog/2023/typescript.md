---
title: "[TypeScript] 1. 타입스크립트란?"
date: "2023-02-23"
description: "타입스크립트 배우기"
category: "TypeScript"
tags: ["TypeScript"]
---

참고: [https://www.youtube.com/watch?v=d56mG7DezGs](https://www.youtube.com/watch?v=d56mG7DezGs)

# 타입스크립트가 뭔데?

자바스크립트의 일부 단점을 보완하기 위해 마이크로소프트에서 만든 언어

자바스크립트 위에 구축된 언어로 기능이 추가된 언어이다.

## 타입스크립트의 장점

- 정적 타이핑
  - 자바스크립트는 동적 유형 언어이므로 런타임에 내용이 변경될 수 있다. (숫자를 담는 변수에 문자열을 담는 것이 가능하다던지…)
    유연성이 있지만 문제를 일으킬 가능성도 높아진다.
    정적 유형 언어들은 컴파일 시간에 이러한 문제를 잡아내기 때문에 일찍 발견할 수 있지만 **자바스크립트와 같은 동적 유형 언어는 런타임이 되어서야 문제를 발견할 수 있다.**
    따라서 이러한 문제를 잡아내려하면 모든 테스트를 거쳐봐야하는 번거로움이 있을 수 있으며 이를 해결하기 위해 타입스크립트를 사용한다.
  - 코드 완성과 리팩토링과 같은 생산성 향상에 기여한다.

## 타입스크립트의 단점

- 컴파일
  - 현재 브라우저는 typescript 코드를 이해하지 못하기 때문에 타입스크립트 컴파일러에 코드를 제공하여 컴파일하고 자바스크립트로 변환해야 한다.

---

# 타입스크립트 컴파일러

```js
// index.ts
let age: number = 20;
```

위 코드를 `tsc index.ts` 명령어를 통면

```js
var age = 20;
```

위 코드를 담은 index.js 파일이 생성된다.

타입스크립트 컴파일러는 ES5를 따르기 때문에 최신 자바스크립트 버전을 따르기 위해서는 별도의 설정이 필요하다.

## 타입스크립트 컴파일러 설정하기

1. `tsc --init` 명령어를 통해 tsconfig.json 을 생성한다.
2. tsconfig.json의 구성요소
   - target: typescript 컴파일러가 생성할 자바스크립트 버전
     - ES2016이 제일 안정적이라고 한다.
   - module
   - roodDir: 타입스크립트 소스 파일이 포함된 루트 디렉터리
     - 주석을 풀어준다.
     - 일반적으로 별도의 src 폴더를 만들어 코드를 넣는 경우가 많기 때문에 `./src` 와 같은 형태로 지정한다.
   - outDir: 자바스크립트 파일을 포함하는 디렉터리
     - 컴파일된 자바스크립트 파일이 들어가는 경로를 설정하는 것
   - removeComments: 타입스크립트 파일의 모든 주석을 제거한 상태로 자바스크립트 파일을 생성한다.
   - noEmitOnError: 타입스크립트 코드에 오류가 있으면 컴파일을 하지 않는다.
   - sourceMap: 타입스크립트의 각 줄이 자바스크립트 코드에 매핑되는 방법을 지정한다.

---