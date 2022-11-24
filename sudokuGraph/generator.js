/*
This file includes the logic for generating a valid sudoku grid, or taking one 
from the pre generated boards if there are 25 or less givens 

Future todos: 
- Shuffle the pre generated boards to create new boards that are group-isomorphic 
to the old ones, but appear different. This includes stuff like rotating 90 degrees
- Use human strategies coded in starts.js and others to decide difficulty of a puzzle
*/

// global vars needed for this file
var solution_b;
let counter = 0;

// checks if the board is full
function checkFull(board) {
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      if (board[x][y] === "-1") {
        return false;
      }
    }
  }
  return true;
}

// checks if a given cell with a given number is valid
function generCheckUnq(num, x, y, board) {
  // check block
  const bigRow = Math.floor(x / 3);
  const bigCol = Math.floor(y / 3);

  for (let i = bigRow * 3; i < bigRow * 3 + 3; i++) {
    for (let j = bigCol * 3; j < bigCol * 3 + 3; j++) {
      if (board[i][j] === num && i !== x && j !== y) {
        return false;
      }
    }
  }

  // check row
  for (let i = 0; i < 9; i++) {
    if (board[x][i] === num && i !== y) {
      return false;
    }
  }

  // check col
  for (let i = 0; i < 9; i++) {
    if (board[i][y] === num && i !== x) {
      return false;
    }
  }

  return true;
}

// returns a list of numbers that a given cell could be
function getPossibilities(x, y, board) {
  // starting possible - map to copy
  let poss = numbers.map((n) => n);

  // get rid others in row
  for (let i = 0; i < 9; i++) {
    let toD = poss.indexOf(board[x][i]);
    if (toD !== -1) {
      poss.splice(toD, 1);
    }
  }

  // collumn
  for (let j = 0; j < 9; j++) {
    let toD = poss.indexOf(board[j][y]);
    if (toD !== -1) {
      poss.splice(toD, 1);
    }
  }

  // square
  const bigRow = Math.floor(x / 3);
  const bigCol = Math.floor(y / 3);

  for (let row = bigRow * 3; row < bigRow * 3 + 3; row++) {
    for (let col = bigCol * 3; col < bigCol * 3 + 3; col++) {
      let toD = poss.indexOf(board[row][col]);
      if (toD !== -1) {
        poss.splice(toD, 1);
      }
    }
  }

  return poss;
}

// backtracking algorithm that returns a complete (solved) board that is valid
function backtrackingFill(partial_board) {
  // find next empty cell
  let empty = false;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (partial_board[i][j] === "-1") {
        var x = i;
        var y = j;
        empty = true;
        break;
      }
    }
    if (empty) {
      break;
    }
  }

  // found correct solution because it is correct and now we know that it is full
  if (!empty) {
    return partial_board;
  }

  // go through rest of board starting with first empty space
  for (let xi = x; x < 9; x++) {
    for (let yi = y; y < 9; y++) {
      // get the possiblities for cell
      let poss = getPossibilities(x, y, partial_board);

      // randomize the list of possilities
      shuffleArray(poss);

      // backtracking loop
      for (let c = 0; c < poss.length; c++) {
        // set the current cell to the random option
        partial_board[xi][yi] = poss[c];
        // call function and if returns not false we return this board
        if (backtrackingFill(partial_board)) {
          return partial_board;
        }
      }

      // go back a layer, none of the option worked
      // set current cell back to -1
      partial_board[xi][yi] = "-1";
      return false;
    }
    // increment loop
    y = 0;
    x++;
  }
}

// checks if a given board is solvable with backtracking
// NOTE: this will say full board is not solvable
function solveBoard(partial_solution) {
  // more than one solution, so not solvable
  if (counter > 1) {
    return false;
  }

  // generates all possible solutions

  // find next empty
  let empty = false;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (partial_solution[i][j] === "-1") {
        var x = i;
        var y = j;
        empty = true;
        break;
      }
    }
    if (empty) {
      break;
    }
  }

  // we have a full board that is valid
  if (!empty) {
    return true;
  }

  // go through board starting and next empty
  for (let xi = x; x < 9; x++) {
    for (let yi = y; y < 9; y++) {
      // get possiblites
      let poss = getPossibilities(x, y, partial_solution);

      // if no possiblites this is not a valid board
      if (poss.length === 0) {
        return false;
      }

      // backtracking loop
      for (let c = 0; c < poss.length; c++) {
        // set current cell to kone of the possiblites
        partial_solution[xi][yi] = poss[c];
        // backtrack and if it is solvable, increment counter
        if (solveBoard(partial_solution)) {
          counter++;
        }
      }

      // go back a layer, none of the option worked
      // reset cell
      partial_solution[xi][yi] = "-1";
      return false;
    }
    // increment loop
    y = 0;
    x++;
  }
  // the final return will only be true if it gets to a complete valid board once
}

// main backtracking algorithm that returns a solvable boarded
// given the number of cells to get rid of to and starting with a complete valid board
function createFinal(solution_board, n) {
  // return board if we don't need to get rid of any others
  if (n === 0) {
    return solution_board;
  }

  // cells left to "delete"
  let poss = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (solution_board[i][j] !== "-1") {
        poss.push([i, j]);
      }
    }
  }

  // randomize
  shuffleArray(poss);

  // save a copy
  let old_board = solution_board.map((arr) => arr.map((el) => el));

  // backtracking loop
  for (let i = 0; i < poss.length; i++) {
    // reset counter
    counter = 0;
    // "delete" a random one
    solution_board[poss[i][0]][poss[i][1]] = "-1";

    // see if it is solvable
    solveBoard(solution_board.map((arr) => arr.map((el) => el)));
    if (counter === 1) {
      let newn = n - 1;
      // backtrack
      toR = createFinal(solution_board, newn);
      if (toR !== false) {
        return toR;
      }
    }
    // recover old board
    solution_board = old_board.map((arr) => arr.map((el) => el));
  }
  return false;
}

// main function called on startup to get a valid grid with the number of given
async function fillGrid(givens) {
  let board = [];

  // first create "empty" board
  for (let i = 0; i < 9; i++) {
    board[i] = [];
    for (let j = 0; j < 9; j++) {
      board[i][j] = "-1";
    }
  }

  // grab pre generated if in the range
  if (givens < 25 && givens > 20) {
    let boards;
    if (givens == 21) {
      boards = boards21;
    } else if (givens == 22) {
      boards = boards22;
    } else if (givens == 23) {
      boards = boards23;
    } else if (givens == 24) {
      boards = boards24;
    }

    let toGet = getRandomInt(boards.length);
    const final_board = boards[toGet];
    // gets the solution
    let final_board_c = final_board.map((arr) => arr.map((el) => el));
    const full_board = backtrackingFill(final_board_c);
    solution_b = full_board.map((arr) => arr.map((el) => el));

    return final_board;
  } else {
    const full_board = backtrackingFill(board);
    solution_b = full_board.map((arr) => arr.map((el) => el));
    const final_board = createFinal(full_board, 81 - givens);

    return final_board;
  }
}
