# 🌱 마음이 자라는 교실

사회정서 교학공에서 만든 웹앱 모음 대문 페이지입니다. (빌드 없는 정적 사이트, 반응형)

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 대문 페이지 |
| `admin.html` | 관리자 페이지 (대문 왼쪽 위 🌱를 3초 꾹 → 암호) |
| `apps.js` | **앱 목록·관리자 암호 데이터** |
| `apps/` | 웹앱 html 파일을 넣는 폴더 |
| `store.js`, `pin.js`, `github.js`, `script.js`, `admin.js` | 동작 코드 |
| `style.css`, `admin.css` | 디자인 |

## 관리자 페이지

- 들어가기: 대문 왼쪽 위 🌱를 **3초 동안 꾹** 누르기 → 암호 입력 (기본 `4021`)
- 할 수 있는 것: 순서 바꾸기(⠿ 끌기 / ▲▼), 아이콘(이모지·사진) 바꾸기, 이름·설명·주소 수정, 앱 추가·삭제, 암호 변경
- 고친 내용은 먼저 **그 기기에 자동 저장**되고, **사이트에 저장**을 누르면 GitHub의 `apps.js`(main 브랜치)가
  바뀌어 1~2분 뒤 **모든 기기**에 반영됩니다. 고칠 때마다 커밋 기록이 남아 되돌릴 수도 있어요.
- 다른 기기에서 저장한 최신 내용은 관리자 페이지를 열 때 자동으로 불러옵니다.

### GitHub 연결 (처음 한 번)

1. https://github.com/settings/personal-access-tokens/new 접속
2. Token name 아무거나, Expiration 기간 선택
3. Repository access → **Only select repositories** → **SEL**
4. Permissions → Repositories → **Contents: Read and write**
5. Generate token → 복사 → 관리자 페이지 맨 아래 **GitHub 연결**에 붙여 넣고 **연결하기**

> 토큰은 그 기기 브라우저에만 저장되고 저장소에는 올라가지 않습니다. 공용 PC에서는 다 쓰고 **토큰 지우기**.
> 토큰이 없는 기기에서는 **파일 내려받기**로 받은 `apps.js`를 GitHub에 직접 올려도 됩니다.

> 암호는 `apps.js`에 그대로 들어 있어 페이지 소스를 보면 알 수 있습니다.
> 학생이 우연히 들어가는 것을 막는 가림막이고, 실제로 사이트를 바꿀 수 있게 하는 열쇠는 토큰입니다.

## 웹앱 주소 정하기

1. 웹앱 html 파일을 `apps/` 폴더에 넣습니다. (예: `apps/mood-weather.html`)
2. 관리자 페이지 주소 칸에 `apps/mood-weather.html` 이라고 적습니다.
3. 이미 다른 곳에 올라가 있는 앱이면 `https://…` 전체 주소를 적으면 됩니다.

## 배포

- GitHub Pages: 저장소 Settings → Pages → 배포할 브랜치 선택
  → `https://<아이디>.github.io/<저장소>/` 로 열림
- 개인 도메인(예: kalapui.com/sel)에 쓰려면 폴더 전체를 그 경로에 업로드
