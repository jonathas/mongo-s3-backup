import S3Client from "../config/aws";
import { log } from "../config/logger";
import * as fs from "fs";

class S3Manager {

    public upload = async (file: { name: string, type: string, path: string }): Promise<any> => {
        try {
            const data = {
                Body: fs.createReadStream(file.path),
                Key: file.name,
                ContentType: file.type
            };

            await this.S3ClientUpload(data);

            return new Promise((resolve, reject) => resolve(true));
        } catch (err) {
            /* istanbul ignore next */
            return new Promise((resolve, reject) => reject(err));
        }
    }

    private S3ClientUpload = (data): Promise<any> => {
        return new Promise((resolve, reject) => {
            S3Client.upload(<any>data, (err, data) => {
                /* istanbul ignore next */
                if (err) return reject(err);
                return resolve(data);
            });
        });
    }

}

export default new S3Manager();
