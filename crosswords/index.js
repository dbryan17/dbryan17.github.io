document.querySelector("#generateBtn").addEventListener("click", () => {
  let divCont = document.querySelector("#container");
  divCont.innerHTML = ``;

  let cw = outerCreateCw(commontrie);
  console.log(cw);

  // const parser = new DOMParser();

  // let cwHtml = parser.parseFromString(
  //   `

  //   `
  // )
  const cwTable = document.createElement("table");
  const cwRowOne = document.createElement("tr");
  const cwRowTwo = document.createElement("tr");
  const cwRowThree = document.createElement("tr");
  const cwRowFour = document.createElement("tr");
  cwRowOne.innerHTML = `
    <td>${cw[0][0]}</td>
    <td>${cw[0][1]}</td>
    <td>${cw[0][2]}</td>
    <td>${cw[0][3]}</td>
  `;
  cwRowTwo.innerHTML = `
    <td>${cw[1][0]}</td>
    <td>${cw[1][1]}</td>
    <td>${cw[1][2]}</td>
    <td>${cw[1][3]}</td>
  `;
  cwRowThree.innerHTML = `
    <td>${cw[2][0]}</td>
    <td>${cw[2][1]}</td>
    <td>${cw[2][2]}</td>
    <td>${cw[2][3]}</td>

  `;
  cwRowFour.innerHTML = `
    <td>${cw[3][0]}</td>
    <td>${cw[3][1]}</td>
    <td>${cw[3][2]}</td>
    <td>${cw[3][3]}</td>
  `;
  cwTable.appendChild(cwRowOne);
  cwTable.appendChild(cwRowTwo);
  cwTable.appendChild(cwRowThree);
  cwTable.appendChild(cwRowFour);

  divCont.appendChild(cwTable);
});
