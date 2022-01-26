//// generate sodoku board 


const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

let solution_b;

var counter = 0;

// can eventually add more complex shiit like solvable using given strageiges 


function checkFull(board) {

    for(let x = 0; x < 9; x++) {
        for(let y = 0; y < 9; y++) {
            if(board[x][y] === "-1") {
                return false
            }
        }
    }
    return true;
}

// make this faster 
function checkBoard(board) {

    for(let x= 0; x < 9; x++) {
        for(let y = 0; y < 9; y++) {
            if(board[x][y] !== "-1") {
                if(!generCheckUnq(board[x][y], x, y, board)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function generCheckUnq(num, x, y, board) {
    
    // check block

    const bigRow = Math.floor(x/3);
    const bigCol = Math.floor(y/3);

    for(let i = bigRow * 3; i < bigRow * 3 + 3; i++) {
        for(let j = bigCol * 3; j < bigCol * 3 + 3; j++) {

            if((board[i][j] === num) && (i !== x) && (j !== y)) {
                return false;
            }


        }
    }
    // check row

    for(let i = 0; i < 9; i++) {
        if((board[x][i] === num) && (i !== y)) {
            return false;
        }
        
    }

    for(let i = 0; i < 9; i++) {
        if((board[i][y] === num) && (i !== x)) {
            return false;
        }
    }

    return true;

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max); 
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function getPossibilities(x, y, board) {
    // get the numbers this space could possibly be 
    let poss = numbers.map(n => n);

    // get rid others in row
    for(let i = 0; i < 9; i++) {
        let toD = poss.indexOf(board[x][i]);
        if(toD !== -1) {
            poss.splice(toD, 1)
        }
    }

    // collumn
    for(let j = 0; j < 9; j++) {
        let toD = poss.indexOf(board[j][y])
        if(toD !== -1) {
            poss.splice(toD, 1);
        }
    }

    // square
    const bigRow = Math.floor(x/3);
    const bigCol = Math.floor(y/3);

    // bigRow * 3 + 3
    // bigCol * 3 + 3
    for(let row = bigRow * 3; row < bigRow * 3 + 3; row++) {
        for(let col = bigCol * 3; col < bigCol * 3 + 3; col++) {
            let toD = poss.indexOf(board[row][col])
            if(toD !== -1) {
                poss.splice(toD, 1);
            }
        }
    }

    return poss
}


function backtrackingFill(partial_board) {

    // TODO make this a function

    // find next empty 
    let empty = false
    for(let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if(partial_board[i][j] === "-1") {
                var x = i;
                var y = j;
                empty = true;
                break;
            }
        }
        if(empty){
            break;
        }

    }

    // found correct solution because it is correct and now we know that it is full 
    if(!empty) {
        return partial_board;
    }

    // go through rest of board starting with first empty space
    for(let xi = x; x < 9; x++) {
        for(let yi = y; y < 9; y++) {


            let poss = getPossibilities(x, y, partial_board);


            // below is slightly faster becuase don't go all the way to 9 when don't need to 

            // // get the numbers this space could possibly be 
            // let poss = numbers.map(n => n);
            
            // // get rid others in row
            // for(let i = 0; i < yi; i++) {
            //     poss.splice(poss.indexOf(partial_board[xi][i]), 1)
            // }

            // // collumn
            // for(let j = 0; j < xi; j++) {
            //     let toD = poss.indexOf(partial_board[j][yi])
            //     if(toD !== -1) {
            //         poss.splice(toD, 1);
            //     }
            // }

            // // square
            // const bigRow = Math.floor(x/3);
            // const bigCol = Math.floor(y/3);
        
            // // bigRow * 3 + 3
            // // bigCol * 3 + 3
            // for(let row = bigRow * 3; row < bigRow * 3 + 3; row++) {
            //     for(let col = bigCol * 3; col < bigCol * 3 + 3; col++) {
            //         let toD = poss.indexOf(partial_board[row][col])
            //         if(toD !== -1) {
            //             poss.splice(toD, 1);
            //         }
            //     }
            // }

        


            shuffleArray(poss);
            
            // get random array of options left 
            for(let c = 0; c < poss.length; c++) {
                // TODO this could be cleaner
                partial_board[xi][yi] = poss[c];
                if(backtrackingFill(partial_board)) {
                    return partial_board;
                }
                // } else {
                //     backtrackingFill(old_board);
                // }
            }

            // go back a layer, none of the option worked, for some reason partial_solution sicks around 
            // so have to set it to -1
            partial_board[xi][yi] = "-1"
            return false;

        }
        y = 0
        x++;
    }

}



// NOTE this will say full board is not solvable
function solveBoard(partial_solution) { 
    // optim
    if(counter > 1) {
        return false
    }

    // generates all possible solutions 

    // find next empty 
    let empty = false
    for(let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if(partial_solution[i][j] === "-1") {
                var x = i;
                var y = j;
                empty = true;
                break;
            }
        }
        if(empty){
            break;
        }

    }

    // found correct solution because it is correct and now we know that it is full 
    if(!empty) {
        return true;
    }


    for(let xi = x; x < 9; x++) {
        for(let yi = y; y < 9; y++) {


            let poss = getPossibilities(x, y, partial_solution);



            if(poss.length === 0) {
                return false;
            }

            for(let c = 0; c < poss.length; c++) {
                partial_solution[xi][yi] = poss[c]
                if(solveBoard(partial_solution)) {
                    counter++;
                }
           
                
            }


            // go back a layer, none of the option worked, for some reason partial_solution sicks around 
            // so have to set it to -1
            partial_solution[xi][yi] = "-1"
            return false;


        }
        y = 0
        x++;
    }
}

function createFinal(solution_board, n) {

    if(n === 0) {
        return solution_board
    }

    let poss = []

    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(solution_board[i][j] !== "-1") {
                poss.push([i,j]);
            }
        }
    }

    shuffleArray(poss);

    let old_board = solution_board.map(arr => arr.map(el => el));

    for(let i = 0; i < poss.length; i++) {
        counter = 0;
        solution_board[poss[i][0]][poss[i][1]] = "-1";
        solveBoard(solution_board.map(arr => arr.map(el => el)));
        if(counter === 1) {
            let newn = n - 1;
            toR = createFinal(solution_board, newn);
            if(toR !== false) {
                return toR
            } 
        }
        solution_board = old_board.map(arr => arr.map(el => el));
    }
   
   
    return false; 

}


async function fillGrid(givens) {

    let board = [];

    // first create "empty" board
    for(let i = 0; i < 9; i++) {
        board[i] = []
        for(let j = 0; j < 9; j++) {
            board[i][j] = "-1";
        }
    }

    if(givens < 25 && givens > 20) {

       
        let boards;

        if(givens == 21) {
            boards = boards21
        } else if(givens == 22) {
            boards = boards22
        } else if(givens == 23) {
            boards = boards23
        } else if(givens == 24) {
            boards = boards24
        }



        let toGet = getRandomInt(boards.length);


        const final_board = boards[toGet];

        
        final_board_c = final_board.map(arr => arr.map(el => el))
        const full_board = backtrackingFill(final_board_c);
    

        solution_b = full_board.map(arr => arr.map(el => el));

        return final_board;
  
    } else {
        const full_board = backtrackingFill(board);

        solution_b = full_board.map(arr => arr.map(el => el));
    
        const final_board = createFinal(full_board, 81 - givens);
    
        return final_board;

    }


    
    // counter = 0;
    // solveBoard(final_board)
    // if(counter !== 1) {
    //     console.log(counter)
    //     console.log("this should not happen")

    // }

    // if(!checkBoard(final_board)) {
    //     return board;
    // }




    // if(!checkBoard(full_board)) {
    //     return board;
    // }

    

};
