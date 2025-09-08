
const fs = require('fs')
const _ = require('lodash')
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const main = async () => {
  
  const productionQty = await parseCsv('./data/csv/production_qty.csv')

  const productionQtyParsed = await paresProductionQty(productionQty)

  writeJsonToCsv(productionQtyParsed, './data/csv/production_qty_parsed.csv')
  wirteJson(productionQtyParsed, './data/json/production_qty_parsed.json')

  const productionHarvest = await parseCsv('./data/csv/harvest.csv')
  const productionHarvestParsed = await paresProductionQty(productionHarvest, 'harvest')

  writeJsonToCsv(productionHarvestParsed, './data/csv/harvest_parsed.csv')
  wirteJson(productionHarvestParsed, './data/json/harvest_parsed.json')
}

const parseCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const result = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        result.push(data)
      })
      .on('end', () => {
        resolve(result)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

const paresProductionQty = async ( jsonData, dataType = 'qty' ) => {
  const agFaoMapFile = await fs.readFileSync('./ag-fao.json', 'utf8') // 매핑 데이터
  const agFaoCodeMapData = JSON.parse(agFaoMapFile)
  // [
  //   'Domain Code',      'Domain',
  //   'Area Code (ISO2)', 'Area',
  //   'Element Code',     'Element',
  //   'Item Code (FAO)',  'Item',
  //   'Year Code',        'Year',
  //   'Unit',             'Value',
  //   'Flag',             'Flag Description',
  //   'Note'
  // ]

  console.log('변환 시작', 'Raw Data Length:', jsonData.length)

  const parsedData = jsonData.map(data => {
    const faoCode = data['Item Code (FAO)']
    let parseCode = faoCode.length == 2 ? `00${faoCode}` : faoCode
    parseCode = faoCode.length == 3 ? `0${faoCode}` : parseCode

    let groups = []
    const mappingData = agFaoCodeMapData.filter(data => data.faoCode == parseCode).map(data => {
      data.groupCode = `${data.agCode}`.substring(0, 1)

      if(!groups.includes(data.groupCode)) groups.push(data.groupCode)
      return data
    })


    return groups.map(group => {
      return {
        NATION_CODE: data['Area Code (ISO2)'],
        GROUP_CODE: group,
        FAO_K_NAME: mappingData?.[0].faoKName,
        FAO_E_NAME: data['Element'],
        FAO_CODE: parseCode,
        YEAR_VALUE: data['Year'],
        VAL: Number(data['Value']),
        UNIT: data['Unit'],
        DATA_TYPE: dataType
      }
    })    
  })

  const result = _.flattenDeep(parsedData)

  console.log('변환 완료', 'Parsed Data Length:', result.length)

  return result
}

const writeJsonToCsv = (jsonData, path) => {
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(jsonData);

  // CSV 파일로 저장
  fs.writeFileSync(path, csv);
}

const wirteJson = (jsonData, path) => {
  fs.writeFileSync(path, JSON.stringify(jsonData, null, 2), 'utf8')
}

main()