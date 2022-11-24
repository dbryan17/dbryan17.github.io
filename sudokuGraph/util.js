/*
file contains usefull funtions and varaibles that are used throughout the app 
*/
var numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// randomly shuffles an array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function oneThroughNine(numStr) {
  return (
    ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(
      (num) => numStr === num
    ).length === 1
  );
}
