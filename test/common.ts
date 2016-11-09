const dotenv = require("dotenv").config();
import "mocha";
import * as shell from "shelljs";
import {log} from "../config/logger";
process.env.NODE_ENV = "test";

const dependencies = ["mongodump", "tar", "md5sum"];

for (let dep of dependencies) {
    if (!shell.which(dep)) {
        log.error(`Sorry, this script requires ${dep}`);
        process.exit(1);
    }
}

const db = require("../config/db"); // Ensures that Mongo is running

// Muahahahaha
const AWSMock = require("aws-sdk-mock");
AWSMock.mock("S3", "upload", (params, callback) => { callback(null, { Location: "https://i.ytimg.com/vi/lb9n9RTLE7o/maxresdefault.jpg" }); });
AWSMock.mock("S3", "deleteObject", "Who cares?");

export const chai = require("chai");
export const expect = chai.expect;
export const should = chai.should();