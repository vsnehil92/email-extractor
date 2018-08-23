﻿var currentDate = new Date();
var currentYear = currentDate.getFullYear();
var currentMonth = currentDate.getMonth();
var currentDay = currentDate.getDate();

var regBlock = /<tr\s*class="zA (yO|zE)".+?tr>/gi;
var regEmail = /email="(.+?)"\s*name="(.+?)"/i;
var regDate = /class="xW xY.+?aria-label=".+?">(.+?)<\/span>/i;
var reg550 = /email="mailer-daemon@googlemail\.com".+?(\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b)/i;
var regLang = /<html.*?lang="(.+?)"/i;
var lang = 'en';

var invalidLocalParts = ['the', '2', '3', '4', '123', '20info', 'aaa', 'ab', 'abc', 'acc', 'acc_kaz', 'account', 'accounts', 'accueil', 'ad', 'adi', 'adm', 'an', 'and', 'available',
    'b', 'c', 'cc', 'com', 'domain', 'domen', 'email', 'fb', 'foi', 'for', 'found', 'g', 'get', 'h', 'here', 'includes', 'linkedin', 'mail', 'mailbox', 'more', 'my_name', 'n',
    'name', 'need', 'nfo', 'ninfo', 'now', 'o', 'online', 'post', 'rcom.TripResearch.userreview.UserReviewDisplayInfo', 's', 'sales2', 'test', 'up', 'we', 'www', 'xxx', 'xxxxx', 
    'y', 'username', 'firstname.lastname'];

function prepareEmails(emails, domain, method, html=undefined) {
    var emailsNew = [], tempEmail = [];
    for (var iNo = 0; iNo < emails.length; iNo++) {
        var email = emails[iNo].toLowerCase().trim();

        if ((tempEmail.indexOf(email) < 0)) {
            if (domain && method === 'extractEmails') {
                alert('here');
                if (email.indexOf(domain) < 1) {
                    continue;
                };
            }

            var ext = email.slice(-4);
            if ((ext === '.png') || (ext === '.jpg') || (ext === '.gif') || (ext === '.css') || (ext === '.jpeg')) {
                continue;
            }
            var ext2 = email.slice(-3);
            if ((ext2 === '.js')) {
                continue;
            }

            var newEmail = email.replace(/^(x3|x2|u003)[b|c|d|e]/i, '');
            newEmail = newEmail.replace(/^sx_mrsp_/i, '');
            newEmail = newEmail.replace(/^3a/i, '');
            if (newEmail !== email) {
                email = newEmail;
                if (email.search(/\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/i) == -1) {
                    continue;
                }
            }

            if (email.search(/(no|not)[-|_]*reply/i) != -1) {
                continue;
            };
            if (email.search(/mailer[-|_]*daemon/i) != -1) {
                continue;
            };
            if (email.search(/reply.+\d{5,}/i) != -1) {
                continue;
            };
            if (email.search(/\d{13,}/i) != -1) {
                continue;
            };
            if (email.indexOf('.crx1') > 0) {
                continue;
            };
            if (email.indexOf('nondelivery') > 0) {
                continue;
            };
            if (email.indexOf('@linkedin.com') > 0) {
                continue;
            };
            if (email.indexOf('@linkedhelper.com') > 0) {
                continue;
            };
            if (email.indexOf('feedback') > 0) {
                continue;
            };
            if (email.indexOf('notification') > 0) {
                continue;
            };

            var localPart = email.substring(0, email.indexOf('@'));
            if (invalidLocalParts.indexOf(localPart) !== -1) {
                continue;
            };

            if ((email !== '') && (tempEmail.indexOf(email) == -1)) {
                let split = email.split('@');
                let dom = split[1];
                let newEmail = {email: email, domain: dom, source: domain};
                if(tempEmail.indexOf(email) == -1){
                    tempEmail.push(email)
                    let div = undefined;
                    if(html){
                        div = extractDiv(html, email)
                        newEmail = {email: email, domain: dom, source: domain, div: div};
                    }
                    newEmail = JSON.stringify(newEmail);
                    emailsNew.push(newEmail);  
                }  
            }
        }
    }
    console.log("emailsNew", emailsNew)
    return emailsNew;
}

function searchEmails(pageText, domain, method) {
    pageText = pageText.replace(/\\n/ig, ' ');
    var emails = pageText.match(/\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi);
    console.log("emails : ", emails)
    if ((emails !== null) && (emails.length > 0)) {
        if (domain.ser == undefined || domain.ser == '0'){
            return prepareEmails(emails, domain, method, document.all[0].innerHTML);
        } else if(domain.domain.indexOf('google') != -1){
            return prepareEmails(emails, domain.domain, method, document.all[0].innerHTML);
        } else {
            return prepareEmails(emails, domain.domain, method, document.all[0].innerHTML);
        }
    }
}

function extractDiv(html, email){
    let tempHtml = html;
    let splitData = tempHtml.split(email)
    console.log(splitData.length + " " + email)
    var text = "";
    let textArr = [];
    let divStartFlag = false
    if(splitData.length > 1){
        for(var i=0; i<splitData.length; i++){
            let splitDataDivStart = splitData[i].split("<div");
            // let splitDataDivEnd = undefined;
            console.log("test")
            if(splitDataDivStart.length > 1 && !divStartFlag){
                // let n = 1
                // while(n = 1){
                //     let x = 1;
                //     console.log(x)
                //     splitDataDivEnd = splitData[i + x].split("</div>")
                //     if(splitDataDivEnd.length > 1){
                //         n = i + x;
                //     } else {
                //         x++;
                //     }
                // }
                console.log(":::::::: split div length start :::: ", splitDataDivStart.length)
                splitDataDivStart[splitDataDivStart.length - 1] = splitDataDivStart[splitDataDivStart.length - 1].replace(/\n/g, "<br />");
                text = "<div " + splitDataDivStart[splitDataDivStart.length - 1].trim() + email;
                divStartFlag = true;
                text = text.trim();
                // console.log(":::::::: split div length end :::: ", splitDataDivEnd.length)
                // var text = "<div"+splitDataDivStart[splitDataDivStart.length - 1] + emails[email] + splitDataDivEnd[0] + "</div>"
                // console.log(text)
            } else {
                
                let splitDataDivEnd = splitData[i].split("</div>");
                if(splitDataDivEnd.length > 1){
                    text = text + splitDataDivEnd[0].trim() + "</div>";
                    divStartFlag = false;
                    text = text.trim();
                    textArr.push(text);
                    text = "";
                } else {
                    splitDataDivEnd[0] = splitDataDivEnd[0].replace(/\n/g, "<br />");
                    text = text + splitDataDivEnd[0].trim() + email;
                    text = text.trim();
                }
                
                // i++;
            }
        }
    }
    return textArr;
    
}

function convertHtmlToText(inputText) {
    var returnText = inputText;
    if (returnText) {

        returnText = returnText.replace(/<br>/gi, "\n");
        returnText = returnText.replace(/<br\s\/>/gi, "\n");
        returnText = returnText.replace(/<br\/>/gi, "\n");

        returnText = returnText.replace(/ +(?= )/g, '');

        returnText = returnText.replace(/&nbsp;/gi, ' ');
        returnText = returnText.replace(/&amp;/gi, '&');
        returnText = returnText.replace(/&quot;/gi, '"');
        returnText = returnText.replace(/&lt;/gi, '<');
        returnText = returnText.replace(/&gt;/gi, '>');

        returnText = returnText.replace(/<.*?>/gi, '');
    }

    return (returnText);
}

var months = {
    'en': ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'm/d/y'],
    'en-GB': ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'd/m/y'],
    'fr': ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil', 'Août', 'sept.', 'oct.', 'nov', 'déc.', 'd/m/y'],
    'es': ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago', 'sep.', 'oct.', 'nov.', 'dic.', 'd/m/y'],
    'ru': ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.', 'd.m.y'],
    'uk': ['січ.', 'лют.', 'бер.', 'квіт.', 'трав.', 'черв.', 'лип.', 'серп.', 'вер.', 'жовт.', 'лист.', 'груд.', 'd.m.y'],
    'pt-BR': ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez', 'm/d/y'],
    'pl': ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru', 'd.m.y'],
    'it': ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic', 'd/m/y']
}

function localeStringToDate(date, format) {
    // date separator replace to '.' ('11/25/16' -> '11.25.16')
    date = date.replace(/\//ig, '.');

    // remove separator from format ('m/d/y' -> 'mdy')
    format = format.replace(/\//ig, '').replace(/\./ig, '');

    // divide the day, month, year into groups
    var result = date.match(/(\d+)\.(\d+)\.(\d+)/i);
    if (result && result.length == 4) {
        var Year = +result[format.indexOf('y') + 1];
        var Month = +result[format.indexOf('m') + 1];
        var Day = +result[format.indexOf('d') + 1];

        if (Year < 100) {
            Year = Year + 2000;
        }

        return (new Date(Year, Month - 1, Day));
    }
}

function detectDate(date, lang, cYear, cMonth, cDay) {
    var regMonth = /[^\d\s]{3,}/i;
    var regDay = /\d{1,}/i;
    var regTime = /^\d{1,2}:\d{1,2}(\s\w{2})?$/i;

    var result = date.match(regMonth);
    if (result && result[0]) {
        var month = result[0].trim().toLowerCase();
    }
    var result = date.match(regDay);
    if (result && result[0]) {
        day = result[0].trim().toLowerCase();
    }

    if (day && month && (month.length > 2)) {
        if (months[lang]) {
            iMonth = (months[lang].indexOf(month));
            return (new Date(cYear, iMonth, day));
        } else {
            return undefined;
        }
    } else {
        if (regTime.test(date)) {
            return (new Date(cYear, cMonth, cDay));
        } else {
            return localeStringToDate(date, months[lang][12]);
        }
    }
}

function searchContactsGmail(source) {
    var emails = [];
    var contacts = [];

    var result = source.match(regLang);
    if (result && result[1]) {
        lang = result[1];
    }

    while (matches = regBlock.exec(source)) {
        if (matches[0]) {
            res = regEmail.exec(matches[0]);
            if (res && res[1] && res[2]) {

                var undelivered = reg550.exec(matches[0]);
                if (undelivered && undelivered[1]) {
                    var email = undelivered[1];
                    var type = 'bounce';
                    var name = email.replace(/@.+/i, '');
                } else {
                    var email = res[1];
                    var type = 'inbox';
                    var name = convertHtmlToText(res[2]);
                }

                if (emails.indexOf(email) == -1) {
                    {
                        emails.push(email);

                        var contact = {};
                        contact.email = email;
                        contact.name = name;
                        contact.type = type;

                        var mtchs = regDate.exec(matches[0]);
                        if (mtchs && mtchs[1]) {
                            contact.originalDate = convertHtmlToText(mtchs[1])
                            var timeStamp = detectDate(contact.originalDate, lang, currentYear, currentMonth, currentDay);
                            if (timeStamp) {
                                timeStamp = timeStamp.getTime();
                                if (timeStamp > 1000) {
                                    timeStamp = (timeStamp / 1000) + 21600;
                                }
                                contact.date = timeStamp;
                            }
                        }

                        contacts.push(contact);
                    }
                }
            }
        }
    }

    if (emails.length > 0) {
        emails = prepareEmails(emails);
    }
    if (emails.length > 0) {
        var contacts = contacts.filter(function (contact) {
            return (emails.indexOf(contact.email) !== -1)
        });
    }

    if (contacts.length > 0) {
        return (contacts);
    }
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("hit0")
    console.log(request)
    if (request.method == 'getEmails') {
        // console.log(document.all[0].innerHTML)
        sendResponse({ data: searchEmails(document.all[0].innerHTML, request.domain), method: 'getEmails' });
    } else
        if (request.method == 'getEmailsBing') {
            sendResponse({ data: searchEmails(document.all[0].innerText ,request.domain), method: 'getEmailsBing' });
        } else
            if (request.method == 'getEmailsGoogle') {
                sendResponse({ data: searchEmails(document.all[0].innerText, request.domain), method: 'getEmailsGoogle' });
            } else
                if (request.method == 'getEmailsGmail') {
                    sendResponse({ data: searchContactsGmail(document.all[0].outerHTML, request.domain), pageLang: lang, method: 'getEmailsGmail' });
                } else
                    if (request.method == 'getInnerHTML') {
                        sendResponse({ data: document.all[0].innerHTML, method: 'getInnerHTML' });
                    } else
                        if (request.method == 'getInnerText') {
                            sendResponse({ data: document.all[0].innerText, method: 'getInnerText' });
                        } else
                            if (request.method == 'extractEmails') {
                                sendResponse({ data: searchEmails(request.data, request.domain, request.method), method: 'extractEmails' });
                            }
});
