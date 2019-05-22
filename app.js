"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const driversRouter = require('./routes/drivers-CRUD');
const routesRouter = require('./routes/routes-CRUD');
const app = express_1.default();
app.use(logger('dev'));
app.use(body_parser_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
let healthCheck;
app.listen(3000, () => {
    console.log('Server started at port: 3000');
    healthCheck = new Date();
});
app.use('/drivers', driversRouter);
app.use('/routes', routesRouter);
app.all('/health-check', (req, res, next) => {
    res.setHeader('Server-start-time', `${healthCheck}`);
    res.setHeader('Time-of-last-request', `${new Date()}`);
    res.setHeader('Server-work-duration', `${new Date().getTime() - healthCheck.getTime()} ms`);
    res.send();
});
app.use((req, res, next) => {
    next(createError(404));
});
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
});
