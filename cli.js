#!/usr/bin/env node

var program = require('commander');
var biplane = require('biplane');
var Spreadsheet = require('edit-google-spreadsheet');

program.version('0.0.1')
  .option('-d, --debug', 'Show debugging information')
  .parse(process.argv);

var api = new biplane.Biplane({
  baseUrl: 'https://kittiesinthesky.appspot.com/',
  username: process.env.SCRATCHINGPOST_USERNAME,
  password: process.env.SCRATCHINGPOST_PASSWORD
});

api.export({
  date: 'today'
}, function(jobs) {
  var rowsToAdd = [];
  var job;

  /*
{ deliverAfter: '2014-01-21 09:49:14-06:00',
  orderDate: '2014-01-21 09:49:14-06:00',
  created: '2014-01-21 09:49:18.053170-06:00',
  ownerId: '2918100',
  orderTotal: 27.29,
  id: '24848001',
  deliverTo: '596 W Hawthorne Pl305\nChicago, IL 60657',
  clientId: '1042001',
  status: 'complete',
  tip: 3.56,
  paymentMethod: 'prepaid',
  deliveryFee: 4 }
   */

  for (var i = 0; i < jobs.length; i++) {
    job = jobs[i];
    if (job.status === 'complete') {
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
    }
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
        });
      });
    }
  });
});
