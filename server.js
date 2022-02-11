// init mysql connection
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'authenticate'
});

connection.connect();
console.log('Connected to authenticate');


// init server
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());


// eventlistener for post request
app.post('/authenticate', (req, res) => {

    const computerToken = "computerToken"
    const gameToken = "gameToken"
    var containsCT;
    var containsGT;

    for (const x in req.body) {
      var key = JSON.stringify(x).slice(1, -1);

      switch (key) {
        case computerToken: containsCT = true; break;
        case gameToken: containsGT = true; break;
      }
    }

    // exits function if the body doesn't contain "computerToken" or "gameToken" keys
    if (!containsCT || !containsGT) {
      res.send('INVALID')
      return;
    }

    // checks if the computer token and game token matches
    connection.query('SELECT computertoken, claimed FROM tokenlog WHERE token= \'' + req.body[gameToken] + '\'', function (error, results, fields) {
        if (error) throw error;

        var parsedResponse = Object.values(JSON.parse(JSON.stringify(results)))[0];

        if (parsedResponse['claimed'] == '0') {
          connection.query('UPDATE tokenlog SET claimed = 1, computerToken = \'' + req.body[computerToken] + '\' WHERE token= \'' + req.body[gameToken] + '\'')
          res.send('APPROVED');

        } else if (parsedResponse['computertoken'] == req.body[computerToken]) {
          res.send('APPROVED');
        } else res.send('DENIED');
    });
});

// starts server
app.listen(3000, () => console.log(`started server at http://localhost:3000`));
