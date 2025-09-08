# 일본 세관 관세율 페이지 스크래퍼

이 프로젝트는 일본 세관의 관세율 페이지에서 9자리 Statistical code와 Description을 추출하는 Node.js 기반 스크래퍼입니다.

## 기능

- **수입용 스크래퍼**: 일본 세관 수입 관세율 데이터 추출
- **수출용 스크래퍼**: 일본 세관 수출 관세율 데이터 추출
- **계층적 데이터**: 4자리, 6자리, 9자리 코드와 Description 제공
- **전체 챕터**: 46개 챕터의 모든 데이터 수집
- **다중 형식**: JSON과 CSV 형식으로 결과 저장

## 설치 방법

1. Node.js가 설치되어 있는지 확인하세요 (버전 14 이상 권장)

2. 의존성 설치:
```bash
npm install
```

## 사용 방법

### 수입용 데이터 수집
```bash
node customs_import_scraper.js
```

### 수출용 데이터 수집
```bash
node customs_export_scraper.js
```

## 출력 파일

### 수입용 데이터
- `customs_import_all_chapters.json`: 수입용 JSON 데이터
- `customs_import_all_chapters.csv`: 수입용 CSV 데이터

### 수출용 데이터
- `customs_export_all_chapters.json`: 수출용 JSON 데이터
- `customs_export_all_chapters.csv`: 수출용 CSV 데이터

## 데이터 구조

각 항목은 다음 정보를 포함합니다:

- `chapter_code`: 챕터 코드 (01, 02, 04, ...)
- `hs_code`: H.S.code (예: 01.01, 0101.21)
- `hs_4digit_code`: 4자리 코드 (예: 0101)
- `hs_4digit_description`: 4자리 코드 Description
- `hs_6digit_code`: 6자리 코드 (예: 010121)
- `hs_6digit_description`: 6자리 코드 Description
- `statistical_code`: 3자리 통계 코드 (예: 000)
- `full_9digit_code`: 9자리 전체 코드 (예: 010121000)
- `description`: 품명 Description
- `unit`: 단위 (수출용만)
- `law`: 법령 (수출용만)

## URL 구조

### 수입용
- URL: `https://www.customs.go.jp/english/tariff/2025_04_01/data/e_XX.htm`
- 언어: 영어
- 데이터량: 약 4,675개

### 수출용
- URL: `https://www.customs.go.jp/yusyutu/2025_01_01/data/j_XX.htm`
- 언어: 일본어
- 데이터량: 약 2,570개

## 주의사항

- 웹사이트의 구조가 변경될 경우 코드 수정이 필요할 수 있습니다
- 과도한 요청을 피하기 위해 적절한 딜레이를 두고 사용하세요
- 해당 웹사이트의 이용약관을 준수하세요

## 문제 해결

만약 데이터가 제대로 추출되지 않는다면:

1. 네트워크 연결을 확인하세요
2. 페이지 구조가 변경되었을 수 있으니 코드를 수정해야 할 수 있습니다
3. 일본어 인코딩 문제가 있을 수 있습니다




일본 수출입 코드: https://www.customs.go.jp/toukei/sankou/code/code_e.htm
일본 수출입 데이터: https://www.e-stat.go.jp/en/stat-search/files?page=1&layout=datalist&toukei=00350300&tstat=000001013141&cycle=1&tclass1=000001013180&tclass2=000001013181&cycle_facet=cycle&tclass3val=0&metadata=1&data=1
