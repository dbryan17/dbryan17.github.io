/*
This file is for everything to do with coloring algorithms (solving graph)
*/

// solve button listener
function solveListener() {
  const colorGraph = document.querySelector("#colorGrpah");
  const solverModal = document.querySelector("#solverModal");
  const solveForm = document.querySelector("#solveForm");

  colorGraph.addEventListener("click", () => {
    // don't allow a new solve if one is animating
    if (!animationRunning) {
      solverModal.classList.remove("hidden");
      colorGraph.hidden = true;
      document.querySelector("#solverDoneModal").classList.add("hidden");
      // in case it changed the graphs position - tell it to resize so it handles clicks appropiately
      cy.resize();
    } else {
      alert("Let the animation finish before enterning values");
    }
  });

  // on submit of the solve - call the solving algorithm
  solveForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    solverModal.classList.add("hidden");
    colorGraph.hidden = false;
    cy.resize();
    graphSolve();
  });

  // reset
  solveForm.addEventListener("reset", (evt) => {
    evt.preventDefault();
    solverModal.classList.add("hidden");
    colorGraph.hidden = false;

    cy.resize();
  });
}

// listener for closing the end of solve box
document.querySelector("#solverDoneButton").addEventListener("click", () => {
  document.querySelector("#solverDoneModal").classList.add("hidden");
  cy.resize();
});
// for stopping the animation
document.querySelector("#stopAni").addEventListener("click", () => {
  animationRunning = false;
});

var animationRunning = false;

// main function that calls coloring alogirhtms and animation alogirthms
function graphSolve() {
  // reset count and start time
  count = 0;
  let start = Date.now();
  let selection = document.querySelector("#algSelect").value;
  let answer;
  // switch on selecction and get if it worked or not
  switch (selection) {
    case "firstEmpty":
      answer = backtrackingFirstEmpty();
      break;
    case "fewestFirst":
      answer = backtrackingFewestFirst();
      break;
    default:
      throw new Exception("check the values of algSelect");
  }

  let solverDoneModal = document.querySelector("#solverDoneModal");

  // in case of not first alg
  if (document.querySelector("#solveStats")) {
    document.querySelector("#solveStats").remove();
  }

  // will be included in the done modal
  let stats = document.createElement("div");
  stats.classList.add("option");
  stats.id = "solveStats";

  // solving algorithim failed
  if (!answer) {
    stats.innerText = `No valid solution due to user inputs, sudoku reset`;
    solverDoneModal.insertBefore(stats, solverDoneModal.firstChild);
    solverDoneModal.classList.remove("hidden");
    cy.resize();
    animationRunning = false;
    resetGrid();
    resetGraph();
    return;

    // it worked
  } else {
    let end = Date.now();
    let miliseconds = end - start;
    stats.innerText = `Completed in ${miliseconds} miliseconds and ${count} step${
      count === 1 ? "" : "s"
    }`;
  }

  solverDoneModal.insertBefore(stats, solverDoneModal.firstChild);
  solverDoneModal.classList.remove("hidden");
  cy.resize();

  // we have an animation
  if (document.querySelector("#animateColringCheckbox").checked) {
    animationRunning = true;
    document.querySelector("#stopAni").hidden = false;
    i = 0;
    // aniTime is space in between each color - keeps it to a min of 2 secs, but
    // will be zero if it was over 2000 steps, but just coloring takes time, so can run
    // very long
    aniTime = Math.floor(2000 / aniQueue.length);
    // starts the animation
    changeNext();
    // don't need to animate
  } else {
    // need to color all nodes
    cy.nodes()
      .filter((el) => !el.data("locked"))
      .forEach((node) =>
        node.style({
          "background-color": `${color_map[node.data("number")]}`,
          opacity: 0.8,
        })
      );
    endSolve();
  }
}

var aniTime;
var i = 0;
var aniQueue = [];

// recursive function for animating
function changeNext() {
  // stopped midway from button
  if (!animationRunning) {
    cy.nodes()
      .filter((el) => !el.data("locked"))
      .forEach((node) => {
        // was called from reset, so these are not opqaue
        if (node.data("number") === "") {
          node.style({ "background-color": "#666", opacity: 1 });

          // was called from button so want these to still be colored
        } else {
          node.style({
            "background-color": `${color_map[node.data("number")]}`,
            opacity: 0.8,
          });
        }
      });
    endSolve();
  }

  // still have more to go
  if (i < aniQueue.length) {
    aniQueue[i]["node"].style(aniQueue[i]["style"]);
    i++;
    // recursive call about amount of miliseconds
    setTimeout(changeNext, aniTime);
  } else {
    endSolve();
  }
}

// called when solve is over
function endSolve() {
  // reset vars
  animationRunning = false;
  document.querySelector("#stopAni").hidden = true;
  i = 0;
  aniQueue = [];
  count = 0;
  // add labels if needed
  if (document.querySelector("#labelNodes_checkbox").checked) {
    cy.nodes().forEach((node) => {
      node.style({ label: `${node.data("number")}` });
    });
  }
  // fill grid
  refillGrid();
}

// this checks if the graph is a valid sudoku solution
function checkGraph() {
  let bool = true;
  // each node
  cy.nodes().forEach((node) => {
    // get the adjacent colors
    let adjColors = new Set();
    node
      .connectedEdges()
      .connectedNodes()
      .filter((el) => el != node)
      .forEach((node) => adjColors.add(node.data("number")));
    if (adjColors.has(node.data("number"))) {
      bool = false;
    }
  });
  return bool;
}

var count = 0;

// backtracking coloring algorithm that is more efficent - colors the node with fewest options first
function backtrackingFewestFirst() {
  // find all uncolored
  let unclored = cy.nodes().filter((node) => node.data("number") === "");
  // if all are colored
  // this being true would mean that this board is completely correct always if the user
  // didn't edit the board at all becuase then there would be exactly one solution, but since the user could have edited
  // it, there may be no solution which means this would trigger but the board be inccorect
  if (unclored.length === 0) {
    // now check if it is correct and return result
    return checkGraph();
  }

  // find the possiblities for all of the number of vertices
  let possibleNodes = unclored.map((node) => {
    let colors = getPossibleColors(node);
    let newObj = {
      node: node,
      possiblities: colors,
      length: colors.length,
    };
    return newObj;
  });

  // sort by fewest options first
  let sorted = possibleNodes.sort((a, b) => {
    return a.length - b.length;
  });

  // outer backtracking loop - goes through nodes left to color
  for (let i = 0; i < sorted.length; i++) {
    let node = sorted[i]["node"];
    let possibleColors = sorted[i]["possiblities"];
    // inner backtracking loop - goes through options for the node
    for (let j = 0; j < possibleColors.length; j++) {
      let color = possibleColors[j];
      count++;
      // "color" the node
      node.data("number", color);
      // push onto animation queue the style
      aniQueue.push({
        node: node,
        style: {
          "background-color": `${color_map[node.data("number")]}`,
          opacity: 0.8,
        },
      });
      // backtrack and return true if it is true
      if (backtrackingFewestFirst()) {
        return true;
      }
    }

    // didnt work reset node and push the "blank" style onto animation queue
    node.data("number", "");
    aniQueue.push({
      node: node,
      style: {
        "background-color": "#666",
        opacity: 1,
      },
    });

    return false;
  }
}

// backtracking coloring alogorithm that is less efficent - colors first empty first
function backtrackingFirstEmpty() {
  // find all uncolored vertices
  let unclored = cy.nodes().filter((node) => node.data("number") === "");

  // if all are colored
  // this being true would mean that this board is completely correct always if the user
  // didn't edit the board at all becuase then there would be exactly one solution, but since the user could have edited
  // it, there may be no solution which means this would trigger but the board be inccorect
  if (unclored.length === 0) {
    // now check if it is correct
    return checkGraph();
  }

  // outer backtracking loop - goes through nodes left to color
  for (let i = 0; i < unclored.length; i++) {
    let node = unclored[i];
    let possibleColors = getPossibleColors(node);
    // inner backtracking loop - goes through options for the node
    for (let j = 0; j < possibleColors.length; j++) {
      let color = possibleColors[j];
      count++;
      // color node and push style onto ani queue
      node.data("number", color);
      aniQueue.push({
        node: node,
        style: {
          "background-color": `${color_map[node.data("number")]}`,
          opacity: 0.8,
        },
      });
      // backtrack
      if (backtrackingFirstEmpty()) {
        return true;
      }
    }

    // didnt work reset node and push style
    node.data("number", "");
    aniQueue.push({
      node: node,
      style: {
        "background-color": "#666",
        opacity: 1,
      },
    });

    return false;
  }
}

// gets the possible colors for a node
function getPossibleColors(node) {
  let adjColors = new Set();
  // add all ajacent colors to set
  node
    .connectedEdges()
    .connectedNodes()
    .forEach((node) => adjColors.add(node.data("number")));
  // delete the empties
  adjColors.delete("");

  // numbers is array of numbers 1 thorugh 9 from generator global vars
  // this gets only the possible
  let poss = numbers.filter((num) => !adjColors.has(num));
  return poss;
}
