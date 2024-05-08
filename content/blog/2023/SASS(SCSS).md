---
title: "SASS(SCSS)"
date: "2023-03-21"
description: " "
category: "Frontend"
tags: ["CSS"]
---

# 사용법

브라우저는 SCSS를 읽지 못한다.

1. node 환경에서 사용할 때 `node-sass`를 설치하여 사용하기
2. vscode extension - Live SASS compiler 설치하여 사용하기

# Syntax

## 1. variables

```scss
$primary-color: #272727;
$accent-color: #ff652f;
$text-color: #fff;

body {
  background: $primary-color;
  color: $text-color;
}
```

css로 컴파일될 때 실제 값이 할당된다.

## 2. map

```scss
$font-weights: (
  "regular": 400,
  "medium": 500,
  "bold": 700,
);

p {
  font-weight: map-get($font-weights, bold);
}
```

## 3. 중첩

```scss
.main {
  width: 80%;
  margin: 0 auto;

  #{&}__paragraph {
    font-weight: map-get($font-weights, bold);
  }
}
```

SCSS 문법을 이용하면 중첩 기능을 사용할 수 있다.

- `&`: 자기 자신을 가리킨다.
  ```scss
  .main {
    width: 80%;
    margin: 0 auto;
  }
  .main__paragraph {
    font-weight: 700;
  }
  ```
- `#{&}`: 자기 자신과 그 앞에 붙은 것들까지 다 가리킨다.
  ```scss
  .main {
    width: 80%;
    margin: 0 auto;
  }
  .main .main__paragraph {
    font-weight: 700;
  }
  ```

## 4. partials

파일 분리를 할 때 사용하며, 파일 이름 앞에 `_`를 붙여서 부분 파일임을 명시한다.

그리고 `@import` 구문을 이용하여 파일을 로드하여 재사용 할 수 있다.

```scss
// _resets.scss
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

```scss
// _variables.scss

// variables
$primary-color: #272727;
$accent-color: #ff652f;
$text-color: #fff;

// map
$font-weights: (
  "regular": 400,
  "medium": 500,
  "bold": 700,
);
```

```scss
@import "./resets";
@import "./variables";

body {
  background: $primary-color;
  color: $text-color;
}

.main {
  width: 80%;
  margin: 0 auto;

  #{&}__paragraph {
    font-weight: map-get($font-weights, bold);

    &:hover {
      color: pink;
    }
  }
}
```

대규모 프로젝트를 작업할 때 유용하다.

## 5. function

```scss
@function weight($weight-name) {
  @return map-get($font-weights, $weight-name);
}

.main {
  width: 80%;
  margin: 0 auto;

  #{&}__paragraph {
    font-weight: weight(regular);

    &:hover {
      color: pink;
    }
  }
}
```

## 6. mixin

```scss
@mixin flexCenter($direction) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: $direction;
}

@mixin theme($light-theme: true) {
  @if $light-theme {
    background: lighten($primary-color, 100%);
    color: darken($text-color, 100%);
  }
}

@mixin mobile {
  @media (max-width: $mobile) {
    @content;
  }
}

.main {
  @include flexCenter(row);
  ... @include mobile {
    flex-direction: column;
  }
}

.light {
  @include theme($light-theme: true);
}
```

## 7. extend

같은 속성을 상속받고 추가로 스타일을 적용하고 싶을 때

```scss
.main {
  @include flexCenter(row);
  width: 80%;
  margin: 0 auto;

  #{&}__paragraph1 {
    font-weight: weight(bold);

    &:hover {
      color: pink;
    }
  }

  #{&}__paragraph2 {
    @extend .main__paragraph1;

    &:hover {
      color: $accent-color;
    }
  }

  @include mobile {
    flex-direction: column;
  }
}
```

## 8. math operation

SASS에서는 수학식을 스타일에 적용할 수 있다.

단, 단위가 같아야 한다.

```scss
.main {
  width: 80% - 40%;
  margin: 0 auto;
}
```

단위가 다른 경우 `calc()`를 사용해야 한다.
