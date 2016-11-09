import * as path from "path";
import * as fs from "fs";
import * as async from "async";
import * as shell from "shelljs";
import { expect } from "./common";
import Backup from "../backup";

describe("# Backup", () => {
    let mongoBackup: Backup;

    before((done) => {
        mongoBackup = new Backup();
        done();
    });

    it("should dump the DBs", (done) => {
        mongoBackup.dumpDB((err, res) => {
            fs.stat(`${mongoBackup.binDir}/dump`, (err, res) => {
                expect(err).to.be.null;
                done();
            });
        });
    });

    it("should compress the dump", (done) => {
        async.series([
            mongoBackup.dumpDB,
            mongoBackup.compressDump
        ], (err, res) => {
            fs.stat(`${mongoBackup.binDir}/dump`, (err, res) => {
                expect(err).to.not.be.null; // Expect that the dir got deleted
                fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.tar.bz2`, (err, res) => {
                    expect(err).to.be.null; // Expect that the file is there
                    shell.exec(`rm -R ${mongoBackup.binDir}/*.tar.bz2`);
                    done();
                });
            });
        });
    });

    it("should generate a hash of the compressed dump", (done) => {
        async.series([
            mongoBackup.dumpDB,
            mongoBackup.compressDump,
            mongoBackup.generateHash
        ], (err, res) => {
            fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`, (err, res) => {
                expect(err).to.be.null; // Expect that the file is there
                shell.exec(`md5sum --status -c ${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`, (code, stdout, stderr) => {
                    expect(code).to.equal(0);
                    shell.exec(`rm -R ${mongoBackup.binDir}/*.tar.bz2`);
                    shell.exec(`rm -R ${mongoBackup.binDir}/*.md5`);
                    done();
                });
            });
        });
    });

    it("should upload the generated files", (done) => {
        mongoBackup.run((err, res) => {
            expect(err).to.be.null;
            fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.md5`, (err, res) => {
                expect(err).to.not.be.null; // Expect that the file got deleted
                fs.stat(`${mongoBackup.binDir}/${mongoBackup.backupFileName}.tar.bz2`, (err, res) => {
                    expect(err).to.not.be.null; // Expect that the file got deleted
                    done();
                });
            });
        });
    });
});