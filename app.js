// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const msal = require('@azure/msal-node');
require('dotenv').config();

const dbHelper = require('./helpers/dbHelper');
dbHelper.ensureDatabase();

const indexRouter = require('./routes/index');
const delegatedRouter = require('./routes/delegated');
const appOnlyRouter = require('./routes/apponly');
const listenRouter = require('./routes/listen');
const watchRouter = require('./routes/watch');
const lifecycleRouter = require('./routes/lifecycle');

const app = express();

// MSAL config
const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    authority: `${process.env.OAUTH_AUTHORITY}/${process.env.OAUTH_TENANT_ID}`,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Error,
    },
  },
};

// Create msal application object
app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);

// Session middleware
// NOTE: Uses default in-memory session store, which is not
// suitable for production
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
  }),
);

// Flash middleware
app.use(flash());
app.use(function (req, res, next) {
  // Read any flashed errors and save
  // in the response locals
  res.locals.errors = req.flash('error_msg');

  // Check for simple error string and
  // convert to layout's expected format
  const errs = req.flash('error');
  for (const err in errs) {
    res.locals.errors.push({ message: 'An error occurred', debug: err });
  }

  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/delegated', delegatedRouter);
app.use('/apponly', appOnlyRouter);
app.use('/listen', listenRouter);
app.use('/watch', watchRouter);
app.use('/lifecycle', lifecycleRouter);

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

module.exports = app;
