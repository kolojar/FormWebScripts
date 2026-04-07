//Do not forget to add formStyle.css and tableStyle.css

import { GeneratePassword } from "./sharedScripts.js";
import "./formScript"

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
export class HTMLFormBoxElement extends HTMLDivElement {
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
export class HTMLFormToggleElement extends HTMLDivElement {
    readonly labelBefore: HTMLLabelElement
    readonly holder: HTMLLabelElement
    readonly input: HTMLInputElement
    readonly slider: HTMLSpanElement
    readonly labelAfter: HTMLLabelElement
    protected checked: boolean
    constructor() {
        super()
        this.checked = false

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
        this.addEventListener("click", () => {
            this.input.checked = !this.input.checked
            this.input.dispatchEvent(new Event("change"))
            this.updateSwitch()
        })
        this.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.code === "Space") {
                //console.log("Click");
                this.input.checked = !this.input.checked
                this.input.dispatchEvent(new Event("change"))
                this.updateSwitch()
            }
        })
    }

    connectedCallback() {
        this.labelBefore.innerText = this.getAttribute("labelBefore") as string
        this.labelAfter.innerText = this.getAttribute("labelAfter") as string
        this.checked = this.getAttribute("checked") == "true"
        this.updateSwitch()
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
                    //console.log("Disabled");
                } else {
                    enables.removeAttribute("disabled")
                    //console.log("Enable");
                }
            }
        }

        //Update this element
        this.checked = this.input.checked
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (oldValue == newValue) {
            return
        }
        if (name == "value") {
            this.checked = newValue as string == "true"
            this.updateSwitch()
        } else if (name == "labelBefore") {
            this.labelBefore.innerText = newValue
        } else if (name == "labelAfter") {
            this.labelAfter.innerText = newValue
        }
    }
}

type HTMLFormInputType = "button" | "checkbox" | "color" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "textarea" | "time" | "url" | "week"
type HTMLFormInputValidationFunc = (value: string) => boolean
/**
 * HTMLFormInputElement element defition
 */
export class HTMLFormInputElement extends HTMLDivElement {
    readonly img: HTMLImageElement
    readonly input: HTMLInputElement
    readonly textArea: HTMLTextAreaElement
    readonly afterImg: HTMLImageElement
    protected onEnterPressClickElementId: string
    protected type: HTMLFormInputType
    public validationFunction: HTMLFormInputValidationFunc |null
    public doChangeCheck: boolean
    public originalValue: string
    public changeBorderClass: string = "formWarnBorderColor"
    public invalidBorderClass: string = "formErrorBorderColor"

    constructor(onEnterPressClickElementId: string, validationFunction: HTMLFormInputValidationFunc | null,  doChangeCheck: boolean = false, originalValue: string) {
        super()
        this.onEnterPressClickElementId = onEnterPressClickElementId
        this.type = "text"
        this.validationFunction = validationFunction;
        this.doChangeCheck = doChangeCheck
        this.originalValue = originalValue

        //Create elements
        this.img = document.createElement("img")
        this.input = document.createElement("input")
        this.textArea = document.createElement("textarea")
        this.afterImg = document.createElement("img")

        //Add classes
        this.afterImg.style.cursor = "pointer"

        //Set attributes
        this.input.setAttribute("disableRecursiveDisable", "true")
        this.textArea.setAttribute("disableRecursiveDisable", "true")
        this.input.tabIndex = this.tabIndex
        this.textArea.tabIndex = this.tabIndex
        this.tabIndex = -1

        //Move children
        this.appendChild(this.img)
        this.appendChild(this.afterImg)

        //Setup basic events
        this.addEventListener("focusin", () => {
            if (!this.classList.contains("formInputFocus")) {
                this.classList.add("formInputFocus")
            }
        })
        this.addEventListener("focusout", () => {
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
        this.addEventListener("click",() => {
            if(this.type == "textarea") {
                this.textArea.focus()
            } else {
                this.input.focus()
            }
        })
        this.addEventListener("input",() => {
            this.validateInternal()
        })
    }

    updateInputType() {
        //Select input element based on type
        const focused = this.classList.contains("formInputFocus")
        this.removeChild(this.input)
        this.removeChild(this.textArea)
        if (this.type == "textarea") {
            this.appendChild(this.textArea)
            if (focused) {
                this.textArea.focus()
            }
        } else {
            this.appendChild(this.input)
            this.input.type = this.type
            if (focused) {
                this.input.focus()
            }
        } 

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
        //Sort input type
        this.type = this.getAttribute("type") as HTMLFormInputType
        this.updateInputType()
    }

    attributeChangedCallback/(name: string, oldValue: any, newValue: any) {
        if(oldValue == newValue) {
            return
        }
        if (name == "type") {
            this.type = newValue
            this.updateInputType()
        }
    }

    private validateInternal(): [changed: boolean, isValid: bool] {
        //Check for changes
        let changed = false
        if (this.doChangeCheck) {
            if(this.input.value != this.originalValue) {
                changed = true;
            }
        }

        //Do validation
        let isValid = true
        if (this.validationFunction != null) {
            isValid = this.validationFunction(this.input.value)
        }
    }

    public validate(): [changed: boolean, isValid: bool] {

    }
}

/*
Setups text inputs
*/
export function SetupTextInputs() {
    const elements = document.getElementsByTagName("inputfield")
    for (let i = 0; i < elements.length; i++) {
        SetupTextInput(elements[i] as HTMLElement)
    }
}

export function SetupTextInput(element: HTMLElement): HTMLInputElement | HTMLTextAreaElement {
    //Prepare inputs -> CSS + subelements
    const inputHolder = document.createElement("div") as HTMLElement
    inputHolder.classList.add("formTextInput")
    element.appendChild(inputHolder)
    //const holder = document.createElement("holder") as HTMLElement
    //inputHolder.appendChild(holder);
    //inputHolder.style.width = element.style.width

    //Add label
    //if (element.hasAttribute("label")) {
    //    const label = document.createElement("p")
    //    label.innerHTML = element.getAttribute("label")
    //    if (element.hasAttribute("isFirst")) {
    //        label.style.marginTop = "0px"
    //    }
    //    element.insertBefore(label, inputHolder)
    //}

    //Img element
    if (element.hasAttribute("icon")) {
        const img = document.createElement("img") as HTMLImageElement
        img.src = element.getAttribute("icon") as string
        //img.classList.add("formTooltipIcon")
        inputHolder.appendChild(img)
    }

    //Input element
    let input = null
    if (element.getAttribute("inputType") == "textarea") {
        input = document.createElement("textarea") as HTMLTextAreaElement
    } else {
        input = document.createElement("input") as HTMLInputElement
        input.type = element.getAttribute("inputType") as string
    }
    input.id = element.getAttribute("valueId") as string
    input.value = element.getAttribute("initialValue") as string
    input.setAttribute("disableRecursiveDisable", "true")
    input.placeholder = element.getAttribute("placeholder") as string
    input.tabIndex = element.tabIndex
    element.tabIndex = -1
    inputHolder.appendChild(input)

    //Password img element
    if (element.getAttribute("inputType") == "password") {
        const passimg = document.createElement("img") as HTMLImageElement
        if (element.getAttribute("showPass") == null) {
            element.setAttribute("showPass", "false")
        }
        updatePasswordEye(passimg, element, input as HTMLInputElement)
        passimg.style.cursor = "pointer"
        passimg.addEventListener("click", function () {
            element.setAttribute("showPass", String(!(element.getAttribute("showPass") == "true")))
            updatePasswordEye(passimg, element, input as HTMLInputElement)
        })
        inputHolder.appendChild(passimg)
    }

    //Color random button
    if (element.getAttribute("inputType") == "color") {
        const randomImg = document.createElement("img") as HTMLImageElement
        randomImg.src = "/formWebScripts/images/casino32.svg"
        randomImg.style.cursor = "pointer"
        randomImg.onclick = function () {
            input.value = GenerateRandomColor()
        }
        inputHolder.appendChild(randomImg)
    }

    //Focus event
    element.addEventListener("focusin", function () {
        if (!inputHolder.classList.contains("formTextInputFocus")) {
            inputHolder.classList.add("formTextInputFocus")
        }
    })
    element.addEventListener("focusout", function () {
        if (inputHolder.classList.contains("formTextInputFocus")) {
            inputHolder.classList.remove("formTextInputFocus")
        }
    })

    //Click event
    element.addEventListener("click", function () {
        input.focus()
    })

    //Enter event
    if (element.hasAttribute("onEnterPressClickElement")) {
        element.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.key != "Enter") { return }
            document.getElementById(element.getAttribute("onEnterPressClickElement") as string)?.dispatchEvent(new Event("click"))
        })
    }
    return input
}

/*
Setups select inputs
*/
export function SetupSelectInputs() {
    const elements = document.getElementsByTagName("inputselect")
    for (let i = 0; i < elements.length; i++) {
        SetupSelectInput(elements[i] as HTMLElement)
    }
}

export function SetupSelectInput(element: HTMLElement): HTMLSelectElement {
    //Prepare inputs -> CSS + subelements
    const inputHolder = document.createElement("div") as HTMLElement
    inputHolder.classList.add("formTextInput")
    element.appendChild(inputHolder)
    //const holder = document.createElement("holder") as HTMLElement
    //inputHolder.appendChild(holder);
    //inputHolder.style.width = element.style.width

    //Add label
    //if (element.hasAttribute("label")) {
    //    const label = document.createElement("p")
    //    label.innerHTML = element.getAttribute("label")
    //    if (element.hasAttribute("isFirst")) {
    //        label.style.marginTop = "0px"
    //    }
    //    element.insertBefore(label, inputHolder)
    //}

    //Img element
    if (element.hasAttribute("icon")) {
        const img = document.createElement("img") as HTMLImageElement
        img.src = element.getAttribute("icon") as string
        img.classList.add("formTooltipIcon")
        inputHolder.appendChild(img)
    }

    //Input element
    let input = document.createElement("input")
    input.type = "text"
    input.id = element.getAttribute("valueId") as string
    input.setAttribute("disableRecursiveDisable", "true")
    input.tabIndex = element.tabIndex

    //Input options element
    let optionHolder = document.createElement("div")
    optionHolder.id = element.getAttribute("optionHolderId") as string

    let i = 0;
    while (i < element.children.length) {
        const option = element.children.item(i)
        if (option?.tagName == "OPTION") {
            //input.options.add(option as HTMLOptionElement)
        } else {
            i++
        }
    }
    element.tabIndex = -1
    inputHolder.appendChild(input)

    //Click event
    element.addEventListener("click", function () {
        input.focus()
    })

    //Enter event
    if (element.hasAttribute("onEnterPressClickElement")) {
        element.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.key != "Enter") { return }
            document.getElementById(element.getAttribute("onEnterPressClickElement") as string)?.dispatchEvent(new Event("click"))
        })
    }
    return document.createElement("select")
}

function updatePasswordEye(passimg: HTMLImageElement, element: HTMLElement, passwordField: HTMLInputElement) {
    if (element.getAttribute("showPass") == "true") {
        passimg.src = "/formWebScripts/images/visibility32.svg"
        passwordField.type = "text"
    } else {
        passimg.src = "/formWebScripts/images/visibilityoff32.svg"
        passwordField.type = "password"
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
SetupTextInputs()
//SetupToggles()
SetupToasts()