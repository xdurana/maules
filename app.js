global.__base = __dirname;

var express = require('express');
var path = require('path');
var swig = require('swig');
var app = express();
var config = require(__base + '/config');

app.set('port', config.port());
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/lib/views');
app.set('view cache', false);

app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(config.i18next.handle);
app.use(express.methodOverride());
app.use('/app/guaita', express.static(path.join(__dirname, 'public')));
app.use(app.router);

config.i18next.registerAppHelper(app);
config.services = require(__base + '/lib/services/index');
config.user = require(__base + '/lib/services/auth')(app, config);
config.indicadors = require(__base + '/lib/utils/indicadors')(config);

require('./lib/controllers/calendar/index')(app, config);
require('./lib/controllers/classrooms/index')(app, config);
require('./lib/controllers/resources/index')(app, config);
require('./lib/controllers/rooms/index')(app, config);
require('./lib/controllers/statistics/index')(app, config);
require('./lib/controllers/test/index')(app, config);
require('./lib/controllers/widget/index')(app, config);
require('./lib/controllers/monitor/index')(app, config);


var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    var server = app.listen(app.get('port'), function () {
        config.log('Express server listening on port ' + app.get('port'));
    });
    server.on('error', function(err) {
        console.log(err);
    });
}