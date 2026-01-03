export function HighlightRowsByID(table: HTMLTableElement, ids: string[]) {
    //Clear old highlights
    for (let index = 0; index < table.rows.length; index++) {
        table.rows[index].classList.remove("trHighlight")
    }

    //Do not highlight any
    if (ids == null) {
        return;
    }

    //Highlight specified cells
    for (let index = 0; index < table.rows.length; index++) {
        const row = table.rows[index];
        const value = row.cells[0].innerHTML
        if (ids.indexOf(value) != -1) {
            row.classList.add("trHighlight")
        }
    }
}

const passwordLowercaseChars = "abcdefghijklmnopqrstuvwxyz";
const passwordUppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const passwordNumbers = "0123456789";
export function GeneratePassword(lenght: number, includeUppercase: boolean, includeNumbers: boolean): string {
    const allChars = passwordLowercaseChars + (includeUppercase ? passwordUppercaseChars : "") + (includeNumbers ? passwordNumbers : "");
    let password = ""
    for (let i = 0; i < lenght; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    return password
}

export class KeyValuePair<K, V> {
    public key: K
    public value: V
    constructor(key: K, value: V) {
        this.key = key
        this.value = value
    }
}

export function FormatFileSize(fileSizeBytes: number): string {
  // Approximate to the closest prefixed unit
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  const exponent = Math.min(
    Math.floor(Math.log(fileSizeBytes) / Math.log(1024)),
    units.length - 1,
  );
  const approx = fileSizeBytes / 1024 ** exponent;
  return exponent === 0 ? `${fileSizeBytes} bytes` : `${approx.toFixed(3)} ${units[exponent]}`;
}

export function DisableDragAndDrop(element: HTMLElement) {
    element.addEventListener("dragenter", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "none"
    })
    element.addEventListener("dragover", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "none"
    })
    element.addEventListener("drop", (ev) => {
        //ev.dataTransfer.dropEffect = "copy"
        ev.stopPropagation();
        ev.preventDefault();
    })
}