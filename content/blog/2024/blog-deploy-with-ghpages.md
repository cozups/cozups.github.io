---
title: "Gatsby 블로그 github pages로 배포하기 - ENAMETOOLONG 에러"
date: "2024-11-22"
description: "github pages를 이용하여 배포를 수정하는 과정에 마주친 ENAMETOOLONG 에러 해결 과정"
category: "Deploy"
tags: ["Blog", "Deploy"]
---

원래 이 블로그는 netlify로만 배포를 했다. 그냥 놔둬도 상관은 없었지만 url에 netlify.app으로 남는게 마음에 안 들어서 다들 많이 쓰는 github 블로그로 배포하고 싶었다. 그래서 github pages로 배포를 시도하던 중 마주한 이슈가 있었다.

# Error: spawn ENAMETOOLONG

`gatsby build` 명령어 실행 과정은 정상적으로 이루어졌으나 `gh-pages -d public -b deploy` 명령어를 수행하던 중 마주한 에러이다.

`gh-pages -d public -b deploy`는 `gatsby build`의 결과물이 담긴 `public` 폴더를 deploy 브랜치에 배포하겠다는 것을 의미한다. 그 과정에서 마주한 `Error: spawn ENAMETOOLONG` 에러는 git rm 명령어 실행 시 파일 경로나 명령어가 과도하게 길어져서 생기는 에러라고 한다.
우선 저 에러가 어디서 나타나는지 알아내기 위해 `NODE_DEBUG=gh-pages` 명령어와 함께 `npm run deploy`를 수행했다.

## gh-pages가 배포를 실행하는 과정

```text
GH-PAGES 24960: Cloning https://github.com/cozups/cozups.github.io.git into D:\dev-log\node_modules\.cache\gh-pages\https!github.com!cozups!cozups.github.io.git
GH-PAGES 24960: Cleaning
GH-PAGES 24960: Fetching origin
GH-PAGES 24960: Checking out origin/deploy
GH-PAGES 24960: Removing files
Error: spawn ENAMETOOLONG
    at ChildProcess.spawn (node:internal/child_process:421:11)
    at Object.spawn (node:child_process:761:9)
    at D:\cozups-gatsby-blog\cozups-gatsby-blog\node_modules\gh-pages\lib\git.js:30:22
    at new Promise (<anonymous>)
    at spawn (D:\cozups-gatsby-blog\cozups-gatsby-blog\node_modules\gh-pages\lib\git.js:29:10)
    at Git.exec (D:\cozups-gatsby-blog\cozups-gatsby-blog\node_modules\gh-pages\lib\git.js:69:10)
    at Git.rm (D:\cozups-gatsby-blog\cozups-gatsby-blog\node_modules\gh-pages\lib\git.js:146:15)
    at D:\cozups-gatsby-blog\cozups-gatsby-blog\node_modules\gh-pages\lib\index.js:180:22
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
```

gh-pages가 배포를 수행하는 과정은 node_modules\.cache\gh-pages에 리포지토리를 클론하고 원격 deploy 브랜치를 정리한 후에 새로운 배포 결과를 넣는다. 그런데 브랜치를 정리하는 과정에서 문제가 생기고 있다. 이 문제는 파일의 경로나 명령어가 너무 길어지는 경우 생기는 문제로, Mac에서는 발생하지 않고 Windows 환경에서만 생기는 문제라고 한다.

이 문제를 해결하기 위해 stackoverflow도 찾아보고, chatGPT에게 물어봐서 발견한 해결책들도 실행해봤는데 도저히 문제가 해결되지 않았다. 그래서 gh-pages 깃허브에 들어가 이슈 창을 살펴보니 6.2.0 버전으로 업데이트 한 이후로 이 에러가 발생했다는 글을 보았다. 문제 해결법으로 node_modules 내의 코드를 직접 수정하는 방법이 있었는데 그 방법을 쓰는 것은 만약, 다른 환경이나 프로젝트에서 똑같이 gh-pages를 사용하고자 하면 또 코드를 수정해야 하는 문제가 생기기 때문에 버전을 낮추는 방법을 선택했다.
gh-pages 버전을 6.1.0으로 낮추고 배포를 다시 진행하니 문제 없이 블로그가 배포되는 것을 확인했다. gh-pages가 성공적으로 배포를 수행하는 과정은 아래와 같다.

```text
GH-PAGES 22868: Cloning https://github.com/cozups/cozups.github.io.git into D:\dev-log\node_modules\.cache\gh-pages\https!github.com!cozups!cozups.github.io.git
GH-PAGES 22868: Cleaning
GH-PAGES 22868: Fetching origin
GH-PAGES 22868: Checking out origin/deploy
GH-PAGES 22868: Removing files
GH-PAGES 22868: Copying files
GH-PAGES 22868: Adding all
GH-PAGES 22868: Committing
GH-PAGES 22868: Pushing
Published
```

리포지토리 클론 후, 원격 브랜치에 접근해 파일을 정리하고 새로운 배포 내용물을 넣고 깃허브에 푸시한다.

---

이 과정에서 NODE_DEBUG를 통해 디버깅 정보를 확인하는 방법을 알게 되었고 그 과정에서 문제를 찾아내고 해결하는 방법을 찾을 수 있었다. 그리고 gh-pages의 깃허브 이슈 창을 마지막으로 확인했었는데 그냥 처음부터 찾아봤으면 더 빨리 해결할 수 있지 않았을까 하는 생각도 들었다. 앞으로는 패키지 관련 이슈가 있으면 해당 패키지의 깃허브부터 찾아 가봐야겠다.
