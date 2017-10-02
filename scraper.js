// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require('cheerio');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();

function initDatabase(callback) {
  // Set up sqlite database.
  var db = new sqlite3.Database('data.sqlite');
  db.serialize(function() {
    db.run('CREATE TABLE IF NOT EXISTS data (word TEXT, definition TEXT)');
    callback(db);
  });
}

function updateRow(db, values) {
  // Insert some data.
  var statement = db.prepare('INSERT INTO data VALUES(?,?)');
  statement.run(values);
  statement.finalize();
}

function readRows(db) {
  // Read some data.
  db.each('SELECT rowid as id, * FROM data', function(err, row) {
    console.log(row);
  });
}

function fetchPage(url, callback) {
  // Use request to read in pages.
  request(url, function(error, response, body) {
    if (error) {
      console.log('Error requesting page: ' + error);
      return;
    }
    callback(body);
  });
}

function run(db) {
  // Use request to read in pages.
  fetchPage('http://www.ldoceonline.com', function(body) {
    // Use cheerio to find things in the page with css selectors.
    var $ = cheerio.load(body);
    var values = [];
    values.push(($('#wotd .title_entry a').text().trim())); // Word
    values.push(($('#wotd .ldoceEntry a').text().trim()));  // Definition
    updateRow(db, values);
    readRows(db);
    db.close();
  });
}

initDatabase(run);
