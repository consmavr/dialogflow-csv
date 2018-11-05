// const fs = require('fs');
// const parse = require('csv-parse');
// const dialogflowHelpers = require('./dialogflow-helpers');

const fs = require('fs')
const parse = require('csv-parse')

function sleep (ms) {
  return new Promise((resolve) => {
    console.log('start sleeping for ' + ms + 'ms')
    setTimeout(resolve, ms)
  })
}

/**
 *
 * @param {string} inputFile
 */
const csvToArray = (inputFile) => {
  return new Promise((resolve, reject) => {
    let csvData = []
    fs
      .createReadStream(inputFile)
      .pipe(parse({ delimiter: ',' }))
      .on('data', function (csvrow) {
        // do something with csvrow
        csvData.push(csvrow)
      })
      .on('end', function () {
        csvData.shift()

        resolve(csvData)
      })
  })
}

module.exports.sleep = sleep
module.exports.csvToArray = csvToArray
