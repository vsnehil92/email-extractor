function showEmails(data) {
    makeTextFile = function (text, txtFile) {
        var data = new Blob([text], { type: 'text/csv' });

        if (txtFile !== null) {
            console.log(txtFile);
            window.URL.revokeObjectURL(txtFile);
        }

        txtFile = window.URL.createObjectURL(data);
        return txtFile;
    };

    if (data && (!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false'))) {
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
            }

            document.getElementById('pageEmails').value = emails.join('\n');

            document.getElementById('btnExport').href = makeTextFile(emails.join('\r\n'), textFile);
            document.getElementById('btnExport').style.display = 'inline-block';
            document.getElementById('butonexp').style.display = 'inline-block';
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
        document.getElementById('butonexpall').style.display = 'inline-block';
    } else {
        hide(document.getElementById('pageEmails'));
        hide(document.getElementById('pageEmailsLabel'));
        if(localStorage['collectedEmails'] != undefined || localStorage['collectedEmails'] != null) {
            document.getElementById('allEmails').value = localStorage['collectedEmails'];
            document.getElementById('btnExportAll').href = makeTextFile(localStorage['collectedEmails'].replace(/\n/mg, '\r\n'), textFile2);
            document.getElementById('btnExportAll').style.display = 'inline-block';
            document.getElementById('butonexpall').style.display = 'inline-block';
        }
    }
}

function localizeHtml() {
    document.getElementById('pageEmailsLabel').innerText = chrome.i18n.getMessage('pageEmails') + ':';

    document.getElementById('allEmailsLabel').innerText = chrome.i18n.getMessage('emailsFromAllPages');

    document.getElementById('btnExport').innerText = chrome.i18n.getMessage('exportCurrent');
    document.getElementById('btnExportAll').innerText = chrome.i18n.getMessage('exportAll');

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


chrome.tabs.query ({active: true, currentWindow: true}, function (tabs) {
    localizeHtml();
    var tab = tabs[0];
    var a = document.createElement('a');
    a.href = tab.url;

    if (localStorage['disableCollectEmails'] !== undefined) {
        document.getElementById('collectEmails').checked = !(localStorage['disableCollectEmails'] === 'true');
    }

    document.getElementById('collectEmails').addEventListener('change', function () {
        localStorage['disableCollectEmails'] = !document.getElementById('collectEmails').checked;
      if (!document.getElementById('collectEmails').checked) {
        document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelShort');
        hide(document.getElementById('pageEmails'));
        hide(document.getElementById('pageEmailsLabel'));
        hide(document.getElementsById('butonexp'));
        hide(document.getElementsById('butonexpall'));
      } else {
        document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelLong');
        show(document.getElementById('pageEmails'));
        show(document.getElementById('pageEmailsLabel'));
        show(document.getElementsById('butonexp'));
        show(document.getElementsById('butonexpall'));
      }
    });

    document.getElementById('autosearch').checked = !(localStorage['disableAutosearch'] === 'true');

    if (localStorage['disableCollectEmails'] !== 'true') {
        document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelLong');
    } else {
        document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelShort');
    }

    document.getElementById('autosearch').addEventListener('change', function () {
        localStorage['disableAutosearch'] = !document.getElementById('autosearch').checked;

        if (!document.getElementById('autosearch').checked) {
            document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelShort');
        } else {
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

});

document.addEventListener('DOMContentLoaded', function () {
    //
});