---
title: "자바스크립트 입출력"
date: "2023-02-10"
description: "PS 하려고 할 때마다 까먹는 입출력..."
category: "Algorithms"
tags: ["Javascript", "PS"]
---

## 1. fs 모듈 사용하기

백준으로 문제 풀 때

```js
const fs = require("fs");
// 백준은 linux 환경임.
const filePath = process.platform === "linux" ? "/dev/stdin" : "./input.txt";
const input = fs.readFileSync(filePath).toString().split("\n");

// 테스트 케이스 개수가 숫자로 주어지는 경우
const inputC = +input[0];
const inputTestCase = [];

for (let i = 1; i <= inputC; i++) {
  // 테스트 케이스 입력받고 가공 후 inputTestCase에 넣는 과정
}

function solution(n, testCase) {
  // solution 작성
}

solution(inputC, inputTestCase);
```

참고: [https://www.youtube.com/watch?v=5xTHp0wgilU&t=165s](https://www.youtube.com/watch?v=5xTHp0wgilU&t=165s)

## 2. readline 모듈 사용하기

```js
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', (line) => {
  // 줄 바꿈이 입력 될 때 마다 발

	// line을 가공하여 변수에 저장
	...

	// close로 넘어감
	rl.close();
}).on('close', () => {
  // 저장된 변수를 이용하여 계산 후 출력
});
```

⇒ fs 모듈을 사용하는 것이 편하다.
