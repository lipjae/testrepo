const fs = require('fs');
const path = require('path');

async function extractOriginList() {
  try {
    const productDataDir = './json/onion/productData';
    const originSet = new Set(); // 중복 제거를 위한 Set 사용
    
    console.log('productData 폴더의 JSON 파일들을 스캔 중...');
    
    // productData 폴더의 모든 JSON 파일 읽기
    const files = fs.readdirSync(productDataDir).filter(file => file.endsWith('.json'));
    console.log(`총 ${files.length}개의 파일을 처리합니다.`);
    
    for (const file of files) {
      try {
        const filePath = path.join(productDataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // 각 파일의 data 배열에서 산지 추출
        if (jsonData.data && Array.isArray(jsonData.data)) {
          for (const dayData of jsonData.data) {
            if (dayData.items && Array.isArray(dayData.items)) {
              for (const item of dayData.items) {
                if (item.data && Array.isArray(item.data)) {
                  for (const record of item.data) {
                    if (record.산지 && record.산지.trim()) {
                      originSet.add(record.산지.trim());
                    }
                  }
                }
              }
            }
          }
        }
        
        console.log(`파일 ${file} 처리 완료`);
      } catch (error) {
        console.error(`파일 ${file} 처리 중 오류:`, error.message);
      }
    }
    
    // Set을 배열로 변환하고 정렬
    const originList = Array.from(originSet).sort();
    
    console.log(`총 ${originList.length}개의 고유한 산지를 발견했습니다.`);
    
    // originList.json 파일로 저장
    const outputPath = './json/onion/originList.json';
    const outputDir = path.dirname(outputPath);
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // JSON 형태로 저장
    fs.writeFileSync(outputPath, JSON.stringify(originList, null, 2), 'utf8');
    
    console.log(`산지 리스트가 ${outputPath}에 저장되었습니다.`);
    console.log('발견된 산지 목록:');
    originList.forEach((origin, index) => {
      console.log(`${index + 1}. ${origin}`);
    });
    
  } catch (error) {
    console.error('산지 추출 중 오류 발생:', error);
  }
}

// 스크립트 실행
extractOriginList();
