---
title: "DOM 요소 추가하기 - innerHTML vs createElement?"
date: "2024-08-21"
description: "innerHTML와 createElement 중 어느 방법이 더 효율적일까?"
category: "Frontend"
tags: ["DOM"]
---

DOM 요소 속에 다른 요소를 추가하는 방법을 떠올렸을 때 `innerHTML`을 이용하는 방법과 `createElement`를 이용하는 방법이 떠오를 것이다. 이 두 가지의 차이는 무엇이 있는지, 무엇이 더 적절한 방법일지 궁금했다. 가독성 측면에서는 innerHTML이 좋아보이는데 과연 효율성 측면에서는 이게 정말 좋은 방법일까?라는 생각이 들어 정리해보는 글이다.

`div` 태그 안에 새로운 `p` 요소를 넣는다고 생각해보자.

# 1. createElement 사용하기

```html
<div id="container"></div>

<script>
  const container = document.getElementById("container");
  const newElement = document.createElement("p");
  newElement.textContent = "Hello, World!";
  container.appendChild(newElement);
</script>
```

# 2. innerHTML 사용하기

```html
<div id="container"></div>

<script>
  const container = document.getElementById("container");
  container.innerHTML += "<p>Hello, World!</p>";
</script>
```

innerHTML이 더 적은 코드를 요구하기 때문에 간단해 보이지만, innerHTML을 이용하여 요소를 추가하면 div 속에 있는 모든 DOM 노드를 다시 분석하고 렌더링 하게 된다. 반면에 createElement를 사용하면 노드들을 파싱할 필요가 없기 때문에 더 효율적이다.

# 그러나 여러 개의 요소를 추가해야 한다면?

```js
let div = document.querySelector(".container");

for (let i = 0; i < 1000; i++) {
  let p = document.createElement("p");
  p.textContent = `Paragraph ${i}`;
  div.appendChild(p);
}
```

이 경우에는 createElement를 이용하여 노드를 하나씩 추가하는 것보단 innerHTML을 이용하여 한 번에 여러 노드를 추가하는 것이 더 효율적일 수 있다.

위 코드는 div 태그 안에 1000개의 p 태그를 추가하는 코드인데, 이 경우 1000개의 노드를 생성하고 1000번의 DOM 조작을 해야 한다. DOM 조작 자체가 비용이 큰 작업이기도 하고, 매번 요소가 추가될 때마다 브라우저는 reflow, repaint 작업을 거쳐야 하므로 굉장히 비효율적이다.
그러나 createElement를 이용하여 여러 개의 노드를 한번에 추가하는 방법이 있다. `DocumentFragment`를 사용하는 것이다.

### DocumentFragment

웹 문서의 메인 DOM 트리에 포함되지 않는, 가상 메모리에 존재하는 DOM 노드 객체이다.

1. DocumentFragment로 루트 노드를 만든다.
2. createElement로 만드는 여러 개의 노드를 child node로 추가한다.
3. DocumentFragment를 DOM 트리에 붙인다.

```js
let div = document.querySelector(".container");
let fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  let p = document.createElement("p");
  p.textContent = `Paragraph ${i}`;
  fragment.appendChild(p);
}

div.appendChild(fragment);
```

아까의 코드를 DocumentFragment를 이용하여 효율성을 개선한 코드이다.

원래의 코드는 1000번의 reflow, repaint를 발생시켰지만 DocumentFragment는 실제 DOM에 존재하는 요소가 아니므로 어떠한 reflow, repaint도 발생시키지 않는다. 이 가상의 컨테이너 요소를 실제 DOM에 추가하면 DocumentFragment 안에 있는 요소들에 대하여 한꺼번에 한번의 reflow, repaint를 발생시킬 수 있다. 그리고 DocumentFragment 자체는 실제로 렌더링 되지 않으므로 불필요한 div 요소가 생기는 것을 방지할 수 있다.

# 결론

innerHTML과 createElement는 각각 장단점이 다르므로 어떤 방법이 더 효율적이라는 결론을 내기는 어렵다. 본인이 선호하는 방법을 사용하거나 상황에 따라 적절한 방법을 선택하는 것이 옳을 것으로 보인다.
