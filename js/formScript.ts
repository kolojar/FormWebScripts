//Do not forget to add formStyle.css and tableStyle.css

import { GeneratePassword } from "./sharedScripts.js";

/*
Disables element and all subelements without attribute disableRecursiveDisable
 */
export function RecursiveDisabler(target: HTMLElement, disabled: boolean) {
    for (let index = 0; index < target.children.length; index++) {
        const element = target.children[index] as HTMLElement;
        RecursiveDisabler(element, disabled)
    }
    if (!target.hasAttribute("disableRecursiveDisable")) {
        target.setAttribute("disabled", String(disabled))
        if (!disabled) {
            target.removeAttribute("disabled")
        }
    }
}

/*
HTMLFormBoxElement element defition
*/
export class HTMLFormBoxElement extends HTMLElement {
    private messageID: string
    constructor() {
        super();
        this.messageID = ""
    }
    /**
     * Disables form box
     */
    Disable() {
        RecursiveDisabler(this, true)
    }

    /**
     * Enables form box
     */
    Enable() {
        RecursiveDisabler(this, false)
    }

    /**
     * Sets Status message to form box
     * @param blink Should status message blink
     * @param message Message
     * @param cleanAfterMs Clean after timeout
     */
    SetStatusMessage(blink: boolean, message: string, cleanAfterMs: number = 0) {
        //Set message
        const messageID = GeneratePassword(8, true, true)
        this.messageID = messageID
        this.querySelectorAll("form-status-message").forEach(element => {
            let status = element as HTMLParagraphElement //TODO: FIX
            status.innerText = message;

            //Set blinking
            if (blink) {
                if (!status.classList.contains("puslatingEffectFull")) {
                    status.classList.add("puslatingEffectFull")
                }
            } else {
                if (status.classList.contains("puslatingEffectFull")) {
                    status.classList.remove("puslatingEffectFull")
                }
            }

            //Clean if needed
            if (cleanAfterMs > 0) {
                setTimeout(() => {
                    if (this.messageID == messageID) {
                        status.innerText = ""
                        this.messageID = ""
                    }
                }, cleanAfterMs)
            }
        })
    }

    /**
     * Sets waiting status to form box + disables it
     * @param message Message
     */
    SetWaitStatusMessage(message: string) {
        this.Disable()
        this.style.cursor = "wait";
        this.SetStatusMessage(true, message, 0)
    }

    /**
     * Removes waiting status from form box + enables it
     */
    RemoveWaitStatusMessage() {
        this.SetStatusMessage(false, "", 0)
        this.style.cursor = "";
        this.Enable()
    }
}

/**
 * Sets wait status to all forms in document
 * @param message Message
 */
export function SetWaitStatusForms(message: string) {
    document.querySelectorAll("form-box").forEach(form => {
        (form as HTMLFormBoxElement).SetWaitStatusMessage(message)
    })
}

/**
 * Removes wait status from wall forms in document
 */
export function RemoveWaitStatusForms() {
    document.querySelectorAll("form-box").forEach(form => {
        (form as HTMLFormBoxElement).RemoveWaitStatusMessage()
    })
}

/*
HTMLFormBoxStatusMessageElement element defition
*/
export class HTMLFormBoxStatusMessageElement extends HTMLParagraphElement {
    constructor() {
        super()
    }
}

/*
HTMLFormToggleElement element defition
*/
export class HTMLFormToggleElement extends HTMLElement {
    readonly labelBefore: HTMLLabelElement
    readonly holder: HTMLLabelElement
    readonly input: HTMLInputElement
    readonly slider: HTMLSpanElement
    readonly labelAfter: HTMLLabelElement
    protected originalValue: boolean
    //public activeValue: any
    //public notActiveValue: any
    //protected checked: boolean
    constructor() {
        super()
        this.originalValue = false;
        //this.checked = false

        //Create elements
        this.labelBefore = document.createElement("label")
        this.holder = document.createElement("label")
        this.input = document.createElement("input")
        this.slider = document.createElement("span")
        this.labelAfter = document.createElement("label")

        //Add classes
        this.classList.add("formSwitch")
        this.labelAfter.classList.add("labelBefore")
        this.holder.classList.add("toggle")
        this.slider.classList.add("slider")
        this.labelAfter.classList.add("labelAfter")

        //Move children
        this.appendChild(this.labelBefore)
        this.appendChild(this.holder)
        this.holder.appendChild(this.input)
        this.holder.appendChild(this.slider)
        this.holder.appendChild(this.labelAfter)

        //Setup basic events
        this.addEventListener("mousedown", () => {
            console.log("Click",this.input.checked);
            this.setValue(!this.getValue())
            this.input.dispatchEvent(new Event("change"))
            this.dispatchEvent(new Event("change"))
            this.updateSwitch()
        })
        this.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "Space") {
                console.log("Click");
                this.setValue(!this.getValue())
                this.input.dispatchEvent(new Event("change"))
                this.dispatchEvent(new Event("change"))
                this.updateSwitch()
            }
        })
        this.input.addEventListener("change",() => {
            this.updateSwitch()
        })
    }

    connectedCallback() {
        this.labelBefore.innerText = this.getAttribute("labelBefore") as string
        this.labelAfter.innerText = this.getAttribute("labelAfter") as string
        this.originalValue = this.getAttribute("original-value") as string == "true"
        this.setValue(this.getAttribute("checked") == "true")
    }

    updateSwitch() {
        //Switch color and do the animation
        let onColorClass = this.getAttribute("onColorClass") as string
        let offColorClass = this.getAttribute("offColorClass") as string
        if (this.input.checked) {
            this.slider.classList.add(onColorClass)
            this.slider.classList.remove(offColorClass)
            this.holder.classList.add("formSwitchChecked")
        } else {
            this.slider.classList.remove(onColorClass)
            this.slider.classList.add(offColorClass)
            this.holder.classList.remove("formSwitchChecked")
        }

        //Handle enables target document
        if (this.hasAttribute("enables")) {
            const enables = document.getElementById(this.getAttribute("enables") as string)
            if (enables != null) {
                if (!this.input.checked) {
                    enables.setAttribute("disabled", "")
                    console.log("Disabled");
                } else {
                    enables.removeAttribute("disabled")
                    console.log("Enable");
                }
            }
        }

        //Update this element
        //this.checked = this.input.checked
    }

    static observedAttributes = ['value', 'labelBefore', 'labelAfter','original-value']
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (oldValue == newValue) {
            return
        }
        if (name == "value") {
            this.setValue(newValue as string == "true")
        } else if (name == "labelBefore") {
            this.labelBefore.innerText = newValue
        } else if (name == "labelAfter") {
            this.labelAfter.innerText = newValue
        } else if (name == "original-value") {
            this.originalValue = (newValue as string) == "true"
        }
    }

    getValue(): boolean {
        return this.input.checked
    }
    setValue(value: boolean) {
        this.setAttribute("value",value ? "true" : "false");
        this.input.checked = value;
        this.updateSwitch()
    }
    validate(): [boolean,boolean] {
        return [this.originalValue != this.getValue(), true];
    }
    getOriginalValue(): boolean {
        return this.originalValue;
    }
}

export type HTMLFormInputType = "button" | "checkbox" | "color" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "select" | "submit" | "tel" | "text" | "textarea" | "time" | "url" | "week"
export type HTMLFormInputValidationFunc = (value: string) => Promise<boolean>
/**
 * HTMLFormInputElement element defition
 */
export class HTMLFormInputElement extends HTMLElement {
    readonly holder: HTMLDivElement
    readonly img: HTMLImageElement
    readonly input: HTMLInputElement
    readonly textArea: HTMLTextAreaElement
    readonly afterImg: HTMLImageElement
    readonly label: HTMLLabelElement
    private onEnterPressClickElementId: string
    private type: HTMLFormInputType
    public validationFunction: HTMLFormInputValidationFunc | null
    private doChangeCheck: boolean
    private originalValue: string
    readonly changeBorderClass: string = "formWarnBorderColor"
    readonly invalidBorderClass: string = "formErrorBorderColor"
    private listId: string = ""
    private isStrictList: boolean = false
    private options: Map<string, any>
    readonly listHolder: HTMLDivElement
    private usingJSList: boolean = false
    private areOptionsVisible: boolean = false;
    private optionsTimestamp: Date
    private isCaseSensitiveList: boolean

    constructor(onEnterPressClickElementId: string, validationFunction: HTMLFormInputValidationFunc | null, listId: string = "", strictList: boolean = false, doChangeCheck: boolean = false, originalValue: string = "", changeBorderClass: string = "formWarnBorderColor", invalidBorderClass: string = "formErrorBorderColor") {
        super()
        this.onEnterPressClickElementId = onEnterPressClickElementId
        this.type = "text"
        this.validationFunction = validationFunction;
        this.doChangeCheck = doChangeCheck
        this.originalValue = originalValue
        this.changeBorderClass = changeBorderClass
        this.invalidBorderClass = invalidBorderClass
        this.listId = listId
        this.isStrictList = strictList
        this.options = new Map()
        this.optionsTimestamp = new Date(0)
        this.isCaseSensitiveList = true;

        //Create elements
        this.holder = document.createElement("div")
        this.img = document.createElement("img")
        this.input = document.createElement("input")
        this.textArea = document.createElement("textarea")
        this.afterImg = document.createElement("img")
        this.listHolder = document.createElement("div")
        this.label = document.createElement("label")

        //Add classes
        this.afterImg.style.cursor = "pointer"
        this.listHolder.classList.add("listHolder")

        //Set attributes
        this.input.setAttribute("disableRecursiveDisable", "true")
        this.textArea.setAttribute("disableRecursiveDisable", "true")
        this.input.tabIndex = this.tabIndex
        this.textArea.tabIndex = this.tabIndex
        this.tabIndex = -1
        this.listHolder.style.display = "none"

        //Move children
        this.holder.appendChild(this.img)
        this.holder.appendChild(this.afterImg)
        this.appendChild(this.label)
        this.appendChild(this.holder)
        this.appendChild(this.listHolder)

        //Setup basic events
        this.addEventListener("focusin", () => {
            console.log("Focus in");
            this.areOptionsVisible = true;
            this.renderList()
            if (!this.classList.contains("formInputFocus")) {
                this.classList.add("formInputFocus")
            }
        })
        this.addEventListener("focusout", () => {
            console.log("Focus out");
            this.areOptionsVisible = false;
            this.listHolder.style.display = "none"
            if (this.classList.contains("formInputFocus")) {
                this.classList.remove("formInputFocus")
            }
            this.validateInternal()
        })
        this.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (this.onEnterPressClickElementId == "") {
                return
            }
            if (ev.key == "Enter") {
                document.getElementById(this.onEnterPressClickElementId)?.dispatchEvent(new Event("click"))
            }
        })
        this.addEventListener("click", () => {
            if (this.type == "textarea") {
                this.textArea.focus()
            } else {
                this.input.focus()
            }
        })
        this.addEventListener("input", () => {
            this.areOptionsVisible = true;
            this.renderList()
            this.validateInternal()
        })
        this.addEventListener("resize", () => {
            //this.areOptionsVisible = true;
            this.renderList()
        })
    }

    updateList() {
        //Clear list
        if (this.usingJSList) {
            return
        }
        this.options.clear()

        //Updates hint list under the selection
        if (this.listId == "") {
            return
        }
        const list = document.getElementById(this.listId)
        if (list == null) {
            return
        }
        for (let i = 0; i < list.children.length; i++) {
            const child = list.children[i];
            if (child.tagName == "OPTION") {
                const optionChild = child as HTMLOptionElement
                this.options.set(optionChild.label.length != 0 ? optionChild.label : optionChild.value, optionChild.value)
            }
        }
        this.renderList()
    }

    renderList() {
        console.log("Render list");
        if (this.options.size == 0 || !this.areOptionsVisible) {
            console.log("Render list cancel");
            return
        }
        console.log(this.options);
        this.listHolder.style.display = ""

        //Clear list
        while (this.listHolder.lastChild != null) {
            this.listHolder.lastChild.remove()
            console.log("Clearing");
        }

        //Update list
        console.log("isCaseSensitive", this.isCaseSensitiveList);
        for (const value of this.options) {
            if ((this.isCaseSensitiveList ? value : value[0].toLowerCase()).includes((this.isCaseSensitiveList ? this.getValueRaw() : this.getValueRaw().toLocaleLowerCase()))) {
                const optionDiv = document.createElement("div")
                const option = document.createElement("p")
                option.innerText = value[0]
                optionDiv.addEventListener("mousedown", () => {
                    console.log("Clicked on: " + value);
                    this.setValueRaw(value[0])
                    this.areOptionsVisible = false
                    this.listHolder.style.display = "none"
                    //this.renderList()
                    console.log(this.listHolder.style.display);
                })
                optionDiv.appendChild(option)
                this.listHolder.appendChild(optionDiv)
            }
        }
    }

    updateInputType() {
        //Select input element based on type
        const focused = this.classList.contains("formInputFocus")
        if (this.input.parentElement == this) {
            this.holder.removeChild(this.input)
        }
        if (this.textArea.parentElement == this) {
            this.holder.removeChild(this.textArea)
        }
        if (this.afterImg.parentElement == this.holder) {
            this.holder.removeChild(this.afterImg)
        }
        if (this.type == "textarea") {
            this.holder.appendChild(this.textArea)
            if (focused) {
                this.textArea.focus()
            }
        } else {
            this.holder.appendChild(this.input)
            this.input.type = this.type
            if (focused) {
                this.input.focus()
            }
        }
        if (this.type == "select") {
            this.setIsScrictList(true)
        }
        this.holder.appendChild(this.afterImg)

        //Add specific use cases
        if (this.type == "password") {
            //Make password eye
            const updatePasswordEye = () => {
                if (this.input.type == "password") {
                    this.afterImg.src = "/formWebScripts/images/visibilityoff32.svg"
                } else {
                    this.afterImg.src = "/formWebScripts/images/visibility32.svg"
                }
            }
            updatePasswordEye()
            this.afterImg.onclick = () => {
                if (this.input.type == "password") {
                    this.input.type = "text"
                } else {
                    this.input.type = "password"
                }
                updatePasswordEye()
            }
        } else if (this.type == "color") {
            //Random color generator
            this.afterImg.src = "/formWebScripts/images/casino32.svg"
            this.afterImg.onclick = () => {
                this.input.value = GenerateRandomColor()
            }
        } else {
            this.afterImg.src = ""
        }
    }

    connectedCallback() {
        //if (this.hasAttribute("type")) {
        //    //Sort input type
        //this.type = this.getAttribute("type") as HTMLFormInputType
        //this.updateInputType()
        //}
        //if (this.hasAttribute("value")) {
        //    this.setValue(this.getAttribute("value"))
        //}
        // if (this.hasAttribute("onEnterPressClickElementId")) {
        //    this.onEnterPressClickElementId = this.getAttribute("onEnterPressClickElementId")        
        //}
        // if (this.hasAttribute("list")) {
        //    this.setListId(this.getAttribute("list"))
        //}
        // if (this.hasAttribute("placeholder")) {
        //    this.setPlaceHolder(this.getAttribute("placeholder"))
        //}
        // if (this.hasAttribute("icon")) {
        //    this.setIcon(this.getAttribute("icon"))
        //}
        // if (this.hasAttribute("isStrictList")) {
        //    this.setIsScrictList(this.getAttribute("isStrictList") == "true")
        //}
        this.updateInputType()
        if (this.hasAttribute("do-change-check")) {
            this.doChangeCheck = this.getAttribute("do-change-check") as string == "true"
        }
        for (const attribute of HTMLFormInputElement.observedAttributes) {
            if (this.hasAttribute(attribute)) { this.setAttribute(attribute, this.getAttribute(attribute) as string) }
        }
    }

    static observedAttributes = ['label', 'type', 'value', 'on-enter-press-click-element-id', 'list', 'placeholder', 'icon', 'is-strict-list', 'is-case-sensitive-list', 'original-value']
    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        console.log(name, oldValue, newValue);
        if (oldValue == newValue) {
            return
        }
        if (name == "type") {
            this.type = newValue
            this.updateInputType()
        } else if (name == "value") {
            this.setValueRaw(newValue, true)
        } else if (name == "on-enter-press-click-element-id") {
            this.onEnterPressClickElementId = newValue
        } else if (name == "placeholder") {
            this.setPlaceHolder(newValue)
        } else if (name == "icon") {
            this.setIcon(newValue)
        } else if (name == "is-strict-list") {
            this.setIsScrictList(newValue == "true")
        } else if (name == "list") {
            this.setListId(newValue)
        } else if (name == "is-case-sensitive-list") {
            this.setIsCaseSensitiveList(newValue == "true")
        } else if (name == 'original-value') {
            this.setOriginalValue(newValue)
        } else if (name == 'label') {
            this.setLabel(newValue);
        }
    }

    private async validateInternal(): Promise<[changed: boolean, isValid: boolean]> {
        this.setAttribute("value", this.getValueRaw())
        //Check for changes
        let changed = false
        if (this.doChangeCheck) {
            if (this.getValueRaw() != this.originalValue) {
                changed = true;
            }
        }

        //Do validation
        let isValid = true
        if (this.validationFunction != null) {
            isValid = await this.validationFunction(this.getValueRaw())
        }
        if (isValid && this.isStrictList) {
            console.log(this.options);
            console.log(this.getValue());
            isValid = this.options.has(this.getValueRaw())
        }

        //Add styles
        if (changed) {
            this.holder.classList.add(this.changeBorderClass)
        } else {
            this.holder.classList.remove(this.changeBorderClass)
        }
        if (isValid) {
            this.holder.classList.remove(this.invalidBorderClass)
        } else {
            this.holder.classList.add(this.invalidBorderClass)
        }
        return [changed, isValid]
    }

    public async validate(): Promise<[changed: boolean, isValid: boolean]> {
        return this.validateInternal()
    }

    public getValueRaw(): string {
        if (this.type == "textarea") {
            return this.textArea.value
        } else {

        }
        return this.input.value
    }

    /**
     * Get value retuns value of input
     * @returns Value is pair value in select options or null when not found in strictList mode or the value typed inside, if it is generic input
     */
    public getValue(): any{
        const raw = this.getValueRaw()
        //Check if is in select options
        if(this.options.has(raw)) {
            return this.options.get(raw)
        }
        if (this.isStrictList) {
            //Strict, but no value found
            return null
        }
        //Normal value
        return raw;
    }

    public setValueRaw(value: string, calledFromProperty: boolean = false) {
        if (this.type == "textarea") {
            this.textArea.value = value
        } else {
            this.input.value = value
        }
        if (!calledFromProperty) {
            this.setAttribute("value", value)
        }
    }

    public getType(): HTMLFormInputType {
        return this.type
    }

    public setType(type: HTMLFormInputType) {
        this.type = type
        this.updateInputType()
        this.setAttribute("type", type)
    }

    public getOriginalValueRaw(): string {
        return this.originalValue
    }
    public getOriginalValue(): string {
        return this.originalValue
    }

    public setOriginalValue(originalValue: string) {
        this.originalValue = originalValue
        this.setAttribute("original-value", originalValue)
        this.validateInternal()
    }

    public getListId() {
        return this.listId
    }

    public setListId(listId: string) {
        this.listId = listId
        this.usingJSList = false
        this.updateList()
        this.setAttribute("list", listId)
    }

    public getPlaceHolder(): string {
        if (this.type == "textarea") {
            return this.textArea.placeholder
        } else {
            return this.input.placeholder
        }
    }

    public setPlaceHolder(placeholder: string) {
        if (this.type == "textarea") {
            this.textArea.placeholder = placeholder
        } else {
            this.input.placeholder = placeholder
        }
        this.setAttribute("placeholder", placeholder)
    }

    public getIcon(): string {
        return this.img.src
    }

    public setIcon(icon: string) {
        this.img.src = icon
        this.setAttribute("icon", icon)
    }

    public getIsStrictList(): boolean {
        return this.isStrictList
    }

    public setIsScrictList(isStrictList: boolean) {
        if (this.type == "select") {
            isStrictList = true
        }
        this.isStrictList = isStrictList
        this.setAttribute("isStrictList", isStrictList ? "true" : "false")
        this.validateInternal()
    }

    public getOptions(): Map<string,any> {
        return this.options
    }

    /**
     * Sets options for input field
     * @param options Map<label, value> -> label is displayed, value is returned | string[] -> used as values and labels
     * @param timestamp 
     */
    public setOptions(options: Map<string,any> | string[], timestamp: Date | null = null) {
        this.usingJSList = true
        if (timestamp != null && timestamp > this.optionsTimestamp) {
            this.optionsTimestamp = timestamp;
            if (options instanceof Map) {
            this.options = options
            } else {
                this.options.clear()
                for (const element of options) {
                    this.options.set(element,element)
                }
            }
            this.removeAttribute("list")
            this.renderList()
        }
    }

    public getIsCaseSensitiveList(): boolean {
        return this.isCaseSensitiveList;
    }

    public setIsCaseSensitiveList(isCaseSensitiveList: boolean) {
        this.isCaseSensitiveList = isCaseSensitiveList;
        this.setAttribute("isCaseSensitiveList", isCaseSensitiveList ? "true" : "false")
        this.renderList()
    }
    public getLabel(): string {
        return this.label.innerText;
    }
    public setLabel(label: string) {
        this.label.innerText = label;
        this.setAttribute("label",label)
    }
}

export function GenerateRandomColor(): string {
    const colorLetters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
        color += colorLetters[Math.floor(Math.random() * 16)]
    }
    return color
}

//function createPreloadLink(resource: string): HTMLLinkElement {
//    const link = document.createElement("link")
//    link.rel = "preload"
//    link.href = resource
//    link.as = "image"
//    link.crossOrigin = "anonymous"
//    return link
//}

const toastImages = new Map<string, HTMLImageElement>()
function SetupToasts() {
    const holder = document.createElement("div")
    holder.classList.add("formToastHolder")
    document.getElementsByTagName("body")[0].appendChild(holder)

    //Preload images
    const imgOk = new Image()
    imgOk.src = "/formWebScripts/images/checkCircle32.svg"
    toastImages.set("ok", imgOk)
    const imgInfo = new Image()
    imgInfo.src = "/formWebScripts/images/info32.svg"
    toastImages.set("info", imgInfo)
    const imgWarn = new Image()
    imgWarn.src = "/formWebScripts/images/warning32.svg"
    toastImages.set("warn", imgWarn)
    const imgError = new Image()
    imgError.src = "/formWebScripts/images/report32.svg"
    toastImages.set("error", imgError)
    //const head = document.getElementsByTagName("head")[0] as HTMLHeadElement
    //head.appendChild(createPreloadLink("/images/info32.svg"))
    //head.appendChild(createPreloadLink("/images/warning32.svg"))
    //head.appendChild(createPreloadLink("/images/report32.svg"))
    //head.appendChild(createPreloadLink("/images/checkCircle32.svg"))
}

let toastCounter = 0
export function SendToast(title: string, message: string, type: "ok" | "warn" | "info" | "error" | "black"): number {
    toastCounter++
    let toastId = toastCounter

    //Get target color
    const colorDiv = document.createElement("div")
    if (type == "ok") {
        colorDiv.classList.add("formOkColor")
    } else if (type == "warn") {
        colorDiv.classList.add("formWarnColor")
    } else if (type == "info") {
        colorDiv.classList.add("formInfoColor")
    } else if (type == "error") {
        colorDiv.classList.add("formErrorColor")
    } else if (type == "black") {
        colorDiv.classList.add("formBlackColor")
    }
    colorDiv.style.width = "1px"
    colorDiv.style.height = "1px"
    colorDiv.style.position = "absolute"
    colorDiv.style.zIndex = "-100"
    document.getElementsByTagName("body")[0].appendChild(colorDiv)
    const style = getComputedStyle(colorDiv)
    //console.log(style)

    //Toast holder
    const toast = document.createElement("div")
    toast.classList.add("formToast")
    //toast.style.background = style.background
    toast.style.background = "color-mix(in srgb, #FFFFFF 20%, " + style.backgroundColor + " 100%)"
    //console.log(colorDiv.classList);
    //console.log(style.background)
    toast.setAttribute("toastId", String(toastId))
    toast.setAttribute("animationPart", "0")
    toast.addEventListener("click", function () {
        //console.log("click");
        toast.style.animation = "slideOutToRight 0.5s ease-out forwards"
        toast.setAttribute("animationPart", "2")
    })
    toast.addEventListener("animationend", function () {
        if (toast.getAttribute("animationPart") == "0" || toast.getAttribute("animationPart") == "1") {
            toast.setAttribute("animationPart", String(Number(toast.getAttribute("animationPart")) + 1))
        } else {
            toast.remove()
        }
    })
    document.getElementsByClassName("formToastHolder")[0].appendChild(toast)

    //Timeout
    const timeout = document.createElement("div")
    timeout.classList.add("timeout")
    timeout.style.background = "color-mix(in srgb, #000000 20%, " + style.backgroundColor + " 100%)"
    timeout.addEventListener("animationend", function () {
        toast.style.animation = "slideOutToRight 0.5s ease-out forwards"
    })
    toast.appendChild(timeout)

    //Title
    const titleEl = document.createElement("p")
    titleEl.classList.add("formHeader")
    titleEl.innerHTML = title
    toast.appendChild(titleEl)

    //Content holder
    const content = document.createElement("div")
    content.classList.add("content")
    toast.appendChild(content)

    //Image holder
    const imgHolder = document.createElement("div")
    imgHolder.classList.add("formCenter")
    content.appendChild(imgHolder)

    //Image
    const img = document.createElement("img") as HTMLImageElement
    if (type == "black") {
        //colorDiv.classList.add("formBlackColor")
        console.error("Undefined icon!");
    } else {
        img.src = toastImages.get(type)?.src as string
    }
    imgHolder.appendChild(img)

    //Text holder
    const pHolder = document.createElement("div")
    content.appendChild(pHolder)

    //Text
    const p = document.createElement("p")
    p.classList.add("contentText")
    p.innerHTML = message
    pHolder.appendChild(p)
    toast.style.animation = "slideInFromRight 0.5s ease-out forwards"
    colorDiv.remove()

    return toastId
}

/*
Setups rows of form
*/
export function SetupRows() {
    const elements = document.getElementsByTagName("formrow")
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        element.classList.add("formFlexColumn")

        if (element.hasAttribute("isFirst")) {
            (element as HTMLElement).style.marginTop = "0px"
        }

        //Move all elements
        const holder = document.createElement("div")
        holder.classList.add("formFlexRow")
        while (element.lastChild != null) {
            const child = element.childNodes[0]
            if ((child as HTMLElement).tagName == "INPUTFIELD") {
                (child as HTMLElement).style.flexGrow = "1"
            }
            element.removeChild(child)
            holder.appendChild(child)
        }

        //Create label
        if (element.hasAttribute("label")) {
            const label = document.createElement("p")
            label.innerHTML = element.getAttribute("label") as string
            element.appendChild(label)
        }
        element.appendChild(holder)
    }
}

/**
 * Makes HTML element dragable
 * @param movedElement Moved element
 * @param dragElement Element that acts as dragger (topbar of window, ...)
 */
export function MakeElementDraggable(movedElement: HTMLElement, dragElement: HTMLElement | null) {
    if (dragElement == null) {
        dragElement = movedElement
    }
    dragElement.addEventListener("mousedown", (event: MouseEvent) => {
        if (movedElement.getAttribute("formIsDragged") == "true") { return }
        //Start drag
        movedElement.setAttribute("formIsDragged", "true")
        movedElement.setAttribute("formDragLastCursor", dragElement.style.cursor)
        dragElement.style.cursor = "move"
        movedElement.setAttribute("formDragLastX", event.clientX.toString())
        movedElement.setAttribute("formDragLastY", event.clientY.toString())
    })
    function dragEnd() {
        //End drag
        movedElement.removeAttribute("formIsDragged")
        if (dragElement != null) {
            dragElement.style.cursor = movedElement.getAttribute("formDragLastCursor") as string
        }
        movedElement.removeAttribute("formDragLastCursor")
        movedElement.removeAttribute("formDragLastX")
        movedElement.removeAttribute("formDragLastY")
    }
    movedElement.addEventListener("mouseup", () => {
        dragEnd()
    })
    if (dragElement != movedElement) {
        dragElement.addEventListener("mouseup", () => {
            dragEnd()
        })
    }
    function drag(event: MouseEvent) {
        //Drag
        if (movedElement.getAttribute("formIsDragged") != "true") { return }
        let posX = Number(movedElement.getAttribute("formDragLastX")) - event.clientX
        let posY = Number(movedElement.getAttribute("formDragLastY")) - event.clientY
        movedElement.setAttribute("formDragLastX", event.clientX.toString())
        movedElement.setAttribute("formDragLastY", event.clientY.toString())
        movedElement.style.left = (movedElement.offsetLeft - posX) + "px";
        movedElement.style.top = (movedElement.offsetTop - posY) + "px";
    }
    movedElement.addEventListener("mousemove", (event: MouseEvent) => {
        drag(event)
    })
    if (dragElement != movedElement) {
        dragElement.addEventListener("mousemove", (event: MouseEvent) => {
            drag(event)
        })
    }
}

SetupRows()
//SetupTextInputs()
//SetupToggles()
SetupToasts()
customElements.define("form-toggle", HTMLFormToggleElement)
customElements.define("form-input", HTMLFormInputElement)