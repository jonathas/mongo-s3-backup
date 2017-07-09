const dotenv = require("dotenv").config();
import "mocha";
import {log} from "../config/logger";
import CheckDeps from "../lib/checkdeps";
process.env.NODE_ENV = "test";

CheckDeps.checkDependencies();

const db = require("../config/db"); // Ensures that Mongo is running

// Muahahahaha
const AWSMock = require("aws-sdk-mock");
AWSMock.mock("S3", "upload", (params, callback) => { callback(null, { Location: "https://i.ytimg.com/vi/lb9n9RTLE7o/maxresdefault.jpg" }); });
AWSMock.mock("S3", "deleteObject", "Who cares?");

export const chai = require("chai");
export const should = chai.should();