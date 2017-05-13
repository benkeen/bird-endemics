const mysql = require('mysql');

// connect to the database
const connection = mysql.createPool({
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


const addNewCountrySpecies = function (countrySpeciesId, parts) {
  const countryCode = parts[11];
  const commonName = parts[3];
  const sciName = parts[4];

  connection.query({
    sql: `
      INSERT INTO country_species
      SET country_species_id = ?,
          country_code = ?,
          common_name = ?,
          sci_name = ?,
          num_obs = 0,
          over_threshold = 'no'
    `,
    values: [countrySpeciesId, countryCode, commonName, sciName]
  }, function (err, result) {
    if (err) {
      console.log('error adding to country_species (', countryCode, commonName, sciName, ')');
      return;
    }
    // now add the first record for this country
    addSighting(countrySpeciesId, parts);
  });
};


const addSighting = function(countrySpeciesId, parts) {
//  connection.query({
//    sql: 'UPDATE country_species SET num_obs = num_obs + 1 WHERE country_species_id = ?',
//    values: [countrySpeciesId]
//  }, function (err1, results) {
//    if (err1) {
//      return;
//    }
    connection.query({
      sql: 'INSERT INTO rare_sightings (country_species_id, row_data) VALUES (?, ?)',
      values: [countrySpeciesId, parts.join('\t')]
    }, function (err2, results) {
    });
//  });
};


const markCountrySpeciesAsComplete = function (countrySpeciesId) {
  connection.query({
    sql: 'UPDATE country_species SET over_threshold = "yes" WHERE id = ?',
    values: [countrySpeciesId]
  }, function (error, results) {
    if (error) {
      console.log('error setting OVER', error);
    }
    connection.query({
      sql: 'DELETE FROM rare_sightings WHERE id = ?',
      values: [countrySpeciesId]
    }, function (err2, results) {
      console.log(`Threshold met for ${countrySpeciesId}. Cleared rare_sightings.`);
    });
  });
};


const cache = {};
let id = 1;

const processSighting = function (parts, maxThreshold) {
  let countryCode = parts[11];
  let sciName = parts[4];

  let key = countryCode + sciName;
  if (!cache.hasOwnProperty(key)) {
    const newKey = id++;
    cache[key] = [1, newKey, false]; // count, over-threshold
    addNewCountrySpecies(newKey, parts);
  } else if (!cache[key][2]) {
    cache[key][0]++;
    if (cache[key][0] > maxThreshold) {
      markCountrySpeciesAsComplete(cache[key][1]);
      cache[key][2] = true;
    } else {
      addSighting(cache[key][1], parts);
    }
  }
};


module.exports = {
  addCountry: addCountry,
  addNewCountrySpecies: addNewCountrySpecies,
  addSighting: addSighting,
  markCountrySpeciesAsComplete: markCountrySpeciesAsComplete,
  processSighting
};
