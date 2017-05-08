const mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'endemics',
  port     : 8889
});


const addCountry = function (country_code, country_name) {
  connection.query({
    sql: 'SELECT * FROM countries WHERE country_code = ?',
    values: [country_code]
  }, function (error, results) {
    if (results.length > 0) {
      return;
    }

    // now add the new country
    connection.query({
      sql: 'INSERT INTO countries (country_code, country_name) VALUES (?, ?)',
      values: [country_code, country_name]
    }, function (err2, results2) {
      if (err2) {
        console.log('- error in addCountry inserting' + country_code + ', ' + country_name);
      } else {
        console.log('added: ', country_name);
      }
    });
  });
};

const clearCommonSightings = function (country_id) {

};


module.exports = {
  addCountry: addCountry,
  clearCommonSightings: clearCommonSightings
};
