/**
 * 페이징된 데이터를 모두 가져오는 스크래퍼
 */

const { extractSetIItemData } = require('./htmlProcessor');

/**
 * 페이징 정보 추출
 * @param {string} html - HTML 응답
 * @returns {Object} 페이징 정보
 */
const extractPagingInfo = (html) => {
  // 현재 페이지 번호 추출
  const nowPageMatch = html.match(/name="nowPage"\s+value="(\d+)"/);
  const currentPage = nowPageMatch ? parseInt(nowPageMatch[1]) : 1;
  
  // 총 페이지 수 추출 (페이지 번호 링크에서 최대값 찾기)
  const pageLinks = html.match(/onclick='\$action\("move",\s*(\d+)\)/g);
  let maxPage = currentPage;
  
  if (pageLinks) {
    pageLinks.forEach(link => {
      const pageMatch = link.match(/onclick='\$action\("move",\s*(\d+)\)/);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1]);
        if (pageNum > maxPage) {
          maxPage = pageNum;
        }
      }
    });
  }
  
  return {
    currentPage,
    maxPage,
    hasNextPage: currentPage < maxPage
  };
};

/**
 * 특정 페이지의 데이터 로드
 * @param {string} date - 날짜
 * @param {number} pageNum - 페이지 번호
 * @returns {Promise<string>} HTML 응답
 */
const loadPageData = async (date = '20250910', pageNum = 1) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Cookie", "NAIE_SSID=SalXc6d7rDgQr0lv1akakZ5hIatev1NaDbr45E0K97e6DgMclQtE8LCysCEaZ1rq.TkFQUC9uaG5hYnNsb3dzMDNfbmFpZTAx");

  var urlencoded = new URLSearchParams();
  urlencoded.append("selDate", date);
  urlencoded.append("mode", "3");
  urlencoded.append("excel_flag", "0");
  urlencoded.append("na_bzplcNum", "8808990000855");
  urlencoded.append("na_bzplcNm", "가락공판장");
  urlencoded.append("itemNm", "마늘");
  urlencoded.append("itemNum", "003005009");
  urlencoded.append("sellingDate", date);
  urlencoded.append("fromDate", "");
  urlencoded.append("toDate", "");
  urlencoded.append("varItemNum", "003005009003");
  urlencoded.append("varItemNm", "햇마늘한지");
  urlencoded.append("na_bzplc", "8808990000855");
  urlencoded.append("p_item", "003005009");
  urlencoded.append("i_item", "003005009003");
  urlencoded.append("xlsfnm", "");
  urlencoded.append("serviceName", "");
  urlencoded.append("bsn_dsc", "");
  urlencoded.append("parameter", "");
  urlencoded.append("xlssty", "");
  urlencoded.append("xlstitle", "");
  urlencoded.append("xsearch", "");
  urlencoded.append("rowloc", "");
  urlencoded.append("parameterKey", "");
  urlencoded.append("nowPage", pageNum.toString());
  urlencoded.append("pageNum", pageNum.toString());

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow'
  };

  const responseHTML = await fetch("https://newgp.nonghyup.com/naieJsp/uisp/ienb/IENB9010L.jsp", requestOptions)
    .then(response => response.text());
  
  return responseHTML;
};

/**
 * 테이블 데이터 추출
 * @param {string} html - HTML 응답
 * @returns {Array} 테이블 행 데이터
 */
const extractTableData = (html) => {
  const rows = [];
  
  // 테이블 행 추출 (두 번째 테이블의 데이터 행들)
  const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/g);
  if (tableMatch && tableMatch.length >= 2) {
    const dataTable = tableMatch[1]; // 두 번째 테이블이 데이터 테이블
    
    // 행 추출
    const rowMatches = dataTable.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
    if (rowMatches) {
      rowMatches.forEach((row, index) => {
        if (index === 0) return; // 헤더 행 스킵
        
        // 셀 데이터 추출
        const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
        if (cellMatches) {
          const rowData = cellMatches.map(cell => {
            // HTML 태그 제거하고 텍스트만 추출
            return cell.replace(/<[^>]*>/g, '').trim();
          });
          rows.push(rowData);
        }
      });
    }
  }
  
  return rows;
};

/**
 * 모든 페이지의 데이터를 가져오기
 * @param {string} date - 날짜
 * @returns {Promise<Object>} 모든 페이지의 데이터
 */
const loadAllPagesData = async (date = '20250910') => {
  try {
    console.log(`날짜 ${date}의 모든 페이지 데이터 수집 시작...`);
    
    // 첫 번째 페이지 로드
    const firstPageHTML = await loadPageData(date, 1);
    const pagingInfo = extractPagingInfo(firstPageHTML);
    
    console.log(`총 ${pagingInfo.maxPage}페이지 발견`);
    
    const allData = {
      date,
      totalPages: pagingInfo.maxPage,
      pages: []
    };
    
    // 모든 페이지 데이터 수집
    for (let pageNum = 1; pageNum <= pagingInfo.maxPage; pageNum++) {
      console.log(`페이지 ${pageNum}/${pagingInfo.maxPage} 처리 중...`);
      
      const pageHTML = await loadPageData(date, pageNum);
      const tableData = extractTableData(pageHTML);
      
      allData.pages.push({
        pageNum,
        data: tableData,
        rowCount: tableData.length
      });
      
      // 페이지 간 잠시 대기 (서버 부하 방지)
      if (pageNum < pagingInfo.maxPage) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 전체 행 수 계산
    const totalRows = allData.pages.reduce((sum, page) => sum + page.rowCount, 0);
    allData.totalRows = totalRows;
    
    console.log(`총 ${totalRows}행의 데이터 수집 완료`);
    
    return allData;
    
  } catch (error) {
    console.error(`날짜 ${date} 데이터 수집 중 오류:`, error);
    return null;
  }
};

module.exports = {
  extractPagingInfo,
  loadPageData,
  extractTableData,
  loadAllPagesData
};
