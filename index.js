
const day = Math.floor(
    (Date.now() - (new Date().getTimezoneOffset()) * 60 * 1000)
    / (1000 * 60 * 60 * 24)) - 19838;

const expectedGameVersion = 5;
const prevState = localStorage.getItem("powerdle-state");
let hasPrev = !!prevState;
let gameState = null;

if (hasPrev) {
    gameState = JSON.parse(prevState);
    if (gameState.day != day || gameState.version != expectedGameVersion) hasPrev = false;
}
if (!hasPrev) {
    gameState = {
        version: expectedGameVersion,
        day: day,
        turn: 0,
        partial: "",
        target: answerWords[day % answerWords.length],
        gameOver: false,
        won: false,

        rowData: [],
        letterData: {},
        
        traits: {},

        stats: (x => x ? JSON.parse(x) : {})(localStorage.getItem("powerdle-stats")),
    };

    gameState.seed = gameState.target.split("").map(l => l.charCodeAt(0)).reduce((acc, elem) => acc * 3217 + elem) % 10293821;
}

gameState.randAt = (k, m = 2**31) => {
    let seed = gameState.seed - k;
    k = k % 100 + 15;
    while (k > 0) {
        seed = (1103515245 * seed + 12345) % (2**31);
        k--;
    }
    return seed % m;
};

gameState.popups = {
    addToRow: (evt, time = 2000, i) => {
        i = i == undefined ? gameState.turn : i;
        if (gameState.popups.rows[i].length == 0) {
            gameState.popups.rowBoxes[i].right.appendChild(evt);
        }
        gameState.popups.rows[i].push(evt)
        gameState.popups.rowTimers[i].push(time);
    },
    rows: ROW_BASE.map(i => []),
    rowBoxes: [],
    rowTimers: ROW_BASE.map(i => []),
    infoBoxes: {},

    addToOverlay: (evt, time = 2000, shaded = false) => {
        if (gameState.popups.overlayElems.length == 0) {
            gameState.popups.overlayBox.appendChild(evt);
            gameState.popups.overlayBox.style["display"] = "block";
            if (shaded) {
                gameState.popups.overlayBox.classList.add("shaded");
            }
        }
        gameState.popups.overlayElems.push(evt)
        gameState.popups.overlayTimers.push(time);
        gameState.popups.overlayShaded.push(shaded);
    },
    closeTopOverlay: () => {
        gameState.popups.overlayTimers.shift();
        gameState.popups.overlayElems.shift();
        gameState.popups.overlayShaded.shift();

        gameState.popups.overlayBox.innerHTML = "";
        gameState.popups.overlayBox.classList.remove("shaded");
        if (gameState.popups.overlayElems.length != 0) {
            gameState.popups.overlayBox.appendChild(gameState.popups.overlayElems[0]);
            if (gameState.popups.overlayShaded[0]) {
                gameState.popups.overlayBox.classList.add("shaded");
            }
        } else {
            gameState.popups.overlayBox.style["display"] = "none";
        }
    },
    overlayBox: document.getElementById("overlay"),
    overlayTimers: [],
    overlayShaded: [],
    overlayElems: []
};

gameState.appsTable = document.getElementById("apps");

const expectedStatsVersion = 5;
if (gameState.stats.statsVersion != expectedStatsVersion) {
    gameState.stats = {
        statsVersion: expectedStatsVersion 
    };
}

gameState.save = () => {
    allTraits.forEach(t => t.onSave(gameState));
    allLetterTraits.forEach(t => t.onSave(gameState));
    localStorage.setItem("powerdle-stats", JSON.stringify(gameState.stats));
    localStorage.setItem("powerdle-state", JSON.stringify(gameState));
};

const resetSaved = () => {
    localStorage.removeItem("powerdle-stats");
    localStorage.removeItem("powerdle-state");
};

console.log(gameState);

// ----------------------

const typedTrait = new TypedTrait();
const allTraits = [
    new Trait(),
    typedTrait,
    new CorrectnessColoringTrait(),
    new ReusedGrayTrait(),
    new NewGreenTrait(),
    new BannedLetterTrait(),
    new InfoScoreTrait(),
    new StreakTrait(),
    new PetCollectionTrait(),
    new OptimalComparisonTrait(),
    new DailyGiftTrait(),

    new CurrencyTrait(), 
    new StandardPointsTrait() // Important that this is after anything that adds points or creates side popups
];
const revTraits = allTraits.slice().reverse();

const allLetterTraits = [
    new LetterTrait(),
    new CorrectnessColoringLetterTrait(),
    new BannedLetterLetterTrait()
];

// -----------

const displayTable = document.getElementById("display");

for (let i = 0; i < NUM_ROWS + 1; i++) {
    const row = document.createElement("tr");
    row.id = "row-" + i;

    const cellContainer = document.createElement("td");
    cellContainer.classList.add("cell-container", "display");

    const leftContainer = document.createElement("td");
    leftContainer.classList.add("row-popup-box-container", "left", "scale-font");
    
    const rightContainer = document.createElement("td");
    rightContainer.classList.add("row-popup-box-container", "right", "scale-font");

    const rowData = [];
    if (i != NUM_ROWS) {
        for (let j = 0; j < NUM_COLS; j++) {
            const cell = document.createElement("div");
            cell.id = "cell-"+i+"-"+j;
            cell.classList.add("cell");

            cellContainer.appendChild(cell);

            const popupBox = document.createElement("div");
            popupBox.classList.add("cell-popup-box");
            cell.appendChild(popupBox);

            const cellData = hasPrev ? gameState.rowData[i][j] : {
                row: i,
                col: j,
                shareText: "*",
                judge: {
                    judged: false,
                    hidden: false,
                    guess: "",
                    ans: "",
                    correctness: GUESS_TYPES.NONE
                },
                traits: {},
                popups: {
                    elems: [],
                    timers: []
                }
            };
            rowData.push(cellData);

            cellData.element = cell;
            cellData.popups.box = popupBox;
            cellData.popups.add = (evt, time = 2000) => {
                if (cellData.popups.elems.length == 0) {
                    cellData.popups.box.appendChild(evt);
                }
                cellData.popups.elems.push(evt)
                cellData.popups.timers.push(time);
            };

            if (hasPrev) {
                allTraits.forEach(t => t.onReloadCell(gameState, cellData));
            } else {
                allTraits.forEach(t => t.onStartCell(gameState, cellData));
            }

        }
        if (!hasPrev) gameState.rowData.push(rowData);

        gameState.popups.rowBoxes.push({left: leftContainer, right:rightContainer});
    } else {
        gameState.popups.infoBoxes.left = leftContainer;
        gameState.popups.infoBoxes.right = rightContainer;
        cellContainer.classList.add("scale-font");
        
        gameState.popups.infoBoxes.center = cellContainer;
    }

    row.appendChild(leftContainer);
    row.appendChild(cellContainer);
    row.appendChild(rightContainer);
    displayTable.appendChild(row);
}


if (hasPrev) {
    allTraits.forEach(t => t.onReload(gameState));
} else {
    allTraits.forEach(t => t.onStart(gameState));
}

const letterTable = document.getElementById("letters");
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

        const letterData = hasPrev ? gameState.letterData[letter] : {
            letter: letter,
            traits: {}
        };
        letterData.element = cell;
        if (hasPrev) {
            allLetterTraits.forEach(t => t.onReloadCell(gameState, letterData));
        } else {
            allLetterTraits.forEach(t => t.onStartCell(gameState, letterData));
        }

        if (!hasPrev) gameState.letterData[letter] = letterData;
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

if (hasPrev) {
    allLetterTraits.forEach(t => t.onReload(gameState));
} else {
    allLetterTraits.forEach(t => t.onStart(gameState));
}

// -----------

gameState.save();

const renderShare = () => {
    const box = document.createElement("div");
    box.classList.add("center-box", "share-box");
    
    const textBox = document.createElement("pre");
    textBox.innerText = gameState.shareText;
    box.appendChild(textBox);
    
    let button = document.createElement("button");
    button.classList.add("share-button");
    button.innerText = "Copy";
    button.addEventListener("click", e => {
        navigator.clipboard.writeText(gameState.shareText);
    });
    box.appendChild(button);

    button = document.createElement("button");
    button.classList.add("share-button");
    button.innerText = "Close";
    button.addEventListener("click", e => {
        box.style["display"] = "none";
        gameState.popups.closeTopOverlay();
    });
    box.appendChild(button);

    gameState.popups.addToOverlay(box, Infinity, true);
};

if (gameState.gameOver) {
    renderShare();
}

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
        if (gameState.partial.length == NUM_COLS) {
            if (guessWords.includes(gameState.partial)) {
                const judge = judgeGuess(gameState.partial);
                
                for (let i = 0; i < NUM_COLS; i++) {
                    gameState.rowData[gameState.turn][i].judge.guess = judge.cells[i].guess;
                    gameState.rowData[gameState.turn][i].judge.ans = judge.cells[i].ans;
                    gameState.rowData[gameState.turn][i].judge.correctness = judge.cells[i].correctness;
                    gameState.rowData[gameState.turn][i].judge.judged = true;
                }
                
                if (gameState.turn >= NUM_ROWS - 1 || judge.allCorrect) {
                    gameState.gameOver = true;
                    gameState.won = judge.allCorrect;
                }

                allTraits.forEach(t => t.onPreReveal(gameState, gameState.rowData[gameState.turn], judge));
                for (let i = 0; i < NUM_COLS; i++) {
                    allTraits.forEach(t => t.onRevealCell(gameState, gameState.rowData[gameState.turn][i], judge.cells[i]));
                }
                allTraits.forEach(t => t.onReveal(gameState, gameState.rowData[gameState.turn], judge));
                allLetterTraits.forEach(t => t.onReveal(gameState, gameState.rowData[gameState.turn], judge));

                gameState.turn++;
                gameState.partial = "";
            } else {
                const popup = makeFadingPopup("INVALID");
                popup.classList.add("color-red");
                gameState.popups.addToRow(popup);
            }
        }
    } else if (key == "backspace") {
        if (gameState.partial.length > 0) {
            gameState.partial = gameState.partial.substring(0, gameState.partial.length - 1);
            typedTrait.onTypeCell(gameState, gameState.rowData[gameState.turn][gameState.partial.length], "");
        }
    } else if (key.length == 1 && ALPHABET.includes(key)) {
        if (gameState.partial.length < NUM_COLS) {
            gameState.partial += key;
            typedTrait.onTypeCell(gameState, gameState.rowData[gameState.turn][gameState.partial.length - 1], key);
            allLetterTraits.forEach(t => t.onTypeCell(gameState, gameState.letterData[key]));
            allLetterTraits.forEach(t => t.onType(gameState));
        }
    }

    if (gameState.gameOver) {
        gameState.shareText = `Powerdle #${gameState.day} ${gameState.won ? gameState.turn : 'X'}/6\n\n`;

        allTraits.forEach(t => t.onPreShare(gameState));
        for (let i = 0; i < NUM_ROWS; i++) {
            for (let j = 0; j < NUM_COLS; j++) {
                allTraits.forEach(t => t.onShareCell(gameState, gameState.rowData[i][j]));
                gameState.shareText += gameState.rowData[i][j].shareText;
            }
            gameState.shareText += ' ';
            revTraits.forEach(t => t.onShareRow(gameState, i));
            gameState.shareText += '\n';
        }
        gameState.shareText += '\n';
        revTraits.forEach(t => t.onShare(gameState));

        renderShare();
    }

    gameState.save();
}

document.body.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    keyEvent(e.key);
});

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

        //

        for (let j = 0; j < NUM_COLS; j++) {
            const cell = gameState.rowData[i][j];
            if (cell.popups.timers.length <= 0) continue;
            cell.popups.timers[0] -= 50;
            
            if (cell.popups.timers[0] <= 0) {
                cell.popups.timers.shift();
                cell.popups.elems.shift();

                cell.popups.box.innerHTML = "";
                if (cell.popups.elems.length != 0) {
                    cell.popups.box.appendChild(cell.popups.elems[0]);
                }
            }
        }
    }

    if (gameState.popups.overlayTimers.length > 0) {
        gameState.popups.overlayTimers[0] -= 50;
        
        if (gameState.popups.overlayTimers[0] <= 0) {
            gameState.popups.closeTopOverlay();
        }
    }
}, 50);