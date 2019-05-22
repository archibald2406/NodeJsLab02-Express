import * as fs from "fs";
import {DriverModel} from "../models/driver.model";
import {RouteModel} from "../models/route.model";

const express = require('express');
const router = express.Router();

router.get('/', (req: any, res: any, next: any) => {
    fs.readFile('data/drivers.json',(err, jsonData) => {
        if (err) throw err;
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        res.writeHead(200,{'Content-type': 'application/json'});
        res.end(JSON.stringify(driversData));
    });
});

router.get(/^\/\d+$/, (req: any, res: any, next: any) => {
    fs.readFile('data/drivers.json',(err, jsonData) => {
        if (err) throw err;
        const driverId = parseInt(req.url.replace(/\D+/,''));
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        const driver = driversData.find((driversData: DriverModel) => driversData.id === driverId);
        if (driver) {
            res.writeHead(200,{'Content-type': 'application/json'});
            res.end(JSON.stringify(driver));
        } else {
            res.writeHead(404, {'Message': 'No such driver exists'});
            res.end();
        }
    });
});

router.post('/', (req: any, res: any, next: any) => {
    let driversData: DriverModel;
    driversData = req.body;
    fs.readFile('data/drivers.json',(err, jsonData) => {
        if (err) throw err;
        let data: DriverModel[];
        data = JSON.parse(jsonData.toString());
        if (data.findIndex(drivers => drivers.id === driversData.id) === -1) {
            data.push(driversData);
            fs.writeFile('data/drivers.json', JSON.stringify(data,null,2),err => {
                if (err) throw err;
                res.writeHead(200,{'Content-type': 'application/json'});
                res.end(JSON.stringify(data));
            });
        } else {
            res.writeHead(500, {'Message': 'Driver with same id already exists'});
            res.end();
        }
    });
});

router.put(/^\/\d+$/, (req: any, res: any, next: any) => {
    let driverData: DriverModel;
    driverData = req.body;
    fs.readFile('data/drivers.json',(err, jsonData) => {
        if (err) throw err;
        const driverId = parseInt(req.url.replace(/\D+/,''));
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        const driversDataIndex = driversData.findIndex((driversData: DriverModel) => driversData.id === driverId);

        if (driversDataIndex !== -1 && driverData) {
            driverData.id = driversData[driversDataIndex].id;
            driversData[driversDataIndex] = driverData;
            fs.writeFile('data/drivers.json', JSON.stringify(driversData,null,2),err => {
                if (err) throw err;
                res.writeHead(200,{'Content-type': 'application/json'});
                res.end(JSON.stringify(driversData));
            });
        } else {
            res.writeHead(404, {'Message': 'Driver with given id not exists'});
            res.end();
        }
    });
});

router.delete(/^\/\d+$/, (req: any, res: any, next: any) => {
    fs.readFile('data/drivers.json',(err, jsonData) => {
        if (err) throw err;
        const driverId = parseInt(req.url.replace(/\D+/,''));
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        const driversDataIndex = driversData.findIndex((driversData: DriverModel) => driversData.id === driverId);

        if (driversDataIndex !== -1) {
            driversData.splice(driversDataIndex,1);
            fs.writeFile('data/drivers.json', JSON.stringify(driversData,null,2),err => {
                if (err) throw err;
                res.writeHead(200,{'Content-type': 'application/json'});
                res.end(JSON.stringify(driversData));
            });
        } else {
            res.writeHead(404, {'Message': 'Driver with given id not exists'});
            res.end();
        }
    });
});

router.get(/^\/\d+\/routes$/, (req: any, res: any, next: any) => {
    fs.readFile('data/drivers.json', (err, jsonData) => {
        if (err) throw err;
        const driverId = parseInt(req.url.replace(/\D+/, ''));
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        const driver = driversData.find((driversData: DriverModel) => driversData.id === driverId);
        if (driver) {
            res.writeHead(200, {'Content-type': 'application/json'});
            res.end(JSON.stringify(driver.routes));
        } else {
            res.writeHead(404, {'Message': 'Driver with given id not exists'});
            res.end();
        }
    });
});

router.put(/^\/\d+\/routes\/\d+$/, (req: any, res: any, next: any) => {
    const idArray = req.url.replace(/\D+/g,' ').trim().split(' ');
    const driverId = parseInt(idArray[0]);
    const routeId = parseInt(idArray[1]);

    fs.readFile('data/drivers.json', (err, jsonData) => {
        if (err) throw err;
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        const driver = driversData.find((driversData: DriverModel) => driversData.id === driverId);
        if (driver && driver.totalHours < 20) {
            fs.readFile('data/routes.json',(err, jsonData) => {
                if (err) throw err;
                let routesData: RouteModel[];
                routesData = JSON.parse(jsonData.toString());
                const route = routesData.find((routesData: RouteModel) => routesData.id === routeId);

                if (route.time + driver.totalHours <= 20) {
                    if (driver.routes.findIndex(routes => routes.id === routeId) === -1) {
                        driver.routes.push({
                            id: route.id,
                            title: route.title,
                            time: route.time,
                            dateOfRecording: new Date().toString()
                        });
                        driver.totalHours += route.time;

                        const driversDataIndex = driversData.findIndex((driversData: DriverModel) => driversData.id === driverId);
                        if (driversDataIndex !== -1) {
                            driversData[driversDataIndex] = driver;
                        }

                        fs.writeFile('data/drivers.json', JSON.stringify(driversData,null,2),err => {
                            if (err) throw err;

                            const routesDataIndex = routesData.findIndex((routesData: RouteModel) => routesData.id === routeId);
                            if (routesDataIndex !== -1) {
                                routesData[routesDataIndex].drivers.push(driverId);
                            }

                            fs.writeFile('data/routes.json', JSON.stringify(routesData,null,2),err => {
                                if (err) throw err;
                                res.writeHead(200,{'Content-type': 'application/json'});
                                res.end(JSON.stringify(driversData));
                            });
                        });
                    }
                }
            });
        }
    });
});

router.delete(/^\/\d+\/routes\/\d+$/, (req: any, res: any, next: any) => {
    const idArray = req.url.replace(/\D+/g,' ').trim().split(' ');
    const driverId = parseInt(idArray[0]);
    const routeId = parseInt(idArray[1]);

    fs.readFile('data/drivers.json', (err, jsonData) => {
        if (err) throw err;
        let driversData: DriverModel[];
        driversData = JSON.parse(jsonData.toString());
        const driver = driversData.find((driversData: DriverModel) => driversData.id === driverId);
        if (driver) {
            fs.readFile('data/routes.json',(err, jsonData) => {
                if (err) throw err;
                let routesData: RouteModel[];
                routesData = JSON.parse(jsonData.toString());
                const route = routesData.find((routesData: RouteModel) => routesData.id === routeId);

                if (driver.routes.findIndex(routes => routes.id === routeId) !== -1) {
                    const driverRouteIndex = driver.routes.findIndex(routes => routes.id === routeId);

                    if (driverRouteIndex !== -1) {
                        driver.routes.splice(driverRouteIndex,1);
                        driver.totalHours -= route.time;
                    }
                    const driversDataIndex = driversData.findIndex((driversData: DriverModel) => driversData.id === driverId);
                    if (driversDataIndex !== -1) {
                        driversData[driversDataIndex] = driver;
                    }
                    fs.writeFile('data/drivers.json', JSON.stringify(driversData,null,2),err => {
                        if (err) throw err;
                        const routesDataIndex = routesData.findIndex((routesData: RouteModel) => routesData.id === routeId);
                        if (routesDataIndex !== -1) {
                            const routeDriverIdIndex = routesData[routesDataIndex].drivers.findIndex((driversId: number) => driversId === driverId);
                            if (routeDriverIdIndex !== -1) {
                                routesData[routesDataIndex].drivers.splice(routeDriverIdIndex,1);
                            }
                        }
                        fs.writeFile('data/routes.json', JSON.stringify(routesData,null,2),err => {
                            if (err) throw err;
                            res.writeHead(200,{'Content-type': 'application/json'});
                            res.end(JSON.stringify(driversData));
                        });
                    });
                }
            });
        }
    });
});

module.exports = router;