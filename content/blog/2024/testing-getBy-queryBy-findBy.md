---
title: "[React Testing] getBy, queryBy, findBy"
date: "2024-01-15"
description: "getBy, queryBy, findBy 사용하기"
category: "Frontend"
tags: ["React", "React Testing"]
---

쿼리 메서드들에 대한 설명과 사용법은 공식 문서를 참조

[About Queries | Testing Library](https://testing-library.com/docs/queries/about)

getBy, queryBy, findBy에 대해 알아보자.

# 1. getBy

> Returns the matching node for a query, and throw a descriptive error if no elements match *or* if more than one match is found (use `getAllBy` instead if more than one element is expected).

**반환**

- 쿼리와 일치하는 노드

**실패**

- 에러가 발생하는 경우
- 일치하는 엘리먼트가 없는 경우
- 한 개 이상의 엘리먼트를 발견하는 경우 (이 경우는 `getAllBy`를 사용)

# 2. queryBy

> Returns the matching node for a query, and return `null` if no elements match. This is useful for asserting an element that is not present. Throws an error if more than one match is found (use `queryAllBy` instead if this is OK).

**반환**

- 쿼리와 일치하는 노드
- 없는 경우, `null`

**실패**

- 한 개 이상의 엘리먼트를 발견하는 경우 (이 경우는 `queryAllBy`를 사용)

# 3. findBy

> Returns a Promise which resolves when an element is found which matches the given query. The promise is rejected if no element is found or if more than one element is found after a default timeout of 1000ms. If you need to find more than one element, use `findAllBy`.

**반환**

- 프로미스

**resolve**

- 쿼리와 일치하는 엘리먼트가 있는 경우

**reject**

- 엘리먼트를 찾지 못한 경우
- 하나 이상의 엘리먼트를 찾은 경우 (default 1000ms 후)
  - `timeout` 옵션을 따로 설정하지 않은 경우, 1000ms 내에 찾지 못하면 실패
  - 이 경우 `findAllBy`를 사용

```js
test("Start Learning button is eventually displayed", async () => {
  render(<Skills skills={skills} />);
  const startLearningButton = await screen.findByRole("button", {
    name: "Start Learning",
  });
  expect(startLearningButton).toBeInTheDocument();
});
```
