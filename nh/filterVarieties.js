const fs = require('fs');
const path = require('path');

const year = '2024'
const productName = 'garlic'

// 에러 로그 저장 함수
const saveErrorLog = (error, context) => {
  try {
    const errorDir = path.join(__dirname, 'error');
    
    // error 디렉토리가 없으면 생성
    if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: context
    };
    
    const filename = `error_${timestamp}.json`;
    const filePath = path.join(errorDir, filename);
    
    fs.writeFileSync(filePath, JSON.stringify(errorLog, null, 2), 'utf8');
    console.error(`에러 로그가 저장되었습니다: ${filePath}`);
    
  } catch (logError) {
    console.error('에러 로그 저장 중 오류 발생:', logError);
  }
};

// JSON 파일 읽기
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`JSON 파일 읽기 오류 (${filePath}):`, error);
    saveErrorLog(error, {
      function: 'readJsonFile',
      filePath: filePath
    });
    return null;
  }
};

// 모든 품목 데이터 수집
const collectAllVarieties = () => {
  const productListDir = path.join(__dirname, 'json', year, productName, 'productList');
  const varietiesSet = new Set();
  
  try {
    // 디렉토리 내의 모든 JSON 파일 읽기
    const files = fs.readdirSync(productListDir).filter(file => file.endsWith('.json'));
    
    console.log(`총 ${files.length}개의 JSON 파일을 처리합니다.`);
    
    files.forEach((filename, index) => {
      console.log(`처리 중: ${filename} (${index + 1}/${files.length})`);
      
      const filePath = path.join(productListDir, filename);
      const jsonData = readJsonFile(filePath);
      
      if (jsonData && jsonData.data) {
        // 각 날짜의 데이터에서 품목 추출
        jsonData.data.forEach(dayData => {
          if (dayData.data && Array.isArray(dayData.data)) {
            dayData.data.forEach(item => {
              // "선택하세요" 항목 제외하고 실제 품목만 추가
              if (item.value && item.value !== '' && item.text && item.text !== '선택하세요') {
                const varietyKey = `${item.value}|${item.text}`;
                varietiesSet.add(varietyKey);
              }
            });
          }
        });
      }
    });
    
    // Set을 배열로 변환하고 정렬
    const varieties = Array.from(varietiesSet).map(varietyKey => {
      const [value, text] = varietyKey.split('|');
      return { value, text };
    });
    
    // value 기준으로 정렬
    varieties.sort((a, b) => a.value.localeCompare(b.value));
    
    console.log(`총 ${varieties.length}개의 고유 품목을 발견했습니다.`);
    
    return varieties;
    
  } catch (error) {
    console.error('품목 데이터 수집 중 오류:', error);
    saveErrorLog(error, {
      function: 'collectAllVarieties',
      productListDir: productListDir
    });
    return [];
  }
};

// 결과 저장
const saveProductList = (varieties) => {
  try {
    const outputPath = path.join(__dirname, 'json', year, productName, `productList_${productName}.json`);
    
    fs.writeFileSync(outputPath, JSON.stringify(varieties, null, 2), 'utf8');
    
    console.log(`\n=== 결과 저장 완료 ===`);
    console.log(`파일 위치: ${outputPath}`);
    console.log(`총 품목 수: ${varieties.length}`);
    console.log(`품목 목록:`);
    varieties.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} (${item.value})`);
    });
    
  } catch (error) {
    console.error('결과 저장 중 오류:', error);
    saveErrorLog(error, {
      function: 'saveProductList',
      varietiesCount: varieties.length
    });
  }
};

// 메인 실행 함수
const main = async () => {
  try {
    console.log('=== 품목 그룹화 시작 ===');
    
    const varieties = collectAllVarieties();
    
    if (varieties.length > 0) {
      saveProductList(varieties);
    } else {
      console.log('수집된 품목이 없습니다.');
    }
    
    console.log('\n=== 품목 그룹화 완료 ===');
    
  } catch (error) {
    console.error('메인 함수 실행 중 오류:', error);
    saveErrorLog(error, {
      function: 'main'
    });
  }
};

main();
