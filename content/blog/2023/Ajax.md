---
title: "17. Ajax"
date: "2023-01-30"
description: "모던 자바스크립트 Deep Dive [43장]"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# Ajax란?

자바스크립트를 사용하여 브라우저가 서버에게 비동기 방식으로 데이터를 요청하고, 서버가 응답한 데이터를 수신하여 웹페이지를 동적으로 갱신하는 프로그래밍 방식

XMLHttpRequest 객체를 기반으로 동작한다.

### 이전의 웹 페이지는…

완전한 HTML을 서버로부터 전송받아 웹페이지 전체를 처음부터 다시 렌더링하는 방식

→ 화면이 전환되면 서버로부터 새로운 HTML을 전송받아 웹페이지 전체를 처음부터 다시 렌더링

따라서,

1. 변경할 필요가 없는 부분까지 포함된 완전한 HTML을 서버로부터 매번 다시 전송받기 때문에 불필요한 데이터 통신 발생
2. 변경할 필요가 없는 부분까지 처음부터 다시 렌더링 → 화면이 깜빡이는 현상
3. 클라이언트와 서버와의 통신이 동기 방식 → 서버로부터 응답이 있을 때까지 블로킹

### Ajax의 등장

서버로부터 웹페이지의 변경에 필요한 데이터만 비동기 방식으로 전송받아 변경할 필요가 있는 부분만 한정적으로 렌더링하는 방식이 가능해졌다.

전통적인 방식과 비교하여,

1. 변경할 부분을 갱신하는 데 필요한 데이터만 서버로부터 전송 → 불필요한 데이터 통신 미발생
2. 변경할 필요가 없는 부분은 다시 렌더링하지 않음 → 깜빡이는 현상 X
3. 클라이언트와 서버 간 비동기 방식 통신 → 블로킹 X

---

# JSON

클라이언트와 서버 간의 HTTP 통신을 위한 텍스트 데이터 포맷

## 1. JSON 표기 방식

```jsx
{
  "name": "Lee",
  "age": 20,
  "alive": true,
  "hobby": ["traveling", "tennis"]
}
```

객체 리터럴과 유사하게 키와 값으로 구성된 순수한 텍스트

그러나 JSON의 키는 반드시 큰따옴표로 묶어야 한다.

## 2. JSON.stringify

객체를 JSON 포맷의 문자열로 변환한다. (직렬화)

```jsx
const obj = {
  name: "Lee",
  age: 20,
  alive: true,
  hobby: ["traveling", "tennis"],
};

// 객체를 JSON 포맷의 문자열로 변환한다.
const json = JSON.stringify(obj);
console.log(typeof json, json);
// string {"name":"Lee","age":20,"alive":true,"hobby":["traveling","tennis"]}

// 객체를 JSON 포맷의 문자열로 변환하면서 들여쓰기 한다.
const prettyJson = JSON.stringify(obj, null, 2);
console.log(typeof prettyJson, prettyJson);
/*
string {
  "name": "Lee",
  "age": 20,
  "alive": true,
  "hobby": [
    "traveling",
    "tennis"
  ]
}
*/

// replacer 함수. 값의 타입이 Number이면 필터링되어 반환되지 않는다.
function filter(key, value) {
  // undefined: 반환하지 않음
  return typeof value === "number" ? undefined : value;
}

// JSON.stringify 메서드에 두 번째 인수로 replacer 함수를 전달한다.
const strFilteredObject = JSON.stringify(obj, filter, 2);
console.log(typeof strFilteredObject, strFilteredObject);
/*
string {
  "name": "Lee",
  "alive": true,
  "hobby": [
    "traveling",
    "tennis"
  ]
}
*/
```

객체뿐만 아니라 배열도 JSON 포맷의 문자열로 변환한다.

```jsx
const todos = [
  { id: 1, content: "HTML", completed: false },
  { id: 2, content: "CSS", completed: true },
  { id: 3, content: "Javascript", completed: false },
];

// 배열을 JSON 포맷의 문자열로 변환한다.
const json = JSON.stringify(todos, null, 2);
console.log(typeof json, json);
/*
string [
  {
    "id": 1,
    "content": "HTML",
    "completed": false
  },
  {
    "id": 2,
    "content": "CSS",
    "completed": true
  },
  {
    "id": 3,
    "content": "Javascript",
    "completed": false
  }
]
*/
```

## 3. JSON.parse

JSON 포맷의 문자열을 객체로 변환한다. (역직렬화)

```jsx
const obj = {
  name: "Lee",
  age: 20,
  alive: true,
  hobby: ["traveling", "tennis"],
};

// 객체를 JSON 포맷의 문자열로 변환한다.
const json = JSON.stringify(obj);

// JSON 포맷의 문자열을 객체로 변환한다.
const parsed = JSON.parse(json);
console.log(typeof parsed, parsed);
// object {name: "Lee", age: 20, alive: true, hobby: ["traveling", "tennis"]}
```

배열이 JSON 포맷의 문자열로 변환되어 있는 경우 JSON.parse는 문자열을 배열 객체로 변환한다.

배열의 요소가 객체인 경우 배열의 요소까지 객체로 변환한다.

```jsx
const todos = [
  { id: 1, content: "HTML", completed: false },
  { id: 2, content: "CSS", completed: true },
  { id: 3, content: "Javascript", completed: false },
];

// 배열을 JSON 포맷의 문자열로 변환한다.
const json = JSON.stringify(todos);

// JSON 포맷의 문자열을 배열로 변환한다. 배열의 요소까지 객체로 변환된다.
const parsed = JSON.parse(json);
console.log(typeof parsed, parsed);
/*
 object [
  { id: 1, content: 'HTML', completed: false },
  { id: 2, content: 'CSS', completed: true },
  { id: 3, content: 'Javascript', completed: false }
]
*/
```

---

# XMLHttpRequest

자바스크립트를 사용하여 HTTP 요청을 전송하기 위해 사용하는 객체

브라우저에서 제공하는 Web API이다.

## 1. XMLHttpRequest 객체 생성

XMLHttpRequest 생성자 함수를 호출하여 생성한다.

Web API이므로 브라우저 환경에서만 정상적으로 동작한다.

```jsx
// XMLHttpRequest 객체 생성
const xhr = new XMLHttpRequest();
```

## 2. XMLHttpRequest 객체의 프로퍼티와 메서드

주요 프로퍼티만 정리. 나머지는 책 참고

| 프로토타입 프로퍼티                                            | 설명                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| readyState                                                     | HTTP 요청의 현재 상태를 나타내는 정수                       |
| UNSENT: 0, OPENED: 1, HEADERS_RECEIVED: 2, LOADING: 3, DONE: 4 |
| status                                                         | HTTP 요청에 대한 응답 상태를 나타내는 정수, ex) 200         |
| statusText                                                     | HTTP 요청에 대한 응답 메시지를 나타내는 문자열, ex) “OK”    |
| responseType                                                   | HTTP 응답 타입, ex) document, json, text, blob, arraybuffer |
| response                                                       | HTTP 요청에 대한 응답 몸체                                  |

| 이벤트 핸들러 프로퍼티 | 설명                                 |
| ---------------------- | ------------------------------------ |
| onreadystatechange     | readyState 프로퍼티 값이 변경된 경우 |
| onerror                | HTTP 요청에 에러가 발생한 경우       |
| onload                 | HTTP 요청이 성공적으로 완료한 경우   |

| 메서드           | 설명                            |
| ---------------- | ------------------------------- |
| open             | HTTP 요청 초기화                |
| send             | HTTP 요청 전송                  |
| abort            | 이미 전송된 HTTP 요청 중단      |
| setRequestHeader | 특정 HTTP 요청 헤더의 값을 설정 |

| 정적 프로퍼티 | 값  | 설명           |
| ------------- | --- | -------------- |
| DONE          | 4   | 서버 응답 완료 |

## 3. HTTP 요청 전송

1. `XMLHttpRequest.prototype.open` 메서드로 HTTP 요청 초기화
2. 필요에 따라 `XMLHttpRequest.prototype.setRequestHeader` 메서드로 특정 HTTP 요청의 헤더 값 설정
3. `XMLHttpRequest.prototype.send` 메서드로 HTTP 요청 전송

```jsx
// XMLHttpRequest 객체 생성
const xhr = new XMLHttpRequest();

// HTTP 요청 초기화
xhr.open("GET", "/users");

// HTTP 요청 헤더 설정
// 클라이언트가 서버로 전송할 데이터의 MIME 타입 지정: json
xhr.setRequestHeader("content-type", "application/json");

// HTTP 요청 전송
xhr.send();
```

### open 메서드

서버에 전송할 HTTP 요청을 초기화한다.

```jsx
xhr.open(method, url[, async])
```

- method: HTTP 요청 메서드 (”GET”, “POST”, “PUT”, “DELETE” 등)
- url: HTTP 요청을 전송할 URL
- async: 비동기 요청 여부, 기본값 true

| HTTP 요청 메서드 | 종류           | 목적                  | 페이로드 |
| ---------------- | -------------- | --------------------- | -------- |
| GET              | index/retrieve | 모든/특정 리소스 취득 | X        |
| POST             | create         | 리소스 생성           | O        |
| PUT              | replace        | 리소스의 전체 교체    | O        |
| PATCH            | modify         | 리소스의 일부 수정    | O        |
| DELETE           | delete         | 모든/특정 리소스 삭제 | X        |

### send 메서드

open 메서드로 초기화된 HTTP 요청을 서버에 전송한다.

기본적으로 서버로 전송하는 데이터는 GET, POST 요청 메서드에 따라 전송 방식에 차이가 있다.

- GET: 데이터를 URL의 일부분인 쿼리 문자열(query string)로 서버에 전송한다.
- POST: 데이터(페이로드)를 요청 몸체(request body)에 담아 전송한다.

페이로드가 객체인 경우 JSON.stringify를 사용하여 직렬화한 후 전달해야 한다.

**HTTP 요청 메서드가 GET인 경우 send 메서드에 페이로드로 전달한 인수는 무시되고 요청 몸체는 null로 설정된다.**

### setRequestHeader 메서드

특정 HTTP 요청의 헤더 값을 설정한다.

setRequestHeader 메서드는 반드시 open 메서드를 호출한 이후에 호출해야 한다.

| MIME 타입   | 서브타입                                           |
| ----------- | -------------------------------------------------- |
| text        | text/plain, text/html, text/css, text/javascript   |
| application | application/json, application/x-www-form-urlencode |
| multipart   | multipart/formed-data                              |

```jsx
// XMLHttpRequest 객체 생성
const xhr = new XMLHttpRequest();

// HTTP 요청 초기화
xhr.open("POST", "/users");

// HTTP 요청 헤더 설정
// 클라이언트가 서버로 전송할 데이터의 MIME 타입 지정: json
xhr.setRequestHeader("content-type", "application/json");

// HTTP 요청 전송
xhr.send(JSON.stringify({ id: 1, content: "HTML", completed: false }));
```

HTTP 클라이언트가 서버에 요청할 때 서버가 응답할 데이터의 MIME 타입을 Accept로 지정할 수 있다.

만약 Accept 헤더를 설정하지 않으면 send 메서드가 호출될 때 Accept 헤더가 _/_ 로 전송된다.

## 4. HTTP 응답 처리

HTTP 요청의 현재 상태를 나타내는 readyState 프로퍼티 값이 변경된 경우 발생하는 readystatechange 이벤트를 캐치하여 HTTP 응답을 처리할 수 있다.

```jsx
// XMLHttpRequest 객체 생성
const xhr = new XMLHttpRequest();

// HTTP 요청 초기화
// https://jsonplaceholder.typicode.com은 Fake REST API를 제공하는 서비스다.
xhr.open("GET", "https://jsonplaceholder.typicode.com/todos/1");

// HTTP 요청 전송
xhr.send();

// readystatechange 이벤트는 HTTP 요청의 현재 상태를 나타내는 readyState 프로퍼티가
// 변경될 때마다 발생한다.
xhr.onreadystatechange = () => {
  if (xhr.readyState !== XMLHttpRequest.DONE) return;

  if (xhr.status === 200) {
    console.log(JSON.parse(xhr.response));
    // {userId: 1, id: 1, title: "delectus aut autem", completed: false}
  } else {
    console.error("Error", xhr.status, xhr.statusText);
  }
};
```

readystatechange 이벤트 대신 load 이벤트를 캐치해도 된다.

load 이벤트는 HTTP 요청이 성공적으로 완료된 경우 발생한다.

```jsx
// XMLHttpRequest 객체 생성
const xhr = new XMLHttpRequest();

// HTTP 요청 초기화
// https://jsonplaceholder.typicode.com은 Fake REST API를 제공하는 서비스다.
xhr.open("GET", "https://jsonplaceholder.typicode.com/todos/1");

// HTTP 요청 전송
xhr.send();

// load 이벤트는 HTTP 요청이 성공적으로 완료된 경우 발생한다.
xhr.onload = () => {
  if (xhr.status === 200) {
    console.log(JSON.parse(xhr.response));
    // {userId: 1, id: 1, title: "delectus aut autem", completed: false}
  } else {
    console.error("Error", xhr.status, xhr.statusText);
  }
};
```
