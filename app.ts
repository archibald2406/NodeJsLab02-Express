import express from 'express';
import bodyParser from 'body-parser';
const createError = require('http-errors');

const cookieParser = require('cookie-parser');
const logger = require('morgan');

const driversRouter = require('./routes/drivers-CRUD');
const routesRouter = require('./routes/routes-CRUD');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
let healthCheck: Date;

app.listen(3000, () => {
    console.log('Server started at port: 3000');
    healthCheck = new Date();
});

app.use('/drivers', driversRouter);
app.use('/routes', routesRouter);
app.all('/health-check',(req, res, next) => {
    res.setHeader('Server-start-time', `${healthCheck}`);
    res.setHeader('Time-of-last-request', `${new Date()}`);
    res.setHeader('Server-work-duration', `${new Date().getTime() - healthCheck.getTime()} ms`);
    res.send();
});

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err: any, req: any, res: any, next: any) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
});