/**
 * HTML 처리 및 JSON 데이터 추출 관련 함수들
 */

/**
 * setIItem 함수에서 JSON 데이터 추출
 * @param {string} html - HTML 문자열
 * @returns {Array|null} 추출된 JSON 데이터 또는 null
 */
const extractSetIItemData = (html) => {
  // setIItem 함수 호출 부분을 찾는 정규식
  const regex = /parent\.setIItem\("([^"]+)"\)/;
  const match = html.match(regex);
  
  if (match && match[1]) {
    try {
      // JSON 문자열을 파싱
      const jsonString = match[1].replace(/'/g, '"'); // 작은따옴표를 큰따옴표로 변경
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return null;
    }
  }
  
  return null;
};

module.exports = {
  extractSetIItemData
};
