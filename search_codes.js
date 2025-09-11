const fs = require('fs');

// 검색할 코드 목록
const searchCodes = [
    "1211201110", "1211201120", "1211201190", "1211201211", "1211201219",
    "1211201291", "1211201299", "1211201311", "1211201319", "1211201391",
    "1211201399", "1211202210", "1211202220", "1211202290", "1211203100",
    "1211203200", "1211209300", "1211209900", "1302191210", "1302191220",
    "1302191290", "2106903021", "2106903029", "3301904520"
];

// JSON 파일 읽기
const data = JSON.parse(fs.readFileSync('/Users/white/Documents/test/kati/kati.json', 'utf8'));

// 결과 배열
const results = [];

// 각 코드에 대해 검색
searchCodes.forEach(code => {
    const found = data.find(item => item.hscd === code);
    if (found) {
        results.push({
            code: code,
            name: found.name,
            agcd: found.agcd,
            use_yn: found.use_yn,
            first_regdtime: found.first_regdtime,
            hscd: found.hscd,
            usetodt: found.usetodt,
            high_agcd: found.high_agcd,
            grp_cd: found.grp_cd,
            mid_cd: found.mid_cd,
            min_cd: found.min_cd
        });
    } else {
        results.push({
            code: code,
            name: "NOT_FOUND",
            error: "Code not found in database"
        });
    }
});

// 결과를 JSON 파일로 저장
fs.writeFileSync('/Users/white/Documents/test/found_codes.json', JSON.stringify(results, null, 2), 'utf8');

console.log('검색 완료! found_codes.json 파일에 저장되었습니다.');
console.log(`총 ${results.length}개 코드 중 ${results.filter(r => r.name !== "NOT_FOUND").length}개를 찾았습니다.`);

// 결과 출력
results.forEach(result => {
    if (result.name !== "NOT_FOUND") {
        console.log(`${result.code}: ${result.name}`);
    } else {
        console.log(`${result.code}: NOT_FOUND`);
    }
});

