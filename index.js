
const gameState = {
    turn: 0,
    partial: "",
    target: answerWords[Math.floor(Math.random() * answerWords.length)],
    rowData: [],
    judgeData: [],
    gameOver: false,
    letterData: {},
    popups: {
        addToRow: evt => {
            if (gameState.popups.rows[gameState.turn].length == 0) {
                gameState.popups.rowTimers[gameState.turn] = 1000;
            }
            gameState.popups.rows[gameState.turn].push(evt)
        },
        rows: [[], [], [], [], []],
        rowBoxes: [],
        rowTimers: [0, 0, 0, 0, 0]
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
    cellContainer.classList.add("cell-container");

    const leftBox = document.createElement("div");
    leftBox.classList.add("row-popup-box");
    cellContainer.appendChild(leftBox);

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

        allTraits.forEach(t => t.onStartCell(gameState, cellData));

        rowData.push(cellData);
    }

    const rightBox = document.createElement("div");
    rightBox.classList.add("row-popup-box");
    gameState.popups.rowBoxes.push({left: leftBox, right:rightBox});
    cellContainer.appendChild(rightBox);

    row.appendChild(cellContainer);
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

    for (let j = 0; j < alphabetRows[i].length; j++) {
        const letter = alphabetRows[i][j];
        const cell = document.createElement("div");
        cell.classList.add("letter");
        cell.appendChild(makeCenterText(letter.toUpperCase()));

        const letterData = {
            element: cell,
            letter: letter,
            traits: {}
        };
        allLetterTraits.forEach(t => t.onStartCell(gameState, letterData));

        gameState.letterData[letter] = letterData;
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
        cells: [{}, {}, {}, {}, {}]
    };

    for (let i = 0; i < 5; i++) {
        out.cells[i].guess = guess[i];
        out.cells[i].ans = ans[i];
        if (guess[i] == ans[i]) {
            out.cells[i].correctness = GUESS_TYPES.GREEN;
            guess[i] = "*";
            ans[i] = "*";
        }
    }

    for (let i = 0; i < 5; i++) {
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

document.body.addEventListener("keydown", e => {
    if (gameState.gameOver) return;

    const key = e.key.toLowerCase();
    if (key == "enter") {
        if (gameState.partial.length == 5 && guessWords.includes(gameState.partial)) {
            const judge = judgeGuess(gameState.partial);
            gameState.judgeData.push(judge);
            for (let i = 0; i < 5; i++) {
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
        if (gameState.partial.length < 5) {
            gameState.partial += key;
            typedTrait.onTypeCell(gameState, gameState.rowData[gameState.turn][gameState.partial.length - 1], key);
            allLetterTraits.forEach(t => t.onTypeCell(gameState, gameState.letterData[key]));
            allLetterTraits.forEach(t => t.onType(gameState));
        }
    }
});

