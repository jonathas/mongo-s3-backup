process.env.NODE_ENV = "test";

import "mocha";

// Muahahahaha
const AWSMock = require("aws-sdk-mock");
AWSMock.mock("S3", "upload", (params, callback) => { callback(null, { Location: "https://i.ytimg.com/vi/lb9n9RTLE7o/maxresdefault.jpg" }); });
AWSMock.mock("S3", "deleteObject", "Who cares?");

export const chai = require("chai");
export const expect = chai.expect;
export const should = chai.should();