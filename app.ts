import * as shell from "shelljs";
import * as moment from "moment";
import Backup from "./backup";
import {log} from "./config/logger";

const dependencies = ["mongodump", "tar", "md5sum"];

for (let dep of dependencies) {
    if (!shell.which(dep)) {
        shell.echo(`Sorry, this script requires ${dep}`);
        shell.exit(1);
    }
}

const db = require("./config/db"); // Ensures that Mongo is running

const mongoBackup = new Backup();
mongoBackup.run((err, res) => {
    if (err) process.exit(1);
    log.info(`Backup finished - ${moment().format()}`);
});
