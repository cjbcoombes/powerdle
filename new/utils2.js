const WORDLE_ROWS = 6;
const WORDLE_COLS = 5;

const docId = id => document.getElementById(id);
const docMake = (elemType, classes, parent, callback) => {
    const elem = document.createElement(elemType);
    if (classes.length > 0) elem.classList.add(...classes);
    if (parent) parent.appendChild(elem);
    if (callback) callback(elem);

    return elem;
}