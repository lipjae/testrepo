/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 날짜 범위 생성 함수
 * @param {boolean} testMode - 테스트 모드 여부
 * @returns {string[]} 날짜 배열 (YYYYMMDD 형식)
 */
const generateDateRange = (testMode = false) => {
  if (testMode) {
    // 테스트용: 최근 3일만
    const dates = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}${month}${day}`);
    }
    return dates;
  }
  
  const startDate = new Date(new Date().getFullYear(), 0, 1); // 올해 1월 1일
  const endDate = new Date(); // 오늘
  const dates = [];
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}${month}${day}`);
  }
  
  return dates;
};

/**
 * 배열을 청크로 나누는 함수
 * @param {Array} array - 나눌 배열
 * @param {number} chunkSize - 청크 크기
 * @returns {Array[]} 청크 배열
 */
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

module.exports = {
  generateDateRange,
  chunkArray
};
