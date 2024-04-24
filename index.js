
const gameState = {
    turn: 0,
    partial: "",
    target: answerWords[Math.floor(Math.random() * answerWords.length)],
    rowData: [],
    judgeData: [],
    gameOver: false,
    letterData: {}
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

    row.appendChild(cellContainer);
    displayTable.appendChild(row);
    gameState.rowData.push(rowData);
}

allTraits.forEach(t => t.onStart(gameState));

const letterTable = document.getElementById("letters");
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
{
    const row = document.createElement("tr");
    for (let i = 0; i < alphabet.length; i++) {
        const cell = document.createElement("td");
        cell.classList.add("letter");
        cell.appendChild(makeCenterText(alphabet[i].toUpperCase()));

        const letterData = {
            element: cell,
            letter: alphabet[i],
            traits: {}
        };
        allLetterTraits.forEach(t => t.onStartCell(gameState, letterData));

        gameState.letterData[alphabet[i]] = letterData;
        row.appendChild(cell);
    }
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