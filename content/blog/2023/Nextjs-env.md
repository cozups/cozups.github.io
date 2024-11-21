---
title: "Next.js에서 환경 변수 사용하기"
date: "2023-03-23"
description: " "
category: "Frontend"
tags: ["Next.js"]
---

[Basic Features: Environment Variables | Next.js](https://nextjs.org/docs/basic-features/environment-variables)

# 서버 사이드

- `.env.local`에 환경 변수 작성
  ```jsx
  DB_HOST = localhost;
  DB_USER = myuser;
  DB_PASS = mypassword;
  ```
  ```jsx
  // pages/index.js
  export async function getStaticProps() {
    const db = await myDB.connect({
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    // ...
  }
  ```

server-only secret을 지키기 위해 빌드 타임 때 평가되어 실제로 사용되는 변수만 포함된다.

따라서 객체 구조 할당을 사용할 수 없다.

# 클라이언트 사이드

- 브라우저 단에서 사용할 땐 `NEXT_PUBLIC_` 을 붙일 것
  ```jsx
  NEXT_PUBLIC_ANALYTICS_ID = abcdefghijk;
  ```
  ```jsx
  // pages/index.js
  import setupAnalyticsService from "../lib/my-analytics-service";

  // 'NEXT_PUBLIC_ANALYTICS_ID' can be used here as it's prefixed by 'NEXT_PUBLIC_'.
  // It will be transformed at build time to `setupAnalyticsService('abcdefghijk')`.
  setupAnalyticsService(process.env.NEXT_PUBLIC_ANALYTICS_ID);

  function HomePage() {
    return <h1>Hello World</h1>;
  }

  export default HomePage;
  ```
  아래와 같이 변수를 활용하여 환경 변수에 접근하는 것은 불가함
  ```jsx
  // This will NOT be inlined, because it uses a variable
  const varName = "NEXT_PUBLIC_ANALYTICS_ID";
  setupAnalyticsService(process.env[varName]);

  // This will NOT be inlined, because it uses a variable
  const env = process.env;
  setupAnalyticsService(env.NEXT_PUBLIC_ANALYTICS_ID);
  ```
