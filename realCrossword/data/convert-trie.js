// takes in data csv, and converts to javascript file containing data strucutre
// Go through all the words in the dictionary
// - something like that https://johnresig.com/blog/javascript-trie-performance-analysis/
// this is the initial somewhat nieve approach... see how fast it is, then try to implement the other more complicated data strcutres in blog post

// all four letter words to start
const fs = require("fs");
const csv = require("csv-parser");

// const dictLength = 100000;
const wordLength = 4;

let wordsArr = [];

// change the file to create trie from csv
fs.createReadStream("commonwords.csv")
  .pipe(csv())
  .on("data", (row) => {
    wordsArr.push(row.word);
  })
  .on("end", () => {
    // now, we have every word loaded in in order of commonness
    // wordsArr = wordsArr.slice(0, dictLength);
    let trie = generateTrie(wordsArr, wordLength);

    // ending data structure
    const js = `let commontrie = ${JSON.stringify(trie)};`;
    fs.writeFile("commontrie.js", js, (err) => {
      if (err) {
        console.log("an error occured writing the js:\n", err);
      }
    });
  });

const generateTrie = (wordsArr, wordLength) => {
  // first, get rid of all not 4 length words
  // wordsArr = wordsArr.filter((word) => word.length === wordLength);
  let trie = wordsArr.reduce((trie, currWord, idx) => {
    if (!trie[currWord.length]) {
      trie[currWord.length] = {};
    }
    // trie is being accumulated
    let currTrie = trie[currWord.length];
    currWord.split("").forEach((letter, idx) => {
      letter = letter.toLowerCase();
      if (!(letter in currTrie)) {
        currTrie[letter] = {};
      } else {
        // TODO could maybe here incremenent some commonness value
      }
      currTrie = currTrie[letter];
    });
    return trie;
  }, {});
  return trie;
};
