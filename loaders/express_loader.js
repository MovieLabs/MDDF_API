
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const xmlBodyParser = require('express-xml-bodyparser');
const logger = require('morgan');

module.exports = function expressLoader(dependencies) {
    const app = dependencies.expressApp;

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(bodyParser.text({ type: '*/xml' }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => res.send('Hello World'));
};
