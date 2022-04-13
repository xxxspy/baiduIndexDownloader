

let loadButton = document.createElement('span');
loadButton.innerText = '下载JSON';
loadButton.style = 'margin-left: 10px;';
loadButton.className = 'keyword-group__ok'
loadButton.addEventListener('click', handleLoadRequest('json'));

let loadCsvButton = document.createElement('span');
loadCsvButton.innerText = '下载CSV';
loadCsvButton.style = 'margin-left: 10px;';
loadCsvButton.className = 'keyword-group__csvok'
loadCsvButton.addEventListener('click', handleLoadCsvRequest('csv'));

document.querySelector('.keyword-group').append(loadButton)
document.querySelector('.keyword-group').append(loadCsvButton)

let downlink = document.createElement('a')
downlink.className = 'downlink'
document.querySelector('.keyword-group').append(downlink)

function handleLoadRequest(down_type) {
    get_encrypt('search', down_type)
}

function getKey(uniqid, callback){
    url = 'https://index.baidu.com/Interface/api/ptbk?uniqid=' + uniqid
    fetch(url).then(r=>r.json()).then(key=>{
        callback(key.data)
    })
}

function decrypt(key, data){
    let a = key
    let i = data
    let n = {}
    let s = []
    const fl = Math.floor;
    const len = d=>d.length;
    for(let o=0;o<fl(len(a)/2);o++){
        n[a[o]] = a[fl(len(a)/2) + o]
    }
    for(let r=0;r<len(data);r++){
        s.push(n[i[r]])
    }
    return s.join('').split(',')
}

function getWordList(){
    let list = []
    $('.keyword-item').each((i, e)=>{
        let words = []
        $(e).find('.keyword-item__input').each((i, ipt)=>{
            words.push({
                name: $(ipt).val(),
                wordType: 1
            })
        })
        list.push(words)
    })
    return list
}

const ALL_KIND = ['all', 'pc', 'wise']

function get_encrypt(type, down_type){
    pre_url_map = {
        'search': 'https://index.baidu.com/api/SearchApi/index?',
        'live': 'https://index.baidu.com/api/LiveApi/getLive?',
        'news': 'https://index.baidu.com/api/NewsApi/getNewsIndex?',
        'feed': 'https://index.baidu.com/api/FeedSearchApi/getFeedIndex?'
    }
    let ds = $('[title="时间段原项（实线）"]')[0].innerText.split(' ~ ')
    start_date = ds[0]
    end_date = ds[1]
    area = 0
    word_list = getWordList()
    if (type == 'live'){
        request_args = {
            'word':  JSON.stringify(word_list),
            'region': area
        }
    }else{
        request_args = {
            'word':  JSON.stringify(word_list),
            'startDate': start_date,
            'endDate': end_date,
            'area': area
        }
    }
    url = pre_url_map[type] + $.param(request_args)
    fetch(url).then(r => r.json()).then(result => {
        getKey(result['data']['uniqid'], key=>{
            if(type=='search'){
                searchData(result, key, start_date, down_type)
            }else{
                feedData(result, key, start_date)
            }
        })
    })
}

function dataFormating(data, start_date){
    let formatdata = []
    let date = new Date(start_date)
    data.forEach((d, i)=>{
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        formatdata.push({
            date: `${year.toString()}-${month.toString()}-${day.toString()}`,
            value: d,
        })
        date.setDate(date.getDate()+1)
    })
    return formatdata
}

function searchData(result, key, start_date, down_type){
    result.data.userIndexes.forEach(idx=>{
        ALL_KIND.forEach(kind=>{
            idx[kind]['formatdata'] = dataFormating(decrypt(key, idx[kind]['data']), start_date)
        })
    })
    if (down_type == 'csv') {
        downloadCsvData(result.data.userIndexes)
    } else {
        downloadData(result.data.userIndexes)
    }
}


function feedData(result, key, start_date){
    result.data.index.forEach(idx=>{
        // console.log({
        //     idx,
        //     data: decrypt(key, idx['data'])
        // })
        idx.formatdata = dataFormating(decrypt(key, idx['data']), start_date)
    })
    downloadData(result.data.index)
}


// async function fethcpost() {
//     var data = 'data:';
//     url = 'http://127.0.0.1:9604/test'
//     for (let i = 0; i < 5; i++) {
//         await promises(url).then(function(e) {
//             data+=e
//         })
//     }
// }

// function promises(url) {
//     return new Promise((resolve, reject)=> {
//         fetch(url).then(r => r.json()).then(result => {
//          resolve(result.data)
//         })
//     })
// }

function downloadData(data){
    $('.downlink').attr('download', 'data.json')
    $('.downlink').attr('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)))
    $('.downlink')[0].click()
}

function downloadCsvData(data){
    // build data
    data = JSON.parse( data );
    let content = 'name,date,value\n';
    for (let item in data) {
      let formatData = data[item]['all']['formatdata'];
      for (let _item in formatData) {
        content += data[item]['word'][0]['name'] + ',' + formatData[_item]['date'] + ',' + formatData[_item]['value'] + '\n'
      }
    }
    $('.downlink').attr('download', 'data.csv')
    $('.downlink').attr('href', "data:text/csv;charset=utf-8," + encodeURIComponent(content))
    $('.downlink')[0].click()
}