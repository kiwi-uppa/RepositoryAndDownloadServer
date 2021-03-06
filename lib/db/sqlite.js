var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var utils = require("./utils");
var fsys = require("../filesystem");

var file = process.cwd() + "/lib/db/server.db";
var exists = fs.existsSync(file);

exports.getUser = function (name, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM USERS WHERE NAME='" + name + "'";
        sql.get(query, function (err, row) {
            if (err) {
                cb(err, null);
            } else {
                cb(null, row);
            }
        });
    });
    sql.close();
};

exports.getUsers = function (cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM USERS";
        sql.all(query, function (err, rows) {
            if (err) {
                cb(err);
            } else {
                cb(null, rows);
            }
        });
    });
    sql.close();
};

exports.setAdmin = function (name, isAdmin, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "UPDATE USERS SET ADMIN = '" + isAdmin + "' WHERE NAME = '" + name + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.setPassword = function (name, hash, guid, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "UPDATE USERS SET PASSWD = '" + hash + "', SEL = '" + guid + "' WHERE NAME = '" + name + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.addUser = function (name, hash, guid, isAdmin, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "INSERT INTO USERS VALUES ('" + name + "', '" + hash + "', '" + guid + "', '" + isAdmin + "' )";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.deleteUser = function (name, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "DELETE FROM USERS WHERE NAME = '" + name + "'";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
            } else {
                cb(null);
            }
        });
    });
    sql.close();
};

exports.setRootFolder = function (root_folder, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "DELETE FROM ROOT_FOLDER";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
                sql.close();
                return;
            }
            query = "INSERT INTO ROOT_FOLDER VALUES ('" + root_folder + "')";
            sql.run(query, function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
            sql.close();
        });
    });
};

exports.getRootFolder = function (cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM ROOT_FOLDER";
        sql.all(query, function (err, rows) {
            if (err) {
                cb(err);
            } else {
                cb(null, rows);
            }
        });
    });
    sql.close();
};

exports.setDownloadFolder = function (download_folder, cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "DELETE FROM DOWNLOAD_FOLDER";
        sql.run(query, function (err) {
            if (err) {
                cb(err);
                sql.close();
                return;
            }
            query = "INSERT INTO DOWNLOAD_FOLDER VALUES ('" + download_folder + "')";
            sql.run(query, function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
            sql.close();
        });
    });
};

exports.getDownloadFolder = function (cb) {
    var sql = new sqlite3.Database(file);
    sql.serialize(function () {
        var query = "SELECT * FROM DOWNLOAD_FOLDER";
        sql.all(query, function (err, rows) {
            if (err) {
                cb(err);
            } else {
                cb(null, rows);
            }
        });
    });
    sql.close();
};

function createDb() {
    var db;

    if (!exists) {
        db = new sqlite3.Database(file, 'OPEN_CREATE');
        db.serialize(function () {
            var cmd = "CREATE TABLE 'USERS' ('NAME' VARCHAR PRIMARY KEY UNIQUE NOT NULL, 'PASSWD' VARCHAR NOT NULL, 'SEL' VARCHAR NOT NULL, 'ADMIN' BOOLEAN DEFAULT 'FALSE' NOT NULL)";
            db.run(cmd);

            var guid = utils.rand_guid();
            cmd = "INSERT INTO USERS VALUES ('root', '" + utils.hash("alpine", guid) + "', '" + guid + "', 'TRUE' )";
            db.run(cmd);

            cmd = "CREATE TABLE 'ROOT_FOLDER' ('PATH' VARCHAR PRIMARY KEY UNIQUE NOT NULL)";
            db.run(cmd);

            cmd = "INSERT INTO ROOT_FOLDER VALUES ('" + fsys.filesystem.getUserHome() + "')";
            db.run(cmd);

            cmd = "CREATE TABLE 'DOWNLOAD_FOLDER' ('PATH' VARCHAR PRIMARY KEY UNIQUE NOT NULL)";
            db.run(cmd);

            cmd = "INSERT INTO DOWNLOAD_FOLDER VALUES ('" + fsys.filesystem.getUserHome() + "/Downloads" + "')";
            db.run(cmd);
        });

        db.close();
    }
}

createDb();