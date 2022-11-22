// TODO TO FINISH PROJECT 
// amke a button that will stop the animation and clear the queue then just color nodes
// make a pop up after the nimation that says how many steps and a timer 
// make hte animation stuff asynchornous
// fix styling some 
// clea up/ seprate files
// comment code more
// make a selection ting - maybe just say the color and number 
// disable changing color, labeling nodes during the animation
// handle when alg is false (user fucked it up)
// when you click out of a node that had an error - it needs to highlight it like it does when you move to another one
///////////




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
    cy.resize()
  })

  solveForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    // document.querySelector("#opaque").remove();
    modalContainer.hidden = true;
    colorGraph.hidden = false;
    cy.resize();
    graphSolve();

  })

  solveForm.addEventListener("reset", (evt) => {
    evt.preventDefault();
    // document.querySelector("#opaque").remove();
    modalContainer.hidden = true;
    colorGraph.hidden = false;

    cy.resize()
    
  })
}


function delay() {
  console.log("delayed")
}



function changeNext() {

  if(i < aniQueue.length) {


    aniQueue[i]["node"].style(aniQueue[i]["style"])
    i++;
    setTimeout(changeNext, aniTime);


  } else {
    endSolve()
    

  }



}

function endSolve() {
  // reset vars 
  i = 0;
  aniQueue = [];
  count = 0;
  // add labels if needed 
  if(document.querySelector("#labelNodes_checkbox").checked) {
    cy.nodes().forEach((node) => {
      node.style({"label" : `${node.data("number")}`})

    })
    
  }
  // fill grid
  refillGrid();

}

function graphSolve() {

  count = 0;
  let start = Date.now();

  let selection = document.querySelector("#algSelect").value
  console.log(selection)
  
  let answer;
  switch(selection) {
    case "firstEmpty":
      answer = backtrackingFirstEmpty()
      break;
    case "fewestFirst":
      answer = backtrackingFewestFirst()
      break;
    default:
      throw new Exception("check the values of algSelect")
  }

  if(!answer) {
    // solving algorithim failed

    // need to save what the user had before --- in graph 
  }


  let end = Date.now()
  let miliseconds = end - start;
  console.log(answer)
  console.log(count)
  console.log(miliseconds)

  if(document.querySelector("#animateColringCheckbox").checked) {
    i = 0;
    aniTime = Math.floor(2000 / aniQueue.length);
    // starts the animation 
    changeNext();
  } else {
    // need to color all nodes 
    cy.nodes().filter((el) => !el.data("locked")).forEach((node) => node.style({"background-color": `${color_map[node.data("number")]}`, "opacity": .8}))
    endSolve()
  }

  

  
}

var aniTime;
var i = 0;
var aniQueue = []

function checkGraph() {
  let bool = true;
  // each node
  cy.nodes().every((node) => {
    // get the adjacent colors
    let adjColors = new Set(); 
    node.connectedEdges().connectedNodes().filter((el) => el != node).forEach((node) => adjColors.add(node.data("number")));
    if(adjColors.has(node.data("number"))) {
      bool = false 
      return
    }
  })
  return bool;

}

var count = 0;
function backtrackingFewestFirst() {

  // find all uncolored
  let unclored = cy.nodes().filter((node) => (node.data("number") === ""))
  // if all are colored
  // this being true would mean that this board is completely correct always if the user 
  // didn't edit the board at all becuase then there would be exactly one solution, but since the user could have edited
  // it, there may be no solution which means this would trigger but the board be inccorect
  if(unclored.length === 0) {
    // now check if it is correct
    return checkGraph()
  }

  // find the possiblities for all of the number of vertices 
  let possibleNodes = unclored.map((node) => {
    let colors = getPossibleColors(node)
    let newObj = {
      node: node,
      possiblities: colors,
      length: colors.length
    }
    return newObj
  });

  // sort by fewest options first 
  let sorted = possibleNodes.sort((a,b) => {
    return a.length - b.length;
  })

  for(let i = 0; i < sorted.length; i++) {
    let node = sorted[i]["node"]
    let possibleColors = sorted[i]["possiblities"]
    for(let j = 0; j < possibleColors.length; j++) {
      let color = possibleColors[j];
      count++;
      node.data("number", color); 
      aniQueue.push({node: node, style: {
  
          "background-color": `${color_map[node.data("number")]}`,
          "opacity": .8
  

      }});

      if(backtrackingFewestFirst()) {
        return true;
      }
    }

    // didnt work reset node
    node.data("number", "");
    aniQueue.push({node: node, style: {

        "background-color" : "#666", 
        "opacity": 1

    }})

    return false;
  }


}



function backtrackingFirstEmpty() {

  // find all uncolored vertices
  let unclored = cy.nodes().filter((node) => (node.data("number") === ""))


  // if all are colored
  // this being true would mean that this board is completely correct always if the user 
  // didn't edit the board at all becuase then there would be exactly one solution, but since the user could have edited
  // it, there may be no solution which means this would trigger but the board be inccorect
  if(unclored.length === 0) {

    console.log("here")
    // now check if it is correct
    return checkGraph()
    

  }

  

  for(let i = 0; i < unclored.length; i++) {
    let node = unclored[i]
    let possibleColors = getPossibleColors(node)
    for(let j = 0; j < possibleColors.length; j++) {
      let color = possibleColors[j];
      count++;
      node.data("number", color); 
      aniQueue.push({node: node, style: {
  
          "background-color": `${color_map[node.data("number")]}`,
          "opacity": .8
  

      }});

      if(backtrackingFirstEmpty()) {
        return true;
      }
    }

    // didnt work reset node
    node.data("number", "");
    aniQueue.push({node: node, style: {

        "background-color" : "#666", 
        "opacity": 1

    }})

    return false;
  }


}

function getPossibleColors(node) {

  let adjColors = new Set();
  
  node.connectedEdges().connectedNodes().forEach((node) => adjColors.add(node.data("number")));

  adjColors.delete("")

  // numbers is array of numbers 1 thorugh 9 from generator global vars
  let poss = numbers.filter((num) => !adjColors.has(num))

  return poss




}

