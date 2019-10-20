const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const basicAuth = require('basic-auth-connect');

const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');
const removeRouter = require('./routes/remove');
const listRouter = require('./routes/list');
const etcRouter = require('./routes/etc');

const uploadDir = process.env.UPLOAD_DIR;
const downloadDir = process.env.DOWNLOAD_DIR;
const basicUser = process.env.BASIC_USER;
const basicPassword = process.env.BASIC_PASSWORD;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
if (basicUser && basicPassword) {
  app.use(basicAuth(basicUser, basicPassword));
}

app.use('/', indexRouter);
app.use('/upload', uploadRouter);
app.use('/remove', removeRouter);
app.use('/list', listRouter);
app.use('/etc', etcRouter);
app.use(downloadDir, express.static(uploadDir), serveIndex(uploadDir, {'icons': true}));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
