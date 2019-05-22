import * as fs from "fs";
import {RouteModel} from "../models/route.model";
import {DriverModel} from "../models/driver.model";

const express = require('express');
const router = express.Router();

router.get('/', (req: any, res: any, next: any) => {
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        let routesData: RouteModel[];
        routesData = JSON.parse(jsonData.toString());
        res.writeHead(200,{'Content-type': 'application/json'});
        res.end(JSON.stringify(routesData));
    });
});

router.get(/^\/\d+$/, (req: any, res: any, next: any) => {
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        const routeId = parseInt(req.url.replace(/\D+/,''));
        let routesData: RouteModel[];
        routesData = JSON.parse(jsonData.toString());
        const route = routesData.find((routesData: RouteModel) => routesData.id === routeId);
        if (route) {
            res.writeHead(200,{'Content-type': 'application/json'});
            res.end(JSON.stringify(route));
        } else {
            res.writeHead(404, {'Message': 'No such route exists'});
            res.end();
        }
    });
});

router.post('/', (req: any, res: any, next: any) => {
    let routesData: RouteModel;
    routesData = req.body;
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        let data: RouteModel[];
        data = JSON.parse(jsonData.toString());
        if (data.findIndex(routes => routes.id === routesData.id) === -1) {
            data.push(routesData);
            fs.writeFile('data/routes.json', JSON.stringify(data,null,2),err => {
                if (err) throw err;
                res.writeHead(200,{'Content-type': 'application/json'});
                res.end(JSON.stringify(data));
            });
        } else {
            res.writeHead(500, {'Message': 'Route with same id already exists'});
            res.end();
        }
    });
});

router.put(/^\/\d+$/, (req: any, res: any, next: any) => {
    let routeData: RouteModel;
    routeData = req.body;
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        const routeId = parseInt(req.url.replace(/\D+/,''));
        let routesData: RouteModel[];
        routesData = JSON.parse(jsonData.toString());
        const routesDataIndex = routesData.findIndex((routesData: RouteModel) => routesData.id === routeId);

        if (routesDataIndex !== -1 && routeData) {
            routeData.id = routesData[routesDataIndex].id;
            routesData[routesDataIndex] = routeData;
            fs.writeFile('data/routes.json', JSON.stringify(routesData,null,2),err => {
                if (err) throw err;
                res.writeHead(200,{'Content-type': 'application/json'});
                res.end(JSON.stringify(routesData));
            });
        } else {
            res.writeHead(404, {'Message': 'Route with given id not exists'});
            res.end();
        }
    });
});

router.delete(/^\/\d+$/, (req: any, res: any, next: any) => {
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        const routeId = parseInt(req.url.replace(/\D+/,''));
        let routesData: RouteModel[];
        routesData = JSON.parse(jsonData.toString());
        const routesDataIndex = routesData.findIndex((routesData: RouteModel) => routesData.id === routeId);

        if (routesDataIndex !== -1) {
            routesData.splice(routesDataIndex,1);
            fs.writeFile('data/routes.json', JSON.stringify(routesData,null,2),err => {
                if (err) throw err;
                res.writeHead(200,{'Content-type': 'application/json'});
                res.end(JSON.stringify(routesData));
            });
        } else {
            res.writeHead(404, {'Message': 'Route with given id not exists'});
            res.end();
        }
    });
});

router.get(/^\/\d+\/drivers-last-month$/, (req: any, res: any, next: any) => {
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        console.log(req.url);
        let routesData: RouteModel[];
        routesData = JSON.parse(jsonData.toString());
        const route = routesData.find((routesData: RouteModel) => routesData.id === routeId);
        let driversIdList: number[];
        if (route) {
            driversIdList = route.drivers;
            fs.readFile('data/drivers.json',(err, jsonData) => {
                if (err) throw err;

                let driversData: DriverModel[];
                driversData = JSON.parse(jsonData.toString());

                let monthlyTotalHours: number = 0;

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
                res.writeHead(200, {'Content-type': 'application/json'});
                res.end(JSON.stringify({monthlyTotalHours}));
            });
        } else {
            res.writeHead(404, {'Message': 'Route with given id not exists'});
            res.end();
        }
    });
});

router.get(/^\/\d+\/drivers$/, (req: any, res: any, next: any) => {
    fs.readFile('data/routes.json',(err, jsonData) => {
        if (err) throw err;
        const routeId = parseInt(req.url.replace(/\D+/, ''));
        let routesData: RouteModel[];
        routesData = JSON.parse(jsonData.toString());
        const route = routesData.find((routesData: RouteModel) => routesData.id === routeId);
        let driversIdList: number[];
        if (route) {
            driversIdList = route.drivers;
            fs.readFile('data/drivers.json',(err, jsonData) => {
                if (err) throw err;
                let driversData: DriverModel[];
                driversData = JSON.parse(jsonData.toString());
                let driversList: DriverModel[] = [];

                for (const driverId of driversIdList) {
                    for (const item of driversData) {
                        if (driverId === item.id) {
                            driversList.push(item);
                        }
                    }
                }
                res.writeHead(200, {'Content-type': 'application/json'});
                res.end(JSON.stringify(driversList));
            });
        } else {
            res.writeHead(404, {'Message': 'Route with given id not exists'});
            res.end();
        }
    });
});

module.exports = router;