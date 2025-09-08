const _ = require('lodash')
const fs = require('fs')


// 비동기로
const readJSON = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}


const main = async () => {
  const kati =  await readJSON('kati.json');
  const fta = await readJSON('fta.json');
  const ag = await readJSON('ag.json');

  console.log('fta', fta.length)
  console.log('kati', kati.length)

  let final = fta.map(item => {

    if(item.AG_NM == '' || item.AG_NM == null || item.AG_NM == undefined) {
      const hscd = `${item.HS_CD}`.length == 9 ? `0${item.HS_CD}` : `${item.HS_CD}`
      
      const katiItem = _.find(kati, { hscd })
      item['AG_NM'] = katiItem?.name || ''

      item['AG1_CD'] = katiItem?.grp_cd || ''
      item['AG1_NM'] = _.find(ag, {agcd: item['AG1_CD']})?.name || ''

      item['AG3_CD'] = katiItem?.mid_cd || ''
      item['AG3_NM'] = _.find(ag, {agcd: item['AG3_CD']})?.name || ''

      item['AG5_CD'] = katiItem?.min_cd || ''
      item['AG5_NM'] = _.find(ag, {agcd: item['AG5_CD']})?.name || ''

      
      if(katiItem.usetodt != null) {
        const foodType = katiItem.usetodt == 'NF' ? '비식품' : '식품'
        item['FOOD_TP'] = foodType
      }
      
      
      return item
    } else {
      return item
    }
    
  })
  
  // final = final.map(item => {
    
  //   if(item.FOOD_TP == '') {
  //     const hscd = `${item.HS_CD}`.length == 9 ? `0${item.HS_CD}` : `${item.HS_CD}`
      
  //     const katiItem = _.find(kati, { hscd })
      
  //     item['FOOD_TP'] = katiItem?.usetodt == 'NF' ? '비식품': '식품'

  //     return item
  //   } else {
  //     return item
  //   }  

  // })

  // console.log('최종', final.length)
  fs.writeFileSync('final.json', JSON.stringify(final, null, 2));

}





main()