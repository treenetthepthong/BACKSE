var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const cors = require('cors');
const bodyParser = require('body-parser');
var app = express();


const setTimeRoutes = require('./routes/setTimeRoutes');
const authRoutes = require('./routes/authRoutes');
const AvailableTimesRoutes = require('./routes/AvailableTimesRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
const historyRoutes = require('./routes/historyRoutes');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/settime', setTimeRoutes);
app.use('/auth', authRoutes);
app.use('/AvailableTimes', AvailableTimesRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/history', historyRoutes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
