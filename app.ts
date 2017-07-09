const dotenv = require("dotenv").config();
import * as moment from "moment";
import * as child_process from "child_process";
import Backup from "./backup";
import {log} from "./config/logger";

const checkPathForDependency = (dependency: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        child_process.exec(`which ${dependency}`, (err, stdout, stderr) => {
            /* istanbul ignore next */
            if (err) return reject(err);
            return resolve(stdout);
        });
    });
};

const checkDependencies = async () => {
    try {
        const dependencies = ["mongodump", "tar", "md5sum"];

        for (let dep of dependencies) {
            await checkPathForDependency(dep);
        }
    } catch (err) {
        log.error(`Sorry, this script requires mongodump, tar and md5sum`);
        process.exit(1);
    }
};

checkDependencies();

const db = require("./config/db"); // Ensures that Mongo is running

const mongoBackup = new Backup();
mongoBackup.run();
