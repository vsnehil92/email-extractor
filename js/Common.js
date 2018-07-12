function getVersion(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('../manifest.json'), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var manifest = JSON.parse(xhr.responseText);
            callback(manifest.version);
        }
    };
    xhr.send();
}

function show(elements, specifiedDisplay) {
    elements = elements.length ? elements : [elements];
    for (var index = 0; index < elements.length; index++) {
        elements[index].style.display = specifiedDisplay || 'block';
    }
}

function hide(elements) {
    elements = elements.length ? elements : [elements];
    for (var index = 0; index < elements.length; index++) {
        elements[index].style.display = 'none';
    }
}
