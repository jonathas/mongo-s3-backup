import S3Client from "../config/aws";
import * as fs from "fs";
import * as mime from "mime";
const uid = require("uid2");

class S3Manager {

    private generateFileName = (uploadedFile): string => {
        const fileExt = uploadedFile.originalFilename.split(".").pop();
        return uid(22) + "." + fileExt;
    }

    public upload = (uploadedFile, callback): void => {
        const key = this.generateFileName(uploadedFile);

        const data = {
            Body: fs.createReadStream(uploadedFile.path),
            Key: key,
            Metadata: { "Content-Type": uploadedFile.type }
        };

        S3Client.upload(data, (err, data) => {
            fs.unlink(uploadedFile.path);
            callback(err, data);
        });
    }

    public delete = (key: string): void => {
        S3Client.deleteObject({ Key: key });
    }

}

export default new S3Manager();
