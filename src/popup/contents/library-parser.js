function parse(dom) {
    // parse html
    var parser = new DOMParser();
    var doc = parser.parseFromString(dom, "text/html");
    var tables = document.querySelectorAll('.expressTable')
    let nameToCount = {};
    if (tables != null) {
        tables.forEach(tab => {
            var td1 = tab.querySelector('tr:last-child>td:nth-child(2)');
            var td2 = tab.querySelector('tr:last-child>td:last-child');
            if (td2 != null) {
                var count = td2.textContent.split('/')[0] / 1;
                nameToCount[td1.textContent] = count;
            }
        });
    }

    return nameToCount;
}

export { parse }