---
title: "SSR + Tanstack Query 하이드레이션"
date: "2025-10-27"
description: "Tanstack Query 하이드레이션으로 SSR의 장점을 챙기면서 데이터 갱신 및 관리하기"
category: "Frontend"
tags: ["TanStack Query", "SSR"]
---

데이터의 성격에 따라 렌더링 전략을 분리하는 것은 중요하다.

- 자주 바뀌지 않는 데이터는 서버 사이드 렌더링으로 초기 마크업에 포함하여 전송하는 것만으로도 충분하다. 이는 SEO와 초기 로딩 속도에 유리하다.
- 자주 바뀌는 데이터는 페이지 로드 후에도 클라이언트 측에서 주기적으로 데이터를 갱신해야 한다. 서버 사이드 렌더링만 사용한다면 자주 바뀌는 데이터를 확인하기 위해 사용자가 계속해서 새로고침을 해야할 것이다.

서버 측에서 초기 데이터를 프리페칭하고 TanStack Query 하이드레이션의 초기값으로 사용한다면 초기 로딩 속도를 최적화 하면서도 클라이언트에서 주기적으로 데이터를 갱신하고 캐시를 관리할 수 있다.

# Tanstack Query 하이드레이션 방법

TanStack Query를 사용하여 데이터를 하이드레이션하는 방법은 크게 두 가지가 있다.

- **initialData로 전달하는 방식**: 서버 측에서 가져온 데이터를 직렬화하여 클라이언트 컴포넌트의 props로 전달하여 클라이언트에서 useQuery나 useSuspenseQuery의 initialData로 주입한다.
- **prefetchQuery 및 HydrationBoundary를 사용하는 방식**: 서버 측에서 데이터를 프리페칭하고 dehydrate를 통해 직렬화하고 HydrationBoundary에 전달한다.

initialData로 전달하는 방식은 클라이언트 컴포넌트가 마운트되는 시점에 쿼리 캐시에 데이터가 들어간다.

HydrationBoundary를 사용하는 방식은 서버에서 프리페칭을 완료하는 시점에 쿼리 캐시에 데이터가 들어가며 이 시점부터 staleTime이 정확하게 적용된다. 따라서 서버 사이드 렌더링 시점과 데이터의 신선도를 일치시켜 하이드레이션 불일치를 방지하고 효율적으로 캐시를 관리할 수 있다.

staleTime의 개념을 생각한다면 initialData를 사용하는 것보다 HydrationBoundary를 사용하는 방법이 더 정확한 데이터 관리를 가능하게 하는 것 같다.

**직렬화**란 자바스크립트 객체나 데이터를 네트워크로 전송하거나 파일로 저장할 수 있도록 문자열(JSON)로 변환하는 과정이다. 서버에서 클라이언트로 데이터를 전송할 때 네트워크를 사용하게 되며 네트워크를 통해 데이터를 전달하기 위해서는 데이터를 직렬화하여 전달해야 한다. 클라이언트는 전달 받은 직렬화 된 데이터를 다시 객체 상태로 복원(hydrate)하며, 이 과정 덕분에 네트워크 추가 요청 없이 데이터를 즉시 사용할 수 있다.

# HydrationBoundary를 이용하여 하이드레이션하기

프로젝트에서 리뷰 데이터를 자주 바뀔 수 있는 데이터로 간주했고, 그 부분에 대하여 하이드레이션을 진행했다.

```tsx
const supabase = await createClient();
const queryClient = new QueryClient();

// 서버 사이드에서 데이터 프리페치
await queryClient.prefetchQuery({
  queryKey: ["reviews", { page: currentPage, productId }],
  queryFn: async () => {
    const response = await getReviewsByPagination(supabase, productId, {
      pageNum: currentPage,
      itemsPerPage: 5,
    });

    if (response.errors) {
      throw new Error(response.errors.message);
    }

    return { data: response.data, count: response.count };
  },
  staleTime: 5 * 60 * 1000,
});
```

```tsx
<div>
  <ReviewForm productId={product.id} />

  <Suspense fallback={<ReviewListSkeleton />}>
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReviewList page={currentPage} productId={productId} />
    </HydrationBoundary>
  </Suspense>
</div>
```

실제 데이터는 페이지의 ReviewList에 렌더링 된다. 페이지는 서버 사이드 렌더링 되며 페이지에서 리뷰 데이터를 프리페칭 했다.

```tsx
export default function ReviewList({
  page,
  productId,
  recent = false,
}: {
  page?: number;
  productId?: string;
  recent?: boolean;
}) {
  const supabase = createClient();
  const { user } = useUser();

  const { data: reviews } = useSuspenseQuery({
    queryKey: ["reviews", recent ? "recent" : { page, productId }],
    queryFn: async () => {
      const response = await getReviewsByPagination(supabase, productId, {
        pageNum: page,
        itemsPerPage: ITEMS_PER_PAGE,
      });

      if (response.errors) throw new Error(response.errors.message);

      return { data: response.data, count: response.count };
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    // ... 컴포넌트
  );
}
```

리뷰 리스트 컴포넌트에서 useSuspenseQuery를 사용하여 데이터를 가져오고 있다. 초기 렌더링 시에는 서버에서 주입된 쿼리 캐시를 이용하므로 추가적인 서버 요청 없이 바로 데이터를 렌더링 할 수 있다. staleTime인 5분이 지나면 클라이언트 측에서 다시 데이터를 가져오게 된다.

---

# 마치며

서버 사이드 렌더링과 클라이언트 사이드 데이터 페칭을 적절히 조합하면 초기 로딩 속도와 데이터 신선도를 모두 확보할 수 있다.

다만 모든 데이터에 이 방식을 적용할 필요는 없다. 거의 변하지 않는 정적 컨텐츠는 단순 SSR만으로도 충분하며, 극도로 실시간성이 중요한 데이터는 WebSocket 같은 다른 방식을 고려해야 한다. 데이터의 특성을 정확히 파악하고 적절한 렌더링 전략을 선택하는 것이 핵심이다.

**참고**

- [Using React Query with Next.js App Router and Supabase Cache Helpers](https://supabase.com/blog/react-query-nextjs-app-router-cache-helpers)
- [Server Rendering & Hydration](https://tanstack.com/query/v5/docs/framework/react/guides/ssr)
