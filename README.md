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
