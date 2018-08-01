
var tempEmail = undefined;

function saveCollectedEmails(emails) {
  if (emails && (emails.length > 0)) {
    if (!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false') ) {
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

      localStorage['collectedEmails'] = collectedEmails.join('\n');
    }
  }
}

function showEmails(data) {
  console.log("hit")
  console.log("data: ", data);
  makeTextFile = function (text, txtFile) {
    var data = new Blob([text], { type: 'text/csv' });

    if (txtFile !== null) {
      window.URL.revokeObjectURL(txtFile);
    }

    txtFile = window.URL.createObjectURL(data);
    return txtFile;
  };

  localStorageToJson = function (email, table) {
    var data1;
    if (typeof email === 'string' || email instanceof String) {
      data1 = email.split('\n');
      data1 = '[' + data1.join(',') + ']';
    } else {
      email.toString();
      data1 = '[' + email + ']';
      console.log(data1);
      // data1 = email;
    }
    let final = JSON.parse(data1);
    console.log(final);
    if (table) {
      convertToTable(final, table);
    }
  }

  convertToTable = function (jsondata, table) {
    let tableData = document.getElementById(table)
    for (i = 0; i < jsondata.length; i++) {
      var tr = document.createElement('tr');

      var td1 = document.createElement('td');
      var td2 = document.createElement('td');
      var td3 = document.createElement('td');

      var email = document.createTextNode(jsondata[i].email);
      var domain = document.createTextNode(jsondata[i].domain);
      var source = document.createTextNode(jsondata[i].source);

      td1.appendChild(email);
      td2.appendChild(domain);
      td3.appendChild(source);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);

      tableData.appendChild(tr);
    }
  }

  if (data && (!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false'))) {
    var initial_data = data;
    var emails = [];
    var textFile = null;
    var textFile2 = null;
    if ((initial_data) && (initial_data.length > 0)) {
      count = 0;
      for (var iNo = 0; iNo < initial_data.length; iNo++) {
        var email = initial_data[iNo];
        if ((email !== '') && (emails.indexOf(email) == -1)) {
          emails.push(email);
          count += 1;
        }
      }
      console.log("email: ", emails)
      tempEmail = emails;
      localStorageToJson(emails, 'pageEmails');
      document.getElementById('btnExport').href = makeTextFile(emails.join('\r\n'), textFile);
      document.getElementById('btnExport').style.display = 'inline-block';
      document.getElementById('butonexp').style.display = 'inline-block';
      document.getElementById('pageEmailsLabel').innerText = chrome.i18n.getMessage('pageEmails') + ' (' + emails.length + '):';

    }
  }

  if ((!localStorage['disableCollectEmails'] || (localStorage['disableCollectEmails'] == 'false')) && (localStorage['collectedEmails'])) {
    localStorageToJson(localStorage['collectedEmails'], 'allEmails');
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
    if (localStorage['collectedEmails'] != undefined || localStorage['collectedEmails'] != null) {
      localStorageToJson(localStorage['collectedEmails']);
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
function search() {
  // Declare variables 
  
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
        searchEmailsInBing(domain, tabId, true);
      }
    }
  };
  xhr.send();
}


chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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
      document.getElementById('div1').style.height = 0;
      hide(document.getElementById('pageEmailsLabel'));
      hide(document.getElementsById('butonexp'));
      hide(document.getElementsById('butonexpall'));
    } else {
      document.getElementById('autosearchLabel').innerText = chrome.i18n.getMessage('autosearchLabelLong');
      show(document.getElementById('pageEmails'));
      document.getElementById('div1').style.height = 300;
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

  document.getElementById('saveToLocalStorage').addEventListener('click', function () {
    saveCollectedEmails(tempEmail);
  });

  document.getElementById('autocrawlurl').addEventListener('click', function () {
    let urls = document.getElementById("listurl").value;
    let tabData = [];
    urls = urls.split("\n");
    let tabObj = {
      url: urls
    }


    chrome.windows.create(tabObj, function (data) {
      for(var i=0;i<data.tabs.length;i++){
        var urlObj = {};
        urlObj.tabId = data.tabs[i].id;
        urlObj.url = data.tabs[i].url;
        urlObj.windowId = data.tabs[i].windowId;
        tabData.push(urlObj);
      }

      if(!localStorage['automatedCrawls'] || localStorage['automatedCrawls'].length == 0){
        localStorage['automatedCrawls'] = JSON.stringify(tabData);
      } else {
        let tempStorage = JSON.parse(localStorage['automatedCrawls']);
        let tempData = [];
        tempData = tempStorage.concat(tabData)
        localStorage['automatedCrawls'] = JSON.stringify(tempData);
      }
    })

  });

  if (tab.url.indexOf('bing.com') > 0) {
    let domain = tldjs.getDomain(tab.url);
    chrome.tabs.sendMessage(tab.id, { method: 'getEmailsBing', domain: domain }, function (response) {
      if (response) {
        showEmails(response.data);
      } else showEmails();
    });

  } else {
    let domain = tldjs.getDomain(tab.url);
    chrome.tabs.sendMessage(tab.id, { method: 'getEmails', domain: domain }, function (response) {
      if (response) {
        console.log("hit0");
        showEmails(response.data);
      } else {
        console.log("hit1")
        showEmails();
      }

      // this will be executed when we want to search email from google
      /*       if (1 === 'true') {
              if (tab.url.indexOf('google') == -1) {
                console.log('here');
                searchEmailsInBing(tldjs.getDomain(tab.url), tab.id);
              }
            } */

    });
  }

  document.getElementById('cleanAllEmails').addEventListener('click', function () {
    let table = document.getElementById('allEmails');
    table.innerHTML = "";
    localStorage['collectedEmails'] = '';
  });

});

document.getElementById('tablesearch').addEventListener('onkeyup', function () {
  var input, filter, table, tr, td, i;
  input = document.getElementById("tablesearch");
  filter = input.value.toUpperCase();
  table = document.getElementById("allEmails");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td0 = tr[i].getElementsByTagName("td")[0];
    td1 = tr[i].getElementsByTagName("td")[1];
    td2 = tr[i].getElementsByTagName("td")[2];
    if (td0 || td1 || td2) {
      if (td0.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else if (td1.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else if (td2.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
})

document.addEventListener('DOMContentLoaded', function () {
  //
});