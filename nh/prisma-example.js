const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Prisma 클라이언트가 성공적으로 연결되었습니다!');
  
  // 시장 데이터 조회 예제
  const markets = await prisma.market.findMany();
  console.log('현재 등록된 시장 수:', markets.length);
  
  // 상품 목록 데이터 조회 예제
  const productLists = await prisma.productList.findMany({
    take: 5,
    include: {
      market: true
    }
  });
  console.log('상품 목록 데이터 수:', productLists.length);
  
  // 상품 상세 데이터 조회 예제
  const productData = await prisma.productData.findMany({
    take: 5,
    include: {
      market: true,
      records: true
    }
  });
  console.log('상품 상세 데이터 수:', productData.length);
  
  // 판매 기록 조회 예제
  const records = await prisma.productRecord.findMany({
    take: 5,
    include: {
      productData: {
        include: {
          market: true
        }
      }
    }
  });
  console.log('판매 기록 수:', records.length);
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
