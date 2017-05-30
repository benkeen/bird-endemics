/**
 * Parses the giant (currently 122GB) eBird dataset to:
 * - group bird sightings by country
 * - track which are "rare" in the country (< 100 sightings ever)
 * - find out which birds are sighted in the most/least countries
 * - find out the first sighting made in a country
 */
const fs = require('fs');
const es = require('event-stream');
const db = require('./database');

const RARITY_MAX_OBS_THRESHOLD = 10;

// ------------------------------------------------------------------------------------------------

const SOURCE_FILES = [
  "./files/file1_0000",
  "./files/file1_0001",
  "./files/file1_0002",
  "./files/file1_0003",
  "./files/file1_0004",
  "./files/file1_0005",
  "./files/file1_0006",
  "./files/file1_0007",
  "./files/file1_0008",
  "./files/file1_0009",
  "./files/file1_0010",
  "./files/file1_0011",
  "./files/file1_0012",
  "./files/file1_0013",
  "./files/file1_0014",
  "./files/file1_0015",
  "./files/file1_0016",
  "./files/file1_0017",
  "./files/file1_0018",
  "./files/file1_0019",
  "./files/file1_0020",
  "./files/file1_0021",
  "./files/file1_0022",
  "./files/file1_0023",
  "./files/file1_0024",
  "./files/file1_0025",
  "./files/file1_0026",
  "./files/file1_0027",
  "./files/file1_0028",
  "./files/file1_0029",
  "./files/file1_0030",
  "./files/file1_0031",
  "./files/file1_0032",
  "./files/file2.txt",
  "./files/file3.txt",
  "./files/file4.txt",
  "./files/file5.txt"
];

/*
 1: locate all the countries
 2: find the number of country-species sightings.
 3: log the rare sightings
*/
const runStep = 2;


let currFileIndex = -1;

// ------------------------------------------------------------------------------------------------


const parseNextFile = function () {
  currFileIndex++;

  console.log('FILE: ' + SOURCE_FILES[currFileIndex]);
  if (currFileIndex <= SOURCE_FILES.length-1) {
    parseFile(SOURCE_FILES[currFileIndex], currFileIndex === 0);
  } else {
    console.log('COMPLETE!');
  }
};


// memory-friendly way of parsing a single giant file, line by line
const parseFile = function (filename, hasHeaderRow) {
  let isRowOne = true;
  let counter = 1;

  fs.createReadStream(filename)
    .pipe(es.split())
    .pipe(es.mapSync(function (line) {
      if (hasHeaderRow && isRowOne) {
        isRowOne = false;
        return;
      }
      processRow(line);

      if (counter % 1000000 === 0) {
        console.log('- lines processed: ' + counter);
      }

      counter++;
    }))
    .on('end', function() {
      if (runStep === 1) {
        parseNextFile();
      } else if (runStep === 2) {
        db.saveObsCount(cache, parseNextFile);
      }
    });
};


const cache = {};
const processRow = function (line) {
  const parts = line.split(/\t/);
  if (parts.length < 30) {
    return;
  }

  if (runStep === 1) {
    const country_name = parts[10];
    const country_code = parts[11];
    maybeAddCountry(country_name, country_code);
  } else if (runStep === 2) {
    db.logCountrySpecies(cache, parts, RARITY_MAX_OBS_THRESHOLD);
  } else if (runtStep === 3) {

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
parseNextFile();
