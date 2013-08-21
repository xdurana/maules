var express = require('express');
var http = require('http')
var path = require('path');
var request = require('request');
var cons = require('consolidate');
var swig = require('swig');

var config = require('./config');

var assignatures = require('./routes/assignatures');
var aules = require('./routes/aules');
var activitats = require('./routes/activitats');
var eines = require('./routes/eines');
var estudiants = require('./routes/estudiants');
var consultors = require('./routes/consultors');
var connexions = require('./routes/connexions');

var app = express();

app.set('port', config.port());

app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
swig.init({
    root: __dirname + '/views',
	autoescape: true,
	cache: true,
	encoding: 'utf8',
    allowErrors: true
});

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

app.use(function(err, req, res, next) {
	res.status(500);
	res.json({ error: err });
});

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

/**
 * IDP course list
 * @mockup: aulas_pra.html
 */
app.get('/assignatures', function (req, res, callback) {
	if (req.query.s && req.query.idp && req.query.anyAcademic) {
		return assignatures.byidp(req.query.s, req.query.idp, req.query.anyAcademic, function (err, result) {
			if (err) callback(err);
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('pra.html', { object: result });
			}
		});
	} else {
		callback('manquen algun dels parametres de la crida [s, idp, anyAcademic]');
	}
});

/**
 * Course classroom list
 * @mockup: tabs_pra.html
 */
app.get('/assignatures/:domainId/aules', function (req, res, callback) {

	var codAssignatura = '01.503';
	var anyAcademic = '20122';

	if (req.query.s && req.query.tab) {
		if (req.query.tab == '1') {
			return aules.all(codAssignatura, anyAcademic, req.params.domainId, function (err, result) {
				if (err) callback(err);
				if (req.query.format) {
					res.json(result);
				} else {
					result.s = req.query.s;
					res.render('aula-estudiants-activitats.html', { assignatura: result });
				}
			});			
		} else if (req.query.tab == '2') {
			return aules.all(codAssignatura, anyAcademic, req.params.domainId, function (err, result) {
				if (err) callback(err);
				if (req.query.format) {
					res.json(result);
				} else {
					result.s = req.query.s;
					res.render('aula-estudiants-eines.html', { assignatura: result });
				}
			});
		} else if (req.query.tab == '3') {
			return aules.all(codAssignatura, anyAcademic, req.params.domainId, function (err, result) {
				if (err) callback(err);
				if (req.query.format) {
					res.json(result);
				} else {
					result.s = req.query.s;
					res.render('aula-estudiants-avaluacio.html', { assignatura: result });
				}
			});
		}
	} else {
		callback('manquen algun dels parametres de la crida [s, tab]');
	}
});

/**
 * Classroom activities
 * @mockup: actividades_aula.html
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/activitats', function (req, res) {
	if (req.query.s) {
		return activitats.all(req.params.domainId, req.params.domainIdAula, function (err, result) {
			if (err) callback(err);
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('activitats-estudiants.html', { aula: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Activities tools
 * @mockup: actividades_aula.html
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/activitats/:domainIdActivitat/eines', function (req, res) {
	if (req.query.s) {
		return eines.activitat(req.params.domainId, req.params.domainIdAula, req.params.domainIdActivitat, req.query.s, function (err, result) {
			if (err) callback(err);
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('eines-activitats-estudiants.html', { activitat: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula', function (req, res) {
	return aules.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});		
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/activitats/:ordre', function (req, res) {
	return activitats.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.ordre, function (err, result) {
		res.json(result);
	});		
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/eines', function (req, res) {
	return eines.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/eines/:codEina', function (req, res) {
	return eines.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.codEina, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/estudiants', function (req, res) {
	return estudiants.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/estudiants/:numExpedient', function (req, res) {
	return estudiants.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.numExpedient, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/estudiants/:numExpedient/connexions', function (req, res) {
	return connexions.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.numExpedient, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/consultors', function (req, res) {
	return consultors.all(req.params.codAssignatura, req.params.anyAcademic, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/phpBB3', function (req, res) {
	return eines.phpBB3(req.query.domainId, req.query.forumId, function (err, result) {
		res.json(result);
	});
});

app.get('/', function(req, res) {
	res.render('pra', { title: 'The index page!' })
	//res.json({status: 'Express server listening on port ' + app.get('port') });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});