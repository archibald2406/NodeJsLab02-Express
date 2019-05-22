"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const express = require('express');
const router = express.Router();
router.get('/', (req, res, next) => {
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        let routesData;
        routesData = JSON.parse(jsonData.toString());
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(JSON.stringify(routesData));
    });
});
router.get(/^\/\d+$/, (req, res, next) => {
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        let routesData;
        routesData = JSON.parse(jsonData.toString());
        const route = routesData.find((routesData) => routesData.id === routeId);
        if (route) {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.end(JSON.stringify(route));
        }
        else {
            res.writeHead(404, { 'Message': 'No such route exists' });
            res.end();
        }
    });
});
router.post('/', (req, res, next) => {
    let routesData;
    routesData = req.body;
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        let data;
        data = JSON.parse(jsonData.toString());
        if (data.findIndex(routes => routes.id === routesData.id) === -1) {
            data.push(routesData);
            fs.writeFile('data/routes.json', JSON.stringify(data, null, 2), err => {
                if (err)
                    throw err;
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify(data));
            });
        }
        else {
            res.writeHead(500, { 'Message': 'Route with same id already exists' });
            res.end();
        }
    });
});
router.put(/^\/\d+$/, (req, res, next) => {
    let routeData;
    routeData = req.body;
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        let routesData;
        routesData = JSON.parse(jsonData.toString());
        const routesDataIndex = routesData.findIndex((routesData) => routesData.id === routeId);
        if (routesDataIndex !== -1 && routeData) {
            routeData.id = routesData[routesDataIndex].id;
            routesData[routesDataIndex] = routeData;
            fs.writeFile('data/routes.json', JSON.stringify(routesData, null, 2), err => {
                if (err)
                    throw err;
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify(routesData));
            });
        }
        else {
            res.writeHead(404, { 'Message': 'Route with given id not exists' });
            res.end();
        }
    });
});
router.delete(/^\/\d+$/, (req, res, next) => {
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        let routesData;
        routesData = JSON.parse(jsonData.toString());
        const routesDataIndex = routesData.findIndex((routesData) => routesData.id === routeId);
        if (routesDataIndex !== -1) {
            routesData.splice(routesDataIndex, 1);
            fs.writeFile('data/routes.json', JSON.stringify(routesData, null, 2), err => {
                if (err)
                    throw err;
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify(routesData));
            });
        }
        else {
            res.writeHead(404, { 'Message': 'Route with given id not exists' });
            res.end();
        }
    });
});
router.get(/^\/\d+\/drivers-last-month$/, (req, res, next) => {
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        console.log(req.url);
        let routesData;
        routesData = JSON.parse(jsonData.toString());
        const route = routesData.find((routesData) => routesData.id === routeId);
        let driversIdList;
        if (route) {
            driversIdList = route.drivers;
            fs.readFile('data/drivers.json', (err, jsonData) => {
                if (err)
                    throw err;
                let driversData;
                driversData = JSON.parse(jsonData.toString());
                let monthlyTotalHours = 0;
                for (const driverId of driversIdList) {
                    for (const item of driversData) {
                        if (driverId === item.id) {
                            for (const route of item.routes) {
                                const condition1 = new Date().getMonth() - new Date(route.dateOfRecording).getMonth() === 0
                                    && new Date().getDate() >= new Date(route.dateOfRecording).getDate();
                                const condition2 = new Date().getMonth() - new Date(route.dateOfRecording).getMonth() === 1
                                    && new Date().getDate() <= new Date(route.dateOfRecording).getDate();
                                if (condition1 || condition2) {
                                    monthlyTotalHours += route.time;
                                }
                            }
                        }
                    }
                }
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify({ monthlyTotalHours }));
            });
        }
        else {
            res.writeHead(404, { 'Message': 'Route with given id not exists' });
            res.end();
        }
    });
});
router.get(/^\/\d+\/drivers$/, (req, res, next) => {
    fs.readFile('data/routes.json', (err, jsonData) => {
        if (err)
            throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        let routesData;
        routesData = JSON.parse(jsonData.toString());
        const route = routesData.find((routesData) => routesData.id === routeId);
        let driversIdList;
        if (route) {
            driversIdList = route.drivers;
            fs.readFile('data/drivers.json', (err, jsonData) => {
                if (err)
                    throw err;
                let driversData;
                driversData = JSON.parse(jsonData.toString());
                let driversList = [];
                for (const driverId of driversIdList) {
                    for (const item of driversData) {
                        if (driverId === item.id) {
                            driversList.push(item);
                        }
                    }
                }
                res.writeHead(200, { 'Content-type': 'application/json' });
                res.end(JSON.stringify(driversList));
            });
        }
        else {
            res.writeHead(404, { 'Message': 'Route with given id not exists' });
            res.end();
        }
    });
});
module.exports = router;
