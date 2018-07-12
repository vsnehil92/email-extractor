function showEmails(data) {
    makeTextFile = function (text, txtFile) {
        var data = new Blob([text], { type: 'text/plain' });

        if (txtFile !== null) {
            window.URL.revokeObjectURL(txtFile);
        }

        txtFile = window.URL.createObjectURL(data);

        return txtFile;
    };

    if (data) {
        emails = data.slice();
        var textFile = null;
        var textFile2 = null;

        if ((emails) && (emails.length > 0)) {
            var emailsOld = [];
            emailsOld = document.getElementById('pageEmails').value.split('\n');
            if ((emailsOld.length == 1) && (emailsOld[0].trim() == '')) {
                emailsOld.splice(0, 1);
            }

            if (emailsOld.length > 0) {

                for (var iNo = 0; iNo < emailsOld.length; iNo++) {
                    var email = emailsOld[iNo].toLowerCase().trim();

                    if ((email !== '') && (emails.indexOf(email) < 0)) {
                        emails.push(email);
                    }
                }
            } else {
                if (emails.length > 0) {
                    showStars();
                }
            }

            document.getElementById('pageEmails').value = emails.join('\n');

            document.getElementById('btnExport').href = makeTextFile(emails.join('\r\n'), textFile);
            document.getElementById('btnExport').style.display = 'inline-block';
            document.getElementById('pageEmailsLabel').innerText = chrome.i18n.getMessage('pageEmails') + ' (' + emails.length + '):';
        }
    }

    if ((!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false')) && (localStorage['collectedEmails'])) {
        document.getElementById('allEmails').value = localStorage['collectedEmails'];

        document.getElementById('allEmailsLabel').style.display = 'inline';
        document.getElementById('allEmailsLabel').innerText = chrome.i18n.getMessage('emailsFromAllPages') + ' (' + localStorage['collectedEmails'].split('\n').length + '):';
        document.getElementById('cleanAllEmails').style.display = 'inline-block';
        document.getElementById('allEmails').style.display = 'inline-block';

        document.getElementById('btnExportAll').href = makeTextFile(localStorage['collectedEmails'].replace(/\n/mg, '\r\n'), textFile2);
        document.getElementById('btnExportAll').style.display = 'inline-block';
    } else {
        hide(document.getElementById('allEmails'));
        hide(document.getElementById('allEmailsLabel'));
    }
}

function localizeHtml() {
    document.getElementById('pageEmailsLabel').innerText = chrome.i18n.getMessage('pageEmails') + ':';

    document.getElementById('allEmailsLabel').innerText = chrome.i18n.getMessage('emailsFromAllPages');
    document.getElementById('collectEmailsLabel').innerHTML = chrome.i18n.getMessage('keepEmailsFromAllPages');

    document.getElementById('btnExport').innerText = chrome.i18n.getMessage('exportCurrent');
    document.getElementById('btnExportAll').innerText = chrome.i18n.getMessage('exportAll');

    document.getElementById('searchByDomain').innerText = chrome.i18n.getMessage('searchByDomain');

    document.getElementById('appLink').innerHTML = '<a href="' + chrome.i18n.getMessage('appLink') + '" style="font-size: 9pt;"  target="_blank" id="appLink">' + chrome.i18n.getMessage('appLinkText') + '</a>';
}

function parseSearchEmailsInBing(response, url, domain, tabId) {
    response = response.replace(/<strong>/ig, '');
    response = response.replace(/<\/strong>/ig, '');

    chrome.tabs.sendMessage(tabId, { method: 'extractEmails', data: response, domain: domain }, function (response) {
        if (response) {
            showEmails(response.data);

            var port = chrome.extension.connect({
                name: 'send'
            });
            var obj = {};
            obj.data = response.data;
            obj.url = url;
            port.postMessage(obj);
            port.onMessage.addListener(function ({ msg }) { });
        }
    });
}

function searchEmailsInBing(domain, tabId, secondPage) {
    show(document.getElementById('bingAnimate'));
    document.getElementById('bingAnimate').className = "icon-refresh-animate";
    if (secondPage) {
        var url = 'http://www.bing.com/search?q="*%40' + domain + '"&first=11&FORM=PERE';
    } else {
        var url = 'http://www.bing.com/search?q="*%40' + domain + '"';
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            hide(document.getElementById('bingAnimate'));
            parseSearchEmailsInBing(xhr.responseText, url, domain, tabId);
            if (!secondPage && xhr.responseText.indexOf('"b_pag"') > 0) {
                setTimeout(searchEmailsInBing, 1000, domain, tabId, true);
                // searchEmailsInBing(domain, tabId, true);    
            }
        }
    };
    xhr.send();
}

function showStars() {
    var impressions = 0;
    if (localStorage['impressions']) {
        impressions = localStorage['impressions'];
    }
    impressions++;
    localStorage['impressions'] = impressions;

    if (impressions > 19) {
        if (localStorage['needShowRate'] == undefined) {
            localStorage['needShowRate'] = 1;
        }
    }

    if (localStorage['needShowRate'] && (localStorage['needShowRate'] == 1) && ((impressions % 5) == 0)) {
        document.getElementById('pleaseRateUs').innerText = chrome.i18n.getMessage('pleaseRateUs');
        show(document.getElementById('allStars'));

        document.getElementById('star-5').addEventListener('click', function () {
            hide(document.getElementById('allStars'));
            localStorage['needShowRate'] = 0;

            var newURL = 'https://chrome.google.com/webstore/detail/email-hunter/igpjommeafjpifagkfhebdbofcokbhcb/reviews';
            chrome.tabs.create({ url: newURL });

            localStorage['star'] = 5;
        });

        function badEval(star) {
            document.getElementById('badEval').innerHTML = chrome.i18n.getMessage('badEval');
            show(document.getElementById('badEval'));
            hide(document.getElementById('allStars'));
            localStorage['needShowRate'] = 0;
            localStorage['star'] = star;
        }

        document.getElementById('star-1').addEventListener('click', function () { badEval(1); });
        document.getElementById('star-2').addEventListener('click', function () { badEval(2); });
        document.getElementById('star-3').addEventListener('click', function () { badEval(3); });
        document.getElementById('star-4').addEventListener('click', function () { badEval(4); });
    }
}

chrome.tabs.getSelected(null, function (tab) {
    localizeHtml();

    var a = document.createElement('a');
    a.href = tab.url;

    if (localStorage['disableCollectEmails'] !== undefined) {
        document.getElementById('collectEmails').checked = !(localStorage['disableCollectEmails'] === 'true');
    }

    document.getElementById('collectEmails').addEventListener('change', function () {
        localStorage['disableCollectEmails'] = !document.getElementById('collectEmails').checked;
    });

    document.getElementById('autosearch').checked = !(localStorage['disableAutosearch'] === 'true');
    if (localStorage['disableAutosearch'] !== 'true') {
        hide(document.getElementById('searchByDomain2'));
        document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelLong');
    } else {
        show(document.getElementById('searchByDomain2'), 'inline');
        document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelShort');
    }

    document.getElementById('autosearch').addEventListener('change', function () {
        localStorage['disableAutosearch'] = !document.getElementById('autosearch').checked;

        if (!document.getElementById('autosearch').checked) {
            show(document.getElementById('searchByDomain2'), 'inline');
            document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelShort');
        } else {
            hide(document.getElementById('searchByDomain2'));
            document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelLong');
        }
    });

    if (tldjs.getDomain(tab.url) == 'bing.com') {
        chrome.tabs.sendMessage(tab.id, { method: 'getEmailsBing' }, function (response) {
            if (response) {
                showEmails(response.data);
            } else showEmails();
        });

    } else {
        chrome.tabs.sendMessage(tab.id, { method: 'getEmails' }, function (response) {
            if (response) {
                showEmails(response.data);
            } else {
                showEmails();
            }

            if (!localStorage['disableAutosearch'] || (localStorage['disableAutosearch'] == 'false')) {
                if (tab.url.indexOf('google') == -1) {
                    searchEmailsInBing(tldjs.getDomain(tab.url), tab.id);
                }
            }

        });
    }

    document.getElementById('cleanAllEmails').addEventListener('click', function () {
        document.getElementById('allEmails').value = '';
        localStorage['collectedEmails'] = '';
    });

    document.getElementById('searchByDomain').addEventListener('click', function () {
        var newURL = 'http://www.bing.com/search?q="*%40' + tldjs.getDomain(tab.url) + '"';
        chrome.tabs.create({ url: newURL });
    });

});

document.addEventListener('DOMContentLoaded', function () {
    //
});