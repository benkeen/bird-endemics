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

const SOURCE_FILES = ["./files/file5.txt"];
const RARITY_MAX_OBS_THRESHOLD = 20;


// memory-friendly way of parsing a giant file, line by line
const parseFile = function (filename) {
  let isRowOne = true;
  let counter = 1;

  fs.createReadStream(filename)
    .pipe(es.split())
    .pipe(es.mapSync(function (line) {
      if (isRowOne) {
        isRowOne = false;
        return;
      }
//      if (counter > 10000) {
//        return;
//      }
      processRow(line);

      if (counter % 500000 === 0) {
        console.log('- lines processed: ' + counter);
      }
      counter++;
    }))
    .on('end', function() {
       console.log("The file was processed.");
    });
};


const processRow = function (line) {
  const parts = line.split(/\t/);
//  const country_name = parts[10];
//  const country_code = parts[11];

  if (parts.length < 30) {
    console.log('[invalid row data]');
  }

  // for each file, run the code twice, first running maybeAddCountry() with processSighting commented out, then the
  // opposite. (don't have to do this!)
  //maybeAddCountry(country_name, country_code);
  db.processSighting(parts, RARITY_MAX_OBS_THRESHOLD);
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


parseFile(SOURCE_FILES[0]);


