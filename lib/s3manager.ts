import S3Client from "../config/aws";
import * as fs from "fs";

class S3Manager {

    public upload = (file: { name: string, type: string, path: string }, callback): void => {
        const content = fs.createReadStream(file.path);
        content.on("error", (err) => {
            return callback(err);
        });

        const data = {
            Body: content,
            Key: file.name,
            Metadata: { "Content-Type": file.type }
        };

        S3Client.upload(data, (err, result) => {
            content.close();
            callback(err, result);
        });
    }

    public delete = (key: string): void => {
        S3Client.deleteObject({ Key: key });
    }

}

export default new S3Manager();
