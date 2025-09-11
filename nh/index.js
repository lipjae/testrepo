/**
 * 농협 공판장 데이터 수집기
 * 모듈화된 구조로 코드 정리
 */

// 모듈 import
const { generateDateRange, chunkArray } = require('./modules/dateUtils');
const { processDateChunk } = require('./modules/nhScraper');
const { saveToFile, aggregateData, printSummary } = require('./modules/dataAggregator');

/**
 * 메인 실행 함수
 * @param {boolean} testMode - 테스트 모드 여부
 * @param {number} chunkSize - 청크 크기 (기본값: 30)
 */
const main = async (testMode = false, chunkSize = 30) => {
  try {
    console.log('날짜 범위 생성 중...');
    const dateRange = generateDateRange(testMode);
    console.log(`총 ${dateRange.length}일의 데이터를 처리합니다.`);
    
    // 날짜를 청크로 나누기
    const dateChunks = chunkArray(dateRange, chunkSize);
    console.log(`${dateChunks.length}개의 청크로 나누어 처리합니다.`);
    
    const allResults = [];
    
    // 각 청크를 순차적으로 처리 (서버 부하 방지)
    for (let i = 0; i < dateChunks.length; i++) {
      console.log(`청크 ${i + 1}/${dateChunks.length} 처리 중...`);
      const chunkResults = await processDateChunk(dateChunks[i]);
      allResults.push(...chunkResults);
      
      // 청크 간 잠시 대기 (서버 부하 방지)
      if (i < dateChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 데이터 취합
    const aggregatedData = aggregateData(allResults, dateRange);
    
    // 파일로 저장
    saveToFile(aggregatedData, 'nh_data_aggregated.json');
    
    // 요약 정보 출력
    printSummary(allResults, dateRange);
    
  } catch (error) {
    console.error('메인 함수 실행 중 오류:', error);
  }
}



// 실행 옵션 설정
const options = {
  testMode: false,     // true: 테스트 모드 (최근 3일), false: 전체 데이터
  chunkSize: 30       // 병렬 처리 청크 크기
};

// 메인 함수 실행
main(options.testMode, options.chunkSize);