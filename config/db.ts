const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
let dbName;

switch (process.env.NODE_ENV) {
     case "test":
          dbName = "mydb_test";
          break;
     case "production":
          dbName = "mydb";
          break;
     default:
          dbName = "mydb_dev";
}

const host = process.env.MONGO_PORT_27017_TCP_ADDR || "localhost";
const port = process.env.MONGO_PORT_27017_TCP_PORT || 27017;

mongoose.connect(`mongodb://${host}:${port}/${dbName}`);

mongoose.connection.on("error", (err) => {
    if (err.message.indexOf("ECONNREFUSED") !== -1) {
       console.log("Error: The server was not able to reach MongoDB.\nMaybe it's not running?");
       process.exit(1);
    } else {
       throw err;
    }
});
