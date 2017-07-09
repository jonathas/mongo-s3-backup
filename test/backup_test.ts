import * as path from "path";
import * as child_process from "child_process";
import * as fs from "fs";
import { chai } from "./common";
import Backup from "../backup";

const removeFile = (filePath: string) => {
    return new Promise((resolve, reject) => {
        child_process.exec(`rm -R ${filePath}`, (err, stdout, stderr) => {
            if (err) return reject(err);
            return resolve(stdout);
        });
    });
};

describe("# Backup", () => {
    let mongoBackup: Backup;

    beforeEach((done) => {
        mongoBackup = new Backup();
        done();
    });

    it("should dump the DBs", (done) => {
        // Casting to any so we can access the private methods for testing purposes
        (<any>mongoBackup).dumpDB().then(res => {
            fs.stat(`${mongoBackup.binDir}/dump`, (err, res) => {
                chai.expect(err).to.be.null;
                done();
            });
        });
    });

    it("should compress the dump", (done) => {
        (<any>mongoBackup).dumpDB()
            .then(res => (<any>mongoBackup).compressDump())
            .then(res => (<any>mongoBackup).removeDump())
            .then(res => {
                fs.stat(`${mongoBackup.binDir}/dump`, (err, res) => {
                    chai.expect(err).to.not.be.null; // Expect that the dir got deleted
                    fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.tar.bz2`, (err, res) => {
                        chai.expect(err).to.be.null; // Expect that the file is there
                        child_process.exec(`rm -R ${mongoBackup.binDir}/*.tar.bz2`, (err, stdout, stderr) => {
                            done();
                        });
                    });
                });
            });
    });

    it("should generate a hash of the compressed dump", (done) => {
        (<any>mongoBackup).dumpDB()
            .then(res => (<any>mongoBackup).compressDump())
            .then(res => (<any>mongoBackup).generateHash())
            .then(res => {
                fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`, (err, res) => {
                    chai.expect(err).to.be.null; // Expect that the file is there
                    child_process.exec(`cd ${mongoBackup.binDir} && md5sum --status -c ${mongoBackup.backupFileName}.md5`, (err, stdout, stderr) => {
                        chai.expect(err).to.be.null;
                        removeFile(`${mongoBackup.binDir}/*.tar.bz2`)
                            .then(res => removeFile(`${mongoBackup.binDir}/*.md5`))
                            .then(res => done());
                    });
                });
            });
    });

    it("should upload the generated files", (done) => {
        mongoBackup.run().then(res => {
            fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`, (err, res) => {
                chai.expect(err).to.not.be.null; // Expect that the file got deleted
                fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.tar.bz2`, (err, res) => {
                    chai.expect(err).to.not.be.null; // Expect that the file got deleted
                    done();
                });
            });
        });
    });
});