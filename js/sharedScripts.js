export function HighlightRowsByID(table, ids) {
    //Clear old highlights
    for (let index = 0; index < table.rows.length; index++) {
        table.rows[index].classList.remove("trHighlight");
    }
    //Do not highlight any
    if (ids == null) {
        return;
    }
    //Highlight specified cells
    for (let index = 0; index < table.rows.length; index++) {
        const row = table.rows[index];
        const value = row.cells[0].innerHTML;
        if (ids.indexOf(value) != -1) {
            row.classList.add("trHighlight");
        }
    }
}
const passwordLowercaseChars = "abcdefghijklmnopqrstuvwxyz";
const passwordUppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const passwordNumbers = "0123456789";
export function GeneratePassword(lenght, includeUppercase, includeNumbers) {
    const allChars = passwordLowercaseChars + (includeUppercase ? passwordUppercaseChars : "") + (includeNumbers ? passwordNumbers : "");
    let password = "";
    for (let i = 0; i < lenght; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return password;
}
export class KeyValuePair {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
    getValue() {
        return this.value;
    }
}
export function FormatFileSize(fileSizeBytes) {
    // Approximate to the closest prefixed unit
    const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    const exponent = Math.min(Math.floor(Math.log(fileSizeBytes) / Math.log(1024)), units.length - 1);
    const approx = fileSizeBytes / 1024 ** exponent;
    return exponent === 0 ? `${fileSizeBytes} bytes` : `${approx.toFixed(3)} ${units[exponent]}`;
}
export function DisableDragAndDrop(element) {
    element.addEventListener("dragenter", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        if (ev.dataTransfer != null) {
            ev.dataTransfer.dropEffect = "none";
        }
    });
    element.addEventListener("dragover", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        if (ev.dataTransfer != null) {
            ev.dataTransfer.dropEffect = "none";
        }
    });
    element.addEventListener("drop", (ev) => {
        //ev.dataTransfer.dropEffect = "copy"
        ev.stopPropagation();
        ev.preventDefault();
    });
}
export function ContainsText(text, searched, isCaseSensitive, seachWords) {
    //Sort invalid cases
    if (searched.length == 0) {
        return true;
    }
    else if (text.length == 0) {
        return false;
    }
    //Case sensitive
    text = isCaseSensitive ? text : text.toLowerCase();
    searched = isCaseSensitive ? searched : searched.toLowerCase();
    //Split to words
    const words = seachWords ? searched.split(" ") : [searched];
    //Do checks
    let validChecks = 0;
    for (const word of words) {
        if (word.length == 0) {
            continue;
        }
        validChecks++;
        if (!text.includes(word)) {
            return false;
        }
    }
    return validChecks > 0;
}
export function DiffArrays(array, compareTo) {
    const arraySet = new Set(array);
    const added = compareTo.filter(x => !arraySet.has(x));
    const compareToSet = new Set(compareTo);
    const removed = array.filter(x => !compareToSet.has(x));
    return [added, removed];
}
//# sourceMappingURL=sharedScripts.js.map