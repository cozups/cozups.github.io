---
title: "라이브러리 덜 의존해보기"
date: "2025-12-03"
description: "라이브러리를 사용하지 않고 직접 기능 구현해보기"
category: "Dev"
tags: ["development"]
---

# 1. lodash 제거하기

5ot Next 프로젝트를 구현하는 중, lodash 라이브러리를 사용하는 일이 있었다.

lodash를 사용하면 간단한 코드만으로 기능을 빠르게 구현할 수 있어 사용하게 되었는데, 막상 생각해보니 극히 일부 기능만을 사용하게 되었고 그 기능을 편하게 사용하자고 라이브러리를 설치하는 것이 좋은 선택은 아니라는 생각이 들었다.

그리고 실무에서는 라이브러리를 쓰고 싶어도 못 쓰는 환경이 존재할 수 있다는 이야기를 들었다. 이런 경우에는 직접 구현해야 하기 때문에 직접 구현을 시도해보게 되었다.

lodash를 사용하는 코드는

- 디바운스
- 배열의 차집합 구하기

고작 이 정도인데, 구현하기 어려운 기능도 아니라서 그냥 lodash를 제거하고 직접 구현해보기로 하였다.

## 디바운스

디바운스는 검색창에서 사용한다. 사용자가 검색어 입력값을 바꿀 때마다 일일이 db에 요청을 보내는 것은 좋은 일이 아니기 때문에 디바운스를 적용하기로 하였다.

**기존 코드**

```tsx
"use client";

import { getProductByName } from "@/features/product/queries";
import { Products } from "@/types/products";
import { createClient } from "@/utils/supabase/client";
import _ from "lodash";
import { useCallback, useState } from "react";

export function useDebounceSearch() {
  const [searchResults, setSearchResults] = useState<Products[]>([]);

  const debounceSearch = useCallback(
    _.debounce(async (query: string) => {
      const supabase = createClient();
      if (query.trim().length > 0) {
        const searchedProducts = await getProductByName(supabase, query);
        setSearchResults(searchedProducts.data || []);
      }
    }, 300),
    []
  );

  return { searchResults, setSearchResults, debounceSearch };
}
```

단순히 lodash의 debounce 메서드를 사용하여 제품 검색 요청을 보낸다.

**수정된 코드**

```tsx
"use client";

import { getProductByName } from "@/features/product/queries";
import { Products } from "@/types/products";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export function useDebounceSearch(value: string, delay: number = 300) {
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] =
    useState<string>(value);
  const [searchResults, setSearchResults] = useState<Products[]>([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchKeyword(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, value]);

  useEffect(() => {
    async function searchProducts() {
      const supabase = createClient();
      if (debouncedSearchKeyword.trim().length > 0) {
        const searchedProducts = await getProductByName(
          supabase,
          debouncedSearchKeyword
        );
        setSearchResults(searchedProducts.data || []);
      } else {
        setSearchResults([]);
      }
    }

    if (debouncedSearchKeyword !== "") {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchKeyword]); // debouncedSearchKeyword가 바뀔 때마다 실행

  return { searchResults, setSearchResults };
}
```

useEffect 훅을 이용하여 직접 디바운스를 구현해보았다.

디바운스의 이론적 개념은 알고 있었지만 막상 구현하려 하니 막히는 부분이 존재했다. 구현 방법을 찾아보며 각각이 무슨 역할을 하는지 파악하는 시간을 가졌다.

- 검색 키워드를 디바운스를 이용하여 변경시킨다.
- useEffect 훅을 통해 `debouncedSearchKeyword`가 변경될 때마다 검색을 실행한다.
- 검색 결과를 searchResults 상태로 관리하여 반환한다.

## 배열의 차집합

배열의 차집합은 장바구니 데이터로부터 제품을 구매할 때 사용한다.

사용자가 제품을 구매한 후에는 장바구니 데이터에서 그 제품을 제거해야 하기 때문이다.

**기존 코드**

```tsx
updateCartAfterPurchase: (purchaseData) => {
  const { data } = get();

  const updated = _.differenceWith(
    data,
    purchaseData,
    (cart, purchase) => cart.product.id === purchase.product.id
  );

  set({ data: updated, length: updated.length });
  sessionStorage.removeItem("purchase");
},
```

lodash의 differenceWith를 사용하여 data(장바구니 로컬 스토리지)에서 구매 데이터를 제거하여 반영하였다.

**수정된 코드**

```tsx
updateCartAfterPurchase: async (purchaseData, userId) => {
  const { data } = get();

  // 장바구니 데이터에서 구매한 데이터는 제거
  const purchaseProductsIds = new Set(purchaseData.map((purchaseItem) => purchaseItem.product.id));

  const updated = data.filter((cartItem) => !purchaseProductsIds.has(cartItem.product.id));

  set({ data: updated, length: updated.length });
  sessionStorage.removeItem("purchase");

  // 로그인 상태이면 DB에 저장
  if (userId) {
    const { success } = await updateCartToDB(userId, updated);
    if (!success) {
      // 실패 시 원래 상태로 복구
      set({ data, length: data.length });
      throw new Error("장바구니 데이터 정리에 실패했습니다. 다시 시도해주세요.");
    }
  }
},
```

- 구매 데이터에 담긴 제품 ID를 Set으로 관리한다. Set을 이용하면 O(1)의 시간 복잡도로 제품의 존재 유무를 확인할 수 있다.
- data(로컬 스토리지 데이터)에서 구매하지 않은 제품만 남겨 놓는다. 구매한 제품인지는 Set의 has 메서드를 이용한다.
- 결과적으로 updated 변수에는 장바구니 데이터 중 구매하지 않은 데이터만 남게 된다.

---

# 2. 라이브러리 없이 무한 스크롤 구현하기

KT Wiz 프로젝트에서는 react-infinite-scroller 라이브러리를 사용하여 무한 스크롤을 구현했다. 그러나 라이브러리 없이 Intersection Observer로 무한 스크롤을 구현할 수 있다.

KT 프로젝트 서버가 현재 끊겨 있기 때문에 JSON Placeholder API로 데이터를 가져와 무한 스크롤을 구현하는 예제로 진행해보겠다.

## Intersection Observer

Web API 중 하나로, 뷰포트에 특정 요소가 들어왔는지(교차했는지) 확인할 수 있다.

```tsx
const observer = new IntersectionObserver(callback, options);
```

위의 형태로 선언할 수 있다.

- callback: 감지 대상의 교차 상태가 변경될 때 호출되는 콜백
  - `IntersectionObserverEntry`와 observer 객체 자체를 인수로 갖는다.
- options
  - root: 감지 영역
    - 기본: 뷰포트
  - rootMargin: 감지 영역을 얼마나 늘릴 것인지?
    - 기본: ‘0px 0px 0px 0px’
    - ex) 100px → 뷰포트로부터 100px 더 넓혀 감지한다.
    - ex) -100px → 뷰포트로부터 100px 좁혀 감지한다.
  - threshold: 요소가 몇 퍼센트가 뷰포트에 들어왔을 때 콜백 함수를 호출할 것인지?
    - 기본 0
    - 1 → 요소의 100%가 뷰포트에 들어왔을때 콜백함수를 호출

## JSON Placeholder API로 데이터 가져오기

fetch를 이용하여 Photos 데이터를 가져오도록 한다. (Photos에 저장된 이미지 경로가 존재하지 않는 것 같다…)

```tsx
const ITEMS_PER_PAGE = 9;

const fetchPhotos = useCallback(async (page: number) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/photos?_page=${page}&_limit=${ITEMS_PER_PAGE}`
  );
  const photos = await response.json();

  setData(prev => {
    const next = page === 1 ? photos : [...prev, ...photos];
    setHasMore(photos.length < ITEMS_PER_PAGE ? false : true);
    return next;
  });
}, []);
```

- API 자체가 페이지네이션을 제공하므로 page와 limit을 전달하여 API를 호출한다.
- 데이터는 이전 데이터의 뒤에 추가하여 붙인다.
- hasMore는 현재 불러온 데이터의 개수가 limit보다 작은 경우에 데이터가 끝난 것이므로 이를 조건으로 지정한다.

## InfiniteScroll 구현하기

InfiniteScroll은 Wrapper 형태로 구현하여 리스트의 마지막 부분에 도달했을 때 다음 fetch 함수를 호출할 수 있도록 구현했다.

### props

- children: 데이터를 실제로 렌더링 할 리액트 컴포넌트
- hasMore: 데이터를 더 로드해야 하는지 판별하는 boolean 타입의 값
- fetchFn: 데이터 호출 함수

```tsx
import { useEffect, useRef, useState } from "react";

export default function InfiniteScroll({
  children,
  hasMore,
  fetchFn,
}: {
  children: React.ReactNode;
  hasMore: boolean;
  fetchFn: (page: number) => Promise<void>;
}) {
  // page를 상태로 관리한다.
  const [page, setPage] = useState<number>(1);

  // 리스트 끝에 "loading..."을 표시하는 div 엘리먼트
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // page 값이 달라질 때마다 데이터를 호출하는 useEffect
  useEffect(() => {
    fetchFn(page);
  }, [page, fetchFn]);

  // intersection observer를 부착하는 useEffect
  useEffect(() => {
    const options = {
      threshold: 0.5, // 엔트리의 50%가 교차되면 isIntersecting 활성화
    };

    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      // 엔트리가 감지 영역에 들어오고, 다음 데이터를 로드할 필요가 있다면 page 업데이트
      if (entry.isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    }, options);

    // observer가 존재하고 loading 엘리먼트가 존재하면 observe
    if (observer && loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    // cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [hasMore]);

  return (
    <>
      {children}
      {hasMore && <div ref={loadingRef}>loading...</div>}
    </>
  );
}
```

- page가 달라질 때마다 리스트 렌더링을 다시해야 하기 때문에 상태로 관리한다. 이를 fetchFn의 인수로 전달한다.
- loading Div가 렌더링 된 후 감지하기 위해 useEffect에서 옵저버를 부착하는 로직을 실행한다.
- 교차 여부와 hasMore의 값을 바탕으로 page를 업데이트하여 다시 데이터를 가져올 수 있도록 한다.
- 결과적으로 사용자가 loading Div에 도달했을 때마다 데이터가 업데이트 된다.

### InfiniteScroll을 가져와 적용하는 코드

```tsx
import { useCallback, useState } from "react";
import "./App.css";
import InfiniteScroll from "./components/InfiniteScroll";
import type { Photo } from "./types/photo";
import ImageCard from "./components/ImageCard";
import styles from "./components/InfiniteScroll.module.css";

const ITEMS_PER_PAGE = 9;

function App() {
  const [data, setData] = useState<Photo[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchPhotos = useCallback(async (page: number) => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/photos?_page=${page}&_limit=${ITEMS_PER_PAGE}`
    );
    const photos = await response.json();

    setData(prev => {
      const next = page === 1 ? photos : [...prev, ...photos];
      setHasMore(photos.length < ITEMS_PER_PAGE ? false : true);
      return next;
    });
  }, []);

  return (
    <div className="app">
      <h1>Intersection Observer로 무한 스크롤 구현하기</h1>

      <div>
        <InfiniteScroll hasMore={hasMore} fetchFn={fetchPhotos}>
          <div className={styles["list-container"]}>
            {data.map(photo => (
              <ImageCard key={photo.id} photo={photo} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default App;
```

---

# 마치며

생각보다 라이브러리에 많이 의존하고 있다는 것을 알게 되었다. 빠른 구현을 위해 라이브러리를 활용할 수 있겠지만, 라이브러리 기능 중 극히 일부 만을 사용하거나 라이브러리를 사용하지 못하는 환경일 때는 기능을 직접 구현해야 할 줄 알아야 하기 때문에 한 번 직접 구현해보는 기회를 가지게 되었다.

이론적으로는 이해한 개념이지만 실제로 구현해보는 것은 완전 다른 경험이었다. 앞으로도 연습이 필요할 것 같다.
