# Endemics / Visualizing bird data

This purpose of this project is to visualize the location of endemic birds across the world, as derived
from eBird sightings. But I kinda want to make it more general than that...

Ideas:
- Show a map of the world with each country with a shade denoting the number of endemics relative to other countries. 
- Clicking on an country:
    - number of endemics
    - most sighted birds (top 10)
    - least sighted birds
- An option to show countries that "share" endemics - i.e. you could select 1+ countries and it would list the birds
specific to those countries only. 
- global stats:
    - most sighted birds
    - rarest birds


### Parsing the Bird data set

I use node to parse the massive eBird data file and extract the bits of data I was interested in. A few notes for
myself:

- Request and download the full sightings data set from eBird.
- Split it into separate files (the last file I got was >110GB). I did it into about 10 pieces each of approx the 
same size. `gsplit -d -l 1000000 -a 4 file1.txt file1_`
    - the `-d` option wasn't available on mac osx, so I updated coreutils 
    (https://apple.stackexchange.com/questions/138785/d-option-for-split-is-illegal-on-os-x-10-9) hence the `gsplit` g 
    prefix.
- Clone this repo.
- `npm install`
- put the files in the ./files folder.
- install MySQL. Create the database in `db-structure.sql`.
- run `node --max_old_space_size=4096 find-endemics.js`. This ensures it has enough memory to run.
- Each 11GB file takes around ~20 mins, I find. 

