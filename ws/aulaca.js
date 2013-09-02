var config = require('../config');
var request = require('request');

exports.getActivitatsAula = function(domainId, domainIdAula, s, callback) {

    var url = config.aulaca() + "assignatures/" + domainId + "/aules/" + domainIdAula + "/activitats?s=" + s;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(url);
        }
        var object = JSON.parse(body);
        callback(null, object.activities);
    });
}

exports.getAssignaturesPerIdp = function(s, idp, anyAcademic, callback) {

    var url = config.aulaca() + "assignatures?idp=" + idp + "&s=" + s;
    request({
        url: url,
        method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(url);
        }
        var object = JSON.parse(body);
        object.subjects = object.subjects.filter(function(assignatura) {
            return (assignatura.anyAcademic === anyAcademic);
        });
        callback(null, object.subjects);
    });
}

exports.getEinesPerActivitat = function(domainId, domainIdAula, eventId, s, callback) {

    var url = config.aulaca() + "assignatures/" + domainId + "/aules/" + domainIdAula + "/activitats/" + eventId + "/eines?s=" + s;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(url);
        }
        var object = JSON.parse(body);
        callback(null, object.tools);
    });
}

exports.getEinesPerAula = function(domainId, domainIdAula, s, callback) {

    var url = config.aulaca() + "assignatures/" + domainId + "/aules/" + domainIdAula + "/eines?s=" + s;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(url);
        }
        var object = JSON.parse(body);
        callback(null, object.tools);
    });
}