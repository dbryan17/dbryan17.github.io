var rectCanvas = document.querySelector("#rectCanvas");
var rectCtx = rectCanvas.getContext("2d");
rectCanvas.width = canWidth;
rectCanvas.height = canHeight;

// event listeners for mouse stuff 
rectCanvas.addEventListener("mousedown", e => mouseDown(e));
rectCanvas.addEventListener("mousemove", e => mouseMove(e));
rectCanvas.addEventListener("mouseup", e => mouseUp(e));

// global vars needed for box stuff 
var startX;
var startY;
var isDown;

// set context stuff for rect 
rectCtx.strokeStyle = "red";
rectCtx.lineWidth = 5;

function myDrawRect(startX, startY, endX, endY) {

  let rectWidth = endX - startX - rectCtx.lineWidth;
  let rectHeight = endY - startY - rectCtx.lineWidth;
  if(startX > endX) {
    let tmpStart = startX;
    startX = endX
    endX = tmpStart
  }
  if(startY > endY) {
    let tmpStart = startY;
    startY = endY;
    endY = tmpStart

  }

  draw(myModule, myGenPixles, startX, startY, endX, endY, false)

}

function mouseUp(e) {
  e.preventDefault();
  
  // the 3840/ 356 and 2160/ 200 is to convert from the pixel range to the css size range - 356 and 200 is size of the canvas in css pixels
  let endX = parseInt(e.offsetX) * (canWidth / rectCanvas.clientWidth);
  let endY = parseInt(e.offsetY) * (canHeight / rectCanvas.clientHeight);

  isDown = false;
  rectCtx.clearRect(0,0, rectCanvas.width, rectCanvas.height);

  myDrawRect(Math.round(startX), Math.round(startY), Math.round(endX), Math.round(endY));



}



function mouseDown(e) {
  e.preventDefault();


  // the 3840/ 356 and 2160/ 200 is to convert from the pixel range to the css size range - 356 and 200 is size of the canvas in css pixels
  startX = parseInt(e.offsetX) * (canWidth / rectCanvas.clientWidth) //+ parseInt(e.offsetX);
  startY = parseInt(e.offsetY) * (canHeight / rectCanvas.clientHeight) //+ parseInt(e.offsetY);
  isDown=true;
}

function mouseMove(e) {

  e.preventDefault();

  if(!isDown) {
    return
  }

  // the 3840/ 356 and 2160/ 200 is to convert from the pixel range to the css size range - 356 and 200 is size of the canvas in css pixels 
  let mouseX = parseInt(e.offsetX) * (canWidth / rectCanvas.clientWidth)
  let mouseY = parseInt(e.offsetY) * (canHeight / rectCanvas.clientHeight)


  // width and height of the box to be drawn based on 
  // starting and this current
  let width = mouseX - startX;
  let height = mouseY - startY;
  

  // clear rect that is on the cvans now
  rectCtx.clearRect(0,0, rectCanvas.width, rectCanvas.height);
  rectCtx.strokeRect(startX, startY, width, height);

  

}

function canvasToCord(canX, canY, width, height) {

  return [(canX-width/2) / (height/2) - 0.55, (canY-height/2) / (height/2)]


}




