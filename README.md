### Endemics

This purpose of this project is to visualize the location of endemic birds across the world, as derived
from eBird sightings. 
- Show a map of the world with each country awarded a particular color 
- Clicking on an 
- An option to show countries that "share" endemics - i.e. you could select 1+ countries and it would list the birds
specific to those countries only. 
- 


### Step 1: parse the Bird data set

I use node to parse the massive eBird data file and extract the bits of data I was interested in. A few notes for
myself:

- Request and download the full sightings data set from eBird.
- Split it into separate files (the last file I got was >110GB). I did it into about 10 pieces each of approx the 
same size. 
- Clone this repo.
- `npm install`
- put the files in the ./files folder.
- install MySQL. Create the database in `db-structure.sql`.
- Update 
- run `node ... find-endemics.js`. Thi
