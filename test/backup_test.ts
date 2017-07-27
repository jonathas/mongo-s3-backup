require("./common");
import * as path from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import * as chai from "chai";
import Backup from "../backup";

const removeFile = (filePath: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        child_process.exec(`rm -R ${filePath}`, (err, stdout, stderr) => {
            if (err) return reject(err);
            return resolve(stdout);
        });
    });
};

const statFile = (filePath: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, res) => {
            if (err) return reject(err);
            return resolve(res);
        });
    });
};

describe("# Backup", () => {
    let mongoBackup: Backup;

    beforeEach((done) => {
        mongoBackup = new Backup();
        done();
    });

    it("should dump the DBs", async () => {
        // Casting to any so we can access the private methods for testing purposes
        try {
            await (<any>mongoBackup).dumpDB();
            await statFile(`${mongoBackup.binDir}/dump`);
            return new Promise((resolve, reject) => resolve(true));
        } catch (err) {
            return new Promise((resolve, reject) => reject(err));
        }
    });

    it("should compress the dump", () => {
        return (<any>mongoBackup).dumpDB()
            .then(res => (<any>mongoBackup).compressDump())
            .then(res => (<any>mongoBackup).removeDump())
            .then(res => {
                return statFile(`${mongoBackup.binDir}/dump`).catch(err => {
                    chai.expect(err).to.not.be.null; // Expect that the dir got deleted
                });
            })
            .then(res => {
                return statFile(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.tar.bz2`);
            })
            .then(res => {
                return removeFile(`${mongoBackup.binDir}/*.tar.bz2`);
            });
    });

    it("should generate a hash of the compressed dump", async () => {
        try {
            await (<any>mongoBackup).dumpDB();
            await (<any>mongoBackup).compressDump();
            await (<any>mongoBackup).generateHash();
            await statFile(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`);
            await new Promise((resolve, reject) => {
                child_process.exec(`cd ${mongoBackup.binDir} && md5sum --status -c ${mongoBackup.backupFileName}.md5`, (err, stdout, stderr) => {
                    if (err) return reject(err);
                    return resolve(stdout);
                });
            });
            await removeFile(`${mongoBackup.binDir}/*.md5`);
            await removeFile(`${mongoBackup.binDir}/*.tar.bz2`);

            return new Promise((resolve, reject) => resolve(true));
        } catch (err) {
            return new Promise((resolve, reject) => reject(err));
        }
    });

    it("should upload the generated files", () => {
        return mongoBackup.run()
            .then(res => {
                return statFile(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`).catch(err => {
                    chai.expect(err).to.not.be.null; // Expect that the file got deleted
                });
            })
            .then(res => {
                return statFile(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.tar.bz2`).catch(err => {
                    chai.expect(err).to.not.be.null; // Expect that the file got deleted
                });
            });
    });
});