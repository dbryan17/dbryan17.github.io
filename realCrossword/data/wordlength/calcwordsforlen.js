const { words } = require("./wordarrrcopy.js")
let fourletterwords = words.filter((word) => word.length === 4);
fourletterwords.forEach((word) => console.log(word));