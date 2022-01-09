/**
 * function that are startegies that you can use to solve sodokus - keep updation 
 */



// stratgegy you often start with - easiest - only one place a certain number can go in a 3x3 area
function onlyOptionInGroup(board) {

}


// need to look for - hardish - only one option a given cell can be 
function nakedSingle(board) {
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(board[i][j] === "-1") {
                let poss_arr = getPossibilities(i, j, board);
          
                if(poss_arr.length === 1) {
                    let toH = nakedSingleHelper(i, j, board);
                    return [[i,j], [poss_arr[0]], toH]
                }
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