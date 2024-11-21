---
title: "25. 정규 표현식"
date: "2023-06-21"
description: "모던 자바스크립트 Deep Dive [31장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# 정규 표현식

정규 표현식은 문자열의 패턴 매칭 기능을 제공한다. (문자열에서 특정 문자 찾기, 치환 등)

```jsx
// 사용자로부터 입력받은 휴대폰 전화번호
const tel = "010-1234-567팔";

// 정규 표현식 리터럴로 휴대폰 전화번호 패턴을 정의한다.
const regExp = /^\d{3}-\d{4}-\d{4}$/;

// tel이 휴대폰 전화번호 패턴에 매칭하는지 테스트(확인)한다.
regExp.test(tel); // -> false
```

정규 표현식을 이용하면 반복문과 조건문 없이 패턴을 정의하고 테스트할 수 있다.

다만 가독성은 떨어질 수 있다.

## 1. 정규 표현식의 생성

- 정규 표현식 리터럴
- RegExp 생성자 함수

### 1. 정규 표현식 리터럴

![Untitled](./images/regexp1.png)

```jsx
const target = "Is this all there is?";

// 패턴: is
// 플래그: i => 대소문자를 구별하지 않고 검색한다.
const regexp = /is/i;

// test 메서드는 target 문자열에 대해 정규표현식 regexp의 패턴을 검색하여 매칭 결과를 불리언 값으로 반환한다.
regexp.test(target); // -> true
```

## 2. RegExp 생성자 함수

```jsx
const target = "Is this all there is?";

const regexp = new RegExp(/is/i); // ES6
// const regexp = new RegExp(/is/, 'i');
// const regexp = new RegExp('is', 'i');

regexp.test(target); // -> true
```

RegExp 함수를 이용하면 동적으로 정규 표현식을 사용할 수 있다.

```jsx
const count = (str, char) => (str.match(new RegExp(char, "gi")) ?? []).length;

count("Is this all there is?", "is"); // -> 3
count("Is this all there is?", "xx"); // -> 0
```

## 2. RegExp 메서드

### 1. exec

패턴 검색 매칭 결과를 배열로 변환하여 반환한다. 없으면 null을 반환한다.

```jsx
const target = "Is this all there is?";
const regExp = /is/;

regExp.exec(target);
// ['is', index: 5, input: 'Is this all there is?', groups: undefined]
```

### 2. test

패턴 검색 매칭 결과가 존재하는지 불리언 값으로 반환한다.

```jsx
const target = "Is this all there is?";
const regExp = /is/;

regExp.test(target);
// true
```

### 3. match

매칭 결과를 배열로 반환한다.

```jsx
const target = "Is this all there is?";
const regExp = /is/;

target.match(regExp);
// ['is', index: 5, input: 'Is this all there is?', groups: undefined]
```

exec 메서드와의 차이점은, exec 메서드는 문자열 내 모든 패턴을 검색하는 g 플래그를 지정해도 첫 번째 매칭 결과만 반환한다. 그러나 match 메서드는 g 플래그를 지정하면 모든 매칭 결과를 반환한다.

```jsx
const target = "Is this all there is?";
const regExp = /is/g;

target.match(regExp);
// ['is', 'is']
```

## 3. 플래그

총 6개 플래그 중 주요한 3개

- `i`: 대소문자 구별 x
- `g`: 패턴과 일치하는 모든 문자열 전역 검
- `m`: 문자열의 행이 바뀌더라도 검색

```jsx
const target = "Is this all there is?";

// target 문자열에서 is 문자열을 대소문자를 구별하여 한 번만 검색한다.
target.match(/is/);
// -> ["is", index: 5, input: "Is this all there is?", groups: undefined]

// target 문자열에서 is 문자열을 대소문자를 구별하지 않고 한 번만 검색한다.
target.match(/is/i);
// -> ["Is", index: 0, input: "Is this all there is?", groups: undefined]

// target 문자열에서 is 문자열을 대소문자를 구별하여 전역 검색한다.
target.match(/is/g);
// -> ["is", "is"]

// target 문자열에서 is 문자열을 대소문자를 구별하지 않고 전역 검색한다.
target.match(/is/gi);
// -> ["Is", "is", "is"]
```

## 4. 패턴

### 1. 임의의 문자열 검색

`.`은 문자 한 개를 의미한다. `...`을 패턴으로 사용하면 문자의 내용과 상관없이 3자리 문자열을 찾는다.

```jsx
const target = "Is this all there is?";

target.match(/.../g);
// ['Is ', 'thi', 's a', 'll ', 'the', 're ', 'is?']
```

### 2. 반복 검색

`{m, n}`은 앞선 패턴이 최소 m번, 최대 n번 반복되는 문자열을 찾는다.

```jsx
const target = "A AA B BB Aa Bb AAA";

target.match(/A{1,2}/g);
// A가 최소 1번, 최대 2번 반복되는 문자열
// ['A', 'AA', 'A', 'AA', 'A']
```

`{n}`은 앞선 패턴이 n번 반복되는 문자열을 찾는다.

```jsx
const target = "A AA B BB Aa Bb AAA";

target.match(/A{2}/g);
// ['AA', 'AA']
```

`{n,}`은 앞선 패턴이 최소 n번 반복되는 문자열을 찾는다.

```jsx
const target = "A AA B BB Aa Bb AAA";

target.match(/A{2,}/g);
// ['AA', 'AAA']
```

`+`는 앞선 패턴이 최소 1번 이상 반복되는 문자열을 찾는다.

즉, `+`는 `{1,}`과 같다.

```jsx
const target = "A AA B BB Aa Bb AAA";

target.match(/A+/g);
// ['A', 'AA', 'A', 'AAA']
```

`?`는 앞선 패턴이 최대 1번 이상 반복되는 문자열을 찾는다.

즉, `?`는 `{0, 1}`과 같다.

```jsx
const target = "color colour";

// 'colo' 다음 'u'가 최대 한 번(0번 포함) 이상 반복되고 'r'이 이어지는 문자열 'color', 'colour'를 전역 검색한다.
const regExp = /colou?r/g;

target.match(regExp); // -> ["color", "colour"]
```

### 3. OR 검색

`|`를 통해 OR 검색을 할 수 있다.

```jsx
const target = "A AA B BB Aa Bb";
const regExp = /A|B/g;

target.match(regExp);
// ['A', 'A', 'A', 'B', 'B', 'B', 'A', 'B']
```

분해되지 않은 단어 레벨로 검색하려면 `+`를 활용한다.

```jsx
const target = "A AA B BB Aa Bb";
const regExp = /A+|B+/g;

target.match(regExp);
// ['A', 'AA', 'B', 'BB', 'A', 'B']
```

`[]`내의 문자는 or로 동작한다. 그 뒤에 `+`를 사용하면 앞선 패턴을 한 번 이상 반복한다.

```jsx
const target = "A AA B BB Aa Bb";
const regExp = /[AB]+/g;

target.match(regExp);
// ['A', 'AA', 'B', 'BB', 'A', 'B']
```

범위를 지정하려면 `[]`내에 `-`를 이용한다.

```jsx
const target = "A AA B BB Aa Bb";
const regExp = /[A-Z]+/g; // 대소문자 찾기

target.match(regExp);
// ['A', 'AA', 'B', 'BB', 'A', 'B']
```

```jsx
const target = "AA BB Aa Bb 12";

// 'A' ~ 'Z' 또는 'a' ~ 'z'가 한 번 이상 반복되는 문자열을 전역 검색한다.
const regExp = /[A-Za-z]+/g;

target.match(regExp); // -> ["AA", "BB", "Aa", "Bb"]
```

```jsx
const target = "AA BB 12,345";

// '0' ~ '9'가 한 번 이상 반복되는 문자열을 전역 검색한다.
const regExp = /[0-9]+/g;

target.match(regExp); // -> ["12", "345"]
```

```jsx
const target = "AA BB 12,345";

// '0' ~ '9' 또는 ','가 한 번 이상 반복되는 문자열을 전역 검색한다.
const regExp = /[0-9,]+/g;

target.match(regExp); // -> ["12,345"]
```

`\d`는 숫자를 의미한다. 즉, `\d`는 `[0-9]`와 같다.

`\D`는 숫자가 아닌 문자를 의미한다.

```jsx
const target = "AA BB 12,345";

// '0' ~ '9' 또는 ','가 한 번 이상 반복되는 문자열을 전역 검색한다.
let regExp = /[\d,]+/g;

target.match(regExp); // -> ["12,345"]

// '0' ~ '9'가 아닌 문자(숫자가 아닌 문자) 또는 ','가 한 번 이상 반복되는 문자열을 전역 검색한다.
regExp = /[\D,]+/g;

target.match(regExp); // -> ["AA BB ", ","]
```

`\w`는 알파벳, 숫자, 언더스코어를 의미한다. 즉, `[A-Za-z0-9_]`를 의미한다.

`\W`는 그와 반대로 동작한다.

```jsx
const target = "Aa Bb 12,345 _$%&";

// 알파벳, 숫자, 언더스코어, ','가 한 번 이상 반복되는 문자열을 전역 검색한다.
let regExp = /[\w,]+/g;

target.match(regExp); // -> ["Aa", "Bb", "12,345", "_"]

// 알파벳, 숫자, 언더스코어가 아닌 문자 또는 ','가 한 번 이상 반복되는 문자열을 전역 검색한다.
regExp = /[\W,]+/g;

target.match(regExp); // -> [" ", " ", ",", " ", "$%&"]
```

### 4. NOT 검색

`[...]` 내의 `^`는 NOT을 의미한다.

```jsx
const target = "AA BB 12 Aa Bb";

// 숫자를 제외한 문자열을 전역 검색한다.
const regExp = /[^0-9]+/g;

target.match(regExp); // -> ["AA BB ", " Aa Bb"]
```

### 5. 시작 위치로 검색

`[...]` 밖의 `^`는 문자열의 시작을 의미한다.

```jsx
const target = "https://poiemaweb.com";

// 'https'로 시작하는지 검사한다.
const regExp = /^https/;

regExp.test(target); // -> true
```

### 6. 마지막 위치로 검색

`$`는 문자열의 마지막을 의미한다.

```jsx
const target = "https://poiemaweb.com";

// 'com'으로 끝나는지 검사한다.
const regExp = /com$/;

regExp.test(target); // -> true
```
