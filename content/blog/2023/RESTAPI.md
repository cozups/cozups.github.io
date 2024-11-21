---
title: "18. REST API"
date: "2023-01-30"
description: "모던 자바스크립트 Deep Dive [44장]"
category: "Study"
tags: ["Javascript", "모던 자바스크립트 Deep Dive"]
---

# REST

HTTP를 기반으로 클라이언트가 서버의 리소스에 접근하는 방식을 규정한 아키텍처

REST의 기본 원칙을 성실히 지킨 서비스 디자인을 “RESTful”이라고 표현한다.

# REST API의 구성

REST API는 자원, 행위, 표현의 3가지 요소로 구성된다.

| 구성 요소            | 내용                           | 표현 방법        |
| -------------------- | ------------------------------ | ---------------- |
| 자원 resource        | 자원                           | URI (엔드포인트) |
| 행위 verb            | 자원에 대한 행위               | HTTP 요청 메서드 |
| 표현 representations | 자원에 대한 행위의 구체적 내용 | 페이로드         |

---

# REST API 설계 원칙

- URI는 리소스를 표현하는 데 집중한다.
  - 동사보다는 명사를 사용한다.
- 행위에 대한 정의는 HTTP 요청 메서드를 통해 한다.
  - 요청의 종류와 목적에 따라 5가지 요청 메서드 (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)를 사용하여 CRUD를 구현한다.

| HTTP 요청 메서드 | 종류           | 목적                  | 페이로드 |
| ---------------- | -------------- | --------------------- | -------- |
| GET              | index/retrieve | 모든/특정 리소스 취득 | X        |
| POST             | create         | 리소스 생성           | O        |
| PUT              | replace        | 리소스의 전체 교체    | O        |
| PATCH            | modify         | 리소스의 일부 수정    | O        |
| DELETE           | delete         | 모든/특정 리소스 삭제 | X        |

---
