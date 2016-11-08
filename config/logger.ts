import * as winston from "winston";

export const log = new winston.Logger({
    transports: [
        new (winston.transports.File)({
            name: "error-file",
            filename: "error.log",
            level: "error"
        }),
        new winston.transports.Console({
            level: "debug",
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});
