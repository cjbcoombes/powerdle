/*

Trait structure mirrors game state:
components, interactions, data, and stats

Traits keep a local state and stats version?

Traits keep local references to state?

Trait functions:
onLoad
onReload
*/

const expectedDataVersion = 10;
const expectedStatsVersion = 10;
const gameState = {
    components: {
        top: null,
        topright: null,
        bottom: null,
        bottomright: null,
        rows: [],
        cellRows: [],
        letters: {},
        traits: {}
    },

    interactions: {
        save: null, // TODO
        cellHidden: null,
        rand: {
            seed: null,
            at: null
        },
        popups: {
            rows: [],
            sidebars: [],
            overlay: null
        },
        traits: {}
    },

    data: {
        version: 0,
        status: {
            gameOver: false,
            won: false,
            day: null,
            target: null,
            partial: "",
            turn: 0
        },
        traits: {},
        rows: [],
        cellRows: [],
        letters: {}
    },

    stats: {
        version: 0,
        traits: {}
    }
};
const makeCellData = (row, col, component) => {
    return {
        row,
        col,
        component,
        status: {
            letter: null,
            hidden: false,
            judged: false,
            judgeHidden: false,
            correctness: GUESS_TYPES.NONE
        },
        traits: {}
    }
};
const makeLetterData = (letter, component) => {
    return {
        letter,
        component,
        status: {
            hidden: false
        },
        traits: {}
    }
};
const makeRowData = (row, component) => {
    return {
        row,
        component,
        status: {
            hidden: false,
            judged: false,
            judgeHidden: false
        },
        traits: {}
    }
};
gameState.interactions.rand.at = (k, m = 0) => {
    const mod = 2n**31n;
    m = m > 0 ? BigInt(m) : mod;

    // const arr = [];
    let seed = gameState.interactions.rand.seed + BigInt(k);
    k = k % 100 + 15;
    while (k > 0 || seed < 8n) {
        seed = (1103515245n * seed + 12345n) % mod;
        k--;
    }
    return Number((seed >> 2n) % m);
};
gameState.interactions.cellHidden = (cellorrow, col) => {
    if (col == undefined) {
        col = cellorrow.col;
        cellorrow = cellorrow.row;
    }

    return gameState.data.rows[cellorrow].status.hidden ||
        gameState.data.rows[cellorrow].status.judgeHidden ||
        gameState.data.cellRows[cellorrow][col].status.hidden || 
        gameState.data.cellRows[cellorrow][col].status.judgeHidden;
}
const replacer = (key, val) => {
    if (["component"].includes(key)) return undefined;
    return val;
};
gameState.interactions.save = () => {
    traits.all(t => t.onSave(gameState));
    traits.allLetters(t => t.onSave(gameState));
    localStorage.setItem("powerdle-state", JSON.stringify(gameState.data, replacer));
    localStorage.setItem("powerdle-stats", JSON.stringify(gameState.stats, replacer));
};
gameState.interactions.resetSaved = () => {
    localStorage.removeItem("powerdle-state");
    localStorage.removeItem("powerdle-stats");
};
gameState.interactions.popups.addToRow = (...args) => {
    gameState.interactions.popups.sidebars[gameState.data.status.turn].add(...args);
};
gameState.interactions.popups.addToCell = (cell, ...args) => {
    gameState.interactions.popups.rows[cell.row][cell.col].add(...args);
};
gameState.interactions.popups.overlay = new OverlayPopupContainer(docId("overlay"));

const traits = {
    normalList: [
        new ReusedGrayTrait(),
        new NewGreenTrait(),
        new OptimalComparisonTrait(),

        new CorrectnessColoringTrait(),
        new BannedLetterTrait(),
        new InfoScoreTrait(),

        new StreakTrait(),
        new CurrencyTrait(),
        new PetCollectionTrait(),
        new DailyGiftTrait(),
        new StandardPointsTrait()
    ],
    letterList: [
        new CorrectnessColoringLetterTrait(),
        new BannedLetterLetterTrait()
    ],
    normalIndex: {},
    letterIndex: {},
    shareLayout: {
        before: [
            () => `Powerdle #${gameState.data.status.day} ${gameState.data.status.won ? gameState.data.status.turn : 'X'}/6\n`,
            "streak",
            "\n",
            "pets",
            "\n",
            "optimalcomparison"
        ],
        cell: ["correctness", "newgreen", "reusedgray", "currency", "bannedletter"],
        row: ["points", "infoscore", "bannedletter", "\n"],
        after: ["\n", "currency", "points"]
    },
    all: f => traits.normalList.forEach(f),
    allLetters: f => traits.letterList.forEach(f)
};
traits.all(t => traits.normalIndex[t.name] = t);
traits.allLetters(t => traits.letterIndex[t.name] = t);

const mainDisplay = docId("main-display");
const letterDisplay = docId("letter-display");

const constructGrid = (hasPrev) => {
    for (let i = 0; i < WORDLE_ROWS; i++) {
        const gridRow = {
            sidebar: null
        };
        gameState.components.rows.push(gridRow);
        const cellRow = [];
        gameState.components.cellRows.push(cellRow);
        const popupRow = [];
        gameState.interactions.popups.rows.push(popupRow);

        let row = [];
        if (hasPrev) row = gameState.data.cellRows[i];
        else gameState.data.cellRows.push(row);
        

        for (let j = 0; j < WORDLE_COLS; j++) {
            docMake("div", ["wordle-cell", "full-text", "letter-text"], mainDisplay, cell => {
                cell.style["grid-row"] = (i + 2);
                cell.style["grid-column"] = (j + 2);
                cellRow.push(cell);
                if (hasPrev) {
                    row[j].component = cell;
                    cell.innerText = row[j].status.letter ? row[j].status.letter : "";
                    traits.all(t => t.onReloadCell(gameState, row[j]));
                } else {
                    row.push(makeCellData(i, j, cell));
                    traits.all(t => t.onStartCell(gameState, row[j]));
                }
            });
            popupRow.push(new PopupContainer(docMake("div", ["wordle-cell-popup"], mainDisplay, p => {
                p.style["grid-row"] = (i + 2);
                p.style["grid-column"] = (j + 2);
            })));
        }
        gridRow.sidebar = docMake("div", ["wordle-sidebar"], mainDisplay, s => {
            s.style["grid-row"] = (i + 2);
            s.style["grid-column"] = WORDLE_COLS + 2;
            gameState.interactions.popups.sidebars.push(new PopupContainer(s));
        });

        gameState.data.rows.push(makeRowData(i, docMake("div", ["wordle-row"], mainDisplay, cell => {
            cell.style["grid-row"] = (i + 2);
            cell.style["grid-column"] = `2 / ${WORDLE_COLS + 2}`;
        })));
    }
}

const constructLetterGrid = (hasPrev) => {
    const alphabetRows = [
        "qwertyuiop".split(""),
        "asdfghjkl".split(""),
        "zxcvbnm".split("")
    ];

    alphabetRows.forEach((row, i) => {
        row.forEach((char, j) => {
            docMake("div", ["letter-cell", "full-text", "letter-text"], letterDisplay, cell => {
                cell.style["grid-row"] = (i + 1);
                const col = i == 0 ? 2 * j + 1 : 
                            i == 1 ? 2 * j + 2 :
                            2 * j + 4;
                cell.style["grid-column"] = `${col} / ${col + 2}`;
                cell.innerText = char;
                if (hasPrev) {
                    gameState.data.letters[char].component = cell;
                    traits.allLetters(t => t.onReloadCell(gameState, gameState.data.letters[char]));
                } else {
                    gameState.data.letters[char] = makeLetterData(char, cell);
                    traits.allLetters(t => t.onStartCell(gameState, gameState.data.letters[char]));
                }
                cell.addEventListener("click", e => keyEvent(char));
            });
        });
    });
    docMake("div", ["letter-cell", "full-text", "letter-text"], letterDisplay, cell => {
        cell.style["grid-row"] = 3;
        cell.style["grid-column"] = "1 / 4";
        docMake("span", [], cell, sub => {
            sub.innerText = "↵";
            sub.style["font-size"] = "0.8em";
        });
        if (hasPrev) {
            gameState.data.letters["enter"].component = cell;
            traits.allLetters(t => t.onReloadCell(gameState, gameState.data.letters["enter"]));
        } else {
            gameState.data.letters["enter"] = makeLetterData("enter", cell);
            traits.allLetters(t => t.onStartCell(gameState, gameState.data.letters["enter"]));
        }
        cell.addEventListener("click", e => keyEvent("Enter"));
    });
    docMake("div", ["letter-cell", "full-text", "letter-text"], letterDisplay, cell => {
        cell.style["grid-row"] = 3;
        cell.style["grid-column"] = "18 / 21";
        docMake("span", [], cell, sub => {
            sub.innerText = "⌫";
            sub.style["font-size"] = "0.8em";
        });
        if (hasPrev) {
            gameState.data.letters["backspace"].component = cell;
            traits.allLetters(t => t.onReloadCell(gameState, gameState.data.letters["backspace"]));
        } else {
            gameState.data.letters["backspace"] = makeLetterData("backspace", cell);
            traits.allLetters(t => t.onStartCell(gameState, gameState.data.letters["backspace"]));
        }
        cell.addEventListener("click", e => keyEvent("Backspace"));
    });
};

const load = () => {
    let stats = localStorage.getItem("powerdle-stats");
    let data = localStorage.getItem("powerdle-state");
    if (stats) stats = JSON.parse(stats);
    if (data) data = JSON.parse(data);

    if (stats && stats.version == expectedStatsVersion) {
        gameState.stats = stats;
    }

    const mkSeed = () => gameState.data.status.target.split("")
        .map(l => BigInt(l.charCodeAt(0))).reduce((acc, elem) => acc * 3217n + elem) % 10293817n;

    if (data && data.version == expectedDataVersion && data.status.day == todayId) {
        gameState.data = data;

        gameState.interactions.rand.seed = mkSeed();

        constructGrid(true);
        traits.all(t => t.onReload(gameState));
        constructLetterGrid(true);
        traits.allLetters(t => t.onReload(gameState));
    } else {
        gameState.data.status.day = todayId;
        gameState.data.status.target = answerWords[todayId % answerWords.length];
        gameState.data.version = expectedDataVersion;
        gameState.stats.version = expectedStatsVersion;

        gameState.interactions.rand.seed = mkSeed();

        constructGrid(false);
        traits.all(t => t.onStart(gameState));
        constructLetterGrid(false);
        traits.allLetters(t => t.onStart(gameState));
    }

    if (gameState.data.status.gameOver) makeSharePopup();
    gameState.interactions.save();
    console.log(gameState);
};

const updatePartial = key => {
    const status = gameState.data.status;
    if (key == "backspace") {
        if (status.partial.length > 0) {
            status.partial = status.partial.substring(0, status.partial.length - 1);
            gameState.data.cellRows[status.turn][status.partial.length].status.letter = null;
            gameState.components.cellRows[status.turn][status.partial.length].innerText = "";
            traits.allLetters(t => t.onType(gameState, key));
            traits.allLetters(t => t.onTypeCell(gameState, gameState.data.letters[key]));
        }
    } else if (key.length == 1 && ALPHABET.includes(key)) {
        if (status.partial.length < WORDLE_COLS) {
            gameState.data.cellRows[status.turn][status.partial.length].status.letter = key;
            gameState.components.cellRows[status.turn][status.partial.length].innerText = key;
            status.partial += key;
            traits.allLetters(t => t.onType(gameState, key));
            traits.allLetters(t => t.onTypeCell(gameState, gameState.data.letters[key]));
        }
    } else if (key == "enter") {
        traits.allLetters(t => t.onType(gameState, key));
        traits.allLetters(t => t.onTypeCell(gameState, gameState.data.letters[key]));
    }
};

const judgeGuess = guess => {
    guess = guess.split("");
    const ans = gameState.data.status.target.split("");
    const out = {
        cells: []
    };

    for (let i = 0; i < WORDLE_COLS; i++) {
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

    for (let i = 0; i < WORDLE_COLS; i++) {
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

const getShareText = () => {
    let str = "";
    traits.shareLayout.before.forEach(e => {
        if ((typeof e) == "function") {
            str += e();
        } else if (e[0] == " " || e[0] == "\n") {
            str += e;
        } else {
            const v = traits.normalIndex[e].onPreShare(gameState);
            if (v) str += v;
        }
    });
    for (let i = 0; i < WORDLE_ROWS; i++) {
        for (let j = 0; j < WORDLE_COLS; j++) {
            let c = "";
            traits.shareLayout.cell.forEach(e => {
                if ((typeof e) == "function") {
                    c = e(i);
                } else if (e[0] == " " || e[0] == "\n") {
                    c = e;
                } else {
                    const v = traits.normalIndex[e].onShareCell(gameState, gameState.data.cellRows[i][j]);
                    if (v) c = v;
                }
            });
            str += c;
        }

        traits.shareLayout.row.forEach(e => {
            if ((typeof e) == "function") {
                str += e(i);
            } else if (e[0] == " " || e[0] == "\n") {
                str += e;
            } else {
                const v = traits.normalIndex[e].onShareRow(gameState, i);
                if (v) str += v;
            }
        });
    }
    traits.shareLayout.after.forEach(e => {
        if ((typeof e) == "function") {
            str += e();
        } else if (e[0] == " " || e[0] == "\n") {
            str += e;
        } else {
            const v = traits.normalIndex[e].onShare(gameState);
            if (v) str += v;
        }
    });

    return str;
};

const makeSharePopup = () => {
    gameState.interactions.popups.overlay.add(docMake("div", ["overlay-box"], null, e => {
        const text = getShareText();
        docMake("pre", ["monospace-text", "share-pre"], e, pre => {
            pre.innerText = text;
        });
        docMake("button", ["normal-text", "share-button"], e, b => {
            b.innerText = "Copy";
            b.addEventListener("click", () => navigator.clipboard.writeText(text));
        });
        docMake("button", ["normal-text", "share-button"], e, b => {
            b.innerText = "Close";
            b.addEventListener("click", () => gameState.interactions.popups.overlay.pop());
        });
    }), Infinity, true);
};

const keyEvent = key => {
    if (gameState.data.status.gameOver) return;

    key = key.toLowerCase();

    updatePartial(key);

    const status = gameState.data.status;
    if (key == "enter") {
        if (status.partial.length == WORDLE_COLS) {
            if (guessWords.includes(status.partial)) {
                const judge = judgeGuess(status.partial);

                for (let i = 0; i < WORDLE_COLS; i++) {
                    const cell = gameState.data.cellRows[status.turn][i];
                    const cellJudge = judge.cells[i];
                    cell.status.judged = true;
                    cell.status.judgeHidden = false;
                    cell.status.correctness = cellJudge.correctness;
                }

                if (gameState.turn >= WORDLE_ROWS - 1 || judge.allCorrect) {
                    status.gameOver = true;
                    status.won = judge.allCorrect;
                }

                traits.all(t => t.onPreReveal(gameState, status.turn, judge));
                for (let j = 0; j < WORDLE_COLS; j++) {
                    traits.all(t => t.onRevealCell(gameState, gameState.data.cellRows[status.turn][j], judge.cells[j]));
                }
                traits.all(t => t.onReveal(gameState, status.turn, judge));
                traits.allLetters(t => t.onReveal(gameState, status.turn, judge));

                status.turn++;
                status.partial = "";
            } else {
                gameState.interactions.popups.sidebars[status.turn].add(makeTextPopup("INVALID", "var(--wordle-red)"));
            }
        }
    }
    
    if (gameState.data.status.gameOver) makeSharePopup();
    gameState.interactions.save();
};


load();
document.body.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    keyEvent(e.key);
});