import { DraggableElement, HTMLFormInputElement, HTMLFormInputType, MakeElementDraggable } from "./formScript.js"
import { LanguageManager } from "./languageManager.js"
import { KeyValuePair } from "./sharedScripts.js"

export enum FormDialogStyle {
    Normal = 0,
    Wait = 1,
    Entry = 2,
    Select = 3,
    Progress = 4
}

/**
 * Class for button in dialog
 */
export class FormDialogButton {
    location: "left" | "center" | "right"
    color: "ok" | "warn" | "info" | "error" | "black"
    text: string
    valueOnClick: any
    isCancel: boolean = false

    constructor(location: "left" | "center" | "right", color: "ok" | "warn" | "info" | "error" | "black", text: string, valueOnClick: any, isCancel: boolean = false) {
        this.location = location
        this.color = color
        this.valueOnClick = valueOnClick
        this.text = text
        this.isCancel = isCancel
    }
}

/**
 * Dialog template class for creating dialog
 */
export class FormDialogTemplate<T> {
    readonly title: string
    readonly content: string
    readonly escapeCloseValue: T
    readonly onCloseEvent: (clickedButtonID: number, clickedValue: T) => void
    readonly buttons: (FormDialogButton | undefined)[]
    readonly blockOpenOver: boolean
    readonly openOverOthers: boolean
    readonly style: FormDialogStyle
    placeholder: string
    entryType: HTMLFormInputType
    selectValues: Map<string, T>
    createdDialogs: FormDialog<T>[]
    progressLines: number

    /**
     * Creates new dialog, do not modify any properties of element
     * @param title Title of dialog
     * @param content Text content of dialog
     * @param escapeCloseValue Value sended in onCloseEvent, when Escape key was pressed
     * @param onCloseEvent Event called when dialog is closed, -1 = Escape key, -2 = Close using function
     * @param buttons Array of buttons in dialog
     * @param style Style of dialog
     * @param openOverOthers Allow opening over other dialogs
     * @param blockOpenOver Will be the topmost dialog, no other dialog can open over this one
     */
    constructor(title: string, content: string, escapeCloseValue: T, onCloseEvent: (clickedButtonID: number, clickedValue: T) => void, buttons: (FormDialogButton | undefined)[], style: FormDialogStyle = FormDialogStyle.Normal, openOverOthers: boolean = false, blockOpenOver: boolean = false) {
        this.title = title
        this.content = content
        this.escapeCloseValue = escapeCloseValue
        this.onCloseEvent = onCloseEvent
        this.buttons = buttons
        this.blockOpenOver = blockOpenOver
        this.openOverOthers = openOverOthers
        this.style = style
        this.placeholder = ""
        this.entryType = "text"
        this.selectValues = new Map<string, T>
        this.createdDialogs = []
        this.progressLines = 0
    }

    CloseChildrenDialogs() {
        for (let dialog of this.createdDialogs) {
            dialog.CloseDialog()
        }
    }
}

/**
 * Dialog class for creating dialog
 */
export class FormDialog<T> {
    readonly template: FormDialogTemplate<T>
    readonly element: HTMLDialogElement
    readonly inputElement: HTMLFormInputElement | null = null
    readonly progressLines: HTMLDivElement[]
    readonly progressLabels: HTMLSpanElement[] = []
    /**
     * Do not edit externally
     */
    public draggableElement: DraggableElement |null
    closed: boolean = false

    /**
     * Creates new dialog, do not modify any properties of element
     * @param template Template of dialog
     */
    constructor(template: FormDialogTemplate<T>) {
        this.template = template
        this.draggableElement = null;
        this.element = document.createElement("dialog")
        this.progressLines = []
        if (template.style == FormDialogStyle.Entry || template.style == FormDialogStyle.Select) {
            //Setup entry
            this.inputElement = new HTMLFormInputElement("", null)
            this.inputElement.setPlaceHolder(template.placeholder)
            if (template.style == FormDialogStyle.Entry) {
                this.inputElement.setType(this.template.entryType)
            } else {
                this.inputElement.setType("select")
                this.inputElement.setIsScrictList(true)
                this.inputElement.setOptions(template.selectValues)
            }
            let image = ""
            switch (this.template.entryType.toLowerCase()) {
                case "text": { image = "textfields32.svg"; break }
                case "color": { image = "palette32.svg"; break }
                case "password": { image = "key32.svg"; break }
                default: { image = "textfields32.svg"; break }
            }
            this.inputElement.setIcon("/formWebScripts/images/" + image)
        }
        if (template.style == FormDialogStyle.Progress) {
            //Setup progress
            for (let i = 0; i < template.progressLines; i++) {
                const line = document.createElement("div")
                const text = document.createElement("p")
                text.style.textAlign = "center"
                line.appendChild(text)
                const progress = document.createElement("progress")
                progress.classList.add("formProgress")
                line.appendChild(progress)
                this.progressLines.push(line)
            }
        }
        this.template.createdDialogs.push(this)
    }

    SetProgress(id: number, value: number, max: number = 100) {
        if (id >= this.progressLines.length) {
            return
        }
        const element = this.progressLines[id].children.item(1) as HTMLProgressElement
        element.max = max
        element.value = value
    }
    SetMessage(id: number, message: string) {
        if (id >= this.progressLines.length) {
            return
        }
        (this.progressLines[id].children.item(0) as HTMLParagraphElement).innerText = message
    }

    CloseDialog() {
        this.element.dispatchEvent(new Event("force-cancel"))
        this.closed = true;
        this.template.createdDialogs = this.template.createdDialogs.filter(item => item != this)
    }
    AllowSelect(allowSelect: boolean) {
        const holder = this.element.children.item(0) as HTMLElement
        const title = holder.children.item(0) as HTMLElement
        if (allowSelect) {
            for (let i = 1; i < holder.children.length; i++) {
                holder.children.item(i)?.classList.add("allowSelect")
            }
            this.draggableElement?.ChangeDragElement(title)
            title.classList.add("formDialogTitleDrag")
        } else {
            for (let i = 1; i < holder.children.length; i++) {
                holder.children.item(i)?.classList.remove("allowSelect")
            }
            this.draggableElement?.ChangeDragElement(null)
            title.classList.remove("formDialogTitleDrag")
        }
    }
}

/**
 * Class for managing dialogs
 */
export class FormDialogManager {
    dialogs: FormDialog<any>[]
    blockedOpenOver: boolean
    opened: FormDialog<any>[]
    private readonly languageManager: LanguageManager
    constructor() {
        this.dialogs = []
        this.opened = []
        this.blockedOpenOver = false
        this.languageManager = new LanguageManager("/formWebScripts/locales", "", false)

        const dialogHolder = document.createElement("div")
        dialogHolder.id = "formDialogHolder"
        document.body.appendChild(dialogHolder)
    }

    ShowTemplate<T>(template: FormDialogTemplate<T>): FormDialog<T> | null {
        if (template == null) {
            return null
        }
        const dialog = new FormDialog(template)
        if (this.ShowDialog(dialog)) {
            return dialog
        } else {
            return null
        }
    }

    ShowDialog<T>(dialog: FormDialog<T> | undefined): boolean {
        //Check if dialog is valid
        if (dialog == null || dialog == undefined || dialog.template == null) { return false }
        dialog = dialog as FormDialog<T>
        if (dialog.closed) { return false }
        if ((dialog.template.buttons == null || dialog.template.buttons.length == 0) && dialog.template.style != FormDialogStyle.Wait) {
            return false
        }

        //Sort out invalid openings
        if (this.blockedOpenOver) {
            this.dialogs.push(dialog)
            console.log("Dialog waiting - blocked open over");
            return true
        }
        if (this.opened.length > 0 && !dialog.template.openOverOthers) {
            this.dialogs.push(dialog)
            console.log("Dialog waiting - other opened");
            return true
        }

        //Set properties
        if (dialog.template.blockOpenOver) {
            this.blockedOpenOver = true
        }
        this.opened.push(dialog);

        //Create dialog
        document.getElementById("formDialogHolder")?.appendChild(dialog.element)
        dialog.element.classList.add("formDialog")
        dialog.element.classList.add("formDialogFadeIn")
        if (dialog.template.style == FormDialogStyle.Wait) {
            dialog.element.style.cursor = "wait"
        }

        const holder = document.createElement("div")
        dialog.element.appendChild(holder)

        //Title
        const title = document.createElement("p")
        title.classList.add("formHeader")
        title.innerText = dialog.template.title
        holder.appendChild(title)
        dialog.draggableElement = MakeElementDraggable(dialog.element, title)
        dialog.AllowSelect(false);

        //Data
        const data = document.createElement("div")
        if (dialog.template.style == FormDialogStyle.Wait || dialog.template.style == FormDialogStyle.Progress) {
            data.classList.add("puslatingEffectFull")
        }
        data.innerHTML = dialog.template.content
        holder.appendChild(data)

        //Entry
        if (dialog.template.style == FormDialogStyle.Entry || dialog.template.style == FormDialogStyle.Select) {
            holder.appendChild(dialog.inputElement as HTMLFormInputElement)
        }

        //Progress
        if (dialog.template.style == FormDialogStyle.Progress) {
            for (let i = 0; i < dialog.progressLines.length; i++) {
                holder.appendChild(dialog.progressLines[i])
            }
        }

        //Button box holder
        const buttonBoxHolder = document.createElement("div")
        buttonBoxHolder.classList.add("formButtonBoxHolder")
        holder.appendChild(buttonBoxHolder)

        //Button box left
        const buttonBoxLeft = document.createElement("div")
        buttonBoxLeft.classList.add("formButtonBox", "formJustifyLeft")
        buttonBoxHolder.appendChild(buttonBoxLeft)

        //Button box center
        const buttonBoxCenter = document.createElement("div")
        buttonBoxCenter.classList.add("formButtonBox", "formCenter")
        buttonBoxHolder.appendChild(buttonBoxCenter)

        //Button box right
        const buttonBoxRight = document.createElement("div")
        buttonBoxRight.classList.add("formButtonBox", "formJustifyRight")
        buttonBoxHolder.appendChild(buttonBoxRight)

        //Close animation
        const manager = this
        async function closeDialog(isCancel: boolean): Promise<boolean> {
            if (dialog == null || dialog == undefined) {
                return true
            }
            if (dialog.template.style == FormDialogStyle.Select && !isCancel) {
                const [_, valid] = await (dialog.inputElement as HTMLFormInputElement).validate()
                if (!valid) {
                    return false
                }
            }

            dialog.element.classList.add("is-hidden")
            dialog.element.addEventListener("animationend", (event: AnimationEvent) => {
                if (event.animationName == "fadeOut") {
                    dialog.element.classList.remove("is-hidden")
                    dialog.element.close()
                    dialog.element.remove()
                    if (dialog.template.blockOpenOver) {
                        manager.blockedOpenOver = false
                    }
                    manager.opened = manager.opened.filter(item => item != dialog)

                    //Open next dialog
                    let tryOpen = true
                    while (tryOpen) {
                        tryOpen = !manager.ShowDialog(manager.dialogs.pop())
                        if (manager.dialogs.length == 0) { tryOpen = false }
                    }
                }
            })
            return true
        }

        //ESC key press
        dialog.element.addEventListener('cancel', (event) => {
            event.preventDefault();
            if (dialog.template.style == FormDialogStyle.Wait) {
                dialog.element.classList.remove("formDialogFadeIn")
                dialog.element.close()
                dialog.element.showModal()
                return
            }
            if (!closeDialog(true)) { return }
            if (dialog.template.onCloseEvent != null) {
                dialog.template.onCloseEvent(-1, dialog.template.escapeCloseValue)
            }
        });

        //Close using close function
        dialog.element.addEventListener('force-cancel', (event) => {
            event.preventDefault();
            if (!closeDialog(true)) { return }
            if (dialog.template.onCloseEvent != null) {
                dialog.template.onCloseEvent(-2, dialog.template.escapeCloseValue)
            }
        });

        //Setup buttons
        if (dialog.template.buttons != null) {
            for (let i = 0; i < dialog.template.buttons.length; i++) {
                if (dialog.template.buttons[i] == undefined) {
                    continue
                }
                const button = document.createElement("button")
                button.classList.add("formButton")
                if (dialog.template.buttons[i]?.color == "ok") {
                    button.classList.add("formOkColor")
                } else if (dialog.template.buttons[i]?.color == "warn") {
                    button.classList.add("formWarnColor")
                } else if (dialog.template.buttons[i]?.color == "info") {
                    button.classList.add("formInfoColor")
                } else if (dialog.template.buttons[i]?.color == "error") {
                    button.classList.add("formErrorColor")
                } else if (dialog.template.buttons[i]?.color == "black") {
                    button.classList.add("formBlackColor")
                }

                button.onclick = () => {
                    if (!closeDialog((dialog.template.buttons[i] as FormDialogButton).isCancel)) { return }
                    if (dialog.template.onCloseEvent != null) {
                        dialog.template.onCloseEvent(i, dialog.template.buttons[i]?.valueOnClick)
                    }
                }

                if (dialog.template.buttons[i]?.location == "left") {
                    buttonBoxLeft.appendChild(button)
                } else if (dialog.template.buttons[i]?.location == "center") {
                    buttonBoxCenter.appendChild(button)
                } else if (dialog.template.buttons[i]?.location == "right") {
                    buttonBoxRight.appendChild(button)
                }
                button.innerText = (dialog.template.buttons[i] as FormDialogButton).text
            }
        }
        //Open dialog
        dialog.element.showModal()
        return true
    }

    CloseTopDialog() {
        if (this.opened.length > 0) {
            this.opened[this.opened.length - 1].CloseDialog()
        }
    }

    ShowPrompt<T>(title: string, content: string, cancelValue: T, onCloseEvent: (value: T) => void, entryType: HTMLFormInputType = "text", placeholder: string = "", openOverOthers: boolean = true, blockedOpenOver: boolean = true): FormDialog<T> {
        let dialog: FormDialog<T>
        const template = new FormDialogTemplate(title, content, cancelValue, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog.inputElement?.getValue() as unknown as T)
                    return
                }
                onCloseEvent(value)
            }
        }, [new FormDialogButton("left", "error", this.languageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue),
        new FormDialogButton("right", "ok", this.languageManager.Translate("dialog.btnOK", "OK"), null)],
            FormDialogStyle.Entry, openOverOthers, blockedOpenOver)
        template.entryType = entryType
        template.placeholder = placeholder
        dialog = this.ShowTemplate(template) as FormDialog<T>
        return dialog;
    }

    ShowAlert(title: string, content: string, onCloseEvent: () => void, openOverOthers: boolean = true, blockedOpenOver: boolean = true): FormDialog<null> {
        return this.ShowTemplate<null>(new FormDialogTemplate(title, content, null, (_a, _b) => {
            if (onCloseEvent != null) {
                onCloseEvent()
            }
        }, [new FormDialogButton("center", "ok", this.languageManager.Translate("dialog.btnOK", "OK"), null)], FormDialogStyle.Normal, openOverOthers, blockedOpenOver)) as FormDialog<null>
    }

    ShowConfirm(title: string, content: string, onCloseEvent: (value: boolean) => void | Promise<void>, openOverOthers: boolean = true, blockedOpenOver: boolean = true): FormDialog<boolean> {
        return this.ShowTemplate(new FormDialogTemplate(title, content, false, (_, value) => {
            if (!onCloseEvent != null) {
                onCloseEvent(value)
            }
        }, [new FormDialogButton("left", "error", this.languageManager.Translate("dialog.btnNo", "No"), false, true),
        new FormDialogButton("right", "ok", this.languageManager.Translate("dialog.btnYes", "Yes"), true)], FormDialogStyle.Normal, openOverOthers, blockedOpenOver)) as FormDialog<boolean>
    }

    ShowSelect<T>(title: string, content: string, cancelValue: T, onCloseEvent: (value: T) => void, selectValues: Map<string, T>, openOverOthers: boolean = true, blockedOpenOver: boolean = true): FormDialog<T> {
        let dialog: FormDialog<T>
        const template = new FormDialogTemplate(title, content, cancelValue, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent((dialog.inputElement as HTMLFormInputElement).getValue()[1] as T)
                    return
                }
                onCloseEvent(value)
            }
        }, [new FormDialogButton("left", "error", this.languageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue, true),
        new FormDialogButton("right", "ok", this.languageManager.Translate("dialog.btnOK", "OK"), null)],
            FormDialogStyle.Select, openOverOthers, blockedOpenOver)
        template.selectValues = selectValues
        dialog = this.ShowTemplate(template) as FormDialog<T>
        return dialog;
    }

    ShowProgress(title: string, content: string, onCancelEvent: () => void, progressLines: number, allowCancel: boolean = true, openOverOthers: boolean = true, blockedOpenOver: boolean = true): FormDialog<boolean> {
        let dialog: FormDialog<boolean>
        const template = new FormDialogTemplate(title, content, false, (btn, value) => {
            if (onCancelEvent != null) {
                if (btn != -2) {
                    onCancelEvent()
                    return
                }
            }
        }, [allowCancel ? new FormDialogButton("center", "error", this.languageManager.Translate("dialog.btnCancel", "Cancel"), false, true) : undefined],
            FormDialogStyle.Progress, openOverOthers, blockedOpenOver)
        template.progressLines = progressLines;
        dialog = this.ShowTemplate(template) as FormDialog<boolean>
        return dialog;
    }

    OpenPrompt<T>(title: string, content: string, cancelValue: T, entryType: HTMLFormInputType = "text", placeholder: string = "", openOverOthers: boolean = true, blockedOpenOver: boolean = true): Promise<T> {
        return new Promise(resolve => {
            this.ShowPrompt(title, content, cancelValue, (value: T) => { resolve(value) }, entryType, placeholder, openOverOthers, blockedOpenOver)
        })
    }

    OpenAlert(title: string, content: string, openOverOthers: boolean = true, blockedOpenOver: boolean = true): Promise<any> {
        return new Promise(resolve => {
            this.ShowAlert(title, content, () => { resolve(null) }, openOverOthers, blockedOpenOver)
        })
    }

    OpenConfirm(title: string, content: string, openOverOthers: boolean = true, blockedOpenOver: boolean = true): Promise<boolean> {
        return new Promise(resolve => {
            this.ShowConfirm(title, content, (value: boolean) => { resolve(value) }, openOverOthers, blockedOpenOver)
        })
    }

    OpenSelect<T>(title: string, content: string, cancelValue: T, selectValues: Map<string, T>, openOverOthers: boolean = true, blockedOpenOver: boolean = true): Promise<T> {
        return new Promise(resolve => {
            this.ShowSelect(title, content, cancelValue, (value: T) => { resolve(value) }, selectValues, openOverOthers, blockedOpenOver)
        })
    }
}