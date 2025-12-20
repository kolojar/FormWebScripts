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
//# sourceMappingURL=sharedScripts.js.map