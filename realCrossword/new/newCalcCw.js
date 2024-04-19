//////////////////////////////////////////
//////////////////////////////////////////
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
//////////////////////////////////////////
//////////////////////////////////////////

// outerCreateCw(null, commontrie);

// todo - put other functions inside this so we can have global variables
const outerCreateCw = (grid, trie) => {
  // _ is black square
  // , is empty
  // letters are lettes
  // grid is cw of tuples with letter, isLocked
  // isLocked means user entered so can't change
  //let cw = grid;
  console.log("starting");
  let cw = grid;

  createCw(cw, 0, 0);
  return cw;
};

// TODO - I don't think I actually need the locks, can just see if there is already a letter there
// TODO - also don't think I need to pass around trie anymore because we need to check at beginning of each time
const createCw = (cw, row, col) => {
  let trie = commontrie;
  // done
  if (row === cw.length) {
    return true;
  }

  // get next row, checks if we are at the end of a row
  let nextRow = col == cw[row].length - 1 ? row + 1 : row;
  // same for col
  let nextCol = col == cw[row].length - 1 ? 0 : col + 1;

  // if locked letter or black square, nothing to do but continue
  // TODO might have to check if it is all still possible if it is a locked one, but I doubt it
  if (cw[row][col][1] === true || cw[row][col][0] === "_") {
    if (createCw(cw, nextRow, nextCol)) {
      return true;
    } else {
      // want to backtrack here - skip the rest
      return false;
    }
  }

  // now we have the current word
  // note: there should never be a case where it is something like a,,here,,b
  // there should never be blank spaces in the word before where we are
  // also, if we back track we should never need to recompute this

  // now, to find the tries for row and col
  let { word: rowWord, startIdx: rowWordStartIdx } = getWord(
    cw,
    row,
    col,
    true
  );
  let rowWordTrie = JSON.parse(JSON.stringify(trie[rowWord.length]));
  // dont need this
  if (rowWordStartIdx !== col) {
    for (let i = rowWordStartIdx; i < col; i++) {
      rowWordTrie = rowWordTrie[rowWord[i - rowWordStartIdx]];
    }
  }
  // get the rest of the word to filter the trie down to what is possible with the givens left in the word
  rowWord = rowWord.slice(col - rowWordStartIdx);
  // call the function to filter down the trie
  // dont need this if TODO test
  if (rowWord.length !== 1) {
    filterTrie(rowWordTrie, rowWord);
    // throw away return??
  }
  let rowTopLevel = Object.keys(rowWordTrie);

  // col
  // TODO make this and above a function
  let { word: colWord, startIdx: colWordStartIdx } = getWord(
    cw,
    row,
    col,
    false
  );
  let colWordTrie = JSON.parse(JSON.stringify(trie[colWord.length]));
  // this means theres letters before in the word, they will all be letters, need to compute trie
  // TODO don't even need this if statement
  if (colWordStartIdx !== row) {
    for (let i = colWordStartIdx; i < row; i++) {
      colWordTrie = colWordTrie[colWord[i - colWordStartIdx]];
    }
  }
  // same as above
  colWord = colWord.slice(row - colWordStartIdx);
  // dont need
  if (colWord.length !== 1) {
    filterTrie(colWordTrie, colWord);
  }
  let colTopLevel = Object.keys(colWordTrie);

  let topLevel = colTopLevel.filter((letter) => rowTopLevel.includes(letter));

  // to here
  // let allTopLevel = new Set(rowTopLevel.concat(colTopLevel));
  // if it is an empty set, then it is not possible, need to backtrack
  // todo I don't think this means it is never possible, but it is funky - previously entered things effect the trie - so no
  // think this is right but weird
  if (topLevel.length === 0) {
    return false;
  }
  // todo shuffle
  // now we have a set of possible letters, can do old normal backtrack fill
  // console.log([...allTopLevel]);
  // let allTopLevelArr = [...allTopLevel];
  shuffle(topLevel);
  for (let i = 0; i < topLevel.length; i++) {
    let letter = topLevel[i];
    cw[row][col][0] = letter;
    // todo need to implement check duplicates
    if (createCw(cw, nextRow, nextCol)) {
      return true;
    }
  }

  cw[row][col][0] = ",";
  return false;
};

// get word from positon for row or column
// first, find what is currently there
// go up until you hit the end of the puzzle or black sqaure, then go down, simple
const getWord = (cw, row, col, isRowWord) => {
  // where we are will always be a , but just to be sure
  let currWord = cw[row][col][0];

  // "above"
  let i = isRowWord ? col - 1 : row - 1;
  while (i >= 0) {
    if (cw[isRowWord ? row : i][isRowWord ? i : col][0] === "_") {
      break;
    }
    currWord = cw[isRowWord ? row : i][isRowWord ? i : col][0] + currWord;
    i--;
  }
  let startIdx = i + 1;

  // "below"
  i = isRowWord ? col + 1 : row + 1;
  // row lengths will all be the same, so could use 0 instead of row
  while (isRowWord ? i < cw[row].length : i < cw.length) {
    if (cw[isRowWord ? row : i][isRowWord ? i : col][0] === "_") {
      break;
    }
    currWord = currWord + cw[isRowWord ? row : i][isRowWord ? i : col][0];
    i++;
  }
  let endIdx = i - 1;

  return { word: currWord, startIdx: startIdx };
};

// right now, this keeps all of the ones that don't work past the initial. so if its ,,nt it will have hint and hike and hunt because the h works
// that is how I intended it, but if we want to optimize by passing this trie down somehow, we will have to change that
// now, currTrie could be steps down
// say we have h _ r _ and we are at the first blank
// after the step above, we are down the the 4 letter tries starting with h trie
// now, we need to remove all of the tries that don't have r as a second option
// the one we are on will always be blank, so we will start this loop at r in this case and go one step
// filter trie algorithm for when we are at anything the the col, then anything. This removes nodes that make it so
// the letters after col idx not work
const filterTrie = (currTrie, currWord) => {
  if (currWord.length === 0) {
    return true;
  }
  let currLetter = currWord[0];
  let nextWord = currWord.slice(1);

  // it is a blank, need to continue to possiblily remove tries
  if (currLetter === ",") {
    let possible = false;
    for (const letter in currTrie) {
      if (filterTrie(currTrie[letter], nextWord)) {
        possible = true; // it is eventaully valid
        // if the above returns false, there are letters that make this impossible
      } else {
        delete currTrie[letter];
      }
    }
    return possible;
    // not blank
  } else {
    // if it is in it
    if (currTrie.hasOwnProperty(currLetter)) {
      if (filterTrie(currTrie[currLetter], nextWord)) {
        // eventually works out
        return true;
      } else {
        //doesn't work, filter it out
        delete currTrie[currLetter];
        return false;
      }
    }
  }
};

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
///////////////////// testing ///////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// const { commontrie } = require("../data/commontrie");
// let currTrie = commontrie[4];
// let word = ",,nt";
// console.log(filterTrie(currTrie, word));
// console.log(JSON.stringify(currTrie));
// let cw = [
//   [",", ",", ",", ","],
//   [",", ",", ",", ","],
//   [",", ",", ",", ","],
//   [",", ",", ",", ","],
// ];
// createCw(cw, 0, 0);
// console.log(cw);

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
///////////////////// testing ///////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
