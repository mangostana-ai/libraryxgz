import {parse} from './library-parser'

// find isbn
const info = document.querySelector("#info")
var cts = info.textContent.split(/\n/).filter(item => item.replaceAll(/\s|\t| /g,'').length> 0)
var isbn = cts[cts.length-1].match(/(\d+)/)[1]

// meet library
chrome.runtime.sendMessage({isbn: isbn}, function(dom) {
    console.log(dom);
    if ( dom == null) {
        return null;
    }
    var response = parse(dom);

    var aside = document.querySelector(".aside");
    
    var gray = document.createElement('div');
    gray.classList = 'gray_ad version_works';
    var h2 = document.createElement('h2');
    h2.textContent = '广州图书馆可借馆藏';
    gray.appendChild(h2);
    var ul = document.createElement('ul');
    Object.keys(response).forEach(key => {
        var cnt = response[key];
        var li = document.createElement('li');
        li.styleList = 'mb8 pl';
        var a = document.createElement('a');
        a.href = 'javascript:void(0)';
        a.textContent = `${key} (${cnt})`;
        li.appendChild(a);
        
        ul.appendChild(li);
    })
    gray.appendChild(ul);

    aside.prepend(gray);

  });
