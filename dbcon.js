var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs361_vanoverc',
  password        : '3148',
  database        : 'cs361_vanoverc'
});
module.exports.pool = pool;
