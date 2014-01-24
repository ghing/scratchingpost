#!/usr/bin/env node

var program = require('commander');
var biplane = require('biplane');
var Spreadsheet = require('edit-google-spreadsheet');
var redis = require('redis');
var async = require('async');

var client = redis.createClient();

client.on("error", function (err) {
  console.log("Error " + err);
});

program.version('0.0.1')
  .option('-d, --debug', 'Show debugging information')
  .parse(process.argv);

var api = new biplane.Biplane({
  baseUrl: 'https://kittiesinthesky.appspot.com/',
  username: process.env.SCRATCHINGPOST_USERNAME,
  password: process.env.SCRATCHINGPOST_PASSWORD
});


var jobIds = [];
var rowsToAdd = [];
var SEEN_KEY = 'scratchingpost:jobs:seen';

function handleJob(job, callback) {
  client.sismember(SEEN_KEY, job.id, function(err, res) {
    if (res === 0) {
      rowsToAdd.push([
        job.created,
        job.id,
        job.ownerId,
        job.clientId,
        job.deliverTo,
        job.orderTotal,
        job.tip,
        job.deliveryFee,
        job.paymentMethod
      ]);
      jobIds.push(job.id);
    }

    callback();
  });
}

api.export({
  status: 'complete',
  date: 'today'
}, function(jobs) {
  async.each(jobs, handleJob, function() {
    if (rowsToAdd.length === 0) {
      console.log("No new jobs");
      process.exit();
    }

    Spreadsheet.create({
      debug: program.debug, 
      username: process.env.SCRATCHINGPOST_USERNAME, 
      password: process.env.SCRATCHINGPOST_PASSWORD, 
      spreadsheetId: process.env.SCRATCHINGPOST_SPREADSHEET_ID,
      worksheetId: process.env.SCRATCHINGPOST_WORKSHEET_ID,
      callback: function(err, sheet) {
        if (err) throw err;
        sheet.receive(function(err, rows, info) {
          var data = {};
          data[info.nextRow] = rowsToAdd; 
          sheet.add(data);
          sheet.send({
            autoSize: true
          }, function(err) {
            if (err) {
              console.log(err);
              process.exit();
            }

            client.sadd(SEEN_KEY, jobIds, function(err) {
              process.exit();
            });
          });
        });
      }
    });
  });
});
