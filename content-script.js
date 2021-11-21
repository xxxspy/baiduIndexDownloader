

let loadButton = document.createElement('span');
loadButton.innerText = '下载';
loadButton.className = 'keyword-group__ok'
loadButton.addEventListener('click', handleLoadRequest);

document.querySelector('.keyword-group').append(loadButton)

let downlink = document.createElement('a')
downlink.className = 'downlink'
document.querySelector('.keyword-group').append(downlink)

function handleLoadRequest() {
    get_encrypt_json('search')
}

function getKey(uniqid, callback){
    url = 'https://index.baidu.com/Interface/api/ptbk?uniqid=' + uniqid
    fetch(url).then(r=>r.json()).then(key=>{
        console.log('key:' + key.data)
        callback(key.data)
    })
}

function decrypt(key, data){
    console.log({key, data})
    let a = key
    let i = data
    let n = {}
    let s = []
    const fl = Math.floor;
    const len = d=>d.length;
    console.log({a, })
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
    console.log({list, })
    return list
}

const ALL_KIND = ['all', 'pc', 'wise']

function get_encrypt_json(type){
    pre_url_map = {
        'search': 'https://index.baidu.com/api/SearchApi/index?',
        'live': 'https://index.baidu.com/api/LiveApi/getLive?',
        'news': 'https://index.baidu.com/api/NewsApi/getNewsIndex?',
        'feed': 'https://index.baidu.com/api/FeedSearchApi/getFeedIndex?'
    }
    let ds = $('[title="时间段原项（实线）"]')[0].innerText.split(' ~ ')
    start_date = ds[0]
    end_date = ds[1]
    console.log({start_date, end_date})
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
    console.log({url, })
    fetch(url).then(r => r.json()).then(result => {
    console.log({result, })
    getKey(result['data']['uniqid'], key=>{
        if(type=='search'){
            searchData(result, key, start_date)
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
        formatdata.push({
            date: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
            value: d,
        })
        date.setDate(date.getDate()+1)
    })
    return formatdata
}

function searchData(result, key, start_date){
    result.data.userIndexes.forEach(idx=>{
        ALL_KIND.forEach(kind=>{
            idx[kind]['formatdata'] = dataFormating(decrypt(key, idx[kind]['data']), start_date)
        })
    })
    console.log(result.data.userIndexes)
    downloadData(result.data.userIndexes)
}


function feedData(result, key, start_date){
    result.data.index.forEach(idx=>{
        console.log({
            idx,
            data: decrypt(key, idx['data'])
        })
        idx.formatdata = dataFormating(decrypt(key, idx['data']), start_date)
    })
    downloadData(result.data.index)
}

function downloadData(data){
    $('.downlink').attr('download', 'data.json')
    $('.downlink').attr('href', "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data)))
    $('.downlink')[0].click()
    console.log($('.downlink'))
}