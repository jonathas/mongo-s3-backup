import * as path from "path";
import * as async from "async";
import * as shell from "shelljs";
import * as moment from "moment";
import {log} from "./config/logger";
import S3Manager from "./lib/s3manager";

class Backup {

    private dumpEndTime: string;
    private backupFileName: string;
    private files = [];

    private dumpDB = (callback) => {
        shell.exec("mongodump", (code, stdout, stderr) => {
            if (code !== 0) return callback(stderr);
            this.dumpEndTime = moment().utc().format("YYYY-MM-DDTHHmmss");
            callback(null, stdout);
        });
    }

    private compressDump = (callback) => {
        this.backupFileName = `mongodump_${this.dumpEndTime}`;
        this.files.push({
            name: `${this.backupFileName}.tar.bz2`,
            type: "application/x-bzip2",
            path: path.basename(__dirname)
        });
        shell.exec(`tar -cjvf ${this.backupFileName}.tar.bz2 dump`, (code, stdout, stderr) => {
            if (code !== 0) return callback(stderr);
            callback(null, stdout);
        });
    }

    private generateHash = (callback) => {
        this.files.push({
            name: `${this.backupFileName}.md5`,
            type: "text/plain",
            path: path.basename(__dirname)
        });
        shell.exec(`md5sum ${this.backupFileName}.tar.bz2 > ${this.backupFileName}.md5`, (code, stdout, stderr) => {
            if (code !== 0) return callback(stderr);
            callback(null, stdout);
        });
    }

    private upload = (callback) => {
        async.every(this.files, (file, loopCallback) => {
            S3Manager.upload(file, loopCallback);
        }, callback);
    }

    public run = (callback) => {
        async.series([
            this.dumpDB,
            this.compressDump,
            this.generateHash,
            this.upload
        ], (err, res) => {
            if (err) {
                log.error(JSON.stringify(err));
                process.exit(1);
            }
            callback(null, res);
        });
    }

}

export default Backup;