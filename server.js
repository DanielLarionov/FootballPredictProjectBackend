const express = require('express');
const fs = require("fs");
const cors = require('cors');
const csv = require('csvtojson');
const fixtures = require('./controllers/getFixtures');


const http = require('http');

//get current season updated csv and save on system
const file = fs.createWriteStream("controllers/CurrentSeason/epl2020-21.csv");
const request = http.get("http://www.football-data.co.uk/mmz4281/2021/E0.csv", function(response) {
  response.pipe(file);
});
const file2 = fs.createWriteStream("controllers/CurrentSeason/ger2020-21.csv");
const request2 = http.get("http://www.football-data.co.uk/mmz4281/2021/D1.csv", function(response) {
  response.pipe(file2);
});
const file3 = fs.createWriteStream("controllers/CurrentSeason/esp2020-21.csv");
const request3 = http.get("http://www.football-data.co.uk/mmz4281/2021/SP1.csv", function(response) {
  response.pipe(file3);
});
const file4 = fs.createWriteStream("controllers/CurrentSeason/itl2020-21.csv");
const request4 = http.get("http://www.football-data.co.uk/mmz4281/2021/I1.csv", function(response) {
  response.pipe(file4);
});
const file5 = fs.createWriteStream("controllers/CurrentSeason/frc2020-21.csv");
const request5 = http.get("http://www.football-data.co.uk/mmz4281/2021/F1.csv", function(response) {
  response.pipe(file5);
});


const app = express();
app.use(express.json());
app.use(cors());

app.post('/',(req,res)=>{fixtures.handleGetFixutres(req,res,csv)});

//Server listen
app.listen(3000,()=>{
    console.log(`app is running on port 3000`)
})