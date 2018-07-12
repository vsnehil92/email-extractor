function localizeHtml() {
	document.getElementById('optInfo2').textContent = chrome.i18n.getMessage('optInfo2');
    document.getElementById('optSave').textContent = chrome.i18n.getMessage('optSave');

	document.getElementById('optInfo').innerHTML = '<input type="checkbox" id="optEnable" checked="true">' + chrome.i18n.getMessage('optInfo');
}

function optionsLoad() {
	if (localStorage['disableCollect'] && localStorage['disableCollect'] == 'true') {
		document.getElementById('optEnable').checked = false;
	} 
}

function optionsSave() {
	localStorage['disableCollect'] = !document.getElementById('optEnable').checked;
	document.getElementById('optSave').disabled = true;
}

document.addEventListener('DOMContentLoaded', function(e) {
	localizeHtml();

	optionsLoad();

	document.getElementById('optSave').addEventListener('click', optionsSave);

});