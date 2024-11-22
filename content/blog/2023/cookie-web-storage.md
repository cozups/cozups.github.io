---
title: "쿠키(Cookie)와 웹 스토리지(Web Storage)"
date: "2023-05-31"
description: "쿠키와 웹 스토리지의 비교"
category: "Frontend"
tags: ["Web"]
---

# Cookie

우리가 웹 사이트에 접근할 때, 서버가 생성하여 우리 컴퓨터(클라이언트)에 저장하는 데이터 블록

- 로그인 상태 유지
- 이전에 기입한 정보(이름, 주소 등)의 저장
- 팝업 창 “오늘 이 창을 다시 보지 않기”

서버가 데이터를 생성하고 유저 고유의 클라이언트 ID와 함께 저장한다.

`document.cookie`를 통해 쿠키를 생성, 접근, 삭제할 수 있다.

key-value 형식을 따른다.

```js
document.cookie = ‘newCookie’
document.cookie = “username=John Doe”;
```

`expires` 파라미터를 통해 쿠키의 만료일을 지정할 수 있다.

```js
document.cookie = “username=John Doe; expires=Thu, 14 Dec 2034 12:00:00 UTC”;

// Note: UTC is a time standard (the coordinated universal time).
// If no expiration date is specified, the cookie is deleted by default when the browser is closed.
```

`path` 파라미터를 통해 어떤 경로에 쿠키를 포함시킬지 지정할 수 있다.

`/admin`으로 지정하면 주소에 `/admin`이 들어있는 경우 포함된다. (`/cart`경로에는 포함되지 않음)

아무런 path를 지정하지 않으면 현재 페이지에 쿠키가 포함된다.

```js
document.cookie =
  "username=John Doe; expires=Thu, 14 Dec 2034 12:00:00 UTC; path=/";

// Note: It is not recommended to store sensitive data in the root path of your application.
```

## 쿠키의 단점

- 매 요청마다 쿠키 정보가 포함되고 데이터를 다시 로드하므로 성능에 안 좋은 영향을 미칠 수 있다.
- 최대 4KB까지밖에 저장할 수 없다.
- 탈취 당할 가능성이 있어 보안에 취약하다.

# Web Storage

HTML5부터 브라우저에 데이터를 저장할 수 있게 되었다.

또한 웹 사이트 성능에 영향을 미치지 않고 **최대 5MB**까지 데이터를 저장할 수 있다.

웹 스토리지에 저장된 데이터는 서버로 이동되지 않으므로 클라이언트 사이드에서만 접근할 수 있다.

## Local Storage

브라우저가 닫혀도 저장되어 있는 데이터가 유지된다.

사용자가 직접 지우지 않는 이상 영구적으로 보존된다.

- 사용: 자동 로그인

## Session Storage

세션이 끝날 때까지 유지되는 저장소

브라우저(브라우저 탭)가 닫히면 저장된 데이터는 사라진다.

- 사용: 비회원 장바구니 기능

# Cookie vs Web Storage

![https://miro.medium.com/v2/resize:fit:828/format:webp/1*53Vi0hQO5W2dQ98ypnkXOg.png](https://miro.medium.com/v2/resize:fit:828/format:webp/1*53Vi0hQO5W2dQ98ypnkXOg.png)

출처

[Storage Wars: Cookies vs. Local Storage vs. Session Storage](https://medium.com/segmentify-tech/cookie-vs-local-storage-session-storage-ee4c0a07b74e)
