### ✨ Blog

> Notion을 CMS로 쓰는 **Next.js** 블로그입니다.

### 🛠 Tech Stack

| 구분 | 기술 |
|------|------|
| **Framework** | Next.js 16, React 19 |
| **CMS** | Notion API (`@notionhq/client`) |
| **UI** | shadcn/ui, Radix UI, Tailwind CSS 4 |
| **코드 하이라이트** | Shiki |
| **기타** | Lucide Icons, CVA, clsx, tw-merge |


### 📁 주요 기능

- **Notion DB 연동** — Notion 데이터베이스에서 글 목록·본문을 가져와 렌더링
- **카테고리 필터** — 프로젝트 / 딥다이브 / 학습정리 / 회고로 글 분류·필터
- **포스트 상세** — 목차(Table of Contents), 북마크 블록, 이미지 등 Notion 블록 렌더링
- **코드 하이라이트** — Shiki 기반 코드 블록 스타일링


## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local`에 다음 변수를 설정하세요.

| 변수 | 설명 |
|------|------|
| `NOTION_API_KEY` | [Notion 연동](https://www.notion.so/my-integrations)에서 발급한 API 키 |
| `NOTION_DATABASE_ID` | 글 목록으로 쓰는 Notion DB의 ID |

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

---

## 📜 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 실행 |
| `pnpm format` | Prettier로 포맷팅 |

---

## 📂 프로젝트 구조

```
blog/
├── app/
│   ├── page.tsx          # 메인 (글 목록 + 카테고리)
│   ├── post/[id]/        # 포스트 상세
│   └── globals.css
├── components/
│   ├── PostCard/         # 카드, 요약, 썸네일
│   ├── NotionBlock.tsx   # Notion 블록 렌더링
│   ├── BookmarkBlock.tsx
│   ├── PostTableOfContents.tsx
│   └── ...
├── lib/
│   └── notion.ts         # Notion API 래퍼
└── ...
```

---

*Notion에서 작성하고, 여기서 읽는 블로그.*


## 시리즈 설정

홈의 **전체 글 / 시리즈** 탭에서 글 목록과 시리즈 목록을 오갈 수 있습니다.
시리즈 상세 페이지는 `/series/[slug]`이며, 글 주소는 기존 `/post/[id]`를 유지합니다.

### 1. 시리즈 DB 만들기

| 속성 | 타입 | 설명 |
|------|------|------|
| `name` | 제목 | 시리즈 이름 |
| `slug` | 텍스트 | 고유한 URL 이름. 예: `react-rendering` |
| `description` | 텍스트 | 시리즈 소개 |
| `coverUrl` | URL | 선택. 비워두면 노션 페이지 커버 사용 |

`slug`에는 영문 소문자, 숫자, 단어 사이 하이픈을 사용합니다. 잘못된 형식과 공개 시리즈 간 중복 slug는 목록에서 제외합니다.
이름을 바꾸더라도 기존 링크를 유지하려면 slug는 바꾸지 않습니다.

### 2. 기존 글 DB에 속성 추가

| 속성 | 타입 | 설명 |
|------|------|------|
| `series` | 관계형 → 시리즈 DB | 한 글당 한 페이지로 제한 |
| `seriesOrder` | 숫자 | 읽는 순서. 10, 20, 30처럼 입력하면 중간 삽입이 편함 |

일반 글은 두 속성을 비워둡니다. 순서 미입력은 맨 뒤에, 중복 순서는 글 ID 순으로 표시합니다.
시리즈의 글 수·목차·이전/다음 링크에는 `status = Published`인 글만 포함합니다.
공개 글이 없는 시리즈는 목록과 사이트맵에 나타나지 않으며 상세 주소는 404를 반환합니다.

### 3. 연결 및 환경 변수

시리즈 DB에도 기존 Notion 연결의 읽기 권한을 부여합니다.
`.env.local`과 배포 환경에 다음 변수를 추가합니다.

```dotenv
NOTION_SERIES_DATA_SOURCE_ID=시리즈_DB의_data_source_ID
```

이 값은 database ID가 아니라 **data source ID**입니다. Notion API의 database 조회 응답에서
`data_sources` 항목을 확인해 가져올 수 있습니다. 기존 `NOTION_DATABASE_ID`도 코드에서는 글 data source ID로 사용합니다.
변수를 비워두면 시리즈 탭은 빈 목록을 표시하고 기존 글은 정상 동작합니다.
환경 변수를 추가한 뒤 개발 서버를 다시 시작하고 배포 환경은 재배포합니다.

기존 웹훅이 새 시리즈 DB의 이벤트도 받을 수 있도록 연결 권한과 구독을 확인합니다.
`page.properties_updated`, `page.content_updated`, `page.created`, 삭제·복원 이벤트를 처리합니다.
글 이동·순서 변경·공개 해제·시리즈 이름 변경 시 시리즈 목록, 상세, 모든 글의 목차와 이전/다음 링크를 무효화합니다.
페이지는 다음 방문 때 다시 생성합니다.

### 확인

테스트는 Node.js 22.18 이상에서 실행합니다.

```bash
node --test tests/*.test.mjs
```

실제 연결 후에는 공개 글 두 편을 같은 시리즈에 넣고, 순서 변경·초안 전환·다른 시리즈로 이동했을 때
목록, 목차, 이전/다음 링크가 함께 바뀌는지 확인합니다.
