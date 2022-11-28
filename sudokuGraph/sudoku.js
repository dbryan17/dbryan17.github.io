/*
This file contains all logic for initial start up of sudoku grid
future todo:
- make a loading message when waiting for the generater to generate a grid 
*/
"use strict";

// function to create the sudoku grid with html
function createBoard() {
  const table = document.createElement("table");
  table.id = "sudoku-table";
  const body = document.createElement("tbody");
  body.id = "sudoku-body";
  table.appendChild(body);

  // create grid
  for (let i = 0; i < 9; i++) {
    let row = document.createElement("tr");
    row.classList.add("row");
    body.appendChild(row);
    for (let j = 0; j < 9; j++) {
      let cell = document.createElement("td");
      cell.classList.add("cell", `row${i.toString()}`, `col${j.toString()}`);

      let textContainer = document.createElement("div");
      textContainer.classList.add("textContainer");
      let input = document.createElement("input");
      input.id = `cell${i.toString()}${j.toString()}`;
      input.classList.add("bigN");
      input.type = "text";
      input.maxLength = "1";
      input.autocomplete = "off";

      let notesContainer = document.createElement("div");
      notesContainer.classList.add("notesC");

      for (let a = 0; a < 3; a++) {
        let notesRow = document.createElement("div");
        notesRow.classList.add("notesRow");
        notesContainer.appendChild(notesRow);
        for (let b = 0; b < 3; b++) {
          let note = document.createElement("div");
          note.classList.add("note");
          note.classList.add(`note${(a + 1) * 3 - (2 - b)}`);
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

// creates the checkox for notes
function createCheckbox() {
  const parser = new DOMParser();

  const checkbox = parser.parseFromString(
    `
        <div>
            <input type="checkbox" id="notesCheckbox" name="notesCheckbox">
            <label for="notesCheckbox">Notes Mode?</label>
        </div>
    `,
    "text/html"
  );
  document
    .querySelector("#notes-checkbox-container")
    .appendChild(checkbox.body.firstElementChild);
}

// creates the reset button
function createResetButton() {
  const parser = new DOMParser();

  const resetBtn = parser.parseFromString(
    `
  <button id="resetbtn" type="button">Reset</button> 
  `,
    "text/html"
  );
  document
    .querySelector("#reset-button-container")
    .appendChild(resetBtn.body.firstElementChild);
}

// creates the box with colors and numbers
function createSelection() {
  let selectionContainer = document.querySelector("#selectionContainer");
  selectionContainer.hidden = false;
  numbers.forEach((num) => {
    const parser = new DOMParser();

    const ele = parser.parseFromString(
      `
    <div class="option">
    <span id="${num}colorMapColor" style="color:${color_map[num]}">
    ${color_map[num]} 
    </span>

    <span id="${num}colorMapNumber">
    : ${num}
    </span>
    </div>
    `,
      "text/html"
    );
    selectionContainer.appendChild(ele.body.firstElementChild);
  });
}

// check if a given cell can really have the given number - used for highlighting errors
// returns the acutally html input - not just a number
function checkUnq(num, x, y) {
  let toReturn = new Set();

  // check block
  const bigRow = Math.floor(x / 3);
  const bigCol = Math.floor(y / 3);

  for (let i = bigRow * 3; i < bigRow * 3 + 3; i++) {
    for (let j = bigCol * 3; j < bigCol * 3 + 3; j++) {
      if (
        document.querySelector(`#cell${i.toString()}${j.toString()}`).value ===
        num
      ) {
        toReturn.add(
          document.querySelector(`#cell${i.toString()}${j.toString()}`)
        );
      }
    }
  }

  // check row
  document.querySelectorAll(`.row${x.toString()} input`).forEach((node) => {
    if (node.value === num) {
      toReturn.add(node);
    }
  });

  // check collumn
  document.querySelectorAll(`.col${y.toString()} input`).forEach((node) => {
    if (node.value === num) {
      toReturn.add(node);
    }
  });

  return toReturn;
}

// checks if it is a win - this happens everytime a number is added
function checkWin() {
  // number added and errors checked, if board is full you are done
  if (checkF() && errors.length === 0) {
    // add a win message
    let win_div = document.createElement("div");
    win_div.innerText = "YOU WON - NICE JOB";
    document.querySelector("#container").appendChild(win_div);
  }
}

// checks if a board is full
function checkF() {
  for (let x = 0; x < 9; x++) {
    for (let y = 0; y < 9; y++) {
      if (document.querySelector(`#cell${x}${y}`).value === "") {
        return false;
      }
    }
  }
  return true;
}

// refills the grid with colors from the graph - called when auto solved with graph colorings is done
function refillGrid() {
  // reset notes
  document.querySelectorAll(".note").forEach((note) => {
    note.innerHTML = "";
  });

  // reset help
  helpReset();

  // reset errors
  errors = [];

  // go through each cell and add color to number
  document.querySelectorAll(".bigN").forEach((input) => {
    if (!input.disabled) {
      let node = cy.getElementById(input.id.slice(-2));
      input.value = node.data("number");
    } else {
      // recolor
      input.style.color = "black";
    }
  });
}

// resets the grid
function resetGrid() {
  document.querySelectorAll(".bigN").forEach((input) => {
    if (!input.disabled) {
      input.value = "";
    } else {
      // recolor
      input.style.color = "black";
    }
  });
  // reset help stuff
  helpReset();

  // need to go through errors and set the color back to black
  errors.forEach((p) => {
    p.forEach((e) => {
      if (e.disabled) {
        e.style.color = "black";
      } else {
        e.style.color = "darkslategray";
      }
    });
  });

  // need to reset errors
  errors = [];

  // now for notes
  document.querySelectorAll(".note").forEach((note) => {
    note.innerHTML = "";
  });
}

// populate the grid given an array - called on startup
function populateWithArray(arr) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (arr[i][j] !== "-1") {
        let cell = document.querySelector(
          `#cell${i.toString()}${j.toString()}`
        );
        cell.value = arr[i][j];
        cell.disabled = true;
      }
    }
  }
}

// handle a delete - this is needed because the deleting an input html is a little spotty
// so this makes it so pressing the delete key always works
function handleDelete(el, notes) {
  if (notes) {
    el.parentElement.querySelector(".notesC").style.display = "inline";
    highlightErrors(11, el);
  } else {
    el.parentElement.querySelector(".notesC").style.display = "inline";
    highlightErrors(11, el);
  }
}

// function called when a number is inputted, here before it actually gets placed - number only inputted when input is empty
function enterNumber() {
  helpReset();
  // if notes mode - add or delete note
  if (document.querySelector("#notesCheckbox").checked) {
    // if backsapce, bring back all of the old hidden notes - if there was nothing there orginally, other thing will actaully delete them
    if (this.value == "") {
      handleDelete(this, true);
    }

    // if one through nine, either add or delete
    if (oneThroughNine(this.value)) {
      let note = this.parentElement.querySelector(`.note${this.value}`);
      if (note.innerText == this.value) {
        note.innerText = "";
      } else {
        note.innerText = this.value;
      }
    }

    // no matter what, want value to be zero while in notes mode
    this.value = "";

    // notes mode is not clicked
  } else {
    // if it is a delete, bring back old hidden notes
    if (this.value == "") {
      handleDelete(this, false);
    }

    // if not one through nine - set to nothing
    else if (!oneThroughNine(this.value)) {
      this.value = "";
    }

    // legit value
    else {
      // hide notes
      this.parentElement.querySelector(".notesC").style.display = "none";

      // check if valid and highlight
      highlightErrors(this.value, this);
    }
  }

  // needs to be set timeout so the value actually gets added
  setTimeout(checkWin, 10);
}

// function for naviagting around the grid and graph
function navigate(el, key) {
  let count = 0;
  let c;
  // navigate with arrows and WASD
  if (key === "w" || key === "ArrowUp") {
    let row = (((parseInt(el.id.charAt(4)) - 1) % 9) + 9) % 9;
    c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
    while (c.disabled == true) {
      count++;
      row = (((row - 1) % 9) + 9) % 9;
      c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
      // in case entire row is disabled
      if (count > 9) {
        break;
      }
    }
  } else if (key === "s" || key === "ArrowDown") {
    let row = (((parseInt(el.id.charAt(4)) + 1) % 9) + 9) % 9;
    c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
    while (c.disabled == true) {
      count++;
      row = (((row + 1) % 9) + 9) % 9;
      c = document.querySelector(`#cell${row}${el.id.charAt(5)}`);
      // in case entire row is disabled
      if (count > 9) {
        break;
      }
    }
  } else if (key === "a" || key === "ArrowLeft") {
    let col = (((parseInt(el.id.charAt(5)) - 1) % 9) + 9) % 9;
    c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
    while (c.disabled == true) {
      count++;
      col = (((col - 1) % 9) + 9) % 9;
      c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
      // in case entire row is disabled
      if (count > 9) {
        break;
      }
    }
  } else if (key === "d" || key === "ArrowRight") {
    let col = (((parseInt(el.id.charAt(5)) + 1) % 9) + 9) % 9;
    c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
    while (c.disabled == true) {
      count++;
      col = (((col + 1) % 9) + 9) % 9;
      c = document.querySelector(`#cell${el.id.charAt(4)}${col}`);
      // in case entire row is disabled
      if (count > 9) {
        break;
      }
    }
  }
  // focus on the cell
  c.focus();
}

// called when the game is started
async function startGame(givens) {
  const board = createBoard();
  // get the grid from the generator
  let grid = await fillGrid(givens);
  document.querySelector("#grid-container").appendChild(board);
  populateWithArray(grid);
  createCheckbox();
  createHelpButton();
  createResetButton();
  // graph stuff - creates the graph
  document.querySelector("#graph-options-outer").classList.remove("hidden");
  document.querySelector("#cy").hidden = false;
  await generateGraph(grid);

  // register event lisnters for all of the input fields
  document.querySelectorAll(".bigN").forEach((el) => {
    // event listner for focus so can naviagte graph too
    el.addEventListener("focus", () => {
      // don't allow clicking if animation is running
      if (animationRunning) {
        alert("Let the animation finish before enterning values");
        el.blur();
      } else {
        selectCell(el);
      }
    });
    el.addEventListener("blur", () => {
      tappedNode.style({ "border-width": "0px" });

      // re color errors --- this is for when user clicks out and had an eror on selected node -
      // need to color that node, if another node is selected, this gets trigger in selectNode function
      if (errors.length > 0) {
        // re color
        errors.forEach((p) =>
          p.forEach((e) => {
            if (e !== document.activeElement) {
              colorNodeOutline(e, "red");
            }
          })
        );
      }
    });

    // on keydown
    el.addEventListener("keydown", (evt) => {
      if (
        [
          "w",
          "ArrowUp",
          "a",
          "ArrowLeft",
          "s",
          "ArrowDown",
          "d",
          "ArrowRight",
        ].filter((k) => evt.key === k).length === 1
      ) {
        navigate(el, evt.key);
      }

      // if it is a backspace and there is nothing in the value, delete all notes
      if ((evt.key === "Backspace" || evt.key === "Delete") && el.value == "") {
        el.parentElement
          .querySelectorAll(".note")
          .forEach((n) => (n.innerText = ""));

        // if the checkbox isn't checked, the number is one through nine, and the value isn't zero
      } else if (
        !document.querySelector("#notesCheckbox").checked &&
        oneThroughNine(evt.key) &&
        el.value !== ""
      ) {
        // the value to the number - override
        el.value = evt.key;
        helpReset();
        highlightErrors(el.value, el);
        setTimeout(checkWin, 10);

        // if it isn't 1-9, save the old value

        // hard delete the input because sometime the backspace doesn't work
      } else if (evt.key === "Backspace" || evt.key === "Delete") {
        el.value = "";
        handleDelete(el, document.querySelector("#notesCheckbox").checked);
      }
    });

    // extra checks before adding the value
    el.addEventListener("input", enterNumber);
  });

  // focus on random square
  let x = getRandomInt(9);
  let y = getRandomInt(9);
  let ce = document.querySelector(`#cell${x}${y}`);
  while (ce.disabled == true) {
    x = getRandomInt(9);
    y = getRandomInt(9);
    ce = document.querySelector(`#cell${x}${y}`);
  }
  ce.focus();

  // event listner for help button
  document.querySelector("#helpbtn").addEventListener("click", getHelp);
  // event listner for reset button
  document.querySelector("#resetbtn").addEventListener("click", () => {
    // need to close pop up
    document.querySelector("#solverDoneModal").classList.add("hidden");
    cy.resize();
    // first need to stop any animation that are happening
    animationRunning = false;
    resetGrid();
    resetGraph();
  });
}

// on load
window.addEventListener("load", () => {
  document.querySelector("#inputForm").addEventListener("submit", (evt) => {
    evt.preventDefault();
    let givens = document.querySelector("#slider").value;
    document.querySelector("#range-container").remove();
    document.querySelector("#header").remove();
    document.querySelector("#container").classList.remove("start");
    document.querySelector("#sudoku-container").classList.remove("start");
    createSelection();
    // start game
    startGame(givens);
  });

  // register pressing the tab key for notes mode
  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Tab") {
      evt.preventDefault();

      if (document.querySelector("#notesCheckbox").checked) {
        document.querySelector("#notesCheckbox").checked = false;
      } else {
        document.querySelector("#notesCheckbox").checked = true;
      }
    }
  });

  // toggle the instructions
  var toggleInstructions = true;
  document.querySelector("#instructionBtn").addEventListener("click", () => {
    let instructions = document.querySelector("#instructions");
    if (toggleInstructions) {
      instructions.classList.remove("hidden");
    } else {
      instructions.classList.add("hidden");
    }
    toggleInstructions = !toggleInstructions;
  });
});
