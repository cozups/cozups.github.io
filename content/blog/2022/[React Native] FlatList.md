---
title: "[React Native] FlatList"
date: "2022-10-06"
description: "ScrollView와 비슷하지만 좀 더 효율적인 FlatList"
---

새로운 프로젝트에 합류하게 되면서 React Native를 독학하게 되었다. (현재는 무산됨..)
여러 요소들을 렌더링 하는 방법 중 ScrollView와 비슷하지만 좀 더 효율적인 FlatList를 알게 되었고, 자꾸 까먹는 것 같아 여기에 다시 정리하면서 기억해보려고 한다.

# ScrollView vs FlatList

`ScrollView`는 화면에 표시될 콘텐츠를 한번에 다 렌더링한다.
반면에, `FlatList`는 전체 콘텐츠를 한번에 다 렌더링하기 보다는 **지금 현재 보고 있는 스크린에 나타날 콘텐츠**만 렌더링하고 나머지는 사용자가 스크롤할때마다 렌더링하는 방식을 사용한다.

즉, 1000개의 데이터가 있을 때 `ScrollView`는 1000개를 한번에 다 불러오기 때문에 성능 상의 이슈가 발생할 수 있다. `FlatList`는 이 중에 몇개만 불러오고 나머지는 필요할 때마다 불러오기 때문에 `ScrollView`보다 효율적이다.

# FlatList 사용법

```jsx
import { View, FlatList } from 'react-native`;

const dataToRendered = [ elem1, elem2, ... ];

const someComponent = () => {
	return <View>
    	<FlatList
        	data={dataToRendered}
            renderItem={() => {}}
            keyExtractor={() => {}}
        />
    </View>
};

export default someComponent;

```

기본 틀은 위와 같다.
다른 요소와 마찬가지로 `FlatList`를 import하여 사용하면 된다.

- data: `FlatList`에 출력할 데이터
- renderItem: 개별 항목을 렌더링 할 함수
- keyExtractor: 데이터 객체에서 `FlatList`가 알아서 key를 찾아 넣어주지만, 데이터가 객체가 아닌 경우에는 `keyExtractor`를 사용하여 key를 넣어주어야 한다. `keyExtractor`에 들어갈 값도 함수이다.

그 외의 속성들에 대하여 알고 싶다면 공식 문서를 찾아보자.
[React Native FlatList](https://reactnative.dev/docs/flatlist)
