import S3Client from "../config/aws";
import * as fs from "fs";

class S3Manager {

    public upload = (file: { name: string, type: string, path: string }, callback): void => {
        const data = {
            Body: fs.createReadStream(file.path),
            Key: file.name,
            Metadata: { "Content-Type": file.type }
        };

        S3Client.upload(data, (err, data) => {
            fs.unlink(file.path);
            callback(err, data);
        });
    }

    public delete = (key: string): void => {
        S3Client.deleteObject({ Key: key });
    }

}

export default new S3Manager();
