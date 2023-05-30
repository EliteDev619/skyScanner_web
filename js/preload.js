// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

// const csv = require('csvtojson');

window.addEventListener('DOMContentLoaded', async() => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  // let IATAList = await csv().fromFile('./assets/IATA_List.csv');
  // console.log(IATAList, "=================");
  // console.log(JSON.stringify(IATAList), '------');
  // replaceText('iata_list', JSON.stringify(IATAList));
})