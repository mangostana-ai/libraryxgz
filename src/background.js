
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    checkBorrowable(request).then(sendResponse);
    return true; // return true to indicate you want to send a response asynchronously
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create(
        {
            title: '查询广州图书馆：%s', // %s表示选中的文字
            contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
            documentUrlPatterns: ["https://*.zhihu.com/*"],
            id: "pamjfaaphhhkijadcpoadijenmlldcni"
        }
    )
  });

chrome.contextMenus.onClicked.addListener((info, tab) => {
    checkBorrowable({title: info.selectionText}).then(result => {
        chrome.tabs.sendMessage(tab.id, result, (response)=>{});
    });
    
});

async function checkBorrowable(request) {
    var books = await getBooks(request);
    // 正则表达式处理
    if (books) {
        var ms = books.match(/bookrecno=([0-9]+)/mg);
        var nos = ms.map(m => {
            return m.split('=')[1];
        });
        if(nos && nos.length > 1) {
            return getBorrowable(nos.join(','));
        }
    }
    
    return {};
}
async function getBooks(request) {
    let {isbn, title} = request;
    if (isbn == 0) {
        return {};
    }
    var url = '';
    if (title) {
        url = `https://opac.gzlib.org.cn/opac/search?&q=${title}&searchWay=title&sortWay=score&sortOrder=desc&scWay=dim&hasholding=1&curlibcode=TH&curlibcode=NS&curlibcode=BY&curlibcode=HP&curlibcode=PY&curlibcode=YT&curlibcode=LW&curlibcode=GT&curlibcode=HZQ&searchSource=reader`;
    } else {
        url = `https://opac.gzlib.org.cn/opac/search?searchWay0=isbn&q0=${isbn}&logical0=AND&searchWay1=&q1=&logical1=AND&searchWay2=&q2=&searchSource=reader&marcformat=&sortWay=score&sortOrder=desc&startPubdate=&endPubdate=&rows=10&hasholding=1&curlibcode=GT&curlibcode=YT&curlibcode=HZQ&curlibcode=LW&curlibcode=TH&curlibcode=BY&curlibcode=HP&curlibcode=PY&curlibcode=NS`;
    }
    try {
        let response = await fetch(url, { mode: 'no-cors' });
        // .then(r => r.text())
        // .then(result => {
        //     return result;
        // })
        return await response.text();
    } catch(e){

    }

}

async function getBorrowable(item) {
    let url = `https://opac.gzlib.org.cn/opac/book/holdingPreviews?bookrecnos=${item}&curLibcodes=HZQ%2CGT%2CLW%2CYT%2CPY%2CHP%2CBY%2CNS%2CTH&return_fmt=json`;
    var text = '{}';
    try {
        let response = await fetch(url, { mode: 'no-cors' });
        text = await response.text();
    } catch(e) {

    }
    var json = JSON.parse(text);
    let nameToCount = {};
    if (json && json['previews']) {
        Object.keys(json['previews']).forEach(key => {
            // item => {bookrecno: 3005135912, callno: 'I247.57/10039', curlib: 'NS', curlibName: '南沙区图书馆', curlocal: 'NS-LHZTSS', …}
            var a = json['previews'][key];
            a.forEach(item => {
                if(item.loanableCount > 0) {
                    if(nameToCount[item.curlibName]) {
                        nameToCount[item.curlibName] += item.loanableCount;
                    } else {
                        nameToCount[item.curlibName] = item.loanableCount;
                    }
                }
            });
        })
        
    }
    return nameToCount;
}
