/**
 * 농협 공판장 스크래핑 관련 함수들
 */

const { extractSetIItemData } = require('./htmlProcessor');

/**
 * 농협 공판장 HTML 로드
 * @param {string} date - 날짜 (YYYYMMDD 형식)
 * @returns {Promise<string>} HTML 응답
 */
const loadHTML = async (date = '20250911', naBzplcCode, productItem) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Cookie", "NAIE_SSID=SalXc6d7rDgQr0lv1akakZ5hIatev1NaDbr45E0K97e6DgMclQtE8LCysCEaZ1rq.TkFQUC9uaG5hYnNsb3dzMDNfbmFpZTAx");

  var urlencoded = new URLSearchParams();
  urlencoded.append("selDate", date);
  urlencoded.append("mode", "3");
  urlencoded.append("excel_flag", "");
  urlencoded.append("na_bzplcNum", "");
  urlencoded.append("na_bzplcNm", "");
  urlencoded.append("itemNm", "");
  urlencoded.append("itemNum", "");
  urlencoded.append("sellingDate", "");
  urlencoded.append("fromDate", "");
  urlencoded.append("toDate", "");
  urlencoded.append("varItemNum", "");
  urlencoded.append("varItemNm", "");
  urlencoded.append("na_bzplc", naBzplcCode);
  urlencoded.append("p_item", productItem);
  urlencoded.append("xlsfnm", "");
  urlencoded.append("serviceName", "");
  urlencoded.append("bsn_dsc", "");
  urlencoded.append("parameter", "");
  urlencoded.append("xlssty", "");
  urlencoded.append("xlstitle", "");
  urlencoded.append("xsearch", "");
  urlencoded.append("rowloc", "");
  urlencoded.append("parameterKey", "");

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  const responseHTML = await fetch("https://newgp.nonghyup.com/naieJsp/uisp/ienb/IENB9010C.jsp", requestOptions)
    .then(res => res.text());
  
  return responseHTML;
};

/**
 * 병렬로 HTML 로드하고 JSON 추출
 * @param {string[]} dateChunk - 날짜 배열
 * @param {string} naBzplcCode - 공판장 코드
 * @param {string} productItem - 상품 코드
 * @returns {Promise<Array>} 처리 결과 배열
 */
const processDateChunk = async (dateChunk, naBzplcCode, productItem) => {
  const promises = dateChunk.map(async (date) => {
    try {
      const html = await loadHTML(date, naBzplcCode, productItem);
      const jsonData = extractSetIItemData(html);
      return { date, data: jsonData };
    } catch (error) {
      console.error(`날짜 ${date} 처리 중 오류:`, error);
      return { date, data: null, error: error.message };
    }
  });
  
  return Promise.all(promises);
};

module.exports = {
  loadHTML,
  processDateChunk
};
