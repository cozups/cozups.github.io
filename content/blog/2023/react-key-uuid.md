---
title: "[React] key에 uuid를 사용하는 것은 좋은 선택이 아니다."
date: "2023-11-15"
description: "key의 용도를 알아야 하는 이유"
category: "Frontend"
tags: ["React"]
---

# 문제 상황

혼자서 무한스크롤을 구현해 볼 일이 있었다. 사진, 영상과 같은 미디어 소스와 텍스트가 무한스크롤 요소에 포함되었다. 그런데 영상을 로드할 때마다 엘리먼트의 세로 사이즈가 늘어나면서 스크롤이 아래로 밀리면서 무한으로 데이터가 로딩되는 문제가 발생했다. **한 번만 로드되면 될 영상이 계속해서 서버로부터 로드되는 것을 확인**하였고 이것이 원인이 되었다.

개발자 도구를 켜 리스트가 렌더링되는 것을 살펴보았다. 무한 스크롤에 의해 추가되는 리스트만 렌더링 되는 것이 아니라 모든 리스트가 다시 렌더링 되는 현상을 발견했다. **key를 사용했음에도 불구하고 데이터가 로딩될 때마다 모든 리스트가 렌더링** 되었다. 그 이유는 key에 직접적으로 `uuid()`를 사용했기 때문이다.

# 리액트의 Key

리액트에서 **key는 동적으로 리스트를 업데이트 할 때 리스트에 변경 사항을 추적**하는 데에 큰 도움을 준다. Virtual DOM에서 key를 이용하여 각 리스트의 변경 여부를 알아챌 수 있다. 이를 이용하여 불필요한 DOM 조작을 피할 수 있고 더 효율적인 방법으로 업데이트를 할 수 있도록 한다.

그러나 key에 직접적으로 `uuid()`를 사용하게 되면

- 리스트가 추가되어 새로 렌더링 될 때
- 모든 key들이 다시 uuid를 호출 ⇒ key 값에 새로운 값이 할당
- 이전의 key 값이 유지되지 않으므로 모든 리스트가 리렌더링된다.

key에 직접 uuid를 사용하기 보다는 데이터의 id를 key로써 사용하는 것이 좋다. id가 없는 경우엔 다른 고유한 값을 가지는 값을 설정하거나 따로 id를 만들어야 하는 작업이 필요할 수 있다.