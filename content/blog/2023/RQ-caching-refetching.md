---
title: "[React Query] useQuery / 캐싱 / refetching"
date: "2023-12-06"
description: "React Query 사용법"
category: "Frontend"
tags: ["React", "React Query"]
---

# 1. React Query?

React 애플리케이션에서 Data fetching을 위한 라이브러리

## 왜 필요할까?

- React는 UI 라이브러리이므로 데이터를 가져오는 데에 특별한 형식이 있는 것이 아니다.
- useEffect 훅과 useState 훅을 이용하여 데이터를 가져오고 상태에 저장한다.
- 만약 전역적으로 상태를 사용해야 한다면 전역 상태 관리 라이브러리를 사용한다.
- 전역 상태 관리 라이브러리들은 클라이언트측 상태에는 친화적이지만 **비동기 작업과 서버 상태**와는 잘 작용하지 않는다.
  - 클라이언트 상태
    - 애플리케이션 내부에 유지되며 동기적으로 접근 가능하고 업데이트 된다.
  - 서버 상태
    - 애플리케이션과 떨어져서 유지되며 데이터를 가져오거나 업데이트 하기 위해서는 비동기 작업이 필요하다.
    - 클라이언트와는 다르게 공동 소유권이 존재한다. ⇒ 누군가가 데이터를 바꿀 수 있다.
    - 캐싱, 동일한 데이터에 대한 여러 요청을 단일 요청으로 중복 제거하기, 백그라운드에서 오래된 데이터 업데이트하기, 퍼포먼스 최적화 등과 같은 어려움이 존재 할 수 있다.

즉, React Query는 **비동기 작업(데이터 가져오기, 업데이트 등)과 서버 상태 관리**를 더 용이하게 만들어주는 라이브러리이다.

---

# 2. React Query 사용하기 - QueryClientProvider, QueryClient

```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

React query를 사용하기 위해서는 redux에서 Provider 컴포넌트를 사용하듯이 `QueryClientProvider`를 사용해야 한다. QueryClientProvider로 감싼 하위 컴포넌트들은 react query를 사용할 수 있게 된다.

`QueryClient`는 데이터 캐싱, 쿼리 관리 및 상태 추적을 처리한다. `new QueryClient` 키워드로 인스턴스를 생성하고 Provider에 넘겨줌으로써 모든 컴포넌트가 동일한 쿼리 상태를 공유할 수 있다.

---

# 3. useQuery

React query 없이 기존의 방식으로 데이터를 가져오려면 useEffect와 useState를 이용하여 사이드 이펙트(데이터 가져오기)를 실행하고 상태에 저장해야 했다.

```js
...
export const SuperHeroesPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/superheroes').then((response) => {
      setData(response.data);
      setIsLoading(false);
    });
  }, []);
  ...
};
```

그러나 React query가 제공하는 useQuery를 사용하면 훨씬 간결한 코드로 데이터를 가져올 수 있다.

```js
...
export const RQSuperHeroesPage = () => {
  const { isLoading, data, isError, error } = useQuery({
    queryKey: ['super-heroes'],
    queryFn: () => {
      return axios.get('http://localhost:4000/superheroes');
    },
  });
  ...
};
```

`useQuery`는 object 형태로 파라미터를 갖는다. (최신 버전)

- queryKey: 쿼리의 고유한 키
- queryFn: 프로미스나 비동기 함수를 반환하는 함수

useQuery가 반환하는 것들은 여러 개가 있는데

![Untitled](%5BReact%20Query%5D%20useQuery%20%E1%84%8F%E1%85%A2%E1%84%89%E1%85%B5%E1%86%BC%20refetching%208ec24aff279641b181eae52ae508aba4/Untitled.png)

이 중 필요한 것들을 destructuring 하여 사용한다.

---

# 4. Error Handling

기존의 방법으로 에러 핸들링을 하기 위해서는

- error에 대한 상태 변수 선언
- catch문을 추가로 작성
- error가 존재할 때 렌더링 할 요소를 만들었어야 했다.

useQuery를 사용하면 위의 스크린샷의 프로퍼티들 중 isError와 error를 사용하여 간단하게 에러핸들링을 할 수 있다.

```js
import axios from "axios";
import React from "react";
import { useQuery } from "@tanstack/react-query";

export const RQSuperHeroesPage = () => {
  const { isLoading, data, isError, error } = useQuery({
    queryKey: ["super-heroes"],
    queryFn: () => {
      return axios.get("http://localhost:4000/superheroes");
    },
  });

  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  if (isError) {
    return <h2>{error.message}</h2>;
  }

  return (
    <>
      <h2>Super Heroes</h2>
      {data?.data.map(hero => (
        <div key={hero.id}>{hero.name}</div>
      ))}
    </>
  );
};
```

---

# 5. 캐싱

React query는 데이터의 캐싱을 지원한다. 기본적으로 5분의 캐시 타임을 제공한다. 캐시 타임은 얼마의 시간동안 데이터를 캐싱해놓고 있을지를 나타낸다. 즉, 5분의 시간동안 데이터를 캐싱해놓고 5분이 지나면 데이터를 만료시킨다.

데이터 캐싱 없이 데이터를 가져오면 데이터를 가져오는 매 순간마다 새로 데이터를 비동기적으로 가져와야 한다. Loading 화면을 보여주는 UI라면 매번 Loading 화면을 보여준 후 데이터를 표시하게 된다.

그러나 데이터 캐싱을 하는 경우, **데이터가 캐시에 존재한다면 비동기적으로 데이터를 다시 가져올 필요가 없기 때문에** Loading 화면 없이 바로 데이터를 UI에 표시할 수 있게 된다.

## cacheTime (gcTime)

데이터를 캐싱해두고 있는 기간 (기본값: 5분)

React query V3에서는 cacheTime이라는 이름으로 사용되었으나 최신 버전에서는 gcTime으로 사용된다.

```js
const { isLoading, data, isError, error, isFetching } = useQuery({
  queryKey: ["super-heroes"],
  queryFn: () => {
    return axios.get("http://localhost:4000/superheroes");
  },
  gcTime: 5000, // 5초 -> 5초 후 만료
});
```

## staleTime

데이터가 fresh하다고 여기는 기간 (기본: 0초)

쿼리를 fetch한 이후에 데이터가 **stale 상태**가 되는데까지 걸리는 시간을 말한다. stale 상태란 데이터가 오래되어 업데이트가 필요한 상태를 말한다. React query는 데이터가 stale 상태일 때 해당 쿼리를 refetch한다.

백그라운드에서 데이터를 다시 가져오는 횟수를 줄이기 위해 사용된다. 자주 바뀌지 않는 데이터라면 staleTime을 조절하여 불필요한 refetching을 줄일 수 있다.

```js
const { isLoading, data, isError, error, isFetching } = useQuery({
  queryKey: ["super-heroes"],
  queryFn: () => {
    return axios.get("http://localhost:4000/superheroes");
  },
  staleTime: 30000, // 30초 -> 30초 후 stale
});
```

---

# 6. Refetching

## refetchOnMount

컴포넌트가 마운트될 때마다 데이터를 다시 가져온다.

- true (default): stale 상태일 때만 refetch
- false
- ‘always’: stale 상태 여부와 관계 없이 항상

## refetchOnWindowFocus

컴포넌트가 화면에 표시될 때마다 데이터를 다시 가져온다. (보이지 않았다가 다시 보일 때)

- true (default): stale 상태일 때만 refetch
- false
- ‘always’: stale 상태 여부와 관계 없이 항상

## refetchInterval

규칙적으로 데이터를 가져온다.

데이터가 자주 바뀌어 계속해서 UI를 변경해야 하는 경우 유용하다.

- default: false

```js
const { isLoading, data, isError, error, isFetching } = useQuery({
  queryKey: ["super-heroes"],
  queryFn: () => {
    return axios.get("http://localhost:4000/superheroes");
  },
  refetchInterval: 2000, // 2초 -> 2초마다 refetch
});
```

그러나 화면이 포커스를 잃는 경우에는 refetch가 일어나지 않는다. 화면을 켜고 있지 않아도 refetch를 하고 싶다면 `refetchIntervalInBackground`를 true로 설정하면 된다.

---

# 7. 클릭으로 데이터 불러오기

버튼 클릭을 했을 때 데이터를 불러오도록 하고 싶다면

- enabled: false
  - 자동으로 데이터 가져오기 비활성화
- useQuery가 반환하는 refetch 함수를 활용한다.

```js
const { isLoading, data, isError, error, isFetching, refetch } = useQuery({
  queryKey: ['super-heroes'],
  queryFn: () => {
    return axios.get('http://localhost:4000/superheroes');
  },
  enabled: false,
});

...

return (
  <>
    <h2>Super Heroes</h2>
    <button onClick={refetch}>Fetch Heroes</button>
    {data?.data.map((hero) => (
      <div key={hero.id}>{hero.name}</div>
    ))}
  </>
);
```

---

# 8. 데이터 변형하기

서버로부터 데이터를 받아 컴포넌트가 사용할 수 있는 형태로 데이터를 변환해야할 때가 있다. 그럴 경우 제일 많이 사용하던 방법이 렌더링 할 때 데이터에 map이나 filter 메서드를 사용하여 데이터의 일부를 추출하는 것이었다.

```js
import axios from 'axios';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

export const RQSuperHeroesPage = () => {
  const { isLoading, data, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['super-heroes'],
    queryFn: () => {
      return axios.get('http://localhost:4000/superheroes');
    },
    enabled: false,
  });

  ...

  return (
    <>
      <h2>Super Heroes</h2>
      <button onClick={refetch}>Fetch Heroes</button>
      {data?.data.map((hero) => (
        <div key={hero.id}>{hero.name}</div>
      ))}
    </>
  );
};
```

useQuery의 select 옵션을 사용하면 데이터의 일부를 추출하거나 필터링하는 등 데이터를 변형할 수 있다. 변형된 결과는 useQuery가 반환하는 data 변수에 반환된다.

```js
import axios from 'axios';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

export const RQSuperHeroesPage = () => {
  const { isLoading, data, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['super-heroes'],
    queryFn: () => {
      return axios.get('http://localhost:4000/superheroes');
    },
    select: (data) => {
			// data는 query의 response로 받는 data
      const superHeroNames = data.data.map((hero) => hero.name);
      return superHeroNames;
    },
  });

  ...

  return (
    <>
      <h2>Super Heroes</h2>
      {data.map((heroName) => (
        <li key={heroName}>{heroName}</li>
      ))}
    </>
  );
};
```

---
