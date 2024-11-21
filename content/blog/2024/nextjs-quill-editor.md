---
title: "NextJS 프로젝트에서 Quill 에디터 사용하기"
date: "2024-08-19"
description: "Quill 에디터를 사용하며 겪은 문제점과 해결 방법"
category: "Projects"
tags: ["NextJS", "WYSIWYG 에디터"]
---

이번 프로젝트에서 사용자가 일기를 작성할 때, 텍스트뿐만 아니라 이미지를 삽입할 수 있는 기능을 제공하고 싶었다. 그래서 WYSIWYG 에디터를 알아보게 되었고 비교적 간단한 기능만 필요하므로 Quill 에디터를 선택하게 되었다. 다른 에디터들도 다양한 기능을 제공했지만, Documentation 페이지가 자주 에러가 나거나 이번 프로젝트에 비해 기능이 과도하게 많아 보였기 때문에, 사용이 간편한 Quill을 선택했다.

# 1. Quill 라이브러리 import 하기

React 환경에서 Quill 에디터를 사용할 수 있는 `react-quill` 라이브러리를 설치하였다.
그 후에 별도로 `Editor` 컴포넌트를 작성하여 일기를 작성하는 페이지에서 import 할 수 있도록 하였다.

```ts
import { Dispatch, SetStateAction, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export default function Editor({ value, onChange }: EditorProps) {
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6] }],
        ["bold", "italic", "underline", "strike"],
        ["link", "image"],
      ],
    },
  };

  useEffect(() => {
    const preview = document.getElementById("preview");
    if (preview) {
      preview.innerHTML = value;
    }
  }, [value]);

  return (
    <ReactQuill
      theme="snow"
      modules={modules}
      value={value}
      onChange={onChange}
    />
  );
}
```

ReactQuill 컴포넌트에 여러 가지 props를 설정하여 에디터를 쉽게 불러올 수 있다.
modules로 전반적인 에디터의 설정을 할 수 있다.

- heading, font style, 링크, 이미지를 사용할 수 있는 정도의 에디터로 설정하였다.

# 2. Quill이 작성 내용을 전달하는 방법

Quill 에디터는 작성한 내용을 HTML element 형식의 텍스트로 전달한다.

예를 들어 'Hello World'를 평문으로 작성하면 `<p>Hello World</p>`를 텍스트로 전달한다.
이미지의 경우, `<img src="이미지를 base64로 인코딩한 문자열" />`의 형태로 전달한다.

## 이미지를 다루는 방법

이번 프로젝트에서 Quill의 내용물을 Quill이 전달하는 형식의 텍스트 자체로 데이터베이스에 저장할 것인데 이런 경우 이미지가 포함되는 경우 엄청나게 긴 string을 src로 가지는 텍스트가 DB에 저장된다. 그렇다면 이미지의 개수가 늘어날 수록 데이터가 굉장히 길어질 것이며 이는 큰 부하로 이어질 것 같아 다른 방법을 찾아보게 되었다.

다른 해결 방법을 찾았을 때,

1. 사용자가 이미지를 첨부하였을 경우 클라우드 혹은 서버에 이미지 업로드 후
2. 현재 커서에 이미지 붙여넣기

위와 같은 해결 방법을 찾았다. 그러나 이 경우에는 사용자가 submit 버튼을 누르기 전에 여러 번 이미지를 수정한다면 계속해서 클라우드 혹은 서버에 이미지를 업로드했다가 삭제하는 작업이 필요하다. 이것을 비효율적이라 생각했고 최종적으로 작성한 내용을 제출했을 때 이미지가 클라우드에 저장되는 방식을 사용하고 싶었다.

### 생각해낸 해결 방법

```ts
const onSubmit: SubmitHandler<Diary> = async (data: Diary) => {
  if (previewRef.current) {
    const imageNodes: NodeListOf<HTMLImageElement> =
      previewRef.current.querySelectorAll("img");
    const imageSrcs = Array.from(imageNodes, img => img.src);
    const imageFiles = imageSrcs.map(src => base64ToFile(src, "file"));
    await Promise.all(
      imageFiles.map(async (img, index) => {
        const formData = new FormData();
        formData.append("file", img);
        const response = await fetch("/api/images?target=image", {
          method: "POST",
          body: formData,
        });
        const { url } = await response.json();
        imageNodes[index].src = url;
      })
    );
    data.contents = previewRef.current.innerHTML;
    const response = await fetch("/api/diary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        date: new Date(formatDate(date.selectedDate)),
      }),
    });
    router.push("/dashboard");
  }
};
```

위 코드는 일기를 최초 작성할 때 사용되는 submit handler다.

1. 일단 `useRef`를 이용하여 `ref`를 `previewRef`로 갖는 div를 하나 생성하였다. 이 div 요소는 화면에 렌더링 되지 않으며 사용자가 Quill에 작성한 내용이 innerHTML에 삽입된다.
2. 이 preview div에서 `querySelectorAll('img')`를 통해 이미지 요소들을 `imageNodes`에 저장한다.
3. `imageNodes`로부터 `src`를 추출하고 이를 base64에서 파일로 바꿔주는 함수를 통해 이미지 파일로 변환한다.
4. `Promise.all` 메서드를 통해 이미지들이 모두 S3에 업로드 되기를 기다렸다가 업로드 된 이미지들의 링크를 이미지 노드의 src로 할당한다.
   - `<img src="base64 인코딩 문자열" />`형식으로 저장되어 있던 텍스트가 `<img src="S3에 업로드 된 링크" />`형식으로 바뀌게 된다.
5. 이를 data의 contents로 저장하여 일기를 작성하는 request body로 전달한다.

```ts
const onSubmit = async (data: Diary) => {
  if (previewRef.current) {
    const imageNodes: NodeListOf<HTMLImageElement> =
      previewRef.current.querySelectorAll("#preview img");
    const imageSrcs = Array.from(imageNodes, img => img.src);
    // find deleted or added images
    const deletedImages = images.filter(src => !imageSrcs.includes(src));
    const addedImages = imageSrcs.filter(src => !images.includes(src));
    // delete old images
    await Promise.all(
      deletedImages.map(async src => {
        await fetch("/api/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: src,
          }),
        });
      })
    );
    // add new images
    await Promise.all(
      addedImages.map(async src => {
        const formData = new FormData();
        formData.append("file", base64ToFile(src, "file"));
        const response = await fetch("/api/images?target=image", {
          method: "POST",
          body: formData,
        });
        const { url } = await response.json();
        const index = imageSrcs.findIndex(imgSrc => imgSrc === src);
        imageNodes[index].src = url;
      })
    );
    data.contents = previewRef.current.innerHTML;
    const response = await fetch("/api/diary", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, id }),
    });
    router.push("/dashboard");
  }
};
```

이 코드는 일기를 수정할 때 사용하는 submit handler이다.
방법 자체는 일기 작성 시 사용하는 방법과 동일하지만 일기를 수정할 때 어떤 이미지가 수정되었는지 찾아내야 한다. 어떤 이미지가 추가/삭제 되었는지 알아내는 작업이 필요하다.

```ts
const deletedImages = images.filter(src => !imageSrcs.includes(src));
const addedImages = imageSrcs.filter(src => !images.includes(src));
```

- `imageSrcs`: 최종 수정된 일기 콘텐츠가 갖는 이미지 링크들
- `images`: 수정 전 원래의 일기 콘텐츠가 갖고 있는 이미지 링크들
- `deletedImages`: 삭제된 이미지 링크를 갖는 배열
  - filter 메서드를 통해 최종 수정된 일기 콘텐츠가 갖고 있지 않은 링크를 찾아낸다.
  - = 없어진 이미지 링크
- `addedImages`: 추가된 이미지 링크를 갖는 배열
  - filter 메서드를 통해 원래 일기 콘텐츠가 갖고 있지 않은 링크를 찾아낸다.
  - = 새로 추가된 이미지 링크

그 후, 두 번의 `Promise.all`을 통해 기존의 이미지를 삭제하고 새로운 이미지를 추가, src를 바꾸는 작업을 거친다.
다음으로, 수정된 contents를 `data`에 저장하고 request body로 전달하여 DB에 업데이트한다.

사실 이 방법이 최선인지 확신할 수는 없지만, 현재 생각해 낼 수 있는 아이디어 중에서 사용자가 최종적으로 제출 버튼을 눌렀을 때 이미지 저장과 삭제가 이루어질 수 있는 최적의 방법이라고 생각했다.

# 3. dynamic import

Quill은 `windows.document`를 조작하는 방법으로 작동한다. 따라서 프로젝트를 build할 때 ReferenceError가 발생한다.

```
ReferenceError: document is not defined
```

이 에러가 발생하는 이유는 Next.js는 기본적으로 페이지를 서버 측에서 렌더링한 후 클라이언트 측에서 하이드레이션(hydration)하기 때문이다. `document`와 같은 브라우저 전용 객체는 클라이언트 측에서만 접근 가능하며, 서버 측에서는 접근할 수 없기 때문에 발생한다.

따라서 이 오류를 해결하기 위해 Quill을 사용하는 컴포넌트를 dynamic import를 통해 클라이언트 측에서만 로드하도록 해야 한다.

```ts
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/app/components/diary/Editor"), {
  loading: () => <div>Loading Editor...</div>,
  ssr: false,
});
```
