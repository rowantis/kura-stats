# Kura Stats - DEX 대시보드

Kura DEX의 거래내역을 GraphQL을 통해 조회하고 표시하는 대시보드입니다.

## 주요 기능

- **통합 거래내역**: CL (Concentrated Liquidity)과 Legacy 풀의 Swap, Mint, Burn 거래를 통합하여 표시
- **실시간 필터링**: 주소별, 거래 타입별 필터링 지원
- **페이지네이션**: 대량의 거래 데이터를 효율적으로 탐색
- **외부 링크**: SeiTrace로 연결되는 토큰 주소 및 트랜잭션 링크

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **GraphQL**: Apollo Client
- **State Management**: React Hooks

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 GraphQL 엔드포인트를 설정하세요:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=your_graphql_endpoint_here
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 대시보드를 확인하세요.

## 프로젝트 구조

```
kura-stats/
├── app/                    # Next.js App Router
│   ├── globals.css        # 글로벌 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 대시보드 페이지
├── components/             # React 컴포넌트
│   ├── TransactionTable.tsx  # 거래 테이블
│   └── Pagination.tsx        # 페이지네이션
├── lib/                   # 유틸리티 및 설정
│   ├── apollo-client.ts   # Apollo Client 설정
│   ├── transactions.ts    # 거래 데이터 변환 함수
│   └── utils.ts           # 포맷팅 유틸리티
├── types/                 # TypeScript 타입 정의
│   └── graphql.ts         # GraphQL 스키마 타입
└── package.json           # 프로젝트 의존성
```

## GraphQL 쿼리

대시보드는 다음 GraphQL 쿼리를 사용합니다:

- `clSwaps`: CL 풀 스왑 거래
- `clMints`: CL 풀 유동성 추가
- `clBurns`: CL 풀 유동성 제거
- `legacySwaps`: 레거시 풀 스왑 거래
- `legacyMints`: 레거시 풀 유동성 추가
- `legacyBurns`: 레거시 풀 유동성 제거

## 데이터 변환

모든 거래 데이터는 `UnifiedTransaction` 인터페이스로 통합되어 표시됩니다:

- **Swap**: 토큰 교환 거래
- **Mint**: 유동성 풀에 유동성 추가
- **Burn**: 유동성 풀에서 유동성 제거

## 외부 링크

- **토큰 주소**: `https://seitrace.com/address/${tokenAddress}?chain=pacific-1`
- **트랜잭션**: `https://seitrace.com/tx/${transaction.id}?chain=pacific-1`

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 정적 내보내기 (선택사항)

```bash
npm run build
npm run export
```

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
