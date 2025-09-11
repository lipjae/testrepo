/**
 * 페이징 구조 분석을 위한 테스트 파일
 */

const { loadDailyData } = require('./modules/loadDailyData');
const fs = require('fs');

const analyzePaging = async () => {
  try {
    console.log('페이징 구조 분석 시작...');
    
    // 첫 번째 페이지 요청
    const firstPageHTML = await loadDailyData('20250910');
    
    // HTML을 파일로 저장하여 분석
    fs.writeFileSync('first_page_response.html', firstPageHTML, 'utf8');
    console.log('첫 번째 페이지 응답이 first_page_response.html에 저장되었습니다.');
    
    // 페이징 관련 키워드 검색
    const pagingKeywords = [
      'page', 'paging', 'next', 'prev', 'first', 'last',
      'total', 'count', 'limit', 'offset', 'rowloc',
      'parameterKey', 'xsearch', 'rowloc'
    ];
    
    console.log('\n=== 페이징 관련 키워드 검색 ===');
    pagingKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = firstPageHTML.match(regex);
      if (matches) {
        console.log(`${keyword}: ${matches.length}개 발견`);
      }
    });
    
    // JavaScript 함수 호출 패턴 검색
    console.log('\n=== JavaScript 함수 호출 패턴 검색 ===');
    const jsPatterns = [
      /parent\.\w+\([^)]+\)/g,
      /setIItem\([^)]+\)/g,
      /setPage\([^)]+\)/g,
      /loadPage\([^)]+\)/g,
      /nextPage\([^)]+\)/g,
      /prevPage\([^)]+\)/g
    ];
    
    jsPatterns.forEach((pattern, index) => {
      const matches = firstPageHTML.match(pattern);
      if (matches) {
        console.log(`패턴 ${index + 1}: ${matches.length}개 발견`);
        matches.forEach(match => {
          console.log(`  - ${match}`);
        });
      }
    });
    
    // 폼 데이터 패턴 검색
    console.log('\n=== 폼 데이터 패턴 검색 ===');
    const formPatterns = [
      /<form[^>]*>/gi,
      /<input[^>]*>/gi,
      /name="[^"]*"/gi,
      /value="[^"]*"/gi
    ];
    
    formPatterns.forEach((pattern, index) => {
      const matches = firstPageHTML.match(pattern);
      if (matches) {
        console.log(`폼 패턴 ${index + 1}: ${matches.length}개 발견`);
        if (matches.length <= 10) {
          matches.forEach(match => {
            console.log(`  - ${match}`);
          });
        }
      }
    });
    
    // 테이블 구조 분석
    console.log('\n=== 테이블 구조 분석 ===');
    const tableMatches = firstPageHTML.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
    if (tableMatches) {
      console.log(`테이블 개수: ${tableMatches.length}`);
      tableMatches.forEach((table, index) => {
        const rowMatches = table.match(/<tr[^>]*>/gi);
        console.log(`테이블 ${index + 1}: ${rowMatches ? rowMatches.length : 0}행`);
      });
    }
    
  } catch (error) {
    console.error('분석 중 오류:', error);
  }
};

analyzePaging();
