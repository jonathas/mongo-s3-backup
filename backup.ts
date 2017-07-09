import * as child_process from "child_process";
import * as path from "path";
import * as util from "util";
import * as moment from "moment";
import { log } from "./config/logger";
import S3Manager from "./lib/s3manager";
const unlink = util.promisify(require("fs").unlink);

class Backup {

    binDir: string;
    dumpBeginTime: moment.Moment;
    backupFileName: string;
    files = [];

    constructor() {
        this.dumpBeginTime = moment();
        this.backupFileName = `mongodump_${this.dumpBeginTime.clone().utc().format("YYYY-MM-DDTHHmmss")}`;
        this.binDir = path.resolve(__dirname);
        shell.cd(this.binDir);
    }

    dumpDB = (callback) => {
        shell.exec("mongodump", (code, stdout, stderr) => {
            /* istanbul ignore next */
            if (code !== 0) return callback(stderr);
            callback(null, stdout);
        });
    }

    compressDump = (callback) => {
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

    private removeUploaded = () => {
        async.every(this.files, (file, loopCallback) => {
            fs.unlink(file.path, (err) => {
                loopCallback(null, true);
            });
        }, callback);
    }

    public run = () => {
        log.info(`Backup started - ${this.dumpBeginTime.clone().format()}`);
        async.series([
            this.dumpDB,
            this.compressDump,
            this.generateHash,
            this.upload,
            this.removeUploaded
        ], (err, res) => {
            /* istanbul ignore next */
            if (err) {
                log.error(JSON.stringify(err));
                process.exit(1);
            }
            log.info(`Backup finished - ${moment().format()}`);
            callback(null, res);
        });
    }

}

export default Backup;