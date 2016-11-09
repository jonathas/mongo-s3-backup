import * as path from "path";
import * as async from "async";
import * as shell from "shelljs";
import * as moment from "moment";
import { log } from "./config/logger";
import S3Manager from "./lib/s3manager";

class Backup {

    binDir: string;
    dumpEndTime: string;
    backupFileName: string;
    files = [];

    constructor() {
        log.info(`Backup started - ${moment().format()}`);
        this.binDir = path.resolve(__dirname);
        shell.cd(this.binDir);
    }

    dumpDB = (callback) => {
        shell.exec("mongodump --quiet", (code, stdout, stderr) => {
            /* istanbul ignore next */
            if (code !== 0) return callback(stderr);
            this.dumpEndTime = moment().utc().format("YYYY-MM-DDTHHmmss");
            callback(null, stdout);
        });
    }

    compressDump = (callback) => {
        this.backupFileName = `mongodump_${this.dumpEndTime}`;
        this.files.push({
            name: `${this.backupFileName}.tar.bz2`,
            type: "application/x-bzip2",
            path: `${this.binDir}/${this.backupFileName}.tar.bz2`
        });
        shell.exec(`tar -cjf ${this.backupFileName}.tar.bz2 dump`, (code, stdout, stderr) => {
            shell.exec("rm -R dump");
            /* istanbul ignore next */
            if (code !== 0) return callback(stderr);
            callback(null, stdout);
        });
    }

    generateHash = (callback) => {
        this.files.push({
            name: `${this.backupFileName}.md5`,
            type: "text/plain",
            path: `${this.binDir}/${this.backupFileName}.md5`
        });
        shell.exec(`md5sum ${this.backupFileName}.tar.bz2 > ${this.backupFileName}.md5`, (code, stdout, stderr) => {
            /* istanbul ignore next */
            if (code !== 0) return callback(stderr);
            callback(null, stdout);
        });
    }

    upload = (callback) => {
        async.every(this.files, (file, loopCallback) => {
            S3Manager.upload(file, loopCallback);
        }, callback);
    }

    run = (callback) => {
        async.series([
            this.dumpDB,
            this.compressDump,
            this.generateHash,
            this.upload
        ], (err, res) => {
            if (err) {
                log.error(JSON.stringify(err));
                return callback(JSON.stringify(err));
            }
            callback(null, res);
        });
    }

}

export default Backup;