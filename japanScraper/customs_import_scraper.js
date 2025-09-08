const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const CHAPTER_CODES = [
    '01','02','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','29','33','35','38','40','41','44','45','46','47','48','50','51','52','53','56','57','60','61','68','94','96'
]

class CustomsImportScraper {
    constructor() {
        this.baseUrl = 'https://www.customs.go.jp/english/tariff/2025_04_01/data/e_';
        this.chapterCodes = CHAPTER_CODES;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    async fetchPage(chapterCode) {
        const targetUrl = `${this.baseUrl}${chapterCode}.htm`;
        try {
            console.log(`페이지 요청 중: ${targetUrl}`);
            const response = await axios.get(targetUrl, {
                headers: this.headers,
                timeout: 30000,
                maxRedirects: 5
            });
            
            console.log(`페이지 로드 완료. 상태 코드: ${response.status}`);
            return response.data;
        } catch (error) {
            console.error(`페이지 가져오기 실패 (Chapter ${chapterCode}):`, error.message);
            if (error.response) {
                console.error('응답 상태:', error.response.status);
            }
            return null;
        }
    }

    extractStatisticalCodes(htmlContent, chapterCode) {
        const $ = cheerio.load(htmlContent);
        const data = [];

        console.log('HTML 파싱 시작...');

        // 데이터 테이블 찾기 (id="datatable")
        const dataTable = $('#datatable');
        
        if (dataTable.length === 0) {
            console.log('데이터 테이블을 찾을 수 없습니다.');
            return data;
        }

        console.log('데이터 테이블을 찾았습니다.');

        // 테이블의 모든 행 찾기 (헤더 제외)
        const rows = dataTable.find('tbody tr');
        console.log(`데이터 테이블에서 ${rows.length}개의 행을 찾았습니다.`);

        let currentHSCode = ''; // 현재 H.S.code를 추적
        let current6DigitCode = ''; // 현재 6자리 코드를 추적
        let current6DigitDescription = ''; // 현재 6자리 코드의 Description을 추적
        let current4DigitCode = ''; // 현재 4자리 코드를 추적
        let current4DigitDescription = ''; // 현재 4자리 코드의 Description을 추적

        rows.each((rowIndex, row) => {
            const cells = $(row).find('td');
            
            if (cells.length >= 3) {
                // 첫 번째 열: H.S.code (CSTNO)
                const hsCode = $(cells[0]).text().trim();
                // 두 번째 열: Statistical code (HSCODE)
                const statCode = $(cells[1]).text().trim();
                // 세 번째 열: Description
                const description = $(cells[2]).text().trim();
                
                // H.S.code가 있으면 현재 H.S.code 업데이트
                if (hsCode && hsCode !== '') {
                    currentHSCode = hsCode;
                    // 6자리 코드 추출 (점 제거 후 앞의 6자리)
                    const cleanHSCode = hsCode.replace(/\./g, '');
                    current6DigitCode = cleanHSCode.substring(0, 6);
                    // 4자리 코드 추출 (점 제거 후 앞의 4자리)
                    current4DigitCode = cleanHSCode.substring(0, 4);
                    
                    // 6자리 코드의 Description 저장 (들여쓰기가 없는 메인 설명)
                    if (description && !description.startsWith('-')) {
                        current6DigitDescription = description;
                        // 4자리 코드의 Description도 업데이트 (6자리와 동일한 경우)
                        current4DigitDescription = description;
                    }
                }
                
                // Statistical code가 있고 Description이 있는 경우
                if (statCode && description && statCode !== '') {
                    // 9자리 코드 생성: H.S.code + Statistical code
                    // H.S.code에서 점(.) 제거하고 Statistical code와 결합
                    const cleanHSCode = currentHSCode.replace(/\./g, '');
                    const fullCode = cleanHSCode + statCode.padStart(3, '0');
                    
                    data.push({
                        chapter_code: chapterCode,
                        hs_code: currentHSCode,
                        hs_4digit_code: current4DigitCode,
                        hs_4digit_description: current4DigitDescription,
                        hs_6digit_code: current6DigitCode,
                        hs_6digit_description: current6DigitDescription,
                        statistical_code: statCode,
                        full_9digit_code: fullCode,
                        description: description,
                        row_index: rowIndex + 1
                    });
                }
            }
        });

        return data;
    }

    saveToJson(data, filename) {
        const filePath = path.join(__dirname, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`데이터가 ${filename}에 저장되었습니다.`);
    }

    saveToCsv(data, filename) {
        const filePath = path.join(__dirname, filename);
        
        // CSV 헤더
        let csvContent = 'Chapter Code,H.S.Code,HS 4-digit Code,HS 4-digit Description,HS 6-digit Code,HS 6-digit Description,Statistical Code,Full 9-digit Code,Description,Row Index\n';
        
        // 데이터 행들
        data.forEach(item => {
            const escapedDescription = `"${item.description.replace(/"/g, '""')}"`;
            const escaped4DigitDescription = `"${item.hs_4digit_description.replace(/"/g, '""')}"`;
            const escaped6DigitDescription = `"${item.hs_6digit_description.replace(/"/g, '""')}"`;
            csvContent += `${item.chapter_code},${item.hs_code},${item.hs_4digit_code},${escaped4DigitDescription},${item.hs_6digit_code},${escaped6DigitDescription},${item.statistical_code},${item.full_9digit_code},${escapedDescription},${item.row_index}\n`;
        });
        
        fs.writeFileSync(filePath, csvContent, 'utf8');
        console.log(`데이터가 ${filename}에 저장되었습니다.`);
    }

    async run() {
        try {
            console.log('일본 세관 관세율 페이지 스크래핑 시작...');
            console.log(`총 ${this.chapterCodes.length}개의 챕터를 처리합니다.`);
            
            let allData = [];
            let successCount = 0;
            let failCount = 0;
            
            for (let i = 0; i < this.chapterCodes.length; i++) {
                const chapterCode = this.chapterCodes[i];
                console.log(`\n[${i + 1}/${this.chapterCodes.length}] Chapter ${chapterCode} 처리 중...`);
                
                // 페이지 가져오기
                const htmlContent = await this.fetchPage(chapterCode);
                if (!htmlContent) {
                    console.log(`Chapter ${chapterCode} 페이지를 가져올 수 없습니다.`);
                    failCount++;
                    continue;
                }

                // 데이터 추출
                const chapterData = this.extractStatisticalCodes(htmlContent, chapterCode);
                
                if (chapterData.length === 0) {
                    console.log(`Chapter ${chapterCode}에서 데이터를 찾을 수 없습니다.`);
                    failCount++;
                    continue;
                }
                
                console.log(`Chapter ${chapterCode}에서 ${chapterData.length}개의 항목을 찾았습니다.`);
                allData = allData.concat(chapterData);
                successCount++;
                
                // 요청 간 딜레이 (서버 부하 방지)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log(`\n=== 스크래핑 완료 ===`);
            console.log(`성공한 챕터: ${successCount}개`);
            console.log(`실패한 챕터: ${failCount}개`);
            console.log(`총 ${allData.length}개의 Statistical code를 찾았습니다.`);
            
            if (allData.length === 0) {
                console.log('데이터를 찾을 수 없습니다.');
                return;
            }
            
            // 결과 저장
            this.saveToJson(allData, 'customs_import_all_chapters.json');
            this.saveToCsv(allData, 'customs_import_all_chapters.csv');
            
            // 처음 10개 결과 출력
            console.log('\n처음 10개 결과:');
            allData.slice(0, 10).forEach((item, index) => {
                console.log(`${index + 1}. [Chapter ${item.chapter_code}] ${item.full_9digit_code} (4자리: ${item.hs_4digit_code} - ${item.hs_4digit_description}, 6자리: ${item.hs_6digit_code} - ${item.hs_6digit_description}) - ${item.description.substring(0, 50)}...`);
            });
            
        } catch (error) {
            console.error('실행 중 오류 발생:', error);
        }
    }
}

// 스크래퍼 실행
async function main() {
    const scraper = new CustomsImportScraper();
    await scraper.run();
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
    main().catch(console.error);
}

module.exports = CustomsImportScraper;
