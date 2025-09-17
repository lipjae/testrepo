const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 품목별 저장 명칭
const productName = 'onion'

// 데이터 삽입 함수들
async function insertMarketData() {
  try {
    const marketData = JSON.parse(fs.readFileSync('./json/market_list.json', 'utf8'));
    console.log(`총 ${marketData.length}개의 시장 데이터를 삽입합니다...`);
    
    let insertedCount = 0;
    for (const market of marketData) {
      try {
        await prisma.wholesaleMarket.create({
          data: {
            marketCode: market.naBzplcCode,
            marketName: market.naBzplcName
          }
        });
        insertedCount++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`중복된 시장코드 건너뛰기: ${market.naBzplcCode}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log(`성공적으로 ${insertedCount}개의 시장 데이터가 삽입되었습니다.`);
    const totalCount = await prisma.wholesaleMarket.count();
    console.log(`현재 데이터베이스에 총 ${totalCount}개의 시장이 등록되어 있습니다.`);
    
  } catch (error) {
    console.error('시장 데이터 삽입 중 오류 발생:', error);
  }
}

async function insertVarietyData() {
  try {
    const varietyData = JSON.parse(fs.readFileSync(`./json/${productName}/productList_${productName}.json`, 'utf8'));
    console.log(`총 ${varietyData.length}개의 품종 데이터를 삽입합니다...`);
    
    let insertedCount = 0;
    for (const variety of varietyData) {
      try {
        await prisma.variety.create({
          data: {
            varietyCode: variety.value,
            varietyName: variety.text
          }
        });
        insertedCount++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`중복된 품종코드 건너뛰기: ${variety.value}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log(`성공적으로 ${insertedCount}개의 품종 데이터가 삽입되었습니다.`);
    const totalCount = await prisma.variety.count();
    console.log(`현재 데이터베이스에 총 ${totalCount}개의 품종이 등록되어 있습니다.`);
    
  } catch (error) {
    console.error('품종 데이터 삽입 중 오류 발생:', error);
  }
}

async function insertOriginData() {
  try {
    const originData = JSON.parse(fs.readFileSync(`./json/${productName}/originList.json`, 'utf8'));
    console.log(`총 ${originData.length}개의 산지 데이터를 삽입합니다...`);
    
    // 기존 산지명들을 미리 조회하여 중복 체크용 Set 생성
    const existingOrigins = await prisma.origin.findMany({
      select: { originName: true }
    });
    const existingOriginNames = new Set(existingOrigins.map(origin => origin.originName));
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const originName of originData) {
      // 이미 존재하는 산지명인지 확인
      if (existingOriginNames.has(originName)) {
        console.log(`중복된 산지명 건너뛰기: ${originName}`);
        skippedCount++;
        continue;
      }
      
      try {
        await prisma.origin.create({
          data: {
            originName: originName
          }
        });
        insertedCount++;
        // 새로 추가된 산지명을 Set에 추가하여 같은 배치 내에서의 중복 방지
        existingOriginNames.add(originName);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`중복된 산지명 건너뛰기: ${originName}`);
          skippedCount++;
        } else {
          throw error;
        }
      }
    }
    
    console.log(`성공적으로 ${insertedCount}개의 산지 데이터가 삽입되었습니다.`);
    console.log(`${skippedCount}개의 중복된 산지명이 건너뛰어졌습니다.`);
    const totalCount = await prisma.origin.count();
    console.log(`현재 데이터베이스에 총 ${totalCount}개의 산지가 등록되어 있습니다.`);
    
  } catch (error) {
    console.error('산지 데이터 삽입 중 오류 발생:', error);
  }
}

async function insertProductData(filePath = null) {
  try {
    // 산지명과 originCode 매핑을 위한 캐시 생성
    const origins = await prisma.origin.findMany();
    const originMap = new Map();
    origins.forEach(origin => {
      originMap.set(origin.originName, origin.originCode);
    });
    
    let filesToProcess = [];
    if (filePath) {
      // 특정 파일만 처리
      filesToProcess = [filePath];
    } else {
      // 모든 productData 파일 처리
      const productDataDir = `./json/${productName}/productData`;
      const files = fs.readdirSync(productDataDir).filter(file => file.endsWith('.json'));
      filesToProcess = files.map(file => path.join(productDataDir, file));
    }
    
    console.log(`총 ${filesToProcess.length}개의 파일을 처리합니다...`);
    
    let totalInsertedCount = 0;
    let processedFiles = 0;
    const batchSize = 1000; // 배치 크기
    
    for (const file of filesToProcess) {
      try {
        console.log(`파일 처리 중: ${file}`);
        const fileContent = fs.readFileSync(file, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        const marketCode = jsonData.metadata.naBzplcCode;
        let fileInsertedCount = 0;
        let batch = [];
        
        // 각 날짜별 데이터 처리
        for (const dayData of jsonData.data) {
          const saleDate = new Date(
            dayData.date.substring(0, 4) + '-' +
            dayData.date.substring(4, 6) + '-' +
            dayData.date.substring(6, 8)
          );
          
          // 각 품목별 데이터 처리
          for (const item of dayData.items) {
            const varietyCode = item.itemCode;
            
            // 각 거래 기록 처리
            for (const record of item.data) {
              const originName = record.산지;
              const originCode = originMap.get(originName);
              
              // 배치에 데이터 추가
              batch.push({
                marketCode: marketCode,
                varietyCode: varietyCode,
                originCode: originCode || 'cmff4tckk000014ov09uhn0aq',
                grade: record.등급 || null,
                weight: record.중량 ? parseFloat(record.중량.replace(/,/g, '')) : null,
                quantity: record.수량 ? parseInt(record.수량.replace(/,/g, '')) : null,
                price: record.경락가 ? parseInt(record.경락가.replace(/,/g, '')) : null,
                saleDate: saleDate
              });
              
              // 배치가 가득 차면 INSERT
              if (batch.length >= batchSize) {
                try {
                  await prisma.varietiesInfo.createMany({ data: batch });
                  fileInsertedCount += batch.length;
                  totalInsertedCount += batch.length;
                  batch = []; // 배치 초기화
                } catch (error) {
                  console.error(`배치 삽입 오류:`, error);
                  batch = []; // 오류 시 배치 초기화
                }
              }
            }
          }
        }
        
        // 남은 데이터 처리
        if (batch.length > 0) {
          try {
            await prisma.varietiesInfo.createMany({ data: batch });
            fileInsertedCount += batch.length;
            totalInsertedCount += batch.length;
          } catch (error) {
            console.error(`마지막 배치 삽입 오류:`, error);
          }
        }
        
        console.log(`파일 ${file} 처리 완료: ${fileInsertedCount}개 레코드 삽입`);
        processedFiles++;
        
      } catch (error) {
        console.error(`파일 ${file} 처리 중 오류:`, error.message);
      }
    }
    
    console.log(`총 ${processedFiles}개 파일 처리 완료`);
    console.log(`성공적으로 ${totalInsertedCount}개의 거래 데이터가 삽입되었습니다.`);
    const totalCount = await prisma.varietiesInfo.count();
    console.log(`현재 데이터베이스에 총 ${totalCount}개의 거래 기록이 등록되어 있습니다.`);
    
  } catch (error) {
    console.error('거래 데이터 삽입 중 오류 발생:', error);
  }
}

// 명령행 인수에 따라 실행할 함수 결정
async function main() {
  const command = process.argv[2];
  const filePath = process.argv[3]; // 특정 파일 경로 (선택사항)
  
  switch (command) {
    case 'market':
      await insertMarketData();
      break;
    case 'variety':
      await insertVarietyData();
      break;
    case 'origin':
      await insertOriginData();
      break;
    case 'product':
      await insertProductData(filePath);
      break;
    case 'all':
      await insertMarketData();
      await insertVarietyData();
      await insertOriginData();
      break;
    default:
      console.log('사용법:');
      console.log('  node insert_data.js market   - 시장 데이터 삽입');
      console.log('  node insert_data.js variety  - 품종 데이터 삽입');
      console.log('  node insert_data.js origin   - 산지 데이터 삽입');
      console.log('  node insert_data.js product  - 거래 데이터 삽입 (모든 파일)');
      console.log('  node insert_data.js product [파일경로] - 거래 데이터 삽입 (특정 파일)');
      console.log('  node insert_data.js all      - 모든 기본 데이터 삽입');
      break;
  }
  
  await prisma.$disconnect();
}

main();
