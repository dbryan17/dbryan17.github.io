// https://kapadia.github.io/emscripten/2013/09/13/emscripten-pointers-and-pointers.html


// initial setup

var canWidth = 3840;
var canHeight = 2160;

var mandCanvas = document.querySelector("#mandlbrotCanvas");
var mandCtx = mandCanvas.getContext("2d");
mandCtx.imageSmoothingEnabled = false; 
mandCanvas.width = canWidth;
mandCanvas.height = canHeight; 

// length of array - will always stay at this even if we don't fill it all the way
var arrayLength = canWidth * canHeight * 4;

// variable intializtion for stuff that will be used later on redraws
var prevStartX;
var prevStartY;
var prevWidthScale;
var prevHeightScale;

var myModule;
var myGenPixles


// using loadModule promise so this only runs when the "manlebrot.C" script 
// that wasm generates finishes running; otherwise, we will not have access 
// to the functions needed
loadModule().then((Module) => {

  // cwrap is emscripton function that allows us to call the c function as a js function
  let genPixles = Module.cwrap("genPixles", "null", [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number"
  ]);

  myModule = Module;
  myGenPixles = genPixles;

  draw(Module, genPixles, 0, 0, canWidth, canHeight, true);
});


function draw(Module, genPixles, startX, startY, endX, endY, first) {
  // calculate new width and height of image space
  let width = endX - startX;
  let height = endY - startY;

  // clear old rectangle
  mandCtx.clearRect(0, 0, canWidth, canHeight);

  // get the current scales
  let widthScale = width / canWidth;
  let heightScale = height / canHeight;

  // if not on first iteration 
  if(!first) {
    // calculate new start corodinates
    startX = (prevWidthScale * startX) + prevStartX;
    startY = (prevHeightScale * startY) + prevStartY;
    // calculate new scales
    widthScale = widthScale * prevWidthScale;
    heightScale = heightScale * prevHeightScale;
  }
  let newCanHeight;
  let newCanWidth;


  // if height is more zoomed in
  if(heightScale > widthScale) {
    // want full height
    newCanHeight = canHeight;
    // want width properlly scalled and correct based on height
    newCanWidth = canHeight * (width/height);
    widthScale = (canWidth/newCanWidth) * widthScale
    // same for width 
  } else {
    newCanWidth = canWidth;
    newCanHeight = canWidth * (height/width);
    heightScale = (canHeight/newCanHeight) * heightScale
  }

  // using emscriptens malloc to allocate memory on the emscripten heap 
  // of array this returns a pointer to it 
  let pixlesPtr = Module._malloc(
    arrayLength * Uint8Array.BYTES_PER_ELEMENT
  );

  // copy data to Emscripten heap (directly accessed from Module.HEAPU8)
  let dataheap = new Uint8Array(Module.HEAPU8.buffer, pixlesPtr, (arrayLength * Uint8Array.BYTES_PER_ELEMENT));

  // call function 
  genPixles(startX, startY, newCanWidth, newCanHeight, canWidth, canHeight, widthScale, heightScale, dataheap.byteOffset);

  // get the result of the function from the dataheap by way of creating a js array
  let pixelArray = new Uint8ClampedArray(
    dataheap.buffer,
    dataheap.byteOffset,
    arrayLength
  );

  



  ///// can also do above as below --- same result //////

  // let pixelArray = new Uint8ClampedArray(
  //   Module.HEAPU8.buffer,
  //   pixlesPtr,
  //   arrayLength
  // );


  // free the memory
  Module._free(Module.HEAPU8.buffer);

  // create the image
  let data = new ImageData(pixelArray, canWidth, canHeight);
  mandCtx.imageSmoothingEnabled = false; 
  // put the image data in the context
  mandCtx.putImageData(data, 0, 0);

  // reset variables
  prevStartX = startX;
  prevStartY = startY;
  prevWidthScale = widthScale;
  prevHeightScale = heightScale;

}

