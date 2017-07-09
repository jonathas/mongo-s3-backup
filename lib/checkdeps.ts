import * as child_process from "child_process";
import { log } from "../config/logger";

class CheckDeps {

    private dependencies = ["mongodump", "tar", "md5sum"];

    private checkPathForDependency = (dependency: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            child_process.exec(`which ${dependency}`, (err, stdout, stderr) => {
                /* istanbul ignore next */
                if (err) return reject(err);
                return resolve(stdout);
            });
        });
    }

    public checkDependencies = async () => {
        try {
            for (let dep of this.dependencies) {
                await this.checkPathForDependency(dep);
            }
        } catch (err) {
            /* istanbul ignore next */
            log.error(`Sorry, this script requires mongodump, tar and md5sum`);
            /* istanbul ignore next */
            process.exit(1);
        }
    }

}

export default new CheckDeps();
