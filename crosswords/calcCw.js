// const {trie} = require("./data/trie")
// const {smalltrie} = require("./data/smalltrie")

// now for generating the crossword
// could also make it a graph...

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

// TODO think I am editing these vars in place, so don't need to pass anything but row and col
const createCw = (cw, row, col, trie) => {
  if (row === cw.length) {
    // found a poss solution
    return true;
  }

  // get next row, checks if we are at the end of a row
  let nextRow = col == cw[row].length - 1 ? row + 1 : row;
  // same for col
  let nextCol = col == cw[row].length - 1 ? 0 : col + 1;

  // TODO not sure I need this
  let currTrie = trie;
  // current possible letters
  let currTopLevel = Object.keys(currTrie);
  shuffle(currTopLevel);

  // go through poss letters
  for (let keyIdx = 0; keyIdx < currTopLevel.length; keyIdx++) {
    let pickedLetter = currTopLevel[keyIdx];
    cw[row][col] = pickedLetter;

    if (checkIfPossible(cw) && (nextCol === 0 ? checkIfDuplicates(cw) : true)) {
      // is still possible, continue
      // want the original trie if the cycle is start of a row

      if (
        createCw(
          cw,
          nextRow,
          nextCol,
          nextCol === 0 ? commontrie : currTrie[pickedLetter]
        )
      ) {
        return true;
      }
    }
  }
  // went through every letter and they all failed, here or in recursion
  // so rest letter and backtrack
  cw[row][col] = ",";
  return false;
};

// returns true if there are no duplicate words, false otherwise
const checkIfDuplicates = (cw) => {
  // need to go through rows and cols, get all words, and see if there are any duplicate full words
  wordsObj = cw.reduce(
    (acc, row, rowIdx) => {
      let rowWord = "";
      row.forEach((letter, colIdx) => {
        rowWord += letter;
        // if it col idx partial alreadly exists, will be always except first row
        if (acc.colPartials[colIdx]) {
          // add
          acc.colPartials[colIdx] += letter;
        } else {
          // create it
          acc.colPartials[colIdx] = letter;
        }
      });
      acc.rowWords.push(rowWord);
      return acc;
    },
    { rowWords: [], colPartials: {} }
  );

  let allWords = Object.values(wordsObj.colPartials).concat(wordsObj.rowWords);

  allWords = allWords.filter((word) => !word.includes(","));
  let allWordsSet = new Set(allWords);

  if (allWordsSet.size === allWords.length) {
    // no duplicates
    return true;
  } else {
    return false;
  }
};

// could maybe return something if it
// false - not possible, 0 - filled in and done, 1 - still possible, not filled in
const checkIfPossible = (cw) => {
  let currTrie = commontrie;
  let filled = true;

  // rows
  for (let rowIdx = 0; rowIdx < cw.length; rowIdx++) {
    let currTrie = commontrie;
    for (let colIdx = 0; colIdx < cw[rowIdx].length; colIdx++) {
      let letter = cw[rowIdx][colIdx];
      // check if row is still possible
      if (letter === ",") {
        // the row is considered possible if we reach here
        filled = false;
        break;
      }
      if (!(letter in currTrie)) {
        // not possible
        return false;
      }
      // otherwise it is, so continue and update currTrie
      currTrie = currTrie[letter];
    }
  }
  // cols
  currTrie = commontrie;
  // actualyl for now, just focus on x by ys
  // go through "longest one" for now the first one
  for (let colIdx = 0; colIdx < cw[0].length; colIdx++) {
    currTrie = commontrie;
    for (let rowIdx = 0; rowIdx < cw.length; rowIdx++) {
      let letter = cw[rowIdx][colIdx];
      if (letter == ",") {
        filled = false;
        break;
      }
      if (!(letter in currTrie)) {
        return false;
      }
      currTrie = currTrie[letter];
    }
  }

  // TODO figure out why this was here
  return true;
  // if (filled) {
  //   return 0;
  // } else {
  //   return 1;
  // }
};

const outerCreateCw = (trie) => {
  let cw = [
    [",", ",", ",", ","],
    [",", ",", ",", ","],
    [",", ",", ",", ","],
    [",", ",", ",", ","],
  ];
  createCw(cw, 0, 0, commontrie);
  return cw;
};

// const origTrie = commontrie;

// setTimeout(() => {
//   console.log(cw);
//   newCw = createCw(cw, 0, 0, commontrie);
//   console.log(cw);
// }, 2000);

// console.log(cw);
// newCw = createCw(cw, 0, 0, commontrie);
// console.log(cw);
