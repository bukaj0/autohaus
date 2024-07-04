const http = require('http');
const oracledb = require('oracledb');

// Config settings
config = {
    user: 'a12232637',
    password: 'dbs24',
    connectString: 'oracle19.cs.univie.ac.at:1521/orclcdb'
};

// Oracle Instant Client directory
const oraclelib = __dirname + '/instantclient_19_8';  // Make sure to use forward slashes

// Initialize Oracle Client
try {
    oracledb.initOracleClient({ libDir: oraclelib });
} catch (err) {
    console.error("Error initializing Oracle Client with the specified directory: ", oraclelib);
    console.error(err);
    process.exit(1);
}

// Connection function
var connect = function() {
    return new Promise(function(resolve, reject) {
        oracledb.getConnection(config, function(err, conn) {
            if (err) {
                console.log("Critical error: can't connect to db - check username and password");
                reject(err);
            } else {
                connect.connection = conn;
                resolve(conn);
            }
        });
    });
};

// Exports
module.exports.connection = connect;
module.exports.oracledb = oracledb;
