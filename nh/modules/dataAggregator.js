/**
 * 데이터 취합 및 파일 저장 관련 함수들
 */

const fs = require('fs');
const path = require('path');

/**
 * 데이터를 파일로 저장
 * @param {Object} data - 저장할 데이터
 * @param {string} naBzplcCode - 공판장 코드
 */
const saveToFile = (data, naBzplcCode) => {
  const filename = `nh_data_${naBzplcCode}.json`;
  const filePath = path.join(__dirname, '..', 'json', 'garlic', 'productList', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`데이터가 ${filePath}에 저장되었습니다.`);
};

/**
 * 처리 결과를 취합하여 최종 데이터 구조 생성
 * @param {Array} allResults - 모든 처리 결과
 * @param {string[]} dateRange - 날짜 범위
 * @returns {Object} 취합된 데이터
 */
const aggregateData = (allResults, dateRange) => {
  // 결과 정리
  const processedData = allResults.filter(result => result.data !== null);
  const failedData = allResults.filter(result => result.data === null);
  
  console.log(`성공: ${processedData.length}일, 실패: ${failedData.length}일`);
  
  // JSON 데이터 취합
  const aggregatedData = {
    metadata: {
      totalDays: dateRange.length,
      successDays: processedData.length,
      failedDays: failedData.length,
      dateRange: {
        start: dateRange[0],
        end: dateRange[dateRange.length - 1]
      },
      generatedAt: new Date().toISOString()
    },
    data: processedData,
    errors: failedData
  };
  
  return aggregatedData;
};

/**
 * 처리 결과 요약 출력
 * @param {Array} allResults - 모든 처리 결과
 * @param {string[]} dateRange - 날짜 범위
 */
const printSummary = (allResults, dateRange) => {
  const processedData = allResults.filter(result => result.data !== null);
  const failedData = allResults.filter(result => result.data === null);
  
  console.log('\n=== 처리 결과 요약 ===');
  console.log(`총 처리 일수: ${dateRange.length}일`);
  console.log(`성공: ${processedData.length}일`);
  console.log(`실패: ${failedData.length}일`);
  
  if (failedData.length > 0) {
    console.log('\n실패한 날짜들:');
    failedData.forEach(failed => {
      console.log(`- ${failed.date}: ${failed.error || '데이터 없음'}`);
    });
  }
};

module.exports = {
  saveToFile,
  aggregateData,
  printSummary
};
