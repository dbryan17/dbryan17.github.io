/*
This file includes functions related to error checking and highlighting, and helping
*/
"use strict";
var errors = [];
var help_stage = 0;
var help;
var help_highlights = [];

// create and adds the help button
function createHelpButton() {
  const parser = new DOMParser();

  const helpbtn = parser.parseFromString(
    `
        <button id="helpbtn" type="button">Help</button> 
    `,
    "text/html"
  );
  document
    .querySelector("#help-button-container")
    .appendChild(helpbtn.body.firstElementChild);
}

// called when a number is added or deleted, highlights errors in the grid
function highlightErrors(num, el) {
  // set of htmls elements that do not fit with new insertion (errors)
  let highlight = checkUnq(
    num,
    parseInt(el.id.charAt(4)),
    parseInt(el.id.charAt(5))
  );
  // get rid of this value
  highlight.delete(el);

  // set all old errors back to orginal color
  errors.forEach((p) =>
    p.forEach((e) => {
      if (e.disabled) {
        e.style.color = "black";
      } else {
        e.style.color = "darkslategray";
      }
      // for graph - want to color back but not if it is the selected one (stays blue)
      // only color back if not the selected one
      if (e !== document.activeElement) {
        colorNodeOutline(e, false);
      }
    })
  );

  // get rid of any errors that this element previously causes
  errors = errors.filter((p) => p[0] !== el);

  // if there is any new errros
  if (highlight.size > 0) {
    // add them to the errors list
    highlight.forEach((e) => errors.push([el, e]));
  }

  // set all errors to red
  errors.forEach((p) => {
    p[0].style.color = "red";
    p[1].style.color = "red";
    // first one is the one that is not the selected one and never was
    colorNodeOutline(p[1], "red");
    // this could have been a previous seletion that causes this, so might still need to color red
    if (p[0] !== document.activeElement) {
      colorNodeOutline(p[0], "red");
    }
  });
}

// reset help stuff to start
function helpReset() {
  document.querySelector("#helpbtn").innerText = "Help?";
  help_stage = 0;

  // reset colors of all highlights
  help_highlights.forEach((e) => {
    if (e.disabled) {
      e.style.color = "black";
    } else {
      e.style.color = "darkslategray";
    }
    // on graph too
    colorNodeOutline(e, false);
  });

  help_highlights = [];
}

// highlights list elements orange for help
function helpHighlighter(cords) {
  cords.forEach((cord) => {
    help_highlights.push(document.querySelector(`#cell${cord[0]}${cord[1]}`));
  });

  help_highlights.forEach((el) => {
    el.style.color = "orange";
    // on graph too
    colorNodeOutline(el, "orange");
  });
}

// trigger on help button press
function getHelp() {
  // don't allow if graph coloring animation is happening
  // otherwise could end up with bad/broken resluts
  if (animationRunning) {
    return;
  }
  // "first" click - highlight cell
  if (help_stage === 0) {
    // help is array of [cords, eventual value, array of cords that help]
    help = getInitialHelp();
    // "second click" - highlight helpers
  } else if (help_stage === 1) {
    // highlights helper cells
    getMoreHelp(help[2]);
    // rehighligh crret cell
    let c = document.querySelector(
      `#cell${help[0][0].toString()}${help[0][1].toString()}`
    );
    c.focus();
    // "third" click - reveal cell
  } else if (help_stage === 2) {
    // rehighlight
    let c = document.querySelector(
      `#cell${help[0][0].toString()}${help[0][1].toString()}`
    );
    c.parentElement.querySelector(".notesC").style.display = "none";
    c.value = help[1];
    helpReset();
    // get rid of old errors (this is same as a delete)
    highlightErrors(help[1], c);

    // stuff for graph - insert number (color)
    tappedNode.data("number", help[1]);
    if (document.querySelector("#labelNodes_checkbox").checked) {
      tappedNode.style({ label: `${tappedNode.data("number")}` });
    }
    tappedNode.style({
      "background-color": `${color_map[tappedNode.data("number")]}`,
      opacity: 0.8,
    });
    // check if it is a win after some time for all this to finish
    setTimeout(checkWin, 10);
  }
}

// second step - highlights all helper cells
function getMoreHelp(toH) {
  helpHighlighter(toH);
  document.querySelector("#helpbtn").innerText = "reveal cell?";
  help_stage++;
}

// called when help is clicked "first" time
function getInitialHelp() {
  // note: solution board is global as solution_b

  // get the current board as array
  let current_b = [];
  for (let i = 0; i < 9; i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      let v = document.querySelector(`#cell${i}${j}`).value;
      if (v === "") {
        v = "-1";
      }
      row.push(v);
    }
    current_b.push(row);
  }

  // filter out wrong answers
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (current_b[i][j] !== solution_b[i][j]) {
        current_b[i][j] = "-1";
      }
    }
  }

  // get a cell that can be solved with human used starts with helpfcn
  let helpCell = helpfcn(current_b);

  // if we can't get a cell that is solvable with human strageties - not help
  // if not enter this and begin the help stuff
  if (helpCell) {
    // highlight cell
    let c = document.querySelector(
      `#cell${helpCell[0][0].toString()}${helpCell[0][1].toString()}`
    );
    c.focus();
    document.querySelector("#helpbtn").innerText = "more help?";
    help_stage = 1;
    return helpCell;
  }
}
