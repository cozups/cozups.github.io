---
title: "5ot 프로젝트 리팩토링"
date: "2024-04-28"
description: "5ot 프로젝트를 다시 살펴보며 적어보는 리팩토링 로그"
category: "Projects"
tags: ["Refactoring"]
---

프로젝트 정리할 겸 코드를 들여다보니 문제점이 생각보다 많이 발견되었다💦

웹 프로젝트를 처음 배우기 시작하고 나서 얼마 안되어 진행한 프로젝트라 개선해야 할 사항이 많았다.

따라서 프로젝트 코드를 리팩토링하면서 개선 사항들을 정리해보려고 한다.

# 개선점

1. 카테고리가 하드 코딩 되어있음 → DB에서 카테고리를 가져와서 렌더링
2. 홈페이지에 슬라이딩 되는 이미지를 각 카테고리 별 첫번째 제품 이미지로 변경
3. all 카테고리는 직접 등록하는 것보다 DB에 등록된 상품을 최신순으로 가져와서 리스트를 그리는 방법으로 변경
4. 로그인 정보를 세션 스토리지에서 로컬 스토리지에 저장할 것
   - 세션 스토리지는 브라우저에서 페이지를 닫을 경우 비워지기 때문에 로컬 스토리지를 이용하는 것이 사용자 측면에서 편리할 것으로 예상
5. 사진 클릭이 아니라 카테고리 이름도 클릭하여 제품 리스트 화면으로 접근할 수 있도록 하는 것이 직관적이고 편할 듯
6. 공통되는 로직들을 분리하고 싶음… 유지보수가 너무 어렵다
7. 검색 기능에 버그 수정
8. 이벤트 위임 로직 가독성 개선
   - data 어트리뷰트 사용

# 개선하기

## 1. 카테고리 하드 코딩 고치기

현재의 코드는 카테고리를 하드 코딩한다.

이 경우, 카테고리를 추가하면 화면에 렌더링되지 않는다.

카테고리 추가 기능이 있음에도 불구하고 이를 제대로 활용하지 못하는 것이다.

```js
export const fetchCategories = async () => {
  try {
    const womanCategories = [];
    const result = await Api.get("/category");
    const manCategories = [];

    // 성별 필터링
    result.forEach(category => {
      category.sex === "w"
        ? womanCategories.push(category)
        : manCategories.push(category);
    });

    sessionStorage.setItem("womanCategories", JSON.stringify(womanCategories));
    sessionStorage.setItem("manCategories", JSON.stringify(manCategories));

    return [womanCategories, manCategories];
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
};
```

DB로부터 카테고리 정보를 가져와서 성별 별로 나누어 반환한다.

```js
export async function renderCategories() {
  const slideButtons = [];

  let womanCategories = [];
  let manCategories = [];

  if (
    !sessionStorage.getItem("womanCategories") ||
    !sessionStorage.getItem("manCategories")
  ) {
    [womanCategories, manCategories] = await fetchCategories();
  } else {
    womanCategories = JSON.parse(sessionStorage.getItem("womanCategories"));
    manCategories = JSON.parse(sessionStorage.getItem("manCategories"));
  }

  // ul에 동적으로 li 생성 후 삽입
  const womanUL = document.querySelector(".slide-button-list.woman");
  const manUL = document.querySelector(".slide-button-list.man");

  const womanCategoriesItem = womanCategories.map((cat, index) => {
    const li = document.createElement("li");
    const item = document.createElement("a");
    item.classList.add("slide-button-element");
    item.value = index;
    item.innerHTML = cat.type;
    item.href = `/list/w/${cat.type}`;

    slideButtons.push(item);

    li.append(item);

    return li;
  });

  const manCategoriesItem = manCategories.map((cat, index) => {
    const li = document.createElement("li");
    const item = document.createElement("a");
    item.classList.add("slide-button-element");
    item.value = womanCategories.length + index;
    item.innerHTML = cat.type;
    item.href = `/list/m/${cat.type}`;

    slideButtons.push(item);

    li.append(item);

    return li;
  });

  womanUL.append(...womanCategoriesItem);
  manUL.append(...manCategoriesItem);

  return slideButtons;
}
```

카테고리 정보를 세션 스토리지에 저장하여 매번 데이터를 가져올 필요성을 줄이고 탭을 닫을 때마다 정보를 지우도록 한다.

이 작업이 필요한 페이지는 홈 메인 페이지, 제품 리스트 페이지, 제품 상세 페이지, 검색 페이지이므로 이를 각 페이지의 js파일에 도입한다.

```js
import * as Api from '/api.js';
import { renderCategories } from '/category.js';

const headerMenu = document.querySelectorAll('#navbar a');
const section = document.getElementsByTagName('section')[0];
const pathname = window.location.pathname.split('/');
const sex = pathname[2];
const type = pathname[3];

// 카테고리 렌링
let sideMenus = await renderCategories();

sideMenus.forEach(
  (menu) => menu.innerHTML === type && menu.classList.add('button-active')
);

...
```

## 2. 슬라이딩 이미지 변경

```html
<li class="item-photo new">
  <a href="/list/w/new">
    <img
      src="https://static.zara.net/photos///contents/mkt/spots/ss22-north-woman-new/subhome-xmedia-19//w/1039/IMAGE-landscape-f15c96c3-370d-4703-a9af-4a92065f0bfe-default_0.jpg?ts=1652354105595"
      alt=""
    />
  </a>
</li>
```

슬라이딩 이미지 또한 위의 형태로 하드코딩 되어있다.

이 경우의 문제점은 카테고리를 새로 추가할 때 따로 이미지를 삽입하지 않기 때문에 새로운 카테고리를 추가하면 그 카테고리가 출력할 이미지가 없으므로 엑스박스가 그려질 것이다.

따라서 각 카테고리에 제품이 1개 이상 등록되어 있다는 가정 하에 슬라이딩 이미지를 각 카테고리의 최신 제품 이미지로 변경하려 한다.

카테고리 데이터에 이미지 프로퍼티를 추가하고 해당 카테고리의 새로운 제품이 등록되면 그 제품의 이미지 링크를 카테고리의 이미지 프로퍼티에 저장한다.

- 카테고리 데이터에 이미지 프로퍼티 추가
- 상품 등록 시 해당 카테고리의 이미지 프로퍼티에도 링크 저장
- 홈 페이지의 슬라이드 이미지 src를 카테고리의 이미지 프로퍼티로 지정

### 1) 카테고리 데이터에 이미지 프로퍼티 추가

```js
const CategorySchema = new Schema(
  {
    sex: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    // 추가된 분
    image: {
      type: String,
    },
  },
  {
    collection: "categories",
    timestamps: false,
  }
);
```

```js
await Api.post("/category", { sex, type, image });
```

카테고리의 스키마에 image를 추가하면 카테고리를 새로 추가할 때 image 프로퍼티를 사용할 수 있게 된다.

### 2) 상품 등록 시 해당 카테고리의 이미지 프로퍼티에도 링크 저장

```js
productRouter.post(
  "/insertion",
  upload.single("image"),
  loginRequired,
  async (req, res, next) => {
    try {
      console.log(req.file);

      const { product_name, sex, type, price, producer, stock, product_info } =
        req.body;

      const product_image = `/images/${req.file.filename}`; // image 경로 만들기

      const category = { sex, type };

      const new_product = await productService.addItems({
        product_name,
        category,
        product_image,
        price,
        producer,
        stock,
        product_info,
      });

      // 추가된 부분
      await categoryService.setCategory(
        { sex_YetUpdated: sex, type_YetUpdated: type },
        { image: product_image }
      );

      res.status(201).json(new_product);
    } catch (error) {
      next(error);
    }
  }
);
```

이 부분은 백엔드 코드를 수정해야 하는 부분인데, 상품을 등록할 때 카테고리의 image 프로퍼티의 값을 업데이트 하도록 했다.

### 3) 홈 페이지의 슬라이드 이미지 src를 카테고리의 이미지 프로퍼티로 지정

```js
function renderSlideImages() {
  const womanCategories = JSON.parse(sessionStorage.getItem("womanCategories"));
  const manCategories = JSON.parse(sessionStorage.getItem("manCategories"));
  const categories = [...womanCategories, ...manCategories];

  const categoryItems = categories.map(
    category => `
    <li class="item-photo ${category.type}">
      <a href="/list/${category.sex}/${category.type}">
        <img
          src="${category.image}"
          alt=""
        />
      </a>
    </li>
  `
  );

  slides.innerHTML = categoryItems.join("");
}
```

하드 코딩된 html을 지우고 동적으로 listitem을 렌더링한다.

## 3. all 카테고리 리스트 변경하기

```js
const pathname = window.location.pathname.split("/");
const sex = pathname[2];
const type = pathname[3];

if (type === "all") {
  getProductAll();
} else {
  getProductList();
}
```

```js
async function getProductAll() {
  try {
    const result = await Api.get("/product/all");

    const elements = result.map(data => {
      if (data.category.sex === sex) {
        const { product_name, price, product_info, product_image, product_id } =
          data;

        return `
          <div id="product-list-wrap">
            <a href="/list/${sex}/${data.category.type}/${product_id}"> 
              <div class="product-list">
              <img class="product-thumbnail" src="${product_image}"/>
                <div class="product-content">
                  <div class="content">
                    <h3 class="name">${product_name}</h3>
                    <h4 class="price">${price.toLocaleString()}원</h4>
                    <p class="description">${product_info}</p>
                  </div>          
                </div>
              </div>
            </a>
            
          </div>
          `;
      }
    });
    console.log(elements);
    section.innerHTML = elements.join("");
  } catch (error) {
    console.log(`error : ${error}`);
  }
}
```

all 카테고리에 접근하면 `getProductAll` 함수를 호출한다.

getProductAll은 모든 제품을 불러와 해당 성별에 맞게 제품을 필터링하고 렌더링한다.

성별 별로 데이터를 쿼리하면 되지만 현재 코드 상태로는 백엔드에서 성별 별로 데이터를 검색하는 기능이 없기 때문에 일단 이처럼 구현했다.

## 4. 로그인 정보 저장 방식 변경

현재 로그인 정보를 세션 스토리지에 저장하고 있다.

그러나 이 경우 유저가 탭을 닫으면 로그인 정보가 사라져 다시 페이지에 접속하는 경우 다시 로그인을 해야 한다.

이 단점을 보완하기 위해 세션 스토리지에 로그인 정보를 저장하는 것을 로컬 스토리지에 저장하는 방식으로 바꿨다.

```js
async function handleSubmit(e) {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  // 잘 입력했는지 확인
  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length >= 4;

  if (!isEmailValid || !isPasswordValid) {
    return alert(
      "비밀번호가 4글자 이상인지, 이메일 형태가 맞는지 확인해 주세요."
    );
  }

  // 로그인 api 요청
  try {
    const data = { email, password };

    const result = await Api.post("/api/login", data);
    const token = result.token;

    // 로그인 성공
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);

    alert(`정상적으로 로그인되었습니다.`);

    // 기본 페이지로 이동
    window.location.href = "/";
  } catch (err) {
    console.error(err.stack);
    alert(`문제가 발생하였습니다. 확인 후 다시 시도해 주세요: ${err.message}`);
  }
}
```

## 5. 검색 기능 개선

현재의 검색 기능은

- 엔터 키를 입력하여 검색 불가
- 검색 결과가 제대로 렌더링 되지 않음

위의 문제점이 있다.

### 1) 엔터 키를 입력하여 검색

```html
<div class="div-container">
  <div class="searchbar">
    <h1 class="search-form-title">상품 검색</h1>
    <form class="search-form">
      <input
        type="text"
        id="search"
        placeholder="찾으시는 제품명을 입력해주세요"
      />
      <button type="button" id="submit">검색</button>
    </form>
  </div>
</div>
```

```js
const searchForm = document.querySelector(".search-form");

searchForm.addEventListener("submit", searchProducts);
```

form 태그를 추가하고 submit 이벤트 리스너를 추가해줬다.

### 2) 검색 결과 버그 수정

```js
// 기존 코드
async function searchProducts() {
  const input = search.value;
  const result = await Api.get("/product/all");
  const data = [];

  for (let i = 0; i < result.length; i++) {
    const name = result[i].product_name.trim();
    if (name.indexOf(input.replace(/ /g, "").toUpperCase()) !== -1) {
      data.push(result[i]);
    }
  }

  //세션스토리지에 저장
  sessionStorage.setItem("searchProducts", JSON.stringify(data));
  window.location.href = "/searchlist";
}
```

```js
// 개선 코드
async function searchProducts(e) {
  e.preventDefault();

  const input = search.value;
  const result = await Api.get("/product/all");
  const data = result.filter(item => {
    return item.product_name
      .trim()
      .toLowerCase()
      .includes(input.toLowerCase().trim());
  });

  //세션스토리지에 저장
  sessionStorage.setItem("searchProducts", JSON.stringify(data));
  window.location.href = "/searchlist";
}
```

submit 이벤트 리스너로 searchProducts 함수를 지정하였으므로 `preventDefault`함수로 새로고침을 방지하였다.

그 이후에 모든 제품의 데이터를 가져오고 데이터 제품명을 소문자화 후 검색 키워드를 포함하는 경우, 해당 데이터를 배열에 저장한다. 기존의 코드와 기능은 동일하지만 filter 함수를 이용하여 더 가독성 있는 코드로 바꾸었다.

searchlist 페이지에 검색 결과를 사용하기 위해 세션 스토리지에 데이터를 저장하여 활용하였다.

# 6. 이벤트 위임 시 이벤트 핸들러 처리 방식 변경

리스트의 `li`엘리먼트마다 이벤트 핸들러를 부착해야 할 필요가 있었는데, 이를 위해서 이벤트 위임을 이용하여 부모 엘리먼트에 이벤트 핸들러 1개를 부착하여 구현했다.

기존 코드에서는

```js
function cartRendering() {
  let i = 0;
  cartList.innerHTML = "";

  cartCountField.innerText = `${cart.length}개 상품`;

  const elements = cart.map(item => {
    const { product_image, product_name, quantity, price } = item;
    const total = price * quantity;
    return `
      <li>
          <input type="checkbox" class="list-checkbox" value="${i}"/>
          <img
            src="${product_image}"
            alt=""
          />
          <div class="cart-item-info">
            <h3>${product_name}</h3>
            <div class="item-quantity">
              <button class="minus" value="${i}">
                <i class="fas fa-minus"></i>
              </button>
              <span class="qty">${quantity}</span>
              <button class="plus" value="${i}"><i class="fas fa-plus"></i></button>
            </div>
            <span class="item-price">${price}</span>
            <span class="item-total-price">총 ${total}원</span>
            <button class='cancel' value="${i++}"><i class="fa-solid fa-trash-can"></i></buttonc>
          </div>
      </li>`;
  });
  cartList.innerHTML = elements.join("");

  setOrderInfo();
  cartList.addEventListener("click", clickHandler);
}
```

`i` 변수를 이용하여 리스트를 렌더링 했다. 그렇게 했던 이유는 요소를 눌렀을 때 그 요소가 어떤(몇 번째) 요소인지 알아내야 했기 때문이었다. 당시 내가 아는 지식으로 생각해낼 수 있는 최선의 방법이었기 때문에 이렇게 구현했다.

그러나 리팩토링을 진행하면서 data 어트리뷰트에 대해 알게 되었다. `data-`를 붙여 사용자가 커스텀 어트리뷰트를 사용할 수 있다.

```js
function cartRendering() {
  cartList.innerHTML = "";

  cartCountField.innerText = `${cart.length}개 상품`;

  const elements = cart.map(item => {
    const { product_image, product_name, quantity, price, product_id } = item;
    const total = price * quantity;
    return `
      <li data-product-id="${product_id}">
          <input type="checkbox" class="list-checkbox" data-product-id="${product_id}"/>
          <img
            src="${product_image}"
          />
          <div class="cart-item-info">
            <h3>${product_name}</h3>
            <div class="item-quantity">
              <button class="minus" data-product-id="${product_id}">
                <i class="fas fa-minus"></i>
              </button>
              <span class="qty">${quantity}</span>
              <button class="plus" data-product-id="${product_id}">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <span class="item-price">${price}</span>
            <span class="item-total-price">총 ${total}원</span>
            <button class='cancel' data-product-id="${product_id}"><i class="fa-solid fa-trash-can"></i></buttonc>
          </div>
      </li>`;
  });
  cartList.innerHTML = elements.join("");

  setOrderInfo();
  cartList.addEventListener("click", clickHandler);
}
```

`data-product-id`를 이용하여 해당 요소가 어떤 요소인지 찾기로 한다.

```js
function changeQuantity(type, product_id) {
  const quantityField = document.querySelector(
    `li[data-product-id="${product_id}"] span.qty`
  );
  const totalPriceField = document.querySelector(
    `li[data-product-id="${product_id}"] span.item-total-price`
  );

  const itemIdx = cart.findIndex(item => item.product_id === product_id);
  const item = cart[itemIdx];

  let quantity = +quantityField.innerText;
  const price = item.price;

  switch (type) {
    case "minus":
      if (quantity > 1) {
        quantity--;
      }
      break;
    case "plus":
      quantity++;
      break;
    default:
      break;
  }

  item.quantity = quantity;
  cart.splice(itemIdx, 1, item);

  quantityField.innerText = quantity;
  totalPriceField.innerText = `총 ${quantity * price}원`;

  localStorage.setItem("myCart", JSON.stringify(cart));
  setOrderInfo();
}
```

`document.querySelector`를 이용하여 data 어트리뷰트를 기준으로 요소를 찾을 수 있다. 인덱스를 이용하여 요소를 찾는 것보다 쉽게 코드를 작성할 수 있다.

이러한 방식으로 이벤트 위임 방식이 필요한 부분은 모두 data 어트리뷰트를 사용하였다.

[cart 코드](https://github.com/cozups/5ot/blob/master/src/views/cart/cart.js)

[review 코드](https://github.com/cozups/5ot/blob/master/src/views/product-detail/review.js)

[카테고리 관리 코드](https://github.com/cozups/5ot/blob/master/src/views/manage-category/manage-category.js)

[제품 관리 코드](https://github.com/cozups/5ot/blob/master/src/views/manage-product/manage-product.js)
