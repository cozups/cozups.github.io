---
title: "Intersection Observer"
date: "2023-07-19"
description: "스크롤 이벤트와 성능을 위해 사용하는 Intersection Observer API"
category: "Frontend"
tags: ["Javascript"]
---

# 1. Intersection Observer

Intersection Observer는 JavaScript API로, 엘리먼트가 화면 상에 표시되는지 여부를 확인하고 엘리먼트와 뷰포트 간 교차영역을 관찰한다.

- 엘리먼트가 화면에 표시되고 있는 경우: 엘리먼트의 일부 또는 전체가 뷰포트 내에 있으면 교차 영역이 발생한다.
- 엘리먼트가 화면에서 완전히 사라진 경우: 엘리먼트가 뷰포트 밖에 있는 경우 교차 영역은 없다.
- 엘리먼트의 일부가 뷰포트 내에 있는 경우: 엘리먼트의 상단, 하단, 좌측, 우측 중 하나가 뷰포트와 겹치면 교차 영역으로 간주된다.

## 1. 사용법

1. Intersection Observer 객체 생성하기

   ```js
   const observer = new IntersectionObserver(callback, options);
   ```

   - **`callback`**: 교차 영역 변경 시 호출되는 콜백 함수
   - **`options`**: 관찰 설정을 정의하는 객체. 필요에 따라 **`root`**, **`rootMargin`**, **`threshold`** 등을 설정할 수 있다.
     - `root`: 타겟 엘리먼트가 교차 영역을 계산할 때 기준이 되는 엘리먼트. 기본값은 뷰포트
     - `rootMargin`
       - 교차 영역을 확장하거나 축소하는 마진 값. 기본값은 "0px 0px 0px 0px”
       - 양수 - 교차 영역 확대, 음수 - 교차 영역 축소
       - **무한 스크롤 및 lazy loading에 유용**하다.
         - 페이지 끝에 도달하기 전에 리소스 요청을 보낼 수 있기 때문
     - `threshold`: 콜백 함수가 호출되는 조건을 지정하는 교차 영역의 임계값(0.0부터 1.0 사이).

2. 관찰 대상 엘리먼트 등록

   ```js
   const target = document.querySelector(".target");
   observer.observe(target);
   ```

3. 콜백 함수 구현

   ```js
   const callback = (entries, observer) => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         // 교차 영역에 진입한 경우
         // 원하는 동작 수행
       } else {
         // 교차 영역에서 벗어난 경우
         // 원하는 동작 수행
       }
     });
   };
   ```

   - **`entries`**: 관찰 대상 엘리먼트의 교차 영역 정보를 담고 있는 배열. 각 엔트리는 **`isIntersecting`** 속성을 통해 현재 교차 상태를 확인할 수 있다.
   - **`observer`**: Intersection Observer 객체 자체를 참조

### 예시

```js
const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 교차 영역에 진입한 경우
      entry.target.classList.add("visible");
    } else {
      // 교차 영역에서 벗어난 경우
      entry.target.classList.remove("visible");
    }
  });
};

const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

const observer = new IntersectionObserver(callback, options);

const targets = document.querySelectorAll(".target");
targets.forEach(target => observer.observe(target));
```

## 2. **IntersectionObserverEntry**

Intersection Observer의 콜백 함수에서 전달되는 **`entries`** 매개변수는 교차 영역 정보를 담고 있는 객체의 배열이다.

console.log를 찍어보면 아래와 같은 정보를 얻을 수 있다.

![Untitled](Intersection%20Observer%20ba406d495208472199f01ee9adf72001/Untitled.png)

- **`target`**: 교차 영역 정보를 제공하는 대상 엘리먼트를 나타낸다. 콜백 함수에서 **`entry.target`**을 통해 엘리먼트를 참조할 수 있다.
- **`boundingClientRect`**: 엘리먼트의 크기와 위치에 대한 정보를 담고 있는 **`DOMRect`** 객체이다. **`entry.boundingClientRect`**를 통해 엘리먼트의 크기와 위치를 알 수 있다.
- **`intersectionRatio`**: 엘리먼트의 교차 영역 비율을 나타내는 숫자이다. **`0.0`**은 엘리먼트가 전혀 보이지 않음을 의미하고, **`1.0`**은 엘리먼트가 전체적으로 보이는 것을 의미한다.
- **`intersectionRect`**: 교차 영역의 크기와 위치에 대한 정보를 담고 있는 **`DOMRect`** 객체이다. **`entry.intersectionRect`**를 통해 교차 영역의 크기와 위치를 알 수 있다.
- **`isIntersecting`**: 엘리먼트가 현재 교차 영역에 들어와 있는지 여부를 나타내는 부울 값이다. **`true`**는 엘리먼트가 교차 영역에 진입한 상태를 의미하고, **`false`**는 교차 영역에서 벗어난 상태를 의미한다.
- **`rootBounds`**: 교차 영역 계산 시 사용된 뷰포트(루트)의 크기와 위치에 대한 정보를 담고 있는 **`DOMRect`** 객체이다. **`entry.rootBounds`**를 통해 뷰포트의 크기와 위치를 알 수 있다.

[https://codepen.io/cozups/pen/qBQYLMm](https://codepen.io/cozups/pen/qBQYLMm)
