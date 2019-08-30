// If PM2 has not injected the environment variables, load from local .env file
const dotenv = require('dotenv');
if (!process.env.NODE_ENV) {
    console.log('No environment loaded, load from local directory');
    dotenv.config();
}

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const xmlBodyParser = require('express-xml-bodyparser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const { initialize } = require('express-openapi');
const mecController = require('./api/controllers/mec');
const artworkController = require('./api/controllers/artwork');
const mecMapController = require('./api/controllers/mec_map');
const searchController = require('./api/controllers/search');
const database = require('./database/database');
const lookupEIDR = require('./database/lookup_eidr');

const apiDoc = path.join(__dirname, './api/docs-v1/mddf-api-doc.yaml');
console.log(apiDoc);
const swaggerDocument = yaml.load(apiDoc);

const app = express();

const port = process.env.PORT || 4020;
app.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.text({ type: '*/xml' }));
// app.use(bodyParser());
// app.use(xmlBodyParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);

app.get('/', (req, res) => res.send('Hello World'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize the route handlers to their controllers
initialize({
    app,
    apiDoc,
    dependencies: {
        database,
    },
    operations: {
        mecGetResource: mecController.mecGetResource,
        mecPostResource: mecController.mecPostResource,
        mecPutResource: mecController.mecPutResource,
        mecDeleteResource: mecController.mecDeleteResource,
        artworkGetResource: artworkController.artGetResource,
        mecMapResource: mecMapController.mecMapResource,
        searchTitles: searchController.getSearch,
    },
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

console.log('Start lookups');
lookupEIDR();

module.exports = app;
