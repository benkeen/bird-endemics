<?php

// prevent any timeouts
set_time_limit(0);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//const cols = [
//'GLOBAL UNIQUE IDENTIFIER',
//'TAXONOMIC ORDER',
//'CATEGORY',
//'COMMON NAME',
//'SCIENTIFIC NAME',
//'SUBSPECIES COMMON NAME',
//'SUBSPECIES SCIENTIFIC NAME',
//'OBSERVATION COUNT',
//'BREEDING BIRD ATLAS CODE',
//'AGE/SEX',
//'COUNTRY',
//'COUNTRY CODE',
//'STATE',
//'STATE CODE',
//'COUNTY',
//'COUNTY CODE',
//'IBA CODE',
//'BCR CODE',
//'ATLAS BLOCK',
//'LOCALITY',
//'LOCALITY ID',
//'LOCALITY TYPE',
//'LATITUDE',
//'LONGITUDE',
//'OBSERVATION DATE',
//'TIME OBSERVATIONS STARTED',
//'TRIP COMMENTS',
//'SPECIES COMMENTS',
//'OBSERVER ID',
//'FIRST NAME',
//'LAST NAME',
//'SAMPLING EVENT IDENTIFIER',
//'PROTOCOL TYPE',
//'PROJECT CODE',
//'DURATION MINUTES',
//'EFFORT DISTANCE KM',
//'EFFORT AREA HA',
//'NUMBER OBSERVERS',
//'ALL SPECIES REPORTED',
//'GROUP IDENTIFIER',
//'APPROVED',
//'REVIEWED',
//'REASON'
//];

require_once("./code.php");

$db_name = "endemics";
$hostname = "localhost";
$username = "root";
$password = "root";

$countries = []; // for memoization of country additions


$db = new Database($hostname, $username, $password, $db_name);


$FILE = "./files/file1.txt";
$RARITY_MAX_OBS_THRESHOLD = 10;

parseFile($FILE);


// memory-friendly way of parsing a giant file, line by line
function parseFile($filename) {
    $handle = @fopen($filename, "r");
    if (!$handle) {
        echo "no handle.";
        return;
    }
    echo "...";

    $counter = 1;
    while (($buffer = fgets($handle, 4096)) !== false) {
        if ($counter == 1) {
            continue;
        }
        processRow($buffer);
        $counter++;

        if ($counter % 10000 == 0) {
            echo "[$counter]<br />";
        }
    }
    fclose($handle);
}


function processRow($string) {
    $parts = mb_split("\t", $string);

    $country_name = $parts[10];
    $country_code = $parts[11];

    maybeAddCountry($country_name, $country_code);
    processSighting($parts);
}


function maybeAddCountry ($country_name, $country_code) {
    global $countries, $db;

    if (!in_array($country_code, $countries)) {
        $db->query("SELECT * FROM countries WHERE country_code = :country_code");
        $db->bind(":country_code", $country_code);
        $db->execute();

        $result = $db->fetch();

        if (!empty($result)) {
            return;
        }

        // add it!
        $db->query("INSERT IGNORE INTO countries (country_name, country_code) VALUES (:country_name, :country_code)");
        $db->bind("country_name", $country_name);
        $db->bind("country_code", $country_code);
        $db->execute();

        // memoize it for subsequent calls
        $countries[] = $country_name;
    }
}


function processSighting($parts) {
    global $db, $RARITY_MAX_OBS_THRESHOLD;

    $country_code = $parts[11];
    $sci_name = $parts[4];

    $db->query("
        SELECT *
        FROM country_species
        WHERE country_code = :country_code AND
              sci_name = :sci_name
    ");
    $db->bind("country_code", $country_code);
    $db->bind("sci_name", $sci_name);
    $db->execute();

    $result = $db->fetch();

    if ($result) {
        if ($result["over_threshold"] === "yes") {
            return;
        }
        if ($result["num_obs"] >= $RARITY_MAX_OBS_THRESHOLD) {
            clearCommonSightings($result["id"]);
            return;
        }
        addSighting($result["id"], $parts);
    } else {
        addNewCountrySpecies($parts);
    }
}


function addNewCountrySpecies ($parts) {
    global $db;

    $country_code = $parts[11];
    $common_name = $parts[3];
    $sci_name = $parts[4];

    $db->query("
        INSERT INTO country_species
        SET country_code = :country_code,
            common_name = :common_name,
            sci_name = :sci_name,
            num_obs = 0,
            over_threshold = 'no'
    ");
    $db->bind("country_code", $country_code);
    $db->bind("sci_name", $sci_name);
    $db->bind("common_name", $common_name);
    $db->execute();

    $id = $db->getInsertId();
    addSighting($id, $parts);
}


function addSighting($id, $parts) {
    global $db;

    $db->query("
        UPDATE country_species
        SET num_obs = num_obs + 1
        WHERE id = :id
    ");
    $db->bind("id", $id);
    $db->execute();

    $db->query("
        INSERT INTO rare_sightings
        SET country_species_id = :id,
            row_data = :row_data
    ");
    $db->bind("id", $id);
    $db->bind("row_data", implode("\t", $parts));
    $db->execute();
}

function clearCommonSightings ($id) {
    global $db;

    $db->query("
        UPDATE country_species
        SET over_threshold = 'yes'
        WHERE id = :id
    ");
    $db->bind("id", $id);
    $db->execute();

    $db->query("
        DELETE FROM rare_sightings 
        WHERE country_species_id = :id
    ");
    $db->bind("id", $id);
    $db->execute();

    echo "Threshold met for $id. Cleared rare_sightings.<br />";
}
