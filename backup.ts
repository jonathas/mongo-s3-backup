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
    }

    private dumpDB = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            child_process.exec(`cd ${this.binDir} && mongodump`, (err, stdout, stderr) => {
                /* istanbul ignore next */
                if (err) return reject(err);
                return resolve(stdout);
            });
        });
    }

    private compressDump = () => {
        this.files.push({
            name: `${this.backupFileName}.tar.bz2`,
            type: "application/x-bzip2",
            path: `${this.binDir}/${this.backupFileName}.tar.bz2`
        });
        return new Promise((resolve, reject) => {
            child_process.exec(`cd ${this.binDir} && tar -cjf ${this.backupFileName}.tar.bz2 dump`, (err, stdout, stderr) => {
                /* istanbul ignore next */
                if (err) return reject(err);
                return resolve(stdout);
            });
        });
    }

    private removeDump = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            child_process.exec(`cd ${this.binDir} && rm -R dump`, (err, stdout, stderr) => {
                /* istanbul ignore next */
                if (err) return reject(err);
                return resolve(stdout);
            });
        });
    }

    private generateHash = () => {
        this.files.push({
            name: `${this.backupFileName}.md5`,
            type: "text/plain",
            path: `${this.binDir}/${this.backupFileName}.md5`
        });
        return new Promise((resolve, reject) => {
            child_process.exec(`cd ${this.binDir} && md5sum ${this.backupFileName}.tar.bz2 > ${this.backupFileName}.md5`, (err, stdout, stderr) => {
                /* istanbul ignore next */
                if (err) return reject(err);
                return resolve(stdout);
            });
        });
    }

    private upload = async () => {
        try {
            for (let file of this.files) {
                await S3Manager.upload(file);
            }
            return new Promise((resolve, reject) => resolve(true));
        } catch (err) {
            /* istanbul ignore next */
            return new Promise((resolve, reject) => reject(err));
        }
    }

    private removeUploaded = async () => {
        try {
            for (let file of this.files) {
                await unlink(file.path);
            }
            return new Promise((resolve, reject) => resolve(true));
        } catch (err) {
            /* istanbul ignore next */
            return new Promise((resolve, reject) => reject(err));
        }
    }

    public run = async () => {
        try {
            /* istanbul ignore next */
            if (process.env.NODE_ENV !== "test") {
                log.info(`Backup started - ${this.dumpBeginTime.clone().format()}`);
            }

            await this.dumpDB();
            await this.compressDump();
            await this.removeDump();
            await this.generateHash();
            await this.upload();
            await this.removeUploaded();

            /* istanbul ignore next */
            if (process.env.NODE_ENV !== "test") {
                log.info(`Backup finished - ${moment().format()}`);
            }
        } catch (err) {
            /* istanbul ignore next */
            log.error(JSON.stringify(err));
            /* istanbul ignore next */
            process.exit(1);
        }
    }

}

export default Backup;