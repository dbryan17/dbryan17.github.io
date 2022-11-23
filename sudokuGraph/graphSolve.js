// TODO TO FINISH PROJECT
// fix styling some
// clea up/ seprate files
// comment code more
///////////

function solveListener() {
  const colorGraph = document.querySelector("#colorGrpah");
  const solverModal = document.querySelector("#solverModal");
  const solveForm = document.querySelector("#solveForm");
  colorGraph.addEventListener("click", (evt) => {
    if (!animationRunning) {
      //solverModal.hidden = false;
      solverModal.classList.remove("hidden");
      colorGraph.hidden = true;
      //document.querySelector("#solverDoneModal").hidden = true;
      document.querySelector("#solverDoneModal").classList.add("hidden");
      cy.resize();
    } else {
      alert("Chilllll, let the animation finish dawg");
    }
  });

  solveForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    // document.querySelector("#opaque").remove();
    //solverModal.hidden = true;
    solverModal.classList.add("hidden");
    colorGraph.hidden = false;
    cy.resize();
    graphSolve();
  });

  solveForm.addEventListener("reset", (evt) => {
    evt.preventDefault();
    // document.querySelector("#opaque").remove();
    //solverModal.hidden = true;
    solverModal.classList.add("hidden");
    colorGraph.hidden = false;

    cy.resize();
  });
}

function delay() {
  console.log("delayed");
}

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
    // console.log("")
  }

  if (i < aniQueue.length) {
    aniQueue[i]["node"].style(aniQueue[i]["style"]);
    i++;
    setTimeout(changeNext, aniTime);
  } else {
    endSolve();
  }
}

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

document.querySelector("#solverDoneButton").addEventListener("click", () => {
  // close
  //document.querySelector("#solverDoneModal").hidden = true;
  document.querySelector("#solverDoneModal").classList.add("hidden");

  cy.resize();
});

document.querySelector("#stopAni").addEventListener("click", () => {
  // stop animation
  animationRunning = false;
});

var animationRunning = false;
function graphSolve() {
  count = 0;
  let start = Date.now();

  let selection = document.querySelector("#algSelect").value;
  console.log(selection);

  let answer;
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
  let stats = document.createElement("div");
  stats.classList.add("option");
  stats.id = "solveStats";

  console.log(answer);

  if (!answer) {
    // solving algorithim failed
    stats.innerText = `No valid solution due to user inputs, sudoku reset`;
    solverDoneModal.insertBefore(stats, solverDoneModal.firstChild);
    //solverDoneModal.hidden = false;
    solverDoneModal.classList.remove("hidden");
    cy.resize();
    // first need to stop any animation that are happening
    animationRunning = false;
    ////// HERE
    // reset sudoku
    resetGrid();

    // reset graph
    resetGraph();

    return;

    //
  } else {
    let end = Date.now();
    let miliseconds = end - start;
    stats.innerText = `Completed in ${miliseconds} miliseconds and ${count} step${
      count === 1 ? "" : "s"
    }`;
  }

  solverDoneModal.insertBefore(stats, solverDoneModal.firstChild);
  //solverDoneModal.hidden = false;
  solverDoneModal.classList.remove("hidden");
  cy.resize();

  if (document.querySelector("#animateColringCheckbox").checked) {
    animationRunning = true;
    document.querySelector("#stopAni").hidden = false;
    i = 0;
    aniTime = Math.floor(2000 / aniQueue.length);
    // starts the animation
    changeNext();
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
function backtrackingFewestFirst() {
  // find all uncolored
  let unclored = cy.nodes().filter((node) => node.data("number") === "");
  // if all are colored
  // this being true would mean that this board is completely correct always if the user
  // didn't edit the board at all becuase then there would be exactly one solution, but since the user could have edited
  // it, there may be no solution which means this would trigger but the board be inccorect
  if (unclored.length === 0) {
    // now check if it is correct
    console.log(checkGraph());
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

  for (let i = 0; i < sorted.length; i++) {
    let node = sorted[i]["node"];
    let possibleColors = sorted[i]["possiblities"];
    for (let j = 0; j < possibleColors.length; j++) {
      let color = possibleColors[j];
      count++;
      node.data("number", color);
      aniQueue.push({
        node: node,
        style: {
          "background-color": `${color_map[node.data("number")]}`,
          opacity: 0.8,
        },
      });

      if (backtrackingFewestFirst()) {
        return true;
      }
    }

    // didnt work reset node
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

function backtrackingFirstEmpty() {
  // find all uncolored vertices
  let unclored = cy.nodes().filter((node) => node.data("number") === "");

  // if all are colored
  // this being true would mean that this board is completely correct always if the user
  // didn't edit the board at all becuase then there would be exactly one solution, but since the user could have edited
  // it, there may be no solution which means this would trigger but the board be inccorect
  if (unclored.length === 0) {
    console.log("here");
    // now check if it is correct
    return checkGraph();
  }

  for (let i = 0; i < unclored.length; i++) {
    let node = unclored[i];
    let possibleColors = getPossibleColors(node);
    for (let j = 0; j < possibleColors.length; j++) {
      let color = possibleColors[j];
      count++;
      node.data("number", color);
      aniQueue.push({
        node: node,
        style: {
          "background-color": `${color_map[node.data("number")]}`,
          opacity: 0.8,
        },
      });

      if (backtrackingFirstEmpty()) {
        return true;
      }
    }

    // didnt work reset node
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

function getPossibleColors(node) {
  let adjColors = new Set();

  node
    .connectedEdges()
    .connectedNodes()
    .forEach((node) => adjColors.add(node.data("number")));

  adjColors.delete("");

  // numbers is array of numbers 1 thorugh 9 from generator global vars
  let poss = numbers.filter((num) => !adjColors.has(num));

  return poss;
}
