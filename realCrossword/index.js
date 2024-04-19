const generateBoard = (height, width) => {
  // get parent
  let divCont = document.querySelector("#container");
  divCont.innerHTML = ``;
  let cwTable = document.createElement("table");
  cwTable.id = "cwTable";

  // rows
  for (let h = 0; h < height; h++) {
    let row = document.createElement("tr");
    // add cells
    for (let w = 0; w < width; w++) {
      let cell = document.createElement("td");
      cell.classList.add("cell", `row${h.toString()}`, `col${w.toString()}`);
      let textContainer = document.createElement("div");
      textContainer.classList.add("textContainer");
      let input = document.createElement("input");
      input.id = `cell${h.toString()}${w.toString()}`;
      input.classList.add("input");
      input.type = "text";
      input.maxLength = "1";
      input.autocomplete = "off";

      textContainer.appendChild(input);
      // event listners
      input.addEventListener("click", () => {
        if (!isDoneEditing && isBlackSquareSelect) {
          if (input.style.backgroundColor) {
            input.style.backgroundColor = "";
          } else {
            input.style.backgroundColor = "#DCF8C6";
          }
        }
      });
      input.addEventListener("input", (evt) => {
        if (!isDoneEditing && isLetterInsert) {
          // input.value = evt.value;
        } else {
          input.value = "";
        }
      });

      /////////
      cell.appendChild(textContainer);
      row.classList.add("row");
      row.appendChild(cell);
    }
    cwTable.appendChild(row);
  }
  divCont.appendChild(cwTable);
};

document.querySelector("#createGridBtn").addEventListener("click", () => {
  isDoneEditing = false;
  // get height and width
  let height = document.querySelector("#heightInput").value;
  let width = document.querySelector("#widthInput").value;
  generateBoard(height, width);
});
/////////
// global vars - should prob use react or something
let isBlackSquareSelect = false;
let isLetterInsert = false;
let isDoneEditing = false;

////////

document.querySelector("#blackSquareBtn").addEventListener("click", () => {
  if (!isLetterInsert) {
    isBlackSquareSelect = !isBlackSquareSelect;
    // toggle style class
    if (isBlackSquareSelect) {
      document.querySelector("#blackSquareBtn").classList.add("active");
    } else {
      document.querySelector("#blackSquareBtn").classList.remove("active");
    }
  }
});

document.querySelector("#lettersBtn").addEventListener("click", () => {
  if (!isBlackSquareSelect) {
    isLetterInsert = !isLetterInsert;
    // toggle styles
    if (isLetterInsert) {
      document.querySelector("#lettersBtn").classList.add("active");
    } else {
      document.querySelector("#lettersBtn").classList.remove("active");
    }
  }
});

document.querySelector("#lockBtn").addEventListener("click", () => {
  isDoneEditing = true;
});

document.querySelector("#fillBtn").addEventListener("click", () => {
  isDoneEditing = true;
  // need to go through and find all black squares and givens and such and call fcn to autofill
  let grid = Array.from(document.querySelector("#cwTable").childNodes).reduce(
    (acc, row) => {
      // get cells
      let rowArr = [];
      row.childNodes.forEach((cell) => {
        let inputEle = cell.querySelector("div.textContainer > input");
        if (inputEle.style.backgroundColor !== "") {
          // black square
          rowArr.push(["_", false]);
        } else if (inputEle.value !== "") {
          // locked val
          rowArr.push([inputEle.value, true]);
        } else {
          // blank
          rowArr.push([",", false]);
        }
      });
      acc.push(rowArr);
      return acc;
    },
    []
  );
  console.log(grid);
  let cw = outerCreateCw(grid, null);
  // now insert into grid
  cw.forEach((row, r) => {
    row.forEach((cell, c) => {
      // get cell input
      let cellInput = document.querySelector(
        `#cell${r.toString()}${c.toString()}`
      );
      if (cell[0] !== "_") {
        cellInput.value = cell[0];
      }
    });
  });
});

////////////////////////////
////////////////////////////
////////////////////////////
////////////////////////////
