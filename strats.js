/**
 * function that are startegies that you can use to solve sodokus - keep updation 
*/


// TODOTODOTDOTDOTODOTOD - for all reduce the amount of cells that it highlights to all that you need 
/// next add skyscapres and see what help that gives you, just go through each grid and if there are any numbers with less than 3
/// options check if they are in the same row or col, and if they are elimate all of those numbers from that row or col
/// myabe do this multiple times to get more, there can be like a 1 level skyscraper, then 2, maybe 3, after that probs not getting any more
/// but could check, from there can search for x and y wings 


const strats = [onlyOptionInGroup, onlyOptionInRow, onlyOptionInCol, nakedSingle];

/**
 think the best way to do this is get array of all options and check strategies from there 
*/


// START HERE
function helpfcn(board) {
    // get possiblities board
    let possiblities_board = []
    for(let i = 0; i < 9; i++) {
        let row = []
        for(let j = 0; j < 9; j++) {
            if(board[i][j] === "-1") {
                let poss_arr = getPossibilities(i, j, board);
                row.push(poss_arr)
            } else {
                row.push([])
            }
        }
        possiblities_board.push(row);
    }


    
    for(s = 0; s < strats.length; s++) {
        let toR = strats[s](possiblities_board, board);

        
        if(toR) {
            // one option when it the only one in group, makes more sense to highlight all other in group 
            
            // check if it is the only option to make the highlight look better


            let count = 0;
            let toH = [];

            // check square
            const bigRow = Math.floor(toR[0][0]/3);
            const bigCol = Math.floor(toR[0][1]/3);

            // bigRow * 3 + 3
            // bigCol * 3 + 3
            for(let row = bigRow * 3; row < bigRow * 3 + 3; row++) {
                for(let col = bigCol * 3; col < bigCol * 3 + 3; col++) {
                    if(possiblities_board[row][col].length === 0) {
                        count++;
                        toH.push([row, col])
                    }
                }
            }

            if(count === 8) {
                return [toR[0], toR[1], toH]
            }

            count = 0;
            toH = [];

            // check row
            for(let j = 0; j < 9; j++) {
                if(possiblities_board[toR[0][0]][j].length === 0) {
                    count++;
                    toH.push([toR[0][0], j])
                }
            }
            if(count === 8) {
                return [toR[0], toR[1], toH];
            }

            count = 0;
            toH = [];

            // check collumn 
            for(let i = 0; i < 9; i++) {
                if(possiblities_board[i][toR[0][1]].length === 0){
                    count++;
                    toH.push([i, toR[0][1]])
                }
            }
            if(count === 8) {
                return [toR[0], toR[1], toH]
            }



            return toR
        }
    }
    return false 
}





// stratgegy you often start with - easiest - only one place a certain number can go in a 3x3 area
function onlyOptionInGroup(poss_board, board) {



    // go through each area

    for(let bigRow = 0; bigRow < 3; bigRow++) {
        for (let bigCol = 0; bigCol < 3; bigCol++) {


            // find how many options there are for each number
            let options = [0, 0, 0, 0, 0, 0, 0, 0, 0]
            // go through the area
            for(let i = bigRow * 3; i < bigRow * 3 + 3; i++) {
                for(let j = bigCol * 3; j < bigCol * 3 + 3; j++) {
                    // add the options 
                    poss_board[i][j].forEach(poss => options[poss - 1]++);
                }
            }
        
            // go through options
            for(let p = 0; p < options.length; p++) {
                // if there is only one option for a number
                if(options[p] === 1) {
                    // found!!
                    let toH = onlyOptionInGroupHelper(p + 1, bigRow, bigCol, board)
           
                    // find it again 
                    for(let ii = bigRow * 3; ii < bigRow * 3 + 3; ii++) {
                        for(let jj = bigCol * 3; jj < bigCol * 3 + 3; jj++) {
                            for(let g = 0; g < poss_board[ii][jj].length; g++) {
                                if(poss_board[ii][jj][g] === (p + 1).toString()) {
                                    // find cords!
                                 
                                    return [[ii, jj], [(p + 1).toString()], toH];
                                }
                            }
                            
                        }
                    }
                }
            }
        }
    }

    // none found 
    return false;

}

function onlyOptionInGroupHelper(num, bigRow, bigCol, board) {

    

    let idxs = []

    num = num.toString();

    // go through all rows that colide with bigRow
    for(let i = bigRow * 3; i < bigRow * 3 + 3; i++) {

        // tad overkill
        for(let j = 0; j < 9; j++) {
            if(board[i][j] === num) {
                idxs.push([i, j])
            }
        }
    }


    // go through all colums that collide with bigCol
    for(let j = bigCol * 3; j < bigCol * 3 + 3; j++) {
        for(let i = 0; i < 9; i++) {
            if(board[i][j] === num) {
                idxs.push([i,j])
            }
        }
    }

    return idxs;
}

function onlyOptionInRow(poss_board, board) {




    // go through every row 
    for(let i = 0; i < 9; i++) {

        let options = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        for(let j = 0; j < 9; j++) {
            poss_board[i][j].forEach(p => options[p - 1]++);
        }
        
        // go through options
        for(let p = 0; p < options.length; p++) {
            if(options[p] === 1) {
     
                // found one!

                //let toSearch = []
                let cell;
                let num = (p+1).toString()
                // bring this back but better eventaully 

                // // make array of colums to search while finding the cell 
                // for(let jj = 0; jj < 9; jj++) {
                //     if(poss_board[i][jj].length !== 0) {
                //         toSearch.push(jj);
                //         poss_board[i][jj].forEach(poss => {
                //             if(poss === num) {
                //                 cell = [i, jj];
                //             }
                //         });
                //     }
                // }

                let toSearch = [0, 1, 2, 3, 4, 5, 6, 7, 8]
                for(let jj = 0; jj < 9; jj++) {
                    poss_board[i][jj].forEach(poss => {
                        if(poss === num) {
                            cell = [i, jj];
                        }
                    });
                }



                let toH = onlyOptionInRowHelper(num, toSearch, board);

                return [cell, [num], toH]; 
            }
        }
    }

    return false;
}

function onlyOptionInRowHelper(num, toSearch, board) {

    toR = []

    // go through each column 
    toSearch.forEach(col => {
        for(let i = 0; i < 9; i++) {
            if(board[i][col] === num) {
                toR.push([i, col]);

            }
        }
    });

    return toR;
}

function onlyOptionInCol(poss_board, board) {


    // go through every coloumn 
    for(let j = 0; j < 9; j++) {

        let options = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        for(let i = 0; i < 9; i++) {
            poss_board[i][j].forEach(p => options[p - 1]++)
        }

        // go through options 
        for(let p = 0; p < options.length; p++) {
            if(options[p] === 1) {

                // found one 

                let cell;
                let num = (p+1).toString();


                let toSearch = [0, 1, 2, 3, 4, 5, 6, 7, 8]
                for(let ii = 0; ii < 9; ii++) {
                    poss_board[ii][j].forEach(poss => {
                        if(poss === num) {
                            cell = [ii, j];
                        }
                    });
                }



                let toH = onlyOptionInColHelper(num, toSearch, board);

                return [cell, [num], toH]; 
            }
        }

    }
}

function onlyOptionInColHelper(num, toSearch, board) {
    toR = [];

    toSearch.forEach(row => {
        for(let j = 0; j < 9; j++) {
            if(board[row][j] === num) {
                toR.push([row, j])
            }
        }
    });

    return toR;
}




// need to look for - hardish - only one option a given cell can be 
function nakedSingle(poss_board, board) {
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(poss_board[i][j].length === 1) {
                let toH = nakedSingleHelper(i, j, board);
                return [[i,j], [poss_board[i][j][0]], toH]
            }
        }
    }
    return false;
}

/**
 * to get numbers to highlight, get possiblities has this, but returning it will mess up generator, so fuck it 
 */
function nakedSingleHelper(i, j, board) {

    // possible numbers 
    let poss = numbers.map(n => n);

    // indicies of taken away numbers 
    // [[i, j], ...]
    let idxs = [];

    // all numbers in grid 
    const bigRow = Math.floor(i/3);
    const bigCol = Math.floor(j/3);

    // bigRow * 3 + 3
    // bigCol * 3 + 3
    for(let row = bigRow * 3; row < bigRow * 3 + 3; row++) {
        for(let col = bigCol * 3; col < bigCol * 3 + 3; col++) {
            let toD = poss.indexOf(board[row][col])
            if(toD !== -1) {
                poss.splice(toD, 1);
            
                idxs.push([row, col])
         
            }
        }
    }

    // get rid others in row
    for(let y = 0; y < 9; y++) {
        let toD = poss.indexOf(board[i][y]);
        if(toD !== -1) {
            poss.splice(toD, 1)
            idxs.push([i, y])
        }
    }

    // all numbers in col
    for(let x = 0; x < 9; x++) {
        let toD = poss.indexOf(board[x][j])
        if(toD !== -1) {
            poss.splice(toD, 1);
     
            idxs.push([x, j])
           
        }
    }
    return idxs
}