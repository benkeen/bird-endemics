/**
 * Parses the giant (currently 122GB) eBird dataset to:
 * - group bird sightings by country
 * - track which are "rare" in the country (< 100 sightings ever)
 * - find out which birds are sighted in the most/least countries
 * - find out the first sighting made in a country
 */
const fs = require('fs');
const util = require('util');
const es = require('event-stream');
const db = require('./database');

const SOURCE_FILES = ["./files/file3.txt"];
const RARITY_MAX_OBS_THRESHOLD = 20;


// memory-friendly way of parsing a giant file, line by line
const parseFile = function (filename) {
  let isRowOne = true;
  let counter = 1;

  fs.createReadStream(SOURCE_FILES[0])
    .pipe(es.split())
    .pipe(es.mapSync(function (line) {
      if (isRowOne) {
        isRowOne = false;
        return;
      }

      processRow(line);

      if (counter % 100000 === 0) {
        console.log('- row ' + counter);
      }
      counter++;
    }))
    .on('end', function() {
       console.log("The file was saved.");
    });

};


const processRow = function (line) {
  const parts = line.split(/\t/);
  const country_name = parts[10];
  const country_code = parts[11];

  // for each file, run the code twice, first running maybeAddCountry() with processSighting commented out, then the
  // opposite. (don't have to do this!)
  maybeAddCountry(country_name, country_code);
  processSighting(parts);
};



// safely adds a country to the DB. This is a wrapper that memoizes the countries added in this session (i.e. this
// file). It'll work for subsequent files if the country was already in the DB but not stored in `countries`
const countries = {};
const maybeAddCountry = function (country_name, country_code) {
  if (countries.hasOwnProperty(country_name)) {
    return;
  }
  db.addCountry(country_code, country_name);
  countries[country_name] = null;
};


const processSighting = function () {

};

parseFile(SOURCE_FILES[0]);


//    let parts = line.split('\t');
//
//    let countryCode = parts[11];
//    if (!data.hasOwnProperty(countryCode)) {
//      data[countryCode] = {};
//    }
//    let commonName = parts[3];
//    if (!data[countryCode].hasOwnProperty(commonName)) {
//      data[countryCode][commonName] = {
//        obs: [],
//        numObs: 0, // for speed
//        isRare: true // once RARITY_MAX_OBS_THRESHOLD is reached, this species is no longer considered rare in this country
//      };
//    }
//
//    counter++;
//
//    // if we've seen a zillion of these species already, ignore the data
//    if (!data[countryCode][commonName].isRare) {
//      return;
//    }
//
//    // clean house.
//    if (data[countryCode][commonName].numObs >= RARITY_MAX_OBS_THRESHOLD) {
//      data[countryCode][commonName] = {
//        obs: [],
//        isRare: false
//      };
//    } else {
//      data[countryCode][commonName].obs.push(parts);
//      data[countryCode][commonName].numObs++;
//    }
//  }))
//  .on('error', function() {
//    console.log('Error while reading file.');
//  })
//  .on('end', function() {
//
//    // lastly, serialize the data and write to a file
//    fs.writeFile("./results/result-1.txt", JSON.stringify(data), function(err) {
//      if (err) {
//        return console.log(err);
//      }
//      console.log("The file was saved.");
//    });
//  });



