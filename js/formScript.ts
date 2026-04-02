//Do not forget to add formStyle.css and tableStyle.css

import { GeneratePassword } from "./sharedScripts.js";

/*
Disables form and adds propried styles and animations
*/
export function DisableForms(disabled: boolean) {
    const forms = document.getElementsByClassName("formBox")
    for (let index = 0; index < forms.length; index++) {
        RecursiveDisabler(forms.item(index) as HTMLElement, disabled)
    }
}

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
Sets wait status and message
*/
export function SetWaitStatusForms(wait: boolean, message: string) {
    const forms = document.getElementsByClassName("formBox")
    for (let index = 0; index < forms.length; index++) {
        let form = forms[index] as HTMLElement;
        form.style.cursor = wait ? "wait" : "";
    }
    DisableForms(wait)
    SetStatusMessageForms(wait, wait ? message : "", 0)
}


/**
* Sets status message to all forms
*/
export function SetStatusMessageForms(blink: boolean, message: string, cleanAfterMs: number = 0) {
    //Set message
    const messageID = GeneratePassword(8, true, true)
    let status = (document.getElementById("statusMessage") as HTMLElement);
    if (status == null) { return }
    status.setAttribute("messageID", messageID)
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
            if (status.getAttribute("messageID") == messageID) {
                status.innerText = ""
                status.removeAttribute("messageID")
            }
        }, cleanAfterMs)
    }
}

/*
Setups switches (toggles)
*/
export function SetupToggles() {
    const elements = document.getElementsByTagName("toggle")
    for (let i = 0; i < elements.length; i++) {
        //Prepare toggles -> CSS + subelements
        const element = elements[i] as HTMLElement;
        element.classList.add("formSwitch")

        //Label before
        const labelBefore = document.createElement("label")
        if (element.hasAttribute("labelBefore")) {
            labelBefore.classList.add("labelBefore")
            labelBefore.innerHTML = element.getAttribute("labelBefore")
        }
        element.appendChild(labelBefore)

        //Holder label
        const holder = document.createElement("label")
        holder.classList.add("toggle")
        element.appendChild(holder)

        //Input element
        const input = document.createElement("input") as HTMLInputElement
        input.type = "checkbox"
        input.id = element.getAttribute("valueId")
        holder.appendChild(input)

        //Span slider
        const span = document.createElement("span") as HTMLSpanElement
        span.classList.add("slider")
        holder.appendChild(span)
        switchChange(element, span, input)

        //Label after
        if (element.hasAttribute("labelAfter")) {
            const labelAfter = document.createElement("span")
            labelAfter.classList.add("labelAfter")
            labelAfter.innerHTML = element.getAttribute("labelAfter")
            holder.appendChild(labelAfter)
        }

        //Click event
        element.addEventListener("click", function () {
            //console.log("Click");
            input.checked = !input.checked
            input.dispatchEvent(new Event("change"))
            switchChange(element, span, input)
        })
        //On key down
        element.addEventListener("keydown", function (ev: KeyboardEvent) {
            if (ev.code === "Space") {
                //console.log("Click");
                input.checked = !input.checked
                input.dispatchEvent(new Event("change"))
                switchChange(element, span, input)
            }
        })
    }
}

function switchChange(element: HTMLElement, span: HTMLSpanElement, input: HTMLInputElement) {
    const enables = document.getElementById(element.getAttribute("enables")) as HTMLInputElement
    let onColorClass = element.getAttribute("onColorClass")
    let offColorClass = element.getAttribute("offColorClass")
    const holder = element.children[1] as HTMLElement
    if (input.checked) {
        span.classList.add(onColorClass)
        span.classList.remove(offColorClass)
        holder.classList.add("formSwitchChecked")
    } else {
        span.classList.remove(onColorClass)
        span.classList.add(offColorClass)
        holder.classList.remove("formSwitchChecked")
    }
    //console.log(enables);

    if (enables != null) {
        if (!input.checked) {
            enables.setAttribute("disabled", "")
            //console.log("Disabled");
        } else {
            enables.removeAttribute("disabled")
            //console.log("Enable");
        }
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

export function SetupTextInput(element: HTMLElement): HTMLInputElement {
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
    if( element.hasAttribute("icon")) {
    const img = document.createElement("img") as HTMLImageElement
    img.src = element.getAttribute("icon")
    img.classList.add("formTooltipIcon")
    inputHolder.appendChild(img)
    }

    //Input element
    let input = null
    if (element.getAttribute("inputType") == "textarea") {
        input = document.createElement("textarea") as HTMLTextAreaElement
    } else {
        input = document.createElement("input") as HTMLInputElement
        input.type = element.getAttribute("inputType")
    }
    input.id = element.getAttribute("valueId")
    input.value = element.getAttribute("initialValue")
    input.setAttribute("disableRecursiveDisable", "true")
    input.placeholder = element.getAttribute("placeholder")
    input.tabIndex = element.tabIndex
    element.tabIndex = -1
    inputHolder.appendChild(input)

    //Password img element
    if (element.getAttribute("inputType") == "password") {
        const passimg = document.createElement("img") as HTMLImageElement
        if (element.getAttribute("showPass") == null) {
            element.setAttribute("showPass", "false")
        }
        updatePasswordEye(passimg, element, input)
        passimg.style.cursor = "pointer"
        passimg.addEventListener("click", function () {
            element.setAttribute("showPass", String(!(element.getAttribute("showPass") == "true")))
            updatePasswordEye(passimg, element, input)
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
    element.addEventListener("focusin",function() {
        if (!inputHolder.classList.contains("formTextInputFocus")) {
            inputHolder.classList.add("formTextInputFocus")
        }
    })
     element.addEventListener("focusout",function() {
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
        element.addEventListener("keydown",(ev: KeyboardEvent) => {
            if (ev.key != "Enter") {return}
            document.getElementById(element.getAttribute("onEnterPressClickElement")).dispatchEvent(new Event("click"))
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
    if( element.hasAttribute("icon")) {
    const img = document.createElement("img") as HTMLImageElement
    img.src = element.getAttribute("icon")
    img.classList.add("formTooltipIcon")
    inputHolder.appendChild(img)
    }

    //Input element
    let input = document.createElement("select")
    input.id = element.getAttribute("valueId")
    input.setAttribute("disableRecursiveDisable", "true")
    input.tabIndex = element.tabIndex
    let i = 0;
    while(i < element.children.length) {
        const option = element.children.item(i)
        if (option.tagName == "OPTION") {
            input.options.add(option as HTMLOptionElement)
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
        element.addEventListener("keydown",(ev: KeyboardEvent) => {
            if (ev.key != "Enter") {return}
            document.getElementById(element.getAttribute("onEnterPressClickElement")).dispatchEvent(new Event("click"))
        })
    }
    return input
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
        img.src = toastImages.get(type).src
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

export function SwitchToggle(toggle: HTMLElement, value: boolean) {
    const holder = toggle.children[1] as HTMLElement
    const input = holder.children[0] as HTMLInputElement
    const span = holder.children[1] as HTMLSpanElement
    input.checked = value
    input.dispatchEvent(new Event("change"))
    //console.log("Switch",toggle,value,input,span);
    switchChange(toggle, span, input)
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
            label.innerHTML = element.getAttribute("label")
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
export function MakeElementDraggable(movedElement: HTMLElement, dragElement: HTMLElement = null) {
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
        dragElement.style.cursor = movedElement.getAttribute("formDragLastCursor")
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
SetupToggles()
SetupToasts()