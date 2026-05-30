import { DraggableElement, GlobalLanguageManager, HTMLFormInputElement, HTMLFormInputType, HTMLFormToggleElement, MakeElementDraggable, SendToast } from "./formScript.js"
import { ContainsText, GeneratePassword, KeyValuePair } from "./sharedScripts.js"

export enum FormDialogStyle {
    Normal = 0,
    Wait = 1,
    Entry = 2,
    Select = 3,
    Progress = 4,
    CheckBoxSelect = 5
}

/**
 * Class for button in dialog
 */
export class FormDialogButton {
    location: "left" | "center" | "right"
    color: "ok" | "warn" | "info" | "error" | "black"
    text: string | (() => string)
    valueOnClick: any
    isCancel: boolean = false

    constructor(location: "left" | "center" | "right", color: "ok" | "warn" | "info" | "error" | "black", text: string | (() => string), valueOnClick: any, isCancel: boolean = false) {
        this.location = location
        this.color = color
        this.valueOnClick = valueOnClick
        this.text = text
        this.isCancel = isCancel
    }
}

export type FormDialogCheckboxSelectData<T> = {
    value: T
    checked?: boolean
}

/**
 * Settings for dialogs
 */
export type FormDialogSettings<T> = {
    /**
     * If dialog can open over others
     */
    openOverOthers?: boolean
    /**
     * If dialog blocks others dialogs from opening over this one
     */
    blockOpenOver?: boolean
    /**
     * Allow selection of text in dialog
     */
    allowSelect?: boolean
    /**
     * Minimum count of selectable options, set to undefined for unlimited 
     */
    checkboxSelectMinCount?: number
    /**
     * Maximum count of selectable options, set to undefined for unlimited
     */
    checkboxSelectMaxCount?: number
    /**
     * Input field type
     */
    entryType?: HTMLFormInputType
    /**
     * Values for selection, key is display value, value is returned, can be used for hinting at entry
     */
    selectValues?: Map<string, T>
    /**
     * Values for checkbox selection, key is display value, value contains {value = returned value, checked = if checkbox is checked from start}
     */
    checkboxSelectValues?: Map<string, FormDialogCheckboxSelectData<T>>
    /**
     * Count of progressbars
     */
    progressLines?: number
    /**
     * Placeholder for entry
     */
    placeholder?: string
}

export class FormDialog<T> {
    private readonly dialog: FormDialogTemplate<T>
    /**
     * Cant be consturcted externally, use dialog manager - ShowDialog function
     * @param dialog Configuration
     */
    constructor(dialog: FormDialogTemplate<T>) {
        this.dialog = dialog;
    }

    SetProgress(id: number, value: number, max: number = 100) {
        if (id >= this.dialog.progressLines.length || id < 0) {
            return
        }
        const element = this.dialog.progressLines[id].children.item(1) as HTMLProgressElement
        element.max = max
        element.value = value
    }

    SetProgressMessage(id: number, message: string) {
        if (id >= this.dialog.progressLines.length || id < 0) {
            return
        }
        (this.dialog.progressLines[id].children.item(0) as HTMLParagraphElement).innerText = message
    }

    CloseDialog() {
        this.dialog.CloseDialog()
    }

    AllowSelect(allowSelect: boolean) {
        this.dialog.AllowSelect(allowSelect)
    }

    GetInputValue(): any {
        return this.dialog.inputElement?.value
    }

    GetCheckboxHolderChildren(): Element[] {
        return [...this.dialog.checkboxesHolder?.children as HTMLCollection]
    }
}

/**
 * Dialog template class for creating dialog
 */
class FormDialogTemplate<T> {
    readonly settings: FormDialogSettings<T>
    element: HTMLDialogElement | null = null
    holder: HTMLDivElement | null = null
    titleElement: HTMLParagraphElement | null = null
    contentElement: HTMLDivElement | null = null
    inputElement: HTMLFormInputElement | null = null
    progressLines: HTMLDivElement[]
    checkboxesHolder: HTMLFieldSetElement | null = null
    selectAllCheckbox: HTMLFormToggleElement | null = null
    readonly title: string
    readonly content: string
    readonly escapeCloseValue: T
    readonly onCloseEvent: (clickedButtonID: number, clickedValue: T) => void
    readonly buttons: (FormDialogButton | undefined)[]
    readonly style: FormDialogStyle = FormDialogStyle.Normal
    draggableElement: DraggableElement | null
    private closed: boolean = false

    constructor(title: string, content: string, escapeCloseValue: T, style: FormDialogStyle, onCloseEvent: (clickedButtonID: number, clickedValue: T) => void, buttons: (FormDialogButton | undefined)[], settings: FormDialogSettings<T> = {}) {
        //Setup default settings
        this.title = title
        this.content = content
        this.escapeCloseValue = escapeCloseValue;
        this.onCloseEvent = onCloseEvent;
        this.buttons = buttons;
        this.settings = settings;
        this.style = style
        this.settings.entryType = this.settings.entryType ?? "text"
        this.settings.progressLines = this.settings.progressLines ?? 0;
        this.settings.blockOpenOver = this.settings.blockOpenOver ?? true
        this.settings.openOverOthers = this.settings.openOverOthers ?? true
        this.settings.placeholder = this.settings.placeholder ?? ""
        this.draggableElement = null;
        this.progressLines = []
    }

    AllowSelect(allowSelect: boolean) {
        let len = this.holder?.children.length;
        if (len == undefined) { return; }
        if (allowSelect) {
            for (let i = 1; i < len; i++) {
                this.holder?.children.item(i)?.classList.add("allowSelect")
            }
            this.draggableElement?.ChangeDragElement(this.titleElement)
            this.titleElement?.classList.add("formDialogTitleDrag")
        } else {
            for (let i = 1; i < len; i++) {
                this.holder?.children.item(i)?.classList.remove("allowSelect")
            }
            this.draggableElement?.ChangeDragElement(null)
            this.titleElement?.classList.remove("formDialogTitleDrag")
        }
    }

    GetClosed(): boolean {
        return this.closed
    }

    CloseDialog() {
        this.element?.dispatchEvent(new Event("force-cancel"))
        this.closed = true;
    }
}

/**
 * Class for managing dialogs
 */
export class FormDialogManager {
    dialogs: FormDialogTemplate<any>[]
    blockOpenOver: boolean
    opened: FormDialogTemplate<any>[]
    readonly dialogHolder: HTMLDivElement
    constructor() {
        this.dialogs = []
        this.opened = []
        this.blockOpenOver = false

        this.dialogHolder = document.createElement("div")
        this.dialogHolder.id = "formDialogHolder"
        document.body.appendChild(this.dialogHolder)
    }

    ShowDialog<T>(title: string, content: string, escapeCloseValue: T, style: FormDialogStyle, onCloseEvent: (clickedButtonID: number, clickedValue: T) => void, buttons: (FormDialogButton | undefined)[], settings: FormDialogSettings<T>): FormDialog<T> | null {
        const dialog = new FormDialogTemplate<T>(title, content, escapeCloseValue, style, onCloseEvent, buttons, settings)
        if (this.RenderDialog(dialog)) {
            return new FormDialog(dialog)
        } else {
            return null
        }
    }

    private RenderDialog<T>(dialog: FormDialogTemplate<T> | undefined): boolean {
        //Check if dialog is valid
        if (dialog == null || dialog == undefined) { return false }
        dialog = dialog as FormDialogTemplate<T>
        if (dialog.GetClosed()) { return false }
        if ((dialog.buttons == null || dialog.buttons.length == 0) && dialog.style != FormDialogStyle.Wait) {
            return false
        }

        //Sort out invalid openings
        if (this.blockOpenOver) {
            this.dialogs.push(dialog)
            console.log("Dialog waiting - blocked open over");
            return true
        }
        if (this.opened.length > 0 && !dialog.settings.openOverOthers) {
            this.dialogs.push(dialog)
            console.log("Dialog waiting - other opened");
            return true
        }
        if (!GlobalLanguageManager.GetIsReady()) {
            console.log("Dialog waiting - language manager is loading");
            setTimeout(() => {
                this.RenderDialog(dialog)
            }, 10)
            return true
        }

        //Set properties
        if (dialog.settings.blockOpenOver) {
            this.blockOpenOver = true
        }
        this.opened.push(dialog);

        //Create dialog element
        dialog.element = document.createElement("dialog")
        dialog.element.classList.add("formDialog")
        dialog.element.classList.add("formDialogFadeIn")
        if (dialog.style == FormDialogStyle.Wait) {
            dialog.element.style.cursor = "wait"
        }
        dialog.holder = document.createElement("div")
        dialog.element.appendChild(dialog.holder)
        this.dialogHolder.appendChild(dialog.element)

        //Title
        dialog.titleElement = document.createElement("p")
        dialog.titleElement.classList.add("formHeader")
        dialog.titleElement.innerText = dialog.title
        dialog.holder.appendChild(dialog.titleElement)
        dialog.draggableElement = MakeElementDraggable(dialog.element, null)

        //Content
        const content = document.createElement("div")
        if (dialog.style == FormDialogStyle.Wait || dialog.style == FormDialogStyle.Progress) {
            content.classList.add("puslatingEffectFull")
        }
        content.innerHTML = dialog.content
        dialog.holder.appendChild(content)

        //Setup specific styles
        if (dialog.style == FormDialogStyle.Entry || dialog.style == FormDialogStyle.Select) {
            //Setup entry
            dialog.inputElement = new HTMLFormInputElement("", null)
            dialog.inputElement.placeholder = dialog.settings.placeholder as string
            dialog.inputElement.addEventListener("mousedown", (ev: MouseEvent) => {
                ev.stopImmediatePropagation()
            })
            if (dialog.style == FormDialogStyle.Entry) {
                dialog.inputElement.type = dialog.settings.entryType as HTMLFormInputType
            } else {
                dialog.inputElement.type = "select"
                dialog.inputElement.isStrictList = true
                if (dialog.settings.selectValues != undefined) {
                    dialog.inputElement.setOptions(dialog.settings.selectValues)
                }
            }
            let image = ""
            switch (dialog.settings.entryType as HTMLFormInputType) {
                case "text": { image = "textfields32.svg"; break }
                case "color": { image = "palette32.svg"; break }
                case "password": { image = "key32.svg"; break }
                case "search-realtime": { image = "!filter"; break }
                default: { image = "textfields32.svg"; break }
            }
            dialog.inputElement.icon = "/formWebScripts/images/" + image
            dialog.holder.appendChild(dialog.inputElement as HTMLFormInputElement)
        } else if (dialog.style == FormDialogStyle.Progress) {
            //Setup progress
            for (let i = 0; i < (dialog.settings.progressLines as number); i++) {
                const line = document.createElement("div")
                const text = document.createElement("p")
                text.style.textAlign = "center"
                line.appendChild(text)
                const progress = document.createElement("progress")
                progress.classList.add("formProgress")
                line.appendChild(progress)
                dialog.progressLines.push(line)
                dialog.holder.appendChild(line)
            }
        } else if (dialog.style == FormDialogStyle.CheckBoxSelect) {
            //Setup search
            dialog.inputElement = new HTMLFormInputElement("", null)
            /*if (dialog.settings.selectValues != undefined) {
                dialog.inputElement.setOptions([...dialog.settings.selectValues.keys()])
            }*/
            dialog.inputElement.type = "search-realtime";
            dialog.inputElement.addEventListener("search", () => {
                for (const element of dialog.checkboxesHolder?.children as HTMLCollection) {
                    const toggle = (element as HTMLFormToggleElement)
                    toggle.style.display = ContainsText(toggle.label, dialog.inputElement?.value, false, true) ? "" : "none";
                }
                onChange()
            })
            dialog.holder.appendChild(dialog.inputElement as HTMLFormInputElement)

            //Setup checkboxes area
            dialog.checkboxesHolder = document.createElement("fieldset")
            dialog.checkboxesHolder.classList.add("checkboxHolder")
            const name = "FormDialogToggleGroup-" + GeneratePassword(8, false, false);
            dialog.checkboxesHolder.setAttribute("form-toggle-limiter", name)
            dialog.checkboxesHolder.setAttribute("form-toggle-disabled", "")

            //Setup mins and maxes
            if (dialog.settings.checkboxSelectMinCount != undefined) {
                dialog.checkboxesHolder.setAttribute("min", dialog.settings.checkboxSelectMinCount.toString())
            }
            if (dialog.settings.checkboxSelectMaxCount != undefined) {
                dialog.checkboxesHolder.setAttribute("max", dialog.settings.checkboxSelectMaxCount.toString())
            }
            const isRadio = dialog.settings.checkboxSelectMinCount != undefined && dialog.settings.checkboxSelectMaxCount != undefined && dialog.settings.checkboxSelectMinCount == 1 && dialog.settings.checkboxSelectMaxCount == 1
            if (isRadio) {
                dialog.checkboxesHolder.removeAttribute("max")
            }

            //On change            
            const onChange = () => {
                if(isRadio) {return}
                const children = dialog.checkboxesHolder?.children as HTMLCollection;
                let checked = 0;
                let childenCount = 0;
                for (const element of children) {
                    const toggle = (element as HTMLFormToggleElement)
                    if (toggle.style.display == "none") { continue }
                    childenCount++;
                    if (toggle.checked) {
                        checked++;
                    }
                }
                if (checked == 0) {
                    (dialog.selectAllCheckbox as HTMLFormToggleElement).checked = false;
                } else if (checked == childenCount) {
                    (dialog.selectAllCheckbox as HTMLFormToggleElement).checked = true;
                } else {
                    (dialog.selectAllCheckbox as HTMLFormToggleElement).indeterminate = true;
                }
            }

            //Select all checkbox
            if (!isRadio) {
                dialog.selectAllCheckbox = new HTMLFormToggleElement()
                dialog.selectAllCheckbox.addEventListener("change", () => {
                    //if (dialog.settings.checkboxSelectMaxCount != undefined) {
                    //    if(dialog.settings.checkboxSelectMaxCount < (dialog.checkboxesHolder?.children.length as number)) {
                    //        if(dialog.selectAllCheckbox != null) {
                    //            dialog.selectAllCheckbox.checked = false;
                    //        }
                    //    }
                    //}
                    const checked = dialog.selectAllCheckbox?.checked == true
                    for (const element of dialog.checkboxesHolder?.children as HTMLCollection) {
                        const toggle = (element as HTMLFormToggleElement)
                        if (toggle.style.display == "none") { continue }
                        toggle.disableEvents = true;
                        toggle.silenceValidation++;
                        toggle.checked = checked;
                        toggle.silenceValidation--;
                        toggle.disableEvents = false;
                    }
                    if(dialog.checkboxesHolder?.children.length ?? 0 > 0) {
                        (dialog.checkboxesHolder?.children.item(0) as HTMLFormToggleElement).validate()
                    }
                    onChange()
                })
                dialog.selectAllCheckbox.label = GlobalLanguageManager.Translate("dialog.selectAll")
            }
            
            //Generate HTML elements
            dialog.holder.appendChild(dialog.checkboxesHolder)
            if(!isRadio && dialog.selectAllCheckbox != null) {
                dialog.holder.appendChild(dialog.selectAllCheckbox)
            }
            if (dialog.settings.checkboxSelectValues != undefined) {
                for (const [key, val] of dialog.settings.checkboxSelectValues) {
                    const input = new HTMLFormToggleElement()
                    input.name = name;
                    input.isRadio = isRadio
                    input.label = key;
                    input.value = key;
                    input.addEventListener("change", () => {
                        onChange()
                    })
                    input.silenceValidation++;
                    input.checked = val.checked ?? false;
                    input.silenceValidation--;
                    dialog.checkboxesHolder.appendChild(input)
                }
            }
            onChange()

            //Calculate max width
            const lastChild = dialog.checkboxesHolder.children.item(dialog.checkboxesHolder.children.length - 1);
            if (lastChild != null) {
                dialog.checkboxesHolder.style.width = ((lastChild.getBoundingClientRect().right + lastChild.getBoundingClientRect().width) - dialog.checkboxesHolder.getBoundingClientRect().left + dialog.checkboxesHolder.scrollLeft + 20) + "px";
            }
            dialog.checkboxesHolder.removeAttribute("form-toggle-disabled")
        }

        //Allow select
        dialog.AllowSelect(dialog.settings.allowSelect ?? (dialog.style == FormDialogStyle.CheckBoxSelect || dialog.style == FormDialogStyle.Entry || dialog.style == FormDialogStyle.Select));

        //Button box holder
        const buttonBoxHolder = document.createElement("div")
        buttonBoxHolder.classList.add("formButtonBoxHolder")
        dialog.holder.appendChild(buttonBoxHolder)

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
        const closeDialog = async (isCancel: boolean): Promise<boolean> => {
            if (dialog == null || dialog == undefined) {
                return Promise.resolve(true)
            }
            if (dialog.style == FormDialogStyle.Select && !isCancel) {
                const [_, valid] = await (dialog.inputElement as HTMLFormInputElement).validate()
                if (!valid) {
                    SendToast(dialog.title, "Pole obsahuje neplatnou hodnotu.", "error")
                    return Promise.resolve(false)
                }
            }
            if (dialog.style == FormDialogStyle.CheckBoxSelect && !isCancel && dialog.checkboxesHolder?.children.length != 0) {
                const [_, valid] = await (dialog.checkboxesHolder?.children.item(0) as HTMLFormToggleElement).validate()
                if (!valid) {
                    return Promise.resolve(false)
                }
            }

            dialog.element?.classList.add("is-hidden")
            dialog.element?.addEventListener("animationend", (event: AnimationEvent) => {
                if (event.animationName == "fadeOut") {
                    dialog.element?.classList.remove("is-hidden")
                    dialog.element?.close()
                    dialog.element?.remove()
                    if (dialog.settings.blockOpenOver) {
                        this.blockOpenOver = false
                    }
                    this.opened = this.opened.filter(item => item != dialog)

                    //Open next dialog
                    let tryOpen = true
                    while (tryOpen) {
                        tryOpen = !this.RenderDialog(this.dialogs.pop())
                        if (this.dialogs.length == 0) { tryOpen = false }
                    }
                }
            })
            return Promise.resolve(true)
        }

        //ESC key press
        dialog.element.addEventListener('cancel', async (event) => {
            event.preventDefault();
            if (dialog.style == FormDialogStyle.Wait) {
                dialog.element?.classList.remove("formDialogFadeIn")
                dialog.element?.close()
                dialog.element?.showModal()
                return
            }
            if (! await closeDialog(true)) { return }
            if (dialog.onCloseEvent != null) {
                dialog.onCloseEvent(-1, dialog.escapeCloseValue)
            }
        });

        //Close using close function
        dialog.element.addEventListener('force-cancel', async (event) => {
            event.preventDefault();
            if (! await closeDialog(true)) { return }
            if (dialog.onCloseEvent != null) {
                dialog.onCloseEvent(-2, dialog.escapeCloseValue)
            }
        });

        //Setup buttons
        if (dialog.buttons != null) {
            for (let i = 0; i < dialog.buttons.length; i++) {
                if (dialog.buttons[i] == undefined) {
                    continue
                }
                const button = document.createElement("button")
                button.classList.add("formButton")
                if (dialog.buttons[i]?.color == "ok") {
                    button.classList.add("formOkColor")
                } else if (dialog.buttons[i]?.color == "warn") {
                    button.classList.add("formWarnColor")
                } else if (dialog.buttons[i]?.color == "info") {
                    button.classList.add("formInfoColor")
                } else if (dialog.buttons[i]?.color == "error") {
                    button.classList.add("formErrorColor")
                } else if (dialog.buttons[i]?.color == "black") {
                    button.classList.add("formBlackColor")
                }

                button.onclick = async () => {
                    if (! await closeDialog((dialog.buttons[i] as FormDialogButton).isCancel)) { return }
                    if (dialog.onCloseEvent != null) {
                        dialog.onCloseEvent(i, dialog.buttons[i]?.valueOnClick)
                    }
                }

                if (dialog.buttons[i]?.location == "left") {
                    buttonBoxLeft.appendChild(button)
                } else if (dialog.buttons[i]?.location == "center") {
                    buttonBoxCenter.appendChild(button)
                } else if (dialog.buttons[i]?.location == "right") {
                    buttonBoxRight.appendChild(button)
                }
                const text = (dialog.buttons[i] as FormDialogButton).text
                if (typeof text == "string") {
                    button.innerText = text
                } else {
                    button.innerHTML = text();
                }
            }
        }
        //Open dialog
        dialog.element.showModal()
        dialog.element.scroll({ top: 0, behavior: "instant" })
        return true
    }

    CloseTopDialog() {
        if (this.opened.length > 0) {
            this.opened[this.opened.length - 1].CloseDialog()
        }
    }

    /**
     * Shows prompt (asking for user input - text, number, ...)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param entryType Input field type, overwrites settings.entryType
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry
     * @argument settings.allowSelect Allow selection of text in dialog
     * @argument settings.selectValues Hinting values for entry, key is display value, value is returned
     * @returns Dialog or null 
     */
    ShowPrompt<T>(title: string, content: string, cancelValue: T, onCloseEvent: (value: T) => void, entryType: HTMLFormInputType = "text", settings: FormDialogSettings<T> = {}): FormDialog<T> | null {
        settings.entryType = entryType;
        const dialog = this.ShowDialog(title, content, cancelValue, FormDialogStyle.Entry, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog?.GetInputValue() as unknown as T)
                    return
                }
                onCloseEvent(value)
            }
        }, [
            new FormDialogButton("left", "error", GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel"), cancelValue),
            new FormDialogButton("right", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)
        ], settings)
        return dialog;
    }

    /**
     * Shows alert (informing about problem - only OK button)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowAlert(title: string, content: string, onCloseEvent: () => void, settings: FormDialogSettings<null> = {}): FormDialog<null> | null {
        return this.ShowDialog<null>(title, content, null, FormDialogStyle.Normal, (_a, _b) => {
            if (onCloseEvent != null) {
                onCloseEvent()
            }
        }, [
            new FormDialogButton("center", "ok", GlobalLanguageManager.Translate("dialog.btnOK", "OK"), null)
        ], settings)
    }

    /**
     * Opens confirm (asking for user yes or no)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null 
     */
    ShowConfirm(title: string, content: string, onCloseEvent: (value: boolean) => void | Promise<void>, settings: FormDialogSettings<boolean> = {}): FormDialog<boolean> | null {
        return this.ShowDialog(title, content, false, FormDialogStyle.Normal, (_, value) => {
            if (!onCloseEvent != null) {
                onCloseEvent(value)
            }
        }, [
            new FormDialogButton("left", "error", () => { return GlobalLanguageManager.Translate("dialog.btnNo", "No") }, false, true),
            new FormDialogButton("right", "ok", () => { return GlobalLanguageManager.Translate("dialog.btnYes", "Yes") }, true)
        ], settings)
    }

    /**
     * Opens select dialog (asking for user choice of value)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param selectValues Values for selection, key is display value, value is returned, overwrites settings.selectValues
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null 
     */
    ShowSelect<T>(title: string, content: string, cancelValue: T, onCloseEvent: (value: T) => void, selectValues: Map<string, T>, settings: FormDialogSettings<T> = {}): FormDialog<T> | null {
        settings.selectValues = selectValues;
        const dialog = this.ShowDialog<T>(title, content, cancelValue, FormDialogStyle.Select, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    onCloseEvent(dialog?.GetInputValue() as unknown as T)
                    return
                }
                onCloseEvent(value)
            }
        }, [
            new FormDialogButton("left", "error", () => { return GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel") }, cancelValue, true),
            new FormDialogButton("right", "ok", () => { return GlobalLanguageManager.Translate("dialog.btnOK", "OK") }, null)
        ], settings)
        return dialog;
    }

    /**
     * Opens progress (please wait dialogs or progress)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param onCloseEvent Event fired on close
     * @param progressLines Count of progressbars, overwrites settings.progressLines
     * @param allowCancel If you can cancel the progress dialog
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null 
     */
    ShowProgress(title: string, content: string, onCancelEvent: () => void, progressLines: number, allowCancel: boolean, settings: FormDialogSettings<false> = {}): FormDialog<false> | null {
        settings.progressLines = progressLines;
        const dialog = this.ShowDialog(title, content, false, FormDialogStyle.Progress, (btn, value) => {
            if (onCancelEvent != null) {
                if (btn != -2) {
                    onCancelEvent()
                    return
                }
            }
        }, [
            allowCancel ? new FormDialogButton("center", "error", () => { return GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel") }, false, true) : undefined
        ], settings)
        return dialog;
    }

    /**
     * Opens checkbox select (allowing multiselect using checkboxes), if minimum and maximum argument set to 1, it will switch to radio buttons instead
     * @param title Title of dialog
     * @param content Content HTML before select field
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param checkboxSelectValues Values for selection, key is display value, value is returned, overwrites settings.checkboxSelectValues
     * @param settings More settings, not required:
     * @argument settings.checkboxSelectMinCount Minimum count of selectable options, set to undefined for unlimited 
     * @argument settings.checkboxSelectMaxCount Maximum count of selectable options, set to undefined for unlimited
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Dialog or null
     */
    ShowCheckboxSelect<T>(title: string, content: string, cancelValue: T | T[], onCloseEvent: (values: T[] | T) => void, checkboxSelectValues: Map<string, FormDialogCheckboxSelectData<T>>, settings: FormDialogSettings<T> = {}): FormDialog<T | T[]> | null {
        settings.checkboxSelectValues = checkboxSelectValues
        const dialog = this.ShowDialog(title, content, cancelValue, FormDialogStyle.CheckBoxSelect, (btn, value) => {
            if (!onCloseEvent != null) {
                if (btn == 1) {
                    const children = dialog?.GetCheckboxHolderChildren()
                    if (children != undefined) {
                        const values: T[] = [];
                        for (const element of children) {
                            const toggle = element as HTMLFormToggleElement
                            if (toggle.checked) {
                                values.push(checkboxSelectValues.get(toggle.value)?.value as T)
                            }
                        }
                        onCloseEvent(values)
                        return
                    }
                }
                onCloseEvent(value)
            }
        }, [
            new FormDialogButton("left", "error", () => { return GlobalLanguageManager.Translate("dialog.btnCancel", "Cancel") }, cancelValue, true),
            new FormDialogButton("right", "ok", () => { return GlobalLanguageManager.Translate("dialog.btnOK", "OK") }, null)
        ], settings)
        return dialog;
    }

    /**
     * Shows prompt (asking for user input - text, number, ...)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param entryType Input field type, overwrites settings.entryType
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry
     * @argument settings.allowSelect Allow selection of text in dialog
     * @argument settings.selectValues Hinting values for entry, key is display value, value is returned
     * @returns Result value
     */
    ShowPromptAsync<T>(title: string, content: string, cancelValue: T, entryType: HTMLFormInputType = "text", settings: FormDialogSettings<T> = {}): Promise<T | null> {
        return new Promise(resolve => {
            if (this.ShowPrompt(title, content, cancelValue, (value: T) => { resolve(value) }, entryType, settings) == null) {
                resolve(null)
            }
        })
    }

    /**
     * Shows alert (informing about problem - only OK button)
     * @param title Title of dialog
     * @param content Content HTML of information
     * @param onCloseEvent Event fired on close
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns True or null on failure
     */
    ShowAlertAsync(title: string, content: string, settings: FormDialogSettings<any> = {}): Promise<null | true> {
        return new Promise(resolve => {
            if (this.ShowAlert(title, content, () => { resolve(true) }, settings) == null) {
                resolve(null)
            }
        })
    }

    /**
    * Opens confirm (asking for user yes or no)
    * @param title Title of dialog
    * @param content Content HTML of information
    * @param onCloseEvent Event fired on close
    * @param settings More settings, not required:
    * @argument settings.openOverOthers If dialog can open over others
    * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
    * @argument settings.allowSelect Allow selection of text in dialog
    * @returns True or false or null on failure
    */
    ShowConfirmAsync(title: string, content: string, settings: FormDialogSettings<boolean> = {}): Promise<boolean | null> {
        return new Promise(resolve => {
            if (this.ShowConfirm(title, content, (value: boolean) => { resolve(value) }, settings) == null) {
                resolve(null)
            }
        })
    }

    /**
     * Opens select dialog (asking for user choice of value)
     * @param title Title of dialog
     * @param content Content HTML before entry
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param selectValues Values for selection, key is display value, value is returned, overwrites settings.selectValues
     * @param settings More settings, not required:
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Returns selected value or null on failure
     */
    ShowSelectAsync<T>(title: string, content: string, cancelValue: T, selectValues: Map<string, T>, settings: FormDialogSettings<T> = {}): Promise<T | null> {
        return new Promise(resolve => {
            if (this.ShowSelect(title, content, cancelValue, (value: T) => { resolve(value) }, selectValues, settings) == null) {
                resolve(null)
            }
        })
    }

    /**
     * Opens checkbox select (allowing multiselect using checkboxes), if minimum and maximum arguments are set to 1, it will switch to radio buttons instead
     * @param title Title of dialog
     * @param content Content HTML before select field
     * @param cancelValue Value returned on cancel
     * @param onCloseEvent Event fired on close
     * @param checkboxSelectValues Values for selection, key is display value, value is returned, overwrites settings.checkboxSelectValues
     * @param settings More settings, not required:
     * @argument settings.checkboxSelectMinCount Minimum count of selectable options, set to undefined for unlimited 
     * @argument settings.checkboxSelectMaxCount Maximum count of selectable options, set to undefined for unlimited
     * @argument settings.openOverOthers If dialog can open over others
     * @argument settings.blockOpenOver If dialog blocks others dialogs from opening over this one
     * @argument settings.placeholder Placeholder for entry (searchbar)
     * @argument settings.allowSelect Allow selection of text in dialog
     * @returns Array of values, one (cancel) value or null on failure
     */
    ShowCheckboxSelectAsync<T>(title: string, content: string, cancelValue: T, checkboxSelectValues: Map<string, FormDialogCheckboxSelectData<T>>, settings: FormDialogSettings<T> = {}): Promise<T[] | T | null> {
        return new Promise(resolve => {
            if (this.ShowCheckboxSelect(title, content, cancelValue, (value: T[] | T) => { resolve(value) }, checkboxSelectValues, settings) == null) {
                resolve(null)
            }
        })
    }
}