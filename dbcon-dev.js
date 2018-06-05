var mysql = require('mysql');

// development
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'volunteer_now_development'
});

module.exports.pool = pool;