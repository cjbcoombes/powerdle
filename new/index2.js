/*

Trait structure mirrors game state:
components, interactions, data, and stats

Traits keep a local state and stats version?

Traits keep local references to state?

Trait functions:
onLoad
onReload
*/

const expectedDataVersion = 0;
const expectedStatsVersion = 0;
const gameState = {
    components: {
        top: null,
        topright: null,
        bottom: null,
        bottomright: null,
        rows: [],
        traits: {}
    },

    interactions: {
        save: null,
        traits: {}
    },

    data: {
        version: 0,
        traits: {}
    },

    stats: {
        version: 0,
        traits: {}
    }
};

const traits = {
    normalList: [

    ],
    letterList: [],
    normalIndex: {},
    letterIndex: {}
};
traits.normalList.forEach(t => traits.normalIndex[t.name] = t);

const mainDisplay = docId("main-display");
const letterDisplay = docId("letter-display");

const constructGrid = () => {
    for (let i = 0; i < WORDLE_ROWS; i++) {
        const row = {
            cells: [],
            sidebar: null
        };
        gameState.components.rows.push(row);

        for (let j = 0; j < WORDLE_COLS; j++) {
            const cell = docMake("div", ["wordle-cell", "full-text"], mainDisplay);
            cell.style["grid-row"] = (i + 2);
            cell.style["grid-column"] = (j + 2);
            row.cells.push(cell);
        }
        row.sidebar = docMake("div", ["debug-outline", "wordle-sidebar"], mainDisplay, s => {
            s.style["grid-row"] = (i + 2);
            s.style["grid-column"] = WORDLE_COLS + 2;
        });
    }
}

const constructLetterGrid = () => {
    const alphabetRows = [
        "qwertyuiop".split(""),
        "asdfghjkl".split(""),
        "zxcvbnm".split("")
    ];

    alphabetRows.forEach((row, i) => {
        row.forEach((char, j) => {
            const cell = docMake("div", ["letter-cell", "full-text"], letterDisplay);
            cell.style["grid-row"] = (i + 1);
            const col = i == 0 ? 2 * j + 1 : 
                        i == 1 ? 2 * j + 2 :
                        2 * j + 4;
            cell.style["grid-column"] = `${col} / ${col + 2}`;
            cell.innerText = char.toUpperCase();
        });
    });
    docMake("div", ["letter-cell", "full-text"], letterDisplay, cell => {
        cell.style["grid-row"] = 3;
        cell.style["grid-column"] = "1 / 4";
        cell.innerText = "Enter";
    });
    docMake("div", ["letter-cell", "full-text"], letterDisplay, cell => {
        cell.style["grid-row"] = 3;
        cell.style["grid-column"] = "18 / 21";
        cell.innerText = "Del";
    });
};

constructGrid();
constructLetterGrid();

const load = () => {
    const stats = localStorage.getItem("powerdle-stats");
    const data = localStorage.getItem("powerdle-state");

    if (stats && stats.version == expectedStatsVersion) {
        gameState.stats = stats;
    }

    if (data && data.version == expectedDataVersion) {
        gameState.data = data;
    }
};