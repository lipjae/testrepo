/**
 * 기존 nh_data_aggregated.json을 읽어서 각 날짜, 품목별로 페이징된 데이터를 추출
 */

const fs = require('fs');
const { loadDailyData } = require('./modules/loadDailyData');

// JSON 파일 읽기
const readAggregatedData = () => {
  try {
    const data = fs.readFileSync('nh_data_aggregated.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('JSON 파일 읽기 오류:', error);
    return null;
  }
};

// 모든 데이터 반환 (필터링 제거)
const getAllData = (data) => {
  if (!data || !data.data) return [];
  
  return data.data; // 모든 데이터 반환
};

// 각 날짜별 품목 데이터 추출
const extractDailyPagingData = async (date, items) => {
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
      const pagingData = await loadDailyData(date, item.value);
      
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

// 메인 실행 함수
const main = async () => {
  try {
    console.log('nh_data_aggregated.json 파일 읽기 중...');
    const aggregatedData = readAggregatedData();
    
    if (!aggregatedData) {
      console.error('데이터를 읽을 수 없습니다.');
      return;
    }
    
    console.log(`총 ${aggregatedData.data.length}일의 데이터 발견`);
    
    // 모든 데이터 가져오기
    const allData = getAllData(aggregatedData);
    console.log(`전체 데이터: ${allData.length}일`);
    
    if (allData.length === 0) {
      console.log('데이터가 없습니다.');
      return;
    }
    
    // 병렬 처리로 모든 날짜 데이터 추출
    console.log('병렬 처리로 데이터 추출 시작...');
    const promises = allData.map(dayData => 
      extractDailyPagingData(dayData.date, dayData.data)
    );
    
    const allDailyData = await Promise.all(promises);
    
    // 결과를 JSON 파일로 저장
    const result = {
      metadata: {
        extractedAt: new Date().toISOString(),
        totalDays: allDailyData.length,
        totalItems: allDailyData.reduce((sum, day) => sum + day.items.length, 0),
        totalRecords: allDailyData.reduce((sum, day) => 
          sum + day.items.reduce((daySum, item) => daySum + item.count, 0), 0
        )
      },
      data: allDailyData
    };
    
    const filename = 'all_daily_paging_data.json';
    fs.writeFileSync(filename, JSON.stringify(result, null, 2), 'utf8');
    
    console.log(`\n=== 추출 완료 ===`);
    console.log(`총 ${result.metadata.totalDays}일 처리`);
    console.log(`총 ${result.metadata.totalItems}개 품목 처리`);
    console.log(`총 ${result.metadata.totalRecords}개 레코드 추출`);
    console.log(`결과가 ${filename}에 저장되었습니다.`);
    
  } catch (error) {
    console.error('메인 함수 실행 중 오류:', error);
  }
};

main();
