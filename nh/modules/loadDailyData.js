// 페이징 정보 추출
const extractPagingInfo = (html) => {
  // 페이지 링크에서 최대 페이지 번호 찾기
  const pageLinks = html.match(/onclick='\$action\("move",\s*(\d+)\)/g);
  let maxPage = 1;
  
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
  
  return maxPage;
};

// 테이블 데이터 추출 (판매일자, 품종, 산지, 중량, 등급, 수량, 경락가)
const extractTableData = (html) => {
  const rows = [];
  
  // 테이블 행 추출
  const rowMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g);
  
  if (rowMatches) {
    rowMatches.forEach((row, index) => {
      if (index === 0) return; // 헤더 행 스킵
      
      // 셀 데이터 추출
      const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
      if (cellMatches && cellMatches.length >= 7) {
        const rowData = cellMatches.map(cell => {
          return cell.replace(/<[^>]*>/g, '').trim();
        });
        
        // 필요한 7개 컬럼만 추출 (판매일자, 품종, 산지, 중량, 등급, 수량, 경락가)
        if (rowData.length >= 7) {
          rows.push({
            판매일자: rowData[0],
            품종: rowData[1], 
            산지: rowData[2],
            중량: rowData[3],
            등급: rowData[4],
            수량: rowData[5],
            경락가: rowData[6]
          });
        }
      }
    });
  }
  
  return rows;
};

// 특정 페이지 데이터 로드
const loadPageData = async (pageNum, date = '20250910', iItem = '003005009003', naBzplcCode = '8808990000855') => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Cookie", "NAIE_SSID=SalXc6d7rDgQr0lv1akakZ5hIatev1NaDbr45E0K97e6DgMclQtE8LCysCEaZ1rq.TkFQUC9uaG5hYnNsb3dzMDNfbmFpZTAx");

  var urlencoded = new URLSearchParams();
  urlencoded.append("nowPage", pageNum.toString());
  urlencoded.append("na_bzplc", naBzplcCode);
  urlencoded.append("selDate", date);
  urlencoded.append("dt_from", date);
  urlencoded.append("dt_to", date);
  urlencoded.append("p_item", "003005009");
  urlencoded.append("i_item", iItem);
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

// 모든 페이지의 데이터를 가져오기
const loadDailyData = async (date = '20250910', iItem = '003005009003', naBzplcCode = '8808990000855') => {
  try {
    console.log(`날짜 ${date}, 품목 ${iItem}, 공판장 ${naBzplcCode}의 모든 페이지 데이터 수집 시작...`);
    
    // 첫 번째 페이지 로드
    const firstPageHTML = await loadPageData(1, date, iItem, naBzplcCode);
    const maxPage = extractPagingInfo(firstPageHTML);
    
    console.log(`총 ${maxPage}페이지 발견`);
    
    const allData = [];
    
    // 모든 페이지 데이터 수집
    for (let pageNum = 1; pageNum <= maxPage; pageNum++) {
      console.log(`페이지 ${pageNum}/${maxPage} 처리 중...`);
      
      const pageHTML = await loadPageData(pageNum, date, iItem, naBzplcCode);
      const tableData = extractTableData(pageHTML);
      
      allData.push(...tableData);
      
      // 페이지 간 잠시 대기
      if (pageNum < maxPage) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`총 ${allData.length}개 데이터 수집 완료`);
    
    return allData;
    
  } catch (error) {
    console.error('데이터 수집 중 오류:', error);
    return null;
  }
};

const main = async () => {
  // 기본 테스트
  console.log('=== 기본 테스트 (20250910, 003005009003) ===');
  const data1 = await loadDailyData();
  
  if (data1) {
    console.log(`총 ${data1.length}개 데이터 수집 완료`);
  }
  
  // 다른 날짜 테스트
  console.log('\n=== 다른 날짜 테스트 (20250909, 003005009003) ===');
  const data2 = await loadDailyData('20250909', '003005009003');
  
  if (data2) {
    console.log(`총 ${data2.length}개 데이터 수집 완료`);
  }
  
  // 다른 품목 테스트
  console.log('\n=== 다른 품목 테스트 (20250910, 003005009038) ===');
  const data3 = await loadDailyData('20250910', '003005009038');
  
  if (data3) {
    console.log(`총 ${data3.length}개 데이터 수집 완료`);
  }
};

// main();

module.exports = {
  loadDailyData
};