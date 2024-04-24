
const gameState = {
    turn: 0,
    partial: "",
    target: answerWords[Math.floor(Math.random() * answerWords.length)],
    rowData: [],
    judgeData: [],
    gameOver: false,
    letterData: {},
    traits: {},
    lettertraits: {},
    popups: {
        addToRow: (evt, time = 2000) => {
            if (gameState.popups.rows[gameState.turn].length == 0) {
                gameState.popups.rowBoxes[gameState.turn].right.appendChild(evt);
            }
            gameState.popups.rows[gameState.turn].push(evt)
            gameState.popups.rowTimers[gameState.turn].push(time);
        },
        rows: ROW_BASE.map(i => []),
        rowBoxes: [],
        rowTimers: ROW_BASE.map(i => [])
    }
};

console.log(gameState);

const typedTrait = new TypedTrait();
const allTraits = [
    new Trait(),
    typedTrait,
    new CorrectnessColoringTrait()
];

const allLetterTraits = [
    new LetterTrait(),
    new CorrectnessColoringLetterTrait()
];

// -----------

const displayTable = document.getElementById("display");

for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    row.id = "row-" + i;

    const cellContainer = document.createElement("td");
    cellContainer.classList.add("cell-container", "display");

    const rowData = [];
    for (let j = 0; j < NUM_COLS; j++) {
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

        allTraits.forEach(t => t.onStartCell(gameState, cellData));

        rowData.push(cellData);
    }

    const leftContainer = document.createElement("td");
    leftContainer.classList.add("row-popup-box-container", "left");
    const leftBox = document.createElement("div");
    leftBox.classList.add("row-popup-box");
    leftContainer.appendChild(leftBox);
    
    
    const rightContainer = document.createElement("td");
    rightContainer.classList.add("row-popup-box-container", "right");
    const rightBox = document.createElement("div");
    rightBox.classList.add("row-popup-box");
    rightContainer.appendChild(rightBox);

    gameState.popups.rowBoxes.push({left: leftBox, right:rightBox});
    
    row.appendChild(leftContainer);
    row.appendChild(cellContainer);
    row.appendChild(rightContainer);
    displayTable.appendChild(row);
    gameState.rowData.push(rowData);
}

allTraits.forEach(t => t.onStart(gameState));

const letterTable = document.getElementById("letters");
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const alphabetRows = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    "zxcvbnm".split("")
]
for (let i = 0; i < alphabetRows.length; i++) {
    const row = document.createElement("tr");
    const cellContainer = document.createElement("td");
    cellContainer.classList.add("cell-container");

    if (i == 2) {
        const cell = document.createElement("div");
        cell.classList.add("letter", "wide");
        cell.appendChild(makeCenterText("ENTER"));
        cell.addEventListener("click", e => keyEvent("Enter"));
        cellContainer.appendChild(cell);
    }

    for (let j = 0; j < alphabetRows[i].length; j++) {
        const letter = alphabetRows[i][j];
        const cell = document.createElement("div");
        cell.classList.add("letter");
        cell.appendChild(makeCenterText(letter.toUpperCase()));
        cell.addEventListener("click", e => keyEvent(letter));

        const letterData = {
            element: cell,
            letter: letter,
            traits: {}
        };
        allLetterTraits.forEach(t => t.onStartCell(gameState, letterData));

        gameState.letterData[letter] = letterData;
        cellContainer.appendChild(cell);
    }

    if (i == 2) {
        const cell = document.createElement("div");
        cell.classList.add("letter", "wide");
        cell.appendChild(makeCenterText("DEL"));
        cell.addEventListener("click", e => keyEvent("Backspace"));
        cellContainer.appendChild(cell);
    }
    
    row.appendChild(cellContainer);
    letterTable.append(row);
}

allLetterTraits.forEach(t => t.onStart(gameState));

// -----------

const judgeGuess = guess => {
    guess = guess.split("");
    const ans = gameState.target.split("");
    const out = {
        cells: []
    };

    for (let i = 0; i < NUM_COLS; i++) {
        out.cells.push({
            guess: guess[i],
            ans: ans[i]
        });
        if (guess[i] == ans[i]) {
            out.cells[i].correctness = GUESS_TYPES.GREEN;
            guess[i] = "*";
            ans[i] = "*";
        }
    }

    for (let i = 0; i < NUM_COLS; i++) {
        if (guess[i] == "*") continue;
        const idx = ans.indexOf(guess[i]);
        if (idx == -1) {
            out.cells[i].correctness = GUESS_TYPES.GRAY;
        } else {
            ans[idx] = "*";
            out.cells[i].correctness = GUESS_TYPES.YELLOW;
        }
    }

    out.allCorrect = out.cells.every(c => c.correctness == GUESS_TYPES.GREEN);
    return out;
};

const keyEvent = key => {
    if (gameState.gameOver) return;

    key = key.toLowerCase();
    if (key == "enter") {
        if (gameState.partial.length == NUM_COLS && guessWords.includes(gameState.partial)) {
            const judge = judgeGuess(gameState.partial);
            gameState.judgeData.push(judge);
            for (let i = 0; i < NUM_COLS; i++) {
                allTraits.forEach(t => t.onRevealCell(gameState, gameState.rowData[gameState.turn][i], judge.cells[i]));
            }
            allTraits.forEach(t => t.onReveal(gameState, judge));
            allLetterTraits.forEach(t => t.onReveal(gameState, judge));

            gameState.turn++;
            gameState.partial = "";
            if (gameState.turn >= 6 || judge.allCorrect) {
                gameState.gameOver = true;
            }
        }
    } else if (key == "backspace") {
        if (gameState.partial.length > 0) {
            gameState.partial = gameState.partial.substring(0, gameState.partial.length - 1);
            typedTrait.onTypeCell(gameState, gameState.rowData[gameState.turn][gameState.partial.length], "");
        }
    } else if (key.length == 1 && alphabet.includes(key)) {
        if (gameState.partial.length < NUM_COLS) {
            gameState.partial += key;
            typedTrait.onTypeCell(gameState, gameState.rowData[gameState.turn][gameState.partial.length - 1], key);
            allLetterTraits.forEach(t => t.onTypeCell(gameState, gameState.letterData[key]));
            allLetterTraits.forEach(t => t.onType(gameState));
        }
    }
}

document.body.addEventListener("keydown", e => keyEvent(e.key));

setInterval(() => {
    for (let i = 0; i < NUM_ROWS; i++) {
        if (gameState.popups.rowTimers[i].length <= 0) continue;
        gameState.popups.rowTimers[i][0] -= 50;

        if (gameState.popups.rowTimers[i][0] <= 0) {
            gameState.popups.rowTimers[i].shift();
            gameState.popups.rows[i].shift();

            gameState.popups.rowBoxes[i].right.innerHTML = "";
            if (gameState.popups.rows[i].length != 0) {
                gameState.popups.rowBoxes[i].right.appendChild(gameState.popups.rows[i][0]);
            }
        }
    }
}, 50);