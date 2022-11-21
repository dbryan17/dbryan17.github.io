"use strict";
let errors = [];
let help_stage = 0;
let help;
let help_highlights = [];


function createBoard() {
    const table = document.createElement("table");
    table.id = "sodoku-table";
    const body = document.createElement("tbody");
    body.id = "sodoku-body"
    table.appendChild(body);

    // create grid
    for(let i=0; i < 9; i++) {
        let row = document.createElement("tr");
        row.classList.add("row")
        body.appendChild(row);
        for(let j=0; j < 9; j++) {
            let cell = document.createElement("td");
            cell.classList.add("cell", `row${i.toString()}`, `col${j.toString()}`);


            let textContainer = document.createElement("div");
            textContainer.classList.add("textContainer");


           


            // cell.innerText = 4;
        
            let input = document.createElement("input");
            // TODO maybe have this be part of cell too or just part of cell
            input.id = `cell${i.toString()}${j.toString()}`;
            input.classList.add("bigN")
            input.type = "text";
            // input.pattern = "/[1-9]/";

            input.maxLength = "1"

            // input.type = "number"
            // input.min = "1"

        
            input.autocomplete = "off";

            //let notes = document.createElement("input");
            
    
            


            let notesContainer = document.createElement("div");
            notesContainer.classList.add("notesC")
            
            for(let a = 0; a < 3; a++) {
                let notesRow = document.createElement("div");
                notesRow.classList.add("notesRow");
                notesContainer.appendChild(notesRow);
                for(let b = 0; b < 3; b++) {
                    
                    
                    let note = document.createElement("div");

                    note.classList.add("note");

                    note.classList.add(`note${((a+1) * 3) - (2 - b)}`)





                    // let noteT = document.createElement("input")
                    // noteT.classList.add("noteT");
                    // noteT.value = "1"
                    
                    // note.appendChild(noteT);
                    //note.innerText="";
                    notesRow.appendChild(note);
                    
                    
         

                    
                }
                textContainer.appendChild(input);
                textContainer.appendChild(notesContainer);
                cell.appendChild(textContainer);
                row.appendChild(cell); 

            }





        }
    }

    return table;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function checkUnq(num, x, y) {


    let toReturn = new Set();
    
    // check block
    const bigRow = Math.floor(x/3);
    const bigCol = Math.floor(y/3);



    for(let i = bigRow * 3; i < bigRow * 3 + 3; i++) {
        for(let j = bigCol * 3; j < bigCol * 3 + 3; j++) {
            if(document.querySelector(`#cell${i.toString()}${j.toString()}`).value === num) {
                toReturn.add(document.querySelector(`#cell${i.toString()}${j.toString()}`));
            }
        }
    }
    

    

    // check row
    document.querySelectorAll(`.row${x.toString()} input`).forEach(node => {
        if(node.value === num) {
            toReturn.add(node)
        }
    });


    // check collumn 
    document.querySelectorAll(`.col${y.toString()} input`).forEach(node => {
        if(node.value === num) {
            toReturn.add(node);
        }
    });

    return toReturn;

    

}


function populateWithArray(arr) {


    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(arr[i][j] !== "-1") {
                let cell = document.querySelector(`#cell${i.toString()}${j.toString()}`);
                cell.value = arr[i][j];
                cell.disabled = true;
            }
        }
    }
}

function createCheckbox() {

    const parser = new DOMParser();

    const checkbox = parser.parseFromString(`
        <div>
            <input type="checkbox" id="notesCheckbox" name="notesCheckbox">
            <label for="notesCheckbox">Notes Mode?</label>
        </div>
    `, "text/html");



    // make this function return this and append it in main 
    document.querySelector("#notes-checkbox-container").appendChild(checkbox.body.firstElementChild);

}

function createHelpButton() {
    const parser = new DOMParser();

    const helpbtn = parser.parseFromString(`
        <button id="helpbtn" type="button">Help?</button> 
    `, "text/html");

    document.querySelector("#help-button-container").appendChild(helpbtn.body.firstElementChild);
}

function oneThroughNine(numStr) {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(num => numStr === num).length === 1;
}

function highlightErrors(num, el) {

    // set of values that is errors made by new insertion 
    let highlight = checkUnq(num, parseInt(el.id.charAt(4)), parseInt(el.id.charAt(5)))
    // get rid of this value 
    highlight.delete(el);


    // set all errors back to orginal color 
    errors.forEach(p => p.forEach(e => {
        if(e.disabled) {
            e.style.color = "black"
        } else {
            e.style.color = "darkslategray"
        }
    }));

    // get rid of any errors that this element previously causes 
    errors = errors.filter(p => p[0] !== el);


    // if there is any new errros
    if(highlight.size > 0) {
        // add them to the errors list 
        highlight.forEach(e => errors.push([el, e]));

        // no errors 
    } 


    // set all errors to red
    errors.forEach(p => {
        p[0].style.color = "red";
        p[1].style.color = "red";
    });

    
    //highlight.forEach(n => n.style.color = "revert")

}


// function called when a number is inputted, here before it actually gets placed - number only inputted when input is empty
function enterNumber() {


    // need to handle what happens when it is a junk number 
    helpReset();




    // if notes mode - add or delete note -
    if(document.querySelector("#notesCheckbox").checked) {

        // if backsapce, bring back all of the old hidden notes - if there was nothing there orginally, other thing will actaully delete them
        if(this.value == "") {
            this.parentElement.querySelector(".notesC").style.display = "inline";
            highlightErrors(11, this)
        }

        // if one through nine, either add or delete 
        if(oneThroughNine(this.value)) {
            let note = this.parentElement.querySelector(`.note${this.value}`);
            if(note.innerText == this.value) {
                note.innerText = "";
            }

            else {
                note.innerText = this.value;
            }

           
        } 
       
        // no matter what, want value to be zero while in notes mode 
        this.value = ""
    
        
        // notes mode is not clicked 
    } else {
        // if it is a delete, bring back old hidden notes 
        if(this.value == "") {
            this.parentElement.querySelector(".notesC").style.display = "inline";
            highlightErrors(11, this)
            

            
        } 

        
        // if not one through nine - set to nothing
        else if(!oneThroughNine(this.value)) {
            this.value = "";

        }

        // legit value 
        else {
            // hide notes 
            this.parentElement.querySelector(".notesC").style.display = "none"

            // check if valid and highlight
            highlightErrors(this.value, this)

            
        }

    }

    
    // needs to be set timeout so the value actually gets added 
    setTimeout(checkWin, 10);



    
}

function checkWin() {

    // this happens everytime a number is added, so update help button here MOVE THIS
    // number added and errors checked, if board is full you are done 
    if(checkF() && errors.length === 0) {

        let win_div = document.createElement("div")
        win_div.innerText = "YOU WON - NICE JOB"
        document.querySelector(".container").insertBefore(win_div, document.querySelector("#sodoku-container"));

    }

}

function navigate(el, key) {

    let count = 0 
    let c;


    // navigate with arrows and WASD
    if(key === "w" || key === "ArrowUp") {
        let row = (((parseInt(el.id.charAt(4)) - 1) % 9) + 9) % 9
        c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
        while(c.disabled == true) {
            count++;
            row = (((row - 1) % 9) + 9) % 9
            c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
            // in case entire row is disabled
            if(count > 9) {
                break;
            }
        }
    
        
        
    } else if(key === "s" || key === "ArrowDown") {
        let row = (((parseInt(el.id.charAt(4)) + 1) % 9) + 9) % 9;
        c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
        while(c.disabled == true) {
            count++;
            row = (((row + 1) % 9) + 9) % 9
            c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
            // in case entire row is disabled
            if(count > 9) {
                break;
            }
        }
     

    } else if(key === "a" || key === "ArrowLeft") {
        let col = (((parseInt(el.id.charAt(5)) - 1) % 9) + 9) % 9;
        c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
        while(c.disabled == true) {
            count++;
            col = (((col - 1) % 9) + 9) % 9
            c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
            // in case entire row is disabled
            if(count > 9) {
                break;
            }
        }
       
    } else if(key === "d" || key === "ArrowRight") {
        let col = (((parseInt(el.id.charAt(5)) + 1) % 9) + 9) % 9;
        c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
        while(c.disabled == true) {
            count++;
            col = (((col + 1) % 9) + 9) % 9
            c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
            // in case entire row is disabled
            if(count > 9) {
                break;
            }
        }
       

    }

    c.focus();
    //el.style.focus = false;


}

function checkF() {

    for(let x = 0; x < 9; x++) {
        for(let y = 0; y < 9; y++) {
            if(document.querySelector(`#cell${x}${y}`).value === "") {
                return false
            }
        }
    }
    return true;
}

function helpReset() {
    document.querySelector("#helpbtn").innerText = "Help?";
    help_stage = 0; 

    // reset colors of all highlights 
    help_highlights.forEach(e => {
        if(e.disabled) {
            e.style.color = "black"
        } else {
            e.style.color = "darkslategray"
        }
    });

    help_highlights = [];

}

function helpHighlighter(cords) {
 

    cords.forEach(cord => {
 
    
        help_highlights.push(document.querySelector(`#cell${cord[0]}${cord[1]}`))
    });

    help_highlights.forEach(el => {
        el.style.color = "orange"
    });
    
}

function getHelp() {

    // help = [cell cord ([y, x]), [answer], [cells to highlight]]

    if(help_stage === 0) {
        help = getInitialHelp()
    } else if(help_stage === 1) {
        getMoreHelp(help[2]);
        let c = document.querySelector(`#cell${help[0][0].toString()}${help[0][1].toString()}`);
        c.focus();
    } else if(help_stage === 2) {
        let c = document.querySelector(`#cell${help[0][0].toString()}${help[0][1].toString()}`)
        c.parentElement.querySelector(".notesC").style.display = "none"
        c.value = help[1];
        helpReset();
        // maybe make a function for shit to do on insert of a number
        highlightErrors(help[1], c);
        setTimeout(checkWin, 10);

        
    }
}



function getMoreHelp(toH) {
    helpHighlighter(toH);
    document.querySelector("#helpbtn").innerText = "reveal cell?";
    help_stage++;
}

function getInitialHelp() {


    // solution board is global as solution_b

    // get the current board as array 
    let current_b = []

    for(let i = 0; i < 9; i++) {
        let row = []
        for(let j = 0; j<9; j++) {
            let v = document.querySelector(`#cell${i}${j}`).value;
            if(v === "") {
                v = "-1"
            } 
            row.push(v)
        }
        current_b.push(row);
    }

    

    // filter out wrong answers 
    for(let i = 0; i < 9; i++) {
        for(let j = 0; j < 9; j++) {
            if(current_b[i][j] !== solution_b[i][j]) {
                current_b[i][j] = "-1";
            }
        }
    }


    // TEST

    // MAKE IT RETURN WHAT WE WILL EVENTUALLY HIGHLIGHT TO HELP AND ANSWER AND CELL TO FOCUS ON 

    // get a naked single 

    let naked_single = helpfcn(current_b);

    //let naked_single = nakedSingle(current_b);
    if(naked_single) {
       
        // make this a function - used in navigate too 
        let c = document.querySelector(`#cell${naked_single[0][0].toString()}${naked_single[0][1].toString()}`);
        c.focus();
        document.querySelector("#helpbtn").innerText = "more help?";
        help_stage = 1;
        //console.log(naked_single)
        return naked_single;
        //helpHighlighter(naked_single[2]);
        
        

        
    }

}


async function startGame(givens) {


    const board = createBoard();
    let grid = await fillGrid(givens);
    document.querySelector("#sodoku-container").appendChild(board);
    //populateBoard(0);
    console.log(grid);

    // TODO make fill grid return a promise and display loading message here 
    
    populateWithArray(grid);
    // populateWithArray(fillGrid(givens));



    let instructions = document.createElement("p");
    instructions.innerText = "You can move around with arrow keys and switch in and out of notes mode with the tab key"
    document.querySelector("#sodoku-container").appendChild(instructions);
    createCheckbox();
    createHelpButton();
    // register event lisnters for all of the input fields 
    document.querySelectorAll(".bigN").forEach(el => {
        // on keydown
        el.addEventListener("keydown", evt => {

            if(["w", "ArrowUp", "a", "ArrowLeft", "s", "ArrowDown", "d", "ArrowRight"].filter(k => evt.key === k).length === 1) {
                navigate(el, evt.key);

            }


            // if it is a backspace and there is nothing in the value, delete all notes 
            if((evt.key === "Backspace" || evt.key === "Delete") && el.value == "") {
                el.parentElement.querySelectorAll(".note").forEach(n => n.innerText = "");
                

                // if the checkbox isn't checked, the number is one through nine, and the value isn't zero
            } else if(!document.querySelector("#notesCheckbox").checked && oneThroughNine(evt.key) && el.value !== "") {

                // set the value to the number - override
                el.value = evt.key
                helpReset();
                highlightErrors(el.value, el)
                setTimeout(checkWin, 10);


                // if it isn't 1-9, save the old value 
            } 
            


       
    
        });

        // extra checks before adding the value 
        el.addEventListener("input", enterNumber);


        // value gets added as normal - could be set to "" now though

        
    });

    // focus on random square
    let x = getRandomInt(9)
    let y = getRandomInt(9) 
    let ce = document.querySelector(`#cell${x}${y}`);
    while(ce.disabled == true) {
        x = getRandomInt(9)
        y = getRandomInt(9) 
        ce = document.querySelector(`#cell${x}${y}`);
    }
    ce.focus();

    // event listner for help button 
    document.querySelector("#helpbtn").addEventListener("click", getHelp);


}


window.addEventListener("load", () => {



    // TODO async?  --- make some shit promises - homemade



    document.querySelector("#inputForm").addEventListener("submit", (evt) => {


        let givens = document.querySelector("#slider").value;
        //evt.preventDefault;
        document.querySelector("#range-container").remove();

        startGame(givens);




    });




    document.addEventListener("keydown", (evt) => {
        
        if(evt.key === "Tab") {
            evt.preventDefault();

            if(document.querySelector("#notesCheckbox").checked){
                document.querySelector("#notesCheckbox").checked = false;

            } else {
                document.querySelector("#notesCheckbox").checked = true;
            }

        }
    });

    
    

});

