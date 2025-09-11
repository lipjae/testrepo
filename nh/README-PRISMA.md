# Prisma + SQLite3 설정 완료

이 프로젝트에 Prisma와 SQLite3가 성공적으로 설정되었습니다.

## 설치된 패키지

- `prisma`: Prisma CLI
- `@prisma/client`: Prisma 클라이언트
- `sqlite3`: SQLite3 데이터베이스 드라이버

## 데이터베이스 스키마

다음과 같은 모델들이 정의되어 있습니다:

### Market (시장)
- `id`: 고유 식별자
- `naBzplcCode`: 시장 코드
- `naBzplcName`: 시장 이름

### ProductList (상품 목록)
- `id`: 고유 식별자
- `marketId`: 시장 ID (외래키)
- `date`: 날짜 (YYYYMMDD 형식)
- `totalDays`, `successDays`, `failedDays`: 통계 정보
- `dateRange`: 날짜 범위 (JSON 문자열)
- `generatedAt`: 생성 시간

### ProductData (상품 상세 데이터)
- `id`: 고유 식별자
- `marketId`: 시장 ID (외래키)
- `date`: 날짜 (YYYYMMDD 형식)
- `itemCode`: 상품 코드
- `itemName`: 상품 이름
- `extractedAt`: 추출 시간
- `totalDays`, `totalItems`, `totalRecords`: 통계 정보

### ProductRecord (판매 기록)
- `id`: 고유 식별자
- `productDataId`: 상품 데이터 ID (외래키)
- `saleDate`: 판매일자
- `variety`: 품종
- `grade`: 등급
- `specification`: 규격
- `unit`: 단위
- `quantity`: 수량
- `avgPrice`: 평균가격
- `maxPrice`: 최고가격
- `minPrice`: 최저가격
- `volume`: 거래량

## 사용 가능한 스크립트

```bash
# Prisma 예제 실행
npm run prisma:example

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 동기화
npm run db:push

# 마이그레이션 실행
npm run db:migrate

# Prisma Studio 실행 (웹 UI)
npm run db:studio
```

## 데이터베이스 파일

- `dev.db`: SQLite 데이터베이스 파일
- `prisma/schema.prisma`: Prisma 스키마 파일
- `.env`: 환경 변수 파일 (DATABASE_URL 포함)

## Prisma 사용 예제

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 시장 데이터 조회
const markets = await prisma.market.findMany();

// 상품 데이터 조회 (관계 포함)
const productData = await prisma.productData.findMany({
  include: {
    market: true,
    records: true
  }
});

// 데이터 생성
const newMarket = await prisma.market.create({
  data: {
    naBzplcCode: "8808990000794",
    naBzplcName: "안산공판장"
  }
});
```

## 다음 단계

1. 기존 JSON 데이터를 데이터베이스로 마이그레이션
2. 데이터 조회 및 분석 기능 구현
3. API 엔드포인트 생성
4. 데이터 시각화 구현
