/**
 * Parses the giant (currently 122GB) eBird dataset to:
 * - group bird sightings by country
 * - track which are "rare" in the country (< 100 sightings ever)
 */
"use strict";

const fs = require('fs');
const util = require('util');
const es = require('event-stream');

const SOURCE_FILES = ["lines.txt"];
const RARITY_MAX_OBS_THRESHOLD = 100;

const cols = [
  'GLOBAL UNIQUE IDENTIFIER',
  'TAXONOMIC ORDER',
  'CATEGORY',
  'COMMON NAME',
  'SCIENTIFIC NAME',
  'SUBSPECIES COMMON NAME',
  'SUBSPECIES SCIENTIFIC NAME',
  'OBSERVATION COUNT',
  'BREEDING BIRD ATLAS CODE',
  'AGE/SEX',
  'COUNTRY',
  'COUNTRY CODE',
  'STATE',
  'STATE CODE',
  'COUNTY',
  'COUNTY CODE',
  'IBA CODE',
  'BCR CODE',
  'ATLAS BLOCK',
  'LOCALITY',
  'LOCALITY ID',
  'LOCALITY TYPE',
  'LATITUDE',
  'LONGITUDE',
  'OBSERVATION DATE',
  'TIME OBSERVATIONS STARTED',
  'TRIP COMMENTS',
  'SPECIES COMMENTS',
  'OBSERVER ID',
  'FIRST NAME',
  'LAST NAME',
  'SAMPLING EVENT IDENTIFIER',
  'PROTOCOL TYPE',
  'PROJECT CODE',
  'DURATION MINUTES',
  'EFFORT DISTANCE KM',
  'EFFORT AREA HA',
  'NUMBER OBSERVERS',
  'ALL SPECIES REPORTED',
  'GROUP IDENTIFIER',
  'APPROVED',
  'REVIEWED',
  'REASON'
];

const data = {};
var s = fs.createReadStream(SOURCE_FILES[0])
  .pipe(es.split())
  .pipe(es.mapSync(function (line) {
    let parts = line.split('\t');

    let countryCode = parts[11];
    if (!data.hasOwnProperty(countryCode)) {
      data[countryCode] = {};
    }
    let commonName = parts[3];
    if (!data[countryCode].hasOwnProperty(commonName)) {
      data[countryCode][commonName] = {
        obs: [],
        numObs: 0, // for speed
        isRare: true // once RARITY_MAX_OBS_THRESHOLD is reached, this species is no longer considered rare in this country
      };
    }

    // if we've seen a zillion of these species already, ignore the data
    if (!data[countryCode][commonName].isRare) {
      return;
    }

    // clean house.
    if (data[countryCode][commonName].numObs >= RARITY_MAX_OBS_THRESHOLD) {
      data[countryCode][commonName] = {
        obs: [],
        isRare: false
      };
    } else {
      data[countryCode][commonName].obs.push(parts);
      data[countryCode][commonName].numObs++;
    }

  }))
  .on('error', function() {
    console.log('Error while reading file.');
  })
  .on('end', function() {

    // lastly, serialize the data and write to a file
    console.log(JSON.stringify(data));

  });



