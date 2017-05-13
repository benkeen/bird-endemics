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

const RARITY_MAX_OBS_THRESHOLD = 10;

// ------------------------------------------------------------------------------------------------

const SOURCE_FILE = "./files/file1.txt";
const hasHeaderRow = true;
const runStep = 1; // 1: locate all the countries. 2: parse the sightings

// ------------------------------------------------------------------------------------------------



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
      processRow(line);

      if (counter % 500000 === 0) {
        console.log('\n --- lines processed: ' + counter + ' ---');
      }
      counter++;
    }))
    .on('end', function() {
      db.saveObsCount();
      console.log("The file was processed.");
    });
};

const cache = {};

const processRow = function (line) {
  const parts = line.split(/\t/);

  if (parts.length < 30) {
    console.log('[invalid row data]');
  }

  if (runStep === 1) {
    const country_name = parts[10];
    const country_code = parts[11];
    maybeAddCountry(country_name, country_code);
  } else if (runStep === 2) {
    db.processSighting(cache, parts, RARITY_MAX_OBS_THRESHOLD);
  }
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

// get parsin'
parseFile(SOURCE_FILE);
