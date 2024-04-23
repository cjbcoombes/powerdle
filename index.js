


// -----------

const displayTable = document.getElementById("display");
const cellData = [];

for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    row.id = "row-" + i;

    const cellContainer = document.createElement("td");
    cellContainer.classList.add("cell-container");

    const rowData = [];
    for (let j = 0; j < 5; j++) {
        const cell = document.createElement("div");
        cell.id = "cell-"+i+"-"+j;
        cell.classList.add("cell");

        cellContainer.appendChild(cell);

        const cellData = {
            row: i,
            col: j,
            element: cell,
            traits: {}
        };

        rowData.push(cellData);
    }

    row.appendChild(cellContainer);
    displayTable.appendChild(row);
    cellData.push(rowData);
}

const letterTable = document.getElementById("letters");
const letterData = [];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
{
    const row = document.createElement("tr");
    for (let i = 0; i < alphabet.length; i++) {
        const cell = document.createElement("td");
        cell.classList.add("letter");
        cell.appendChild(makeCenterText(alphabet[i].toUpperCase()));

        letterData.push({
            element: cell,
            letter: alphabet[i],
            traits: {}
        });
        row.appendChild(cell);
    }
    letterTable.append(row);
}