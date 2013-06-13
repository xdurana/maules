var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, callback) {

	//http://localhost:3333/assignatures/05.002/20122/consultors

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		consultors: []
	}

	infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		async.each(result.out.AulaVO, getConsultantStats, function(err) {
			if (err) return callback(err);
		});
		callback(null, struct);
	});

	var getConsultantStats = function(item, callback) {
		struct.consultors.push({
			idp: item.idpConsultor[0],
			codAssignatura: item.codAssignatura[0],
			codAula: item.codAula[0]
		});
	}
}