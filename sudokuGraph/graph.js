///////////////////
// INITILIZATION //
///////////////////

///// TODO /////
// then, figure out the naviagting with arrow keys and wasd like in sudoku, maybe just make them do both
// so, then I don't really need to implementet it here, just make them talk more 

var cy;
function generateVertices(sudoku) {


  return sudoku.reduce((acc, row, row_idx) => {
    return acc.concat(row.map((cell, col_idx) => {
      return {
        groups: "nodes",
        data: {
          id: `${row_idx.toString()}${col_idx.toString()}`,
          col: `${col_idx.toString()}`,
          row: `${row_idx.toString()}`,
          number: cell === "-1" ? "" : cell,
          locked: !(cell === "-1")
      }
    }
    }))
  },[])
}



function generateEdges() {
  let edgeArray = [];

  let groups = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let tmp = [];
      for (let ii = 0; ii < 3; ii++) {
        for (let jj = 0; jj < 3; jj++) {
          tmp.push(`${(i * 3 + ii).toString()}${(j * 3 + jj).toString()}`);
        }
      }
      groups.push({ vs: tmp, type: "box" });

      // get an array of all the these
      // within each thing - add all vertices in this thing to a collection
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

  // function to go throught an array of things and generate edges between them, sort of like "make complete"

  groups.forEach((group) => {
    // now have an array of elements to make complete - of the form "10", "21"

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


var stylesArray = [
  {
    selector: "node",
    style: {
      "background-color": "#666",
      label: "",
      "background-color": (node) => node.data("number") ? color_map[node.data("number")] :"#666"
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

var layout = { name: "grid", rows: 9, cols: 9, padding: 30, fit: true };



async function generateGraph(sudoku) {
  cy = cytoscape({
    container: document.getElementById("cy"),
    style: stylesArray,
    userZoomingEnabled: false,
    userPanningEnabled: false,
    boxSelectionEnabled: false,
    // If you want to apply the layout on the constructor
    // you must supply the elements too
    elements: {
      nodes: generateVertices(sudoku),
      edges: generateEdges(),
    },
    layout: layout,
  });

  addDragListener()
  addLayoutListeners()
  labelNodesListener()
  tmpGraphNavListeners()
  edgeColorListener()
  solveListener()



  return


}


var oneDrag = () => {
  showLayoutReset(true);
};
function addDragListener() {
  cy.one("drag", oneDrag);

}


function addLayoutListeners() {

    // means it must have been checked
  document
  .querySelector("#resetLayout_checkbox")
  .addEventListener("change", (evt) => {
    var layout = cy.layout({
      name: document.querySelector("#layouts_select").value,
      animate: false,
      fit: true,
    });
    layout.run();
    showLayoutReset(false);
    cy.removeListener("drag", oneDrag);
    cy.one("drag", oneDrag);
  });

  // will run only on changed value
  document
  .querySelector("#layouts_select")
  .addEventListener("input", changeLayout);


}


///////////////////
// INITILIZATION //
///////////////////

////////////////////////
/////// LAYOUT /////////
////////////////////////

function showLayoutReset(show) {
  document.querySelector("#resetLayout_checkbox").hidden = !show;
  document.querySelector("#resetLayout_checkbox").checked = false;
  document.querySelector("#resetLayout_label").hidden = !show;
}

var layoutRunning = false;
var redo = false;
var toLayout;


function handleStop() {
  layoutRunning = false;
  if (redo === true) {
    changeLayout();
  }
}

// TODOTODOTODTO
// function makeLayout(name, animate, onReady, onStop) {}

function changeLayout() {
  let layoutSelection = document.querySelector("#layouts_select").value;
  if (layoutRunning === true) {
    redo = toLayout !== layoutSelection;

    return;
  }
  redo = false;
  var layout = cy.layout({
    name: layoutSelection,
    animate: document.querySelector("#animate_checkbox").checked,
    fit: true,
    animationDuration: 2000,
    ready: () => {
      layoutRunning = true;
      toLayout = layoutSelection;
    },
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


////////////////////////
/////// LAYOUT /////////
////////////////////////

////////////////////////
/////// SELECTION //////
////////////////////////

var tappedNode;

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



function selectNode(node) {
  if(node.data("locked")) {
    return;
  }
  if (tappedNode) {
    // uncolor previous
    // TODO TODO TODO TODO TODO make only if it was preivously colored - save time 
    // colorAdjacent(tappedNode, false);
    tappedNode.style({ "border-width": "0px" });

    // if (tappedNode === node) {
    //   // if tapped was the tap, set tapped to none
    //   tappedNode = "";
    //   return;
    // }
  }

  node.style({
    "border-color": "blue",
    "border-width": "8px",
    "border-style": "double",
  });
  // if (adjacentNodesInput.checked) {
  //   colorAdjacent(node, true);
  // }

  tappedNode = node;


  // create selection box TDOTODTODOTDOTODTODTODTODTODTODTODTODTO
}


const selectCell = (cell) => selectNode(cy.getElementById(cell.id.slice(-2)));


// TODO 
function colorNodeOutline(cell, color) {

  let vertex = cy.getElementById(cell.id.slice(-2));
  if(color) {
  vertex.style({
    "border-color": color,
    "border-width": "8px",
    "border-style": "double",
  });
} else {

  vertex.style({ "border-width": "0px" });
}



}

// TODO for when I get back before dinner 
/*

- et rid of adjacent nodes
- highlight errors and help on both sudoku and graph

*/


function tmpGraphNavListeners() {


  cy.on("tap", "node", (evt) => {
    // select in sudoku
    let cell = document.querySelector(`#cell${evt.target.data("id")}`);
    cell.focus();
    // on focus event listner will trigger and call the selectNode function from sudoku.js
  });


  var gh = true;
document.addEventListener("keydown", (evt) => {
  


  if((evt.key === "1" || evt.key === "2" || evt.key === "3" || evt.key === "4" || evt.key === "5" || evt.key === "6" || evt.key === "7" || evt.key === "8" || evt.key === "9") && !document.querySelector("#notesCheckbox").checked) {
    if(tappedNode) {
      
      tappedNode.data("number", evt.key);
      if(document.querySelector("#labelNodes_checkbox").checked) {
        tappedNode.style({"label" : `${tappedNode.data("number")}`})

      }
      
      tappedNode.style({"background-color": `${color_map[tappedNode.data("number")]}`, "opacity": .8});

    
    }
  }
  if(evt.key === "Backspace" || evt.key === "Delete") {

    if(tappedNode) {
      tappedNode.data("number", "");
      tappedNode.style({"label" : `${tappedNode.data("number")}`, "background-color" : "#666"})


    }
  }
});


}

function solveListener() {
  const colorGraph = document.querySelector("#colorGrpah")
  const modalContainer = document.querySelector("#modalContainer")
  const solveForm = document.querySelector("#solveForm");
  colorGraph.addEventListener("click", (evt) => {

//     const head = document.querySelector("head")
//     const modalContainer = document.querySelector("#modalContainer")
//     const parser = new DOMParser();
//     const makeOpaque = parser.parseFromString(`
//     <style id="opaque">
//     * {
// filter: opacity(85%);
// }
// </style>
//     `, "text/html");

    // head.appendChild(makeOpaque.firstElementChild);

  

    
    

    modalContainer.hidden = false;
    colorGraph.hidden = true;
  })

  solveForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    // document.querySelector("#opaque").remove();
    modalContainer.hidden = true;
    colorGraph.hidden = false;
  })

  solveForm.addEventListener("reset", (evt) => {
    evt.preventDefault();
    // document.querySelector("#opaque").remove();
    modalContainer.hidden = true;
    colorGraph.hidden = false;
    
  })
}



// cy.on("tap", "node", (evt) => {
//   var node = evt.target;
//   if (tappedNode) {
//     // uncolor previous
//     // TODO TODO TODO TODO TODO make only if it was preivously colored - save time 

//     colorAdjacent(tappedNode, false);
//     tappedNode.style({ "border-width": "0px" });

//     if (tappedNode === node) {
//       // if tapped was the tap, set tapped to none
//       tappedNode = "";
//       return;
//     }
//   }
//   node.style({
//     "border-color": "green",
//     "border-width": "8px",
//     "border-style": "double",
//   });
//   if (adjacentNodesInput.checked) {
//     colorAdjacent(node, true);
//   }

//   tappedNode = node;


//   // create selection box
// });

////////////////////////
/////// SELECTION //////
////////////////////////

////////////////////////
///// EDGE COLOR ///////
////////////////////////

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

function labelNodesListener() {
  var labelNodesInput = document.querySelector("#labelNodes_checkbox");
labelNodesInput.addEventListener("change", () => {
  if (labelNodesInput.checked) {
    //cy.nodes().style({ "label": "data(number)" });
    cy.nodes().forEach((node) => node.style({"label" : `${node.data("number")}`}))
    //cy.nodes().forEach((node) => console.log(node.data()));
    
  } else {
    cy.nodes().style({ "label": "" });

  }
});

}




////////////////////////
///// EDGE COLOR ///////
////////////////////////



