const dotenv = require("dotenv").config();
import * as moment from "moment";
import * as child_process from "child_process";
import Backup from "./backup";
import { log } from "./config/logger";
import CheckDeps from "./lib/checkdeps";

CheckDeps.checkDependencies();

const db = require("./config/db"); // Ensures that Mongo is running

const mongoBackup = new Backup();

log.info(`Backup started - ${mongoBackup.dumpBeginTime.clone().format()}`);

mongoBackup.run().then(res => {
    log.info(`Backup finished - ${moment().format()}`);
    process.exit(1);
}).catch(err => {
    log.error(JSON.stringify(err));
    process.exit(1);
});
