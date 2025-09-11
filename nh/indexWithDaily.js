/**
 * 기존 nh_data_${naBzplcCode}.json을 읽어서 각 날짜, 품목별로 페이징된 데이터를 추출
 */

const fs = require('fs');
const path = require('path');
const { loadDailyData } = require('./modules/loadDailyData');

const marketList = require('./market_list.json');

// JSON 파일 읽기
const readAggregatedData = (naBzplcCode) => {
  try {
    const filename = `nh_data_${naBzplcCode}.json`;
    const filePath = path.join(__dirname, 'json', 'garlic', 'productList', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`JSON 파일 읽기 오류 (${naBzplcCode}):`, error);
    return null;
  }
};

// 모든 데이터 반환 (필터링 제거)
const getAllData = (data) => {
  if (!data || !data.data) return [];
  
  return data.data; // 모든 데이터 반환
};

// 각 날짜별 품목 데이터 추출
const extractDailyPagingData = async (date, items, naBzplcCode) => {
  console.log(`\n날짜 ${date} 처리 시작...`);
  
  const dailyData = {
    date,
    items: []
  };
  
  // "선택하세요" 항목 제외하고 실제 품목만 처리
  const validItems = items.filter(item => item.value && item.value !== '');
  
  for (const item of validItems) {
    console.log(`  품목 ${item.text} (${item.value}) 처리 중...`);
    
    try {
      const pagingData = await loadDailyData(date, item.value, naBzplcCode);
      
      if (pagingData && pagingData.length > 0) {
        dailyData.items.push({
          itemCode: item.value,
          itemName: item.text,
          data: pagingData,
          count: pagingData.length
        });
        
        console.log(`    ${pagingData.length}개 데이터 수집 완료`);
      } else {
        console.log(`    데이터 없음`);
      }
      
      // 품목 간 잠시 대기 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`    품목 ${item.text} 처리 중 오류:`, error);
    }
  }
  
  return dailyData;
};

// 단일 공판장 데이터 처리 함수
const processMarket = async (market) => {
  try {
    console.log(`\n=== ${market.naBzplcName} (${market.naBzplcCode}) 처리 시작 ===`);
    
    console.log(`nh_data_${market.naBzplcCode}.json 파일 읽기 중...`);
    const aggregatedData = readAggregatedData(market.naBzplcCode);
    
    if (!aggregatedData) {
      console.error(`${market.naBzplcName} 데이터를 읽을 수 없습니다.`);
      return;
    }
    
    console.log(`총 ${aggregatedData.data.length}일의 데이터 발견`);
    
    // 모든 데이터 가져오기
    const allData = getAllData(aggregatedData);
    console.log(`전체 데이터: ${allData.length}일`);
    
    if (allData.length === 0) {
      console.log(`${market.naBzplcName} 데이터가 없습니다.`);
      return;
    }
    
    // 병렬 처리로 모든 날짜 데이터 추출
    console.log('병렬 처리로 데이터 추출 시작...');
    const promises = allData.map(dayData => 
      extractDailyPagingData(dayData.date, dayData.data, market.naBzplcCode)
    );
    
    const allDailyData = await Promise.all(promises);
    
    // 결과를 JSON 파일로 저장
    const result = {
      metadata: {
        naBzplcCode: market.naBzplcCode,
        naBzplcName: market.naBzplcName,
        extractedAt: new Date().toISOString(),
        totalDays: allDailyData.length,
        totalItems: allDailyData.reduce((sum, day) => sum + day.items.length, 0),
        totalRecords: allDailyData.reduce((sum, day) => 
          sum + day.items.reduce((daySum, item) => daySum + item.count, 0), 0
        )
      },
      data: allDailyData
    };
    
    const filename = `all_daily_data_${market.naBzplcCode}.json`;
    const filePath = path.join(__dirname, 'json', 'garlic', 'productData', filename);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
    
    console.log(`\n=== ${market.naBzplcName} 추출 완료 ===`);
    console.log(`총 ${result.metadata.totalDays}일 처리`);
    console.log(`총 ${result.metadata.totalItems}개 품목 처리`);
    console.log(`총 ${result.metadata.totalRecords}개 레코드 추출`);
    console.log(`결과가 ${filePath}에 저장되었습니다.`);
    
  } catch (error) {
    console.error(`${market.naBzplcName} 처리 중 오류:`, error);
  }
};

// 메인 실행 함수 - 모든 공판장에 대해 반복 실행
const main = async () => {
  try {
    console.log(`총 ${marketList.length}개의 공판장 데이터를 처리합니다.`);
    
    // 각 공판장에 대해 순차적으로 처리
    for (let i = 0; i < marketList.length; i++) {
      const market = marketList[i];
      console.log(`\n진행률: ${i + 1}/${marketList.length}`);
      
      await processMarket(market);
      
      // 공판장 간 잠시 대기 (서버 부하 방지)
      if (i < marketList.length - 1) {
        console.log('다음 공판장 처리 전 잠시 대기...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n=== 모든 공판장 데이터 처리 완료 ===');
    
  } catch (error) {
    console.error('메인 함수 실행 중 오류:', error);
  }
};

main();
