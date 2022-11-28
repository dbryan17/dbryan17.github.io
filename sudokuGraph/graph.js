/*
This file is for creating and everyting to do with the graph part of the app except for solving 
*/
var cy;
var color_map = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "lime",
  5: "green",
  6: "cyan",
  7: "blue",
  8: "indigo",
  9: "violet",
};

// generates vertices and associated data given a sudoku grid
function generateVertices(sudoku) {
  // turns sudoku array of arrays into format needed for graph
  return sudoku.reduce((acc, row, row_idx) => {
    return acc.concat(
      row.map((cell, col_idx) => {
        return {
          groups: "nodes",
          data: {
            id: `${row_idx.toString()}${col_idx.toString()}`,
            col: `${col_idx.toString()}`,
            row: `${row_idx.toString()}`,
            number: cell === "-1" ? "" : cell,
            locked: !(cell === "-1"),
          },
        };
      })
    );
  }, []);
}

// generates edges
function generateEdges() {
  // to be final edge array
  let edgeArray = [];
  // array of objects where each object is set of vertices that is a clique (complete subgraph)
  // so a box or a row, and the type of that group
  let groups = [];

  // add all of the boxes to the groups
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let tmp = [];
      for (let ii = 0; ii < 3; ii++) {
        for (let jj = 0; jj < 3; jj++) {
          tmp.push(`${(i * 3 + ii).toString()}${(j * 3 + jj).toString()}`);
        }
      }
      groups.push({ vs: tmp, type: "box" });
    }
  }

  // add rows
  for (let i = 0; i < 9; i++) {
    let tmp = [];
    for (let j = 0; j < 9; j++) {
      tmp.push(`${i.toString()}${j.toString()}`);
    }
    groups.push({ vs: tmp, type: "row" });
  }

  // // add cols
  for (let j = 0; j < 9; j++) {
    let tmp = [];
    for (let i = 0; i < 9; i++) {
      tmp.push(`${i.toString()}${j.toString()}`);
    }
    groups.push({ vs: tmp, type: "col" });
  }

  // goes through all of the groups and "makes complete" - exactly one edge between each and every other
  groups.forEach((group) => {
    // array of elements to make complete - of the form "10", "21"
    let vs = group.vs;

    for (i = 0; i < vs.length; i++) {
      // make an edge with everything after i in group
      for (j = i + 1; j < vs.length; j++) {
        // add edge between i and j
        edgeArray.push({
          group: "edges",
          data: {
            id: `from${vs[i]}to${vs[j]}`,
            source: `${vs[i]}`,
            target: `${vs[j]}`,
            type: group.type,
          },
        });
      }
    }
  });

  return edgeArray;
}

// styles
var stylesArray = [
  {
    selector: "node",
    style: {
      label: "",
      // color with the number if locked
      "background-color": (node) =>
        node.data("number") && node.data("locked")
          ? color_map[node.data("number")]
          : "#666",
    },
  },
  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#ccc",
    },
  },
];

// initial layout
var layout = {
  name: "grid",
  rows: 9,
  cols: 9,
  padding: 30,
  fit: true,
};

// generates graph
async function generateGraph(sudoku) {
  // init cytoscape with optios
  cy = cytoscape({
    container: document.getElementById("cy"),
    style: stylesArray,
    userZoomingEnabled: false,
    userPanningEnabled: false,
    boxSelectionEnabled: false,
    elements: {
      nodes: generateVertices(sudoku),
      edges: generateEdges(),
    },
    layout: layout,
  });

  // add event listners
  addDragListener();
  addLayoutListeners();
  labelNodesListener();
  graphNavListeners();
  edgeColorListener();
  solveListener();

  return;
}

// listners for layout resetting stuff //

var layoutRunning = false;
var redo = false;
var toLayout;

// show layout reset when node is dragged
var oneDrag = () => {
  showLayoutReset(true);
};

// first lisenter for a drag - want to allow for reseting layout
function addDragListener() {
  // cy.one is an event listener that only fires once
  cy.one("drag", oneDrag);
}

// lisenter for resetting and changing layuout
function addLayoutListeners() {
  // means it must have been checked
  document.querySelector("#resetLayout_btn").addEventListener("click", () => {
    layout = cy.layout({
      name: document.querySelector("#layouts_select").value,
      animate: false,
      fit: true,
      padding: 30,
    });
    layout.run();
    showLayoutReset(false);
    // remove and add a new listener that will fire once
    cy.removeListener("drag", oneDrag);
    cy.one("drag", oneDrag);
  });

  // listner for changing layout will run only on changed value
  document
    .querySelector("#layouts_select")
    .addEventListener("input", changeLayout);
}

// shows/ides layout reset
function showLayoutReset(show) {
  document.querySelector("#resetLayout_btn").hidden = !show;
}

// changes layout from grid to circle and vise versa
function changeLayout() {
  let layoutSelection = document.querySelector("#layouts_select").value;

  // logic to handle funky user inputs like switching back and forth fast
  if (layoutRunning === true) {
    redo = toLayout !== layoutSelection;
    return;
  }
  redo = false;

  // new layout
  layout = cy.layout({
    name: layoutSelection,
    animate: document.querySelector("#animate_checkbox").checked,
    fit: true,
    padding: 30,
    animationDuration: 2000,
    ready: () => {
      layoutRunning = true;
      toLayout = layoutSelection;
    },
    // more logic to handle funky stuff - on stop if we need to do it again call it
    stop: () => {
      layoutRunning = false;
      toLayout = "";
      if (redo) {
        changeLayout();
      }
    },
  });
  layout.run();
  showLayoutReset(false);
  cy.removeListener("rag", oneDrag);
  cy.one("drag", oneDrag);
}

/////// below is logic for coloring adjacent nodes a certain color to help show
/////// the nature of the graph - out for now because I thought it was too busy

// var adjacentNodesInput = document.querySelector("#adjacentNodes_checkbox");
// adjacentNodesInput.addEventListener("change", (evt) => {
//   if (tappedNode) {
//     colorAdjacent(tappedNode, adjacentNodesInput.checked);
//   }
// });

// function colorAdjacent(node, color) {
//   let adjacentNodes = node
//     .connectedEdges()
//     .connectedNodes()
//     .filter((el) => el != node);
//   if (color) {
//     adjacentNodes.style({
//       "border-color": "green",
//       "border-width": "8px",
//       "border-style": "double",
//     });
//     // "uncolor"
//   } else {
//     adjacentNodes.style({
//       "border-width": "0px",
//     });
//   }
// }

var tappedNode;
// select a given node
function selectNode(node) {
  // can't select a "given" node - like in grid
  if (node.data("locked")) {
    return;
  }

  node.style({
    "border-color": "blue",
    "border-width": "8px",
    "border-style": "double",
    "border-opacity": 1,
  });

  ////// more for coloring adjacent /////
  // if (adjacentNodesInput.checked) {
  //   colorAdjacent(node, true);
  // }

  tappedNode = node;

  // re color errors
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
}

// when cell is selected in grid - select in graph
const selectCell = (cell) => selectNode(cy.getElementById(cell.id.slice(-2)));

// color a given node's outline with a given color
function colorNodeOutline(cell, color) {
  let vertex = cy.getElementById(cell.id.slice(-2));
  if (color) {
    vertex.style({
      "border-color": color,
      "border-width": "8px",
      "border-style": "double",
      "border-opacity": 1,
    });
  } else {
    vertex.style({ "border-width": "0px" });
  }
}

// color a given node - empty is wether to color it back to "blank"
function colorNode(node, empty) {
  if (empty) {
    node.style({
      label: `${node.data("number")}`,
      "background-color": "#666",
      opacity: 1,
    });
    return;
  }

  if (document.querySelector("#labelNodes_checkbox").checked) {
    node.style({ label: `${node.data("number")}` });
  }
  tappedNode.style({
    "background-color": `${color_map[node.data("number")]}`,
    opacity: 0.8,
  });
}

// listner for tapping on nodes
function graphNavListeners() {
  // cypltoscapes custon listner - for a tap on a node
  cy.on("tap", "node", (evt) => {
    // select in sudoku
    let cell = document.querySelector(`#cell${evt.target.data("id")}`);
    cell.focus();
    // on focus event listner will trigger and call the selectNode function from sudoku.js
  });

  // on keydown
  document.addEventListener("keydown", (evt) => {
    // add color
    if (
      (evt.key === "1" ||
        evt.key === "2" ||
        evt.key === "3" ||
        evt.key === "4" ||
        evt.key === "5" ||
        evt.key === "6" ||
        evt.key === "7" ||
        evt.key === "8" ||
        evt.key === "9") &&
      !document.querySelector("#notesCheckbox").checked
    ) {
      if (tappedNode) {
        tappedNode.data("number", evt.key);

        colorNode(tappedNode, false);
      }
    }
    // delete color
    if (evt.key === "Backspace" || evt.key === "Delete") {
      if (tappedNode) {
        tappedNode.data("number", "");
        colorNode(tappedNode, true);
      }
    }
  });
}

// edge color listner and colorer
function edgeColorListener() {
  document
    .querySelector("#edgeColor_checkbox")
    .addEventListener("change", (evt) => {
      if (document.querySelector("#edgeColor_checkbox").checked) {
        cy.elements('[type = "row"]').style({ "line-color": "green" });
        cy.elements('[type = "box"]').style({ "line-color": "red" });
        cy.elements('[type = "col"]').style({ "line-color": "blue" });
      } else {
        cy.edges().style({
          "line-color": "rgb(204,204,204)",
        });
      }
    });
}

// label nodes listener and labeler
function labelNodesListener() {
  var labelNodesInput = document.querySelector("#labelNodes_checkbox");
  labelNodesInput.addEventListener("change", () => {
    if (!animationRunning) {
      if (labelNodesInput.checked) {
        //cy.nodes().style({ "label": "data(number)" });
        cy.nodes().forEach((node) =>
          node.style({ label: `${node.data("number")}` })
        );
      } else {
        cy.nodes().style({ label: "" });
      }
    } else {
      console.log("here");
      labelNodesInput.checked = !labelNodesInput.checked;
      alert("Let the animation finish before enterning values");
    }
  });
}

// reset graph to original givens
function resetGraph() {
  cy.nodes().forEach((node) => {
    // if it is not a locked node
    if (!node.data("locked")) {
      // reset node body color
      node.data("number", "");
      colorNode(node, true);
    }
    // in all cases - need to reset the border
    node.style({ "border-width": "0px" });
  });
}
