---
title: "NextJS 프로젝트에서 AWS S3에 이미지 저장하기"
date: "2024-08-13"
description: "NextJS 프로젝트에서 AWS S3 클라우드 스토리지를 이용하여 이미지 다루기"
category: "Projects"
tags: ["NextJS", "AWS S3"]
---

예전에 팀 프로젝트를 진행했을 때 이미지를 저장하는 방법으로 두 가지 방법을 사용해보았다.

- 로컬 서버에 이미지 저장하기
- AWS S3 스토리지에 이미지 저장하기

로컬 서버에 이미지를 저장하는 것보다는 AWS S3 스토리지를 이용하는 것이 장점이 더 많다고 느껴졌다. 로컬 서버에 이미지를 저장하는 방법은 웹 개발을 처음 시작하며 만든 첫 프로젝트에서 사용했는데, 당시에는 테스트 환경이 제대로 갖춰지지 않아 테스트도 수동으로 진행되었다. 그 결과, 개발 환경에서 저장한 이미지가 배포 환경 서버에는 존재하지 않아 이미지가 제대로 출력되지 않고 엑스박스가 표시되는 문제를 경험했다. 이러한 환경적 문제뿐만 아니라, 클라우드 스토리지를 이용해 이미지를 다루는 방법이 더 널리 사용되고 있어 이를 공부해보고 싶었다. 이전 프로젝트에서 AWS S3 스토리지를 사용한 경험이 있지만, 다른 팀원이 구현했기 때문에 직접 구현해보는 기회가 없었다.

# 1. AWS S3 세팅

[블로그 글](https://medium.com/@givvemeee/upload-image-to-aws-s3-bucket-with-next-js-ccfe35e1de1c)을 참고하여 AWS 콘솔에서 버킷을 생성하였다.

```text
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

`.env` 파일에 AWS 스토리지와 관련된 변수들을 세팅한다. 세팅 방법도 위 블로그에 있다.

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const Bucket = process.env.AWS_BUCKET_NAME;
export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});
```

그 후에 S3을 세팅하는 파일을 작성한다.

# 2. 이미지 업로드/삭제 커맨드 작성

이미지를 저장/삭제하는 route handler를 작성한다.

```ts
import { Bucket, s3 } from '@/app/lib/s3';
import { prisma } from '@/app/lib/prisma';
import { createRandomString } from '@/app/utils';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const target = searchParams.get('target');

  if (target === 'profile') {
    // 프로필 이미지 관련 코드
    ...
  }

  if (target === 'stickers') {
    // 스티커 이미지 관련 코드
    ...
  }

  if (target === 'image') {
	// 단일 이미지 저장 관련 코드
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = `IMG_${createRandomString(10)}`;
    const objectUrl = await uploadImageToS3(fileName, file);

    return NextResponse.json(
      { result: 'Upload success.', url: objectUrl },
      { status: 201 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { url } = await req.json();
  const filename = url.split('/').slice(-1)[0];

  try {
    const command = new DeleteObjectCommand({
      Bucket,
      Key: filename,
    });
    await s3.send(command);
  } catch (error) {
    return NextResponse.json(
      { error: 'DELETE image failed.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { result: 'DELETE image success.' },
    { status: 201 }
  );
}

async function uploadImageToS3(fileName: string, file: File) {
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const uploadCommand = new PutObjectCommand({
    Bucket,
    Key: `${fileName}`,
    Body: fileBuffer,
  });
  await s3.send(uploadCommand);

  const objectUrl = `https://${Bucket}.s3.amazonaws.com/${fileName}`;

  return objectUrl;
}

async function DeleteImageFromS3(key: string | null) {
  if (key) {
    const deletePrevCommand = new DeleteObjectCommand({
      Bucket,
      Key: key,
    });
    await s3.send(deletePrevCommand);
  }
}

```

이 곳에서 s3을 import 하고 `PutObjectCommand`, `DeleteObjectCommand`를 이용하여 이미지를 S3 클라우드에 저장하고 삭제한다.

- request body로 전달받은 formData에서 이미지 파일을 가져와 커맨드를 작성한다.
- 이미지 파일 이름은 중복을 피하기 위해 `IMG_` 뒤에 랜덤 문자열을 붙인다.
- 이미지 삭제는 이미지 파일 키(이름)을 전달한다.
  - request body 속 url은 S3에 업로드 된 이미지 파일 링크이기 때문에 이름을 따로 추출하는 작업이 필요하다. `const filename = url.split('/').slice(-1)[0];`

[전체 코드](https://github.com/cozups/sticker-diary/blob/master/src/app/api/images/route.ts) (아직 리팩토링 전이라 중복되는 로직이 존재할 수 있음)

# 3. 이미지를 다루는 작업이 필요한 경우?

모든 이미지 데이터는 formData로 전달된다.

기본적인 추가/수정/삭제 로직은 같다.

- 추가: 단일 이미지를 저장한다.
- 수정: 기존의 이미지를 삭제하고 수정된 이미지를 저장한다.
- 삭제: 기존의 이미지를 삭제한다.

1. 프로필 이미지의 추가/수정/삭제
2. 스티커 이미지의 추가/수정
3. 일기 이미지의 추가/수정/삭제

## 프로필 이미지

```ts
const onSubmit: SubmitHandler<EditFormInput> = async (
    data: EditFormInput
  ) => {
    data.image = session?.user?.image || '';
    // 이미지를 제외한 사용자 데이터 수정 로직
    ...

	// 이미지 관련 로직
    if (imageInputRef.current?.files?.length) {
      const imageFile: File = imageInputRef.current.files[0];
      const prevProfileImage = session?.user?.image;

      // upload image
      const formData = new FormData();
      formData.append('email', session?.user?.email || '');
      formData.append('image', imageFile);

      const uploadImageResponse = await fetch('/api/images?target=profile', {
        method: 'POST',
        body: formData,
      });

      const { url } = await uploadImageResponse.json();

      data.image = url;

      // delete previous image
      const deleteImageResponse = await fetch('/api/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: prevProfileImage,
        }),
      });
    }

    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: data.username,
        image: data.image,
      },
    };

    await update(newSession);

    router.push('/');
  };
```

1. 사용자가 input 요소에 삽입한 이미지가 있다면 가져온다.
2. 이전에 저장된 프로필 이미지가 있다면 변수에 저장한다.
3. formData에 사용자의 email과 이미지 파일을 추가하고 request body로 전달한다.
4. S3 스토리지에 추가된 이미지의 링크를 response로 받아 업데이트 할 `data`객체에 추가한다.
5. 이전에 저장되었던 프로필 이미지는 더 이상 사용되지 않으므로 삭제한다.
6. 세션을 업데이트한다.

## 스티커 이미지

```ts
const onSubmit = async () => {
  const formData = new FormData();

  Object.entries(stickers).map(([key, file]) => {
    formData.append(key, file);
  });

  const response = await fetch("/api/images?target=stickers", {
    method: "POST",
    body: formData,
  });

  const updatedStickers = await response.json();

  const newSession = {
    ...session,
    user: {
      ...session?.user,
      stickers: updatedStickers,
    },
  };

  await update(newSession);

  router.replace("/profile");
};
```

1. `stickers`에는 사용자가 새로 삽입한 이미지들이 배열로 저장되어있다.
2. 이를 formData에 추가하고 request body로 전달한다.
3. 기존의 이미지가 삭제되고 새로운 이미지가 저장되는 작업은 route handler 안에서 이루어진다.

```ts
// in /api/images/route.ts
const savedStickers = userData.stickers as Record<string, string>;

// delete prevSticker and upload new sticker
for (const key of formData.keys()) {
  // delete previous Sticker
  const deleteKey = savedStickers[key]?.split("/").slice(-1)[0];
  await DeleteImageFromS3(deleteKey);

  // upload new Sticker
  const file = formData.get(key) as File;
  const fileName = `STK_${createRandomString(10)}`;
  const objectUrl = await uploadImageToS3(fileName, file);

  stickers[key] = objectUrl;
}

// update sticker url to DB
const updated = await prisma.user.update({
  where: {
    email: session.user.email as string,
  },
  data: {
    stickers: { ...savedStickers, ...stickers },
  },
});
```

4. 수정 사항이 없는 스티커들은 그대로 놔두고 request body로 전달 받은 스티커들만 수정하면 되므로 `for (const key of formData.keys())`구문으로 처리한다.
   - `key`: 'best', 'good', 'soso', 'bad', 'worst'로 이 다섯 가지만 다룬다.
   - 만약 사용자가 'best', 'good', 'bad'만 새로 수정했다면 formData는 'best', 'good', 'bad'에 대한 이미지 파일을 갖는 형태일 것이다.
5. 업데이트 된 스티커 링크들을 response로 받아 세션을 업데이트한다.

## 일기 이미지

일기 부분은 Quill 에디터를 사용하였기 때문에 로직이 좀 더 특별한데 이에 대한 자세한 사항은 따로 글을 작성하겠다.

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

1. 사용자가 추가한 이미지들을 배열로 받아 formData에 추가하고 request body로 전달한다.
2. 업로드 된 이미지 링크를 response로 받아 이미지 요소의 src를 수정한다.
   - 수정하는 이유는 Quill에서 이미지를 base64형태로 인코딩하여 src에 저장하기 때문이다.
   - 긴 문자열을 가진 src를 갖는 이미지 태그 자체를 DB에 저장하는 것은 좋은 방법이 아니므로 S3에 이미지를 업로드하고 업로드가 완료된 링크를 src로 수정한다.

이 코드에 대한 더 자세한 사항은 따로 글을 작성할 예정이다.
