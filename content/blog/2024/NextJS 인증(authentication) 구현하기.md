---
title: "NextJS 인증(authentication) 구현하기"
date: "2024-07-27"
description: "NextAuth V5(Auth.js)와 react-hook-form을 이용하여 사용자 인증 로직 구현하기"
category: "Projects"
tags: ["NextJS", "NextAuth"]
---

이번 프로젝트를 하면서 인증 로직을 구현해야했는데 NextAuth V5(Auth.js)를 이용하여 인증 절차를 구현하였고 form은 react-hook-form 라이브러리를 이용하였다.

# 1. react-hook-form으로 form 작성하기

`react-hook-form`라이브러리를 이용하면 form 제작을 좀 더 쉽게 할 수 있다고 하여 공부하고 싶었다. 그래서 이 라이브러리를 사용하여 form을 만들었는데... 처음 쓰는 라이브러리라 시작부터 난관이다.

```ts
'use client';

import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import StyledInput from '@/app/components/UI/StyledInput';
import Button from '@/app/components/UI/Button';

...

export default function Join() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormInput>();

  const onSubmit: SubmitHandler<FormInput> = async (data: FormInput) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      router.push('/login');
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      ...
      <div className="px-16 mb-2 flex flex-col justify-center items-center">
        <div className="flex flex-col w-full mb-3">
          <label className="text-gray-400" htmlFor="username">
            Username
          </label>
          <StyledInput
            id="username"
            {...register('username', { required: true })}
          />
          {errors.username && (
            <p id="username-error" className="error-message">
              Username is required.
            </p>
          )}
        </div>

        <div className="flex flex-col my-3 w-full">
          <label className="text-gray-400" htmlFor="email">
            Email
          </label>
          <StyledInput
            id="email"
            {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
          />
          {errors.email && (
            <p id="email-error" className="error-message">
              Email is required and must include @.
            </p>
          )}
        </div>

        <div className="flex flex-col my-3 w-full">
          <label className="text-gray-400" htmlFor="password">
            Password
          </label>
          <StyledInput
            id="password"
            type="password"
            {...register('password', { required: true, minLength: 6 })}
          />
          {errors.password && (
            <p id="password-error" className="error-message">
              Password is required and must be at least 6 characters long.
            </p>
          )}
        </div>

        <div className="flex flex-col mt-3 mb-6 w-full">
          <label className="text-gray-400" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <StyledInput
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: true,
              validate: (value) =>
                watch('password') === value || 'Passwords do not match.',
            })}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="error-message">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
		...
      </div>
    </form>
  );
}

```

form 자체는 useForm 훅을 이용하여 쉽게 만들 수 있었다.

- `register` - input이나 select 태그에 유효성에 관한 옵션들을 넣을 수 있는 메서드
- `formState` - 말 그대로 form state에 관한 정보
- `watch` - 특정 input의 값을 추적할 수 있는 메서드
- `handleSubmit` - form이 유효하다면 form data를 받아서 사용하는 함수

주로 위 네 가지를 사용하였다.

그리고 `NextAuth`라이브러리를 이용하여 인증을 시도했다. NextJS 공식 문서에서도 이 라이브러리를 쓰는 것을 권장하길래 사용해보았다.

# 2. NextAuth 설정 및 사용용

```ts
import NextAuth, { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Prisma } from "@prisma/client";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      authorize: async credentials => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          throw new Error("User Not Found");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          stickers: user.stickers as Record<string, string>,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, session, user }) {
      if (user) {
        // 첫 로그인 시
        token.picture = user.image;
        token.stickers = user.stickers;
      }
      if (trigger === "update") {
        // 세션 업데이트 시
        token.picture = session.user.image;
        token.stickers = session.user.stickers;
        return { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.name = token.name;
        session.user.email = token.email || "";
        session.user.image = token.picture;
        session.user.stickers = token.stickers as Record<string, string>;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
```

`authOptions`: NextAuth.js의 구성 옵션을 정의한 객체이다.

## 주요 구성 요소:

1. **adapter: PrismaAdapter(prisma)**
   - Prisma를 사용하여 NextAuth에서 사용자 데이터 및 세션을 관리
2. **session: { strategy: 'jwt' }**
   - 세션 관리를 JWT(JSON Web Token) 방식으로 설정한다.
   - 세션 업데이트를 하기 위해 jwt 세션 전략을 선택했다.
3. **secret**
   - JWT를 암호화하는 데 사용되는 비밀 키로, 환경 변수 `NEXTAUTH_SECRET`으로 설정된다.
4. **providers**
   - 인증에 사용할 제공자(providers) 목록
   - **Credentials**: 사용자 이메일과 비밀번호로 직접 인증을 처리한다. 여기서 `authorize` 메서드는 사용자의 자격 증명을 검증하고, 인증이 성공하면 사용자 객체를 반환한다.
5. **callbacks**
   - `jwt`: JWT 토큰이 생성되거나 업데이트될 때 호출된다.
     - 사용자가 처음 로그인할 때 또는 세션이 업데이트될 때 사용자 정보를 토큰에 추가한다.
   - `session`: 클라이언트 측에서 세션 정보에 접근할 때 호출된다.
     - 사용자 세션 정보를 토큰 정보로부터 설정한다.

여기서 조금 이해하기 어려웠던 것은 이렇게 설정하고 나서 사용자가 폼을 제출했을 때 'NextAuth가 어떤 로직을 따르는가'였다.
NextAuth를 처음 써보기도 했고 Documentation에도 나와있지 않았기 때문에 직접 알아내야 했다.

1. 우선 `authorize` 함수가 먼저 실행된다.
   - 인증에 성공하는 경우, 사용자 객체를 반환하고 `callbacks`를 실행한다.
   - 인증에 실패하는 경우, `null`이나 오류를 던지며 이 경우 `callbacks`를 실행하지 않는다.
2. 그 후, `callbacks` 중 `jwt`가 실행된다.
3. `jwt`의 실행 이후, `session`이 실행된다.

## callbacks

이번 프로젝트에서 직접 사용한 callback은 `jwt`, `session` 콜백이다. 두 콜백 모두 클라이언트 측에서 세션에 접근할 때 호출된다.

### jwt callback

```ts
async jwt({ token, trigger, session, user }) {
  if (user) {
	// 첫 로그인 시
	token.picture = user.image;
	token.stickers = user.stickers;
  }
  if (trigger === 'update') {
	// 세션 업데이트 시
	token.picture = session.user.image;
	token.stickers = session.user.stickers;
	return { ...token, ...session.user };
  }
  return token;
},
```

- user는 첫 로그인 시에만 전달되며 authorize에서 반환한 사용자 객체가 전달된다. `token.picture`에 사용자의 프로필 이미지(`user.image`)를 저장하고 `token.sticker = user.sticker` 구문을 이용해 사용자의 커스텀 스티커를 저장한다.
- trigger는 `signIn`, `signOut`, `update` 등이 설정될 수 있는데, 세션 업데이트 시 필요한 작업들이 있기 때문에 trigger가 update인 경우에 대한 구문을 추가하였다.
  - 프로필 이미지와 스티커를 업데이트 하는 경우 세션 업데이트가 이루어지므로 이 정보들을 토큰에 반영한다.

### session callback

```ts
async session({ session, token }) {
  if (session.user && token) {
	session.user.name = token.name;
	session.user.email = token.email || '';
	session.user.image = token.picture;
	session.user.stickers = token.stickers as Record<string, string>;
  }
  return session;
},
```

> If you want to pass data such as an Access Token or User ID to the browser when using JSON Web Tokens, you can persist the data in the token when the `jwt` callback is called, then pass the data through to the browser in the `session` callback.

- Document에 따르면 JWT를 사용하여 데이터를 전달하고자 할 때, jwt 콜백에서 토큰에 데이터를 저장하고 session 콜백을 통해 브라우저에 데이터를 전달하라고 명시되어 있다.
- 따라서 session 콜백에서는 token에 저장된 데이터를 세션에 반영하는 작업을 한다.
  [NextAuth 설정 파일](https://github.com/cozups/sticker-diary/blob/master/src/auth.ts)

session update는 프로필 수정, 커스텀 스티커 수정 시 호출된다.

```ts
const onSubmit: SubmitHandler<EditFormInput> = async (
    data: EditFormInput
  ) => {
    // 여러 가지 데이터를 DB에 update하는 로직
    ...

	// 세션 update 로직
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

[전체 코드](https://github.com/cozups/sticker-diary/blob/master/src/app/profile/edit/page.tsx)
