//Do not forget to add formStyle.css and tableStyle.css
import { GeneratePassword } from "./sharedScripts.js";
/*
Disables element and all subelements without attribute disableRecursiveDisable
 */
export function RecursiveDisabler(target, disabled) {
    for (let index = 0; index < target.children.length; index++) {
        const element = target.children[index];
        RecursiveDisabler(element, disabled);
    }
    if (!target.hasAttribute("disableRecursiveDisable")) {
        target.setAttribute("disabled", String(disabled));
        if (!disabled) {
            target.removeAttribute("disabled");
        }
    }
}
/*
HTMLFormBoxElement element defition
*/
export class HTMLFormBoxElement extends HTMLElement {
    constructor() {
        super();
        this.messageID = "";
    }
    /**
     * Disables form box
     */
    Disable() {
        RecursiveDisabler(this, true);
    }
    /**
     * Enables form box
     */
    Enable() {
        RecursiveDisabler(this, false);
    }
    /**
     * Sets Status message to form box
     * @param blink Should status message blink
     * @param message Message
     * @param cleanAfterMs Clean after timeout
     */
    SetStatusMessage(blink, message, cleanAfterMs = 0) {
        //Set message
        const messageID = GeneratePassword(8, true, true);
        this.messageID = messageID;
        this.querySelectorAll("form-status-message").forEach(element => {
            let status = element; //TODO: FIX
            status.innerText = message;
            //Set blinking
            if (blink) {
                if (!status.classList.contains("puslatingEffectFull")) {
                    status.classList.add("puslatingEffectFull");
                }
            }
            else {
                if (status.classList.contains("puslatingEffectFull")) {
                    status.classList.remove("puslatingEffectFull");
                }
            }
            //Clean if needed
            if (cleanAfterMs > 0) {
                setTimeout(() => {
                    if (this.messageID == messageID) {
                        status.innerText = "";
                        this.messageID = "";
                    }
                }, cleanAfterMs);
            }
        });
    }
    /**
     * Sets waiting status to form box + disables it
     * @param message Message
     */
    SetWaitStatusMessage(message) {
        this.Disable();
        this.style.cursor = "wait";
        this.SetStatusMessage(true, message, 0);
    }
    /**
     * Removes waiting status from form box + enables it
     */
    RemoveWaitStatusMessage() {
        this.SetStatusMessage(false, "", 0);
        this.style.cursor = "";
        this.Enable();
    }
}
/**
 * Sets wait status to all forms in document
 * @param message Message
 */
export function SetWaitStatusForms(message) {
    document.querySelectorAll("form-box").forEach(form => {
        form.SetWaitStatusMessage(message);
    });
}
/**
 * Removes wait status from wall forms in document
 */
export function RemoveWaitStatusForms() {
    document.querySelectorAll("form-box").forEach(form => {
        form.RemoveWaitStatusMessage();
    });
}
/*
HTMLFormBoxStatusMessageElement element defition
*/
export class HTMLFormBoxStatusMessageElement extends HTMLParagraphElement {
    constructor() {
        super();
    }
}
/*
HTMLFormToggleElement element defition
*/
export class HTMLFormToggleElement extends HTMLDivElement {
    constructor() {
        super();
        this.checked = false;
        //Create elements
        this.labelBefore = document.createElement("label");
        this.holder = document.createElement("label");
        this.input = document.createElement("input");
        this.slider = document.createElement("span");
        this.labelAfter = document.createElement("label");
        //Add classes
        this.classList.add("formSwitch");
        this.labelAfter.classList.add("labelBefore");
        this.holder.classList.add("toggle");
        this.slider.classList.add("slider");
        this.labelAfter.classList.add("labelAfter");
        //Move children
        this.appendChild(this.labelBefore);
        this.appendChild(this.holder);
        this.holder.appendChild(this.input);
        this.holder.appendChild(this.slider);
        this.holder.appendChild(this.labelAfter);
        //Setup basic events
        this.addEventListener("click", () => {
            this.input.checked = !this.input.checked;
            this.input.dispatchEvent(new Event("change"));
            this.updateSwitch();
        });
        this.addEventListener("keydown", (ev) => {
            if (ev.code === "Space") {
                //console.log("Click");
                this.input.checked = !this.input.checked;
                this.input.dispatchEvent(new Event("change"));
                this.updateSwitch();
            }
        });
    }
    connectedCallback() {
        this.labelBefore.innerText = this.getAttribute("labelBefore");
        this.labelAfter.innerText = this.getAttribute("labelAfter");
        this.checked = this.getAttribute("checked") == "true";
        this.updateSwitch();
    }
    updateSwitch() {
        //Switch color and do the animation
        let onColorClass = this.getAttribute("onColorClass");
        let offColorClass = this.getAttribute("offColorClass");
        if (this.input.checked) {
            this.slider.classList.add(onColorClass);
            this.slider.classList.remove(offColorClass);
            this.holder.classList.add("formSwitchChecked");
        }
        else {
            this.slider.classList.remove(onColorClass);
            this.slider.classList.add(offColorClass);
            this.holder.classList.remove("formSwitchChecked");
        }
        //Handle enables target document
        if (this.hasAttribute("enables")) {
            const enables = document.getElementById(this.getAttribute("enables"));
            if (enables != null) {
                if (!this.input.checked) {
                    enables.setAttribute("disabled", "");
                    //console.log("Disabled");
                }
                else {
                    enables.removeAttribute("disabled");
                    //console.log("Enable");
                }
            }
        }
        //Update this element
        this.checked = this.input.checked;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue == newValue) {
            return;
        }
        if (name == "value") {
            this.checked = newValue == "true";
            this.updateSwitch();
        }
        else if (name == "labelBefore") {
            this.labelBefore.innerText = newValue;
        }
        else if (name == "labelAfter") {
            this.labelAfter.innerText = newValue;
        }
    }
}
HTMLFormToggleElement.observedAttributes = ['value', 'labelBefore', 'labelAfter'];
/**
 * HTMLFormInputElement element defition
 */
export class HTMLFormInputElement extends HTMLElement {
    constructor(onEnterPressClickElementId, validationFunction, listId = "", strictList = false, doChangeCheck = false, originalValue = "", changeBorderClass = "formWarnBorderColor", invalidBorderClass = "formErrorBorderColor") {
        super();
        this.changeBorderClass = "formWarnBorderColor";
        this.invalidBorderClass = "formErrorBorderColor";
        this.listId = "";
        this.isStrictList = false;
        this.usingJSList = false;
        this.areOptionsVisible = false;
        this.onEnterPressClickElementId = onEnterPressClickElementId;
        this.type = "text";
        this.validationFunction = validationFunction;
        this.doChangeCheck = doChangeCheck;
        this.originalValue = originalValue;
        this.changeBorderClass = changeBorderClass;
        this.invalidBorderClass = invalidBorderClass;
        this.listId = listId;
        this.isStrictList = strictList;
        this.options = [];
        this.optionsTimestamp = new Date(0);
        this.isCaseSensitiveList = true;
        //Create elements
        this.holder = document.createElement("div");
        this.img = document.createElement("img");
        this.input = document.createElement("input");
        this.textArea = document.createElement("textarea");
        this.afterImg = document.createElement("img");
        this.listHolder = document.createElement("div");
        //Add classes
        this.afterImg.style.cursor = "pointer";
        this.listHolder.classList.add("listHolder");
        //Set attributes
        this.input.setAttribute("disableRecursiveDisable", "true");
        this.textArea.setAttribute("disableRecursiveDisable", "true");
        this.input.tabIndex = this.tabIndex;
        this.textArea.tabIndex = this.tabIndex;
        this.tabIndex = -1;
        this.listHolder.style.display = "none";
        //Move children
        this.holder.appendChild(this.img);
        this.holder.appendChild(this.afterImg);
        this.appendChild(this.holder);
        this.appendChild(this.listHolder);
        //Setup basic events
        this.addEventListener("focusin", () => {
            console.log("Focus in");
            this.areOptionsVisible = true;
            this.renderList();
            if (!this.classList.contains("formInputFocus")) {
                this.classList.add("formInputFocus");
            }
        });
        this.addEventListener("focusout", () => {
            console.log("Focus out");
            this.areOptionsVisible = false;
            this.listHolder.style.display = "none";
            if (this.classList.contains("formInputFocus")) {
                this.classList.remove("formInputFocus");
            }
            this.validateInternal();
        });
        this.addEventListener("keydown", (ev) => {
            var _a;
            if (this.onEnterPressClickElementId == "") {
                return;
            }
            if (ev.key == "Enter") {
                (_a = document.getElementById(this.onEnterPressClickElementId)) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event("click"));
            }
        });
        this.addEventListener("click", () => {
            if (this.type == "textarea") {
                this.textArea.focus();
            }
            else {
                this.input.focus();
            }
        });
        this.addEventListener("input", () => {
            this.areOptionsVisible = true;
            this.renderList();
            this.validateInternal();
        });
        this.addEventListener("resize", () => {
            //this.areOptionsVisible = true;
            this.renderList();
        });
    }
    updateList() {
        //Clear list
        if (this.usingJSList) {
            return;
        }
        while (this.options.length > 0) {
            this.options.pop();
        }
        //Updates hint list under the selection
        if (this.listId == "") {
            return;
        }
        const list = document.getElementById(this.listId);
        if (list == null) {
            return;
        }
        for (let i = 0; i < list.children.length; i++) {
            const child = list.children[i];
            if (child.tagName == "OPTION") {
                this.options.push(child.value);
            }
        }
        this.renderList();
    }
    renderList() {
        console.log("Render list");
        if (this.options.length == 0 || !this.areOptionsVisible) {
            console.log("Render list cancel");
            return;
        }
        console.log(this.options);
        this.listHolder.style.display = "";
        //Clear list
        while (this.listHolder.lastChild != null) {
            this.listHolder.lastChild.remove();
            console.log("Clearing");
        }
        //Update list
        console.log("isCaseSensitive", this.isCaseSensitiveList);
        for (const value of this.options) {
            if ((this.isCaseSensitiveList ? value : value.toLowerCase()).includes((this.isCaseSensitiveList ? this.getValue() : this.getValue().toLocaleLowerCase()))) {
                const optionDiv = document.createElement("div");
                const option = document.createElement("p");
                option.innerText = value;
                optionDiv.addEventListener("mousedown", () => {
                    console.log("Clicked on: " + value);
                    this.setValue(value);
                    this.areOptionsVisible = false;
                    this.listHolder.style.display = "none";
                    //this.renderList()
                    console.log(this.listHolder.style.display);
                });
                optionDiv.appendChild(option);
                this.listHolder.appendChild(optionDiv);
            }
        }
    }
    updateInputType() {
        //Select input element based on type
        const focused = this.classList.contains("formInputFocus");
        if (this.input.parentElement == this) {
            this.holder.removeChild(this.input);
        }
        if (this.textArea.parentElement == this) {
            this.holder.removeChild(this.textArea);
        }
        if (this.afterImg.parentElement == this.holder) {
            this.holder.removeChild(this.afterImg);
        }
        if (this.type == "textarea") {
            this.holder.appendChild(this.textArea);
            if (focused) {
                this.textArea.focus();
            }
        }
        else {
            this.holder.appendChild(this.input);
            this.input.type = this.type;
            if (focused) {
                this.input.focus();
            }
        }
        if (this.type == "select") {
            this.setIsScrictList(true);
        }
        this.holder.appendChild(this.afterImg);
        //Add specific use cases
        if (this.type == "password") {
            //Make password eye
            const updatePasswordEye = () => {
                if (this.input.type == "password") {
                    this.afterImg.src = "/formWebScripts/images/visibilityoff32.svg";
                }
                else {
                    this.afterImg.src = "/formWebScripts/images/visibility32.svg";
                }
            };
            updatePasswordEye();
            this.afterImg.onclick = () => {
                if (this.input.type == "password") {
                    this.input.type = "text";
                }
                else {
                    this.input.type = "password";
                }
                updatePasswordEye();
            };
        }
        else if (this.type == "color") {
            //Random color generator
            this.afterImg.src = "/formWebScripts/images/casino32.svg";
            this.afterImg.onclick = () => {
                this.input.value = GenerateRandomColor();
            };
        }
        else {
            this.afterImg.src = "";
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
        this.updateInputType();
        if (this.hasAttribute("do-change-check")) {
            this.doChangeCheck = this.getAttribute("do-change-check") == "true";
        }
        for (const attribute of HTMLFormInputElement.observedAttributes) {
            if (this.hasAttribute(attribute)) {
                this.setAttribute(attribute, this.getAttribute(attribute));
            }
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(name, oldValue, newValue);
        if (oldValue == newValue) {
            return;
        }
        if (name == "type") {
            this.type = newValue;
            this.updateInputType();
        }
        else if (name == "value") {
            this.setValue(newValue, true);
        }
        else if (name == "on-enter-press-click-element-id") {
            this.onEnterPressClickElementId = newValue;
        }
        else if (name == "placeholder") {
            this.setPlaceHolder(newValue);
        }
        else if (name == "icon") {
            this.setIcon(newValue);
        }
        else if (name == "is-strict-list") {
            this.setIsScrictList(newValue == "true");
        }
        else if (name == "list") {
            this.setListId(newValue);
        }
        else if (name == "is-case-sensitive-list") {
            this.setIsCaseSensitiveList(newValue == "true");
        }
        else if (name == 'original-value') {
            this.setOriginalValue(newValue);
        }
    }
    async validateInternal() {
        this.setAttribute("value", this.getValue());
        //Check for changes
        let changed = false;
        if (this.doChangeCheck) {
            if (this.getValue() != this.originalValue) {
                changed = true;
            }
        }
        //Do validation
        let isValid = true;
        if (this.validationFunction != null) {
            isValid = await this.validationFunction(this.getValue());
        }
        if (isValid && this.isStrictList) {
            console.log(this.options);
            console.log(this.getValue());
            isValid = this.options.indexOf(this.getValue()) != -1;
        }
        //Add styles
        if (changed) {
            this.classList.add(this.changeBorderClass);
        }
        else {
            this.classList.remove(this.changeBorderClass);
        }
        if (isValid) {
            this.classList.remove(this.invalidBorderClass);
        }
        else {
            this.classList.add(this.invalidBorderClass);
        }
        return [changed, isValid];
    }
    async validate() {
        return this.validateInternal();
    }
    getValue() {
        if (this.type == "textarea") {
            return this.textArea.value;
        }
        else {
            return this.input.value;
        }
    }
    setValue(value, calledFromProperty = false) {
        if (this.type == "textarea") {
            this.textArea.value = value;
        }
        else {
            this.input.value = value;
        }
        if (!calledFromProperty) {
            this.setAttribute("value", value);
        }
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
        this.updateInputType();
        this.setAttribute("type", type);
    }
    getOriginalValue() {
        return this.originalValue;
    }
    setOriginalValue(originalValue) {
        this.originalValue = originalValue;
        this.setAttribute("original-value", originalValue);
        this.validateInternal();
    }
    getListId() {
        return this.listId;
    }
    setListId(listId) {
        this.listId = listId;
        this.usingJSList = false;
        this.updateList();
        this.setAttribute("list", listId);
    }
    getPlaceHolder() {
        if (this.type == "textarea") {
            return this.textArea.placeholder;
        }
        else {
            return this.input.placeholder;
        }
    }
    setPlaceHolder(placeholder) {
        if (this.type == "textarea") {
            this.textArea.placeholder = placeholder;
        }
        else {
            this.input.placeholder = placeholder;
        }
        this.setAttribute("placeholder", placeholder);
    }
    getIcon() {
        return this.img.src;
    }
    setIcon(icon) {
        this.img.src = icon;
        this.setAttribute("icon", icon);
    }
    getIsStrictList() {
        return this.isStrictList;
    }
    setIsScrictList(isStrictList) {
        if (this.type == "select") {
            isStrictList = true;
        }
        this.isStrictList = isStrictList;
        this.setAttribute("isStrictList", isStrictList ? "true" : "false");
        this.validateInternal();
    }
    getOptions() {
        return this.options;
    }
    setOptions(options, timestamp = null) {
        this.usingJSList = true;
        if (timestamp != null && timestamp > this.optionsTimestamp) {
            this.optionsTimestamp = timestamp;
            this.options = options;
            this.removeAttribute("list");
            this.renderList();
        }
    }
    getIsCaseSensitiveList() {
        return this.isCaseSensitiveList;
    }
    setIsCaseSensitiveList(isCaseSensitiveList) {
        this.isCaseSensitiveList = isCaseSensitiveList;
        this.setAttribute("isCaseSensitiveList", isCaseSensitiveList ? "true" : "false");
        this.renderList();
    }
}
HTMLFormInputElement.observedAttributes = ['type', 'value', 'on-enter-press-click-element-id', 'list', 'placeholder', 'icon', 'is-strict-list', 'is-case-sensitive-list', 'original-value'];
export function GenerateRandomColor() {
    const colorLetters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += colorLetters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//function createPreloadLink(resource: string): HTMLLinkElement {
//    const link = document.createElement("link")
//    link.rel = "preload"
//    link.href = resource
//    link.as = "image"
//    link.crossOrigin = "anonymous"
//    return link
//}
const toastImages = new Map();
function SetupToasts() {
    const holder = document.createElement("div");
    holder.classList.add("formToastHolder");
    document.getElementsByTagName("body")[0].appendChild(holder);
    //Preload images
    const imgOk = new Image();
    imgOk.src = "/formWebScripts/images/checkCircle32.svg";
    toastImages.set("ok", imgOk);
    const imgInfo = new Image();
    imgInfo.src = "/formWebScripts/images/info32.svg";
    toastImages.set("info", imgInfo);
    const imgWarn = new Image();
    imgWarn.src = "/formWebScripts/images/warning32.svg";
    toastImages.set("warn", imgWarn);
    const imgError = new Image();
    imgError.src = "/formWebScripts/images/report32.svg";
    toastImages.set("error", imgError);
    //const head = document.getElementsByTagName("head")[0] as HTMLHeadElement
    //head.appendChild(createPreloadLink("/images/info32.svg"))
    //head.appendChild(createPreloadLink("/images/warning32.svg"))
    //head.appendChild(createPreloadLink("/images/report32.svg"))
    //head.appendChild(createPreloadLink("/images/checkCircle32.svg"))
}
let toastCounter = 0;
export function SendToast(title, message, type) {
    var _a;
    toastCounter++;
    let toastId = toastCounter;
    //Get target color
    const colorDiv = document.createElement("div");
    if (type == "ok") {
        colorDiv.classList.add("formOkColor");
    }
    else if (type == "warn") {
        colorDiv.classList.add("formWarnColor");
    }
    else if (type == "info") {
        colorDiv.classList.add("formInfoColor");
    }
    else if (type == "error") {
        colorDiv.classList.add("formErrorColor");
    }
    else if (type == "black") {
        colorDiv.classList.add("formBlackColor");
    }
    colorDiv.style.width = "1px";
    colorDiv.style.height = "1px";
    colorDiv.style.position = "absolute";
    colorDiv.style.zIndex = "-100";
    document.getElementsByTagName("body")[0].appendChild(colorDiv);
    const style = getComputedStyle(colorDiv);
    //console.log(style)
    //Toast holder
    const toast = document.createElement("div");
    toast.classList.add("formToast");
    //toast.style.background = style.background
    toast.style.background = "color-mix(in srgb, #FFFFFF 20%, " + style.backgroundColor + " 100%)";
    //console.log(colorDiv.classList);
    //console.log(style.background)
    toast.setAttribute("toastId", String(toastId));
    toast.setAttribute("animationPart", "0");
    toast.addEventListener("click", function () {
        //console.log("click");
        toast.style.animation = "slideOutToRight 0.5s ease-out forwards";
        toast.setAttribute("animationPart", "2");
    });
    toast.addEventListener("animationend", function () {
        if (toast.getAttribute("animationPart") == "0" || toast.getAttribute("animationPart") == "1") {
            toast.setAttribute("animationPart", String(Number(toast.getAttribute("animationPart")) + 1));
        }
        else {
            toast.remove();
        }
    });
    document.getElementsByClassName("formToastHolder")[0].appendChild(toast);
    //Timeout
    const timeout = document.createElement("div");
    timeout.classList.add("timeout");
    timeout.style.background = "color-mix(in srgb, #000000 20%, " + style.backgroundColor + " 100%)";
    timeout.addEventListener("animationend", function () {
        toast.style.animation = "slideOutToRight 0.5s ease-out forwards";
    });
    toast.appendChild(timeout);
    //Title
    const titleEl = document.createElement("p");
    titleEl.classList.add("formHeader");
    titleEl.innerHTML = title;
    toast.appendChild(titleEl);
    //Content holder
    const content = document.createElement("div");
    content.classList.add("content");
    toast.appendChild(content);
    //Image holder
    const imgHolder = document.createElement("div");
    imgHolder.classList.add("formCenter");
    content.appendChild(imgHolder);
    //Image
    const img = document.createElement("img");
    if (type == "black") {
        //colorDiv.classList.add("formBlackColor")
        console.error("Undefined icon!");
    }
    else {
        img.src = (_a = toastImages.get(type)) === null || _a === void 0 ? void 0 : _a.src;
    }
    imgHolder.appendChild(img);
    //Text holder
    const pHolder = document.createElement("div");
    content.appendChild(pHolder);
    //Text
    const p = document.createElement("p");
    p.classList.add("contentText");
    p.innerHTML = message;
    pHolder.appendChild(p);
    toast.style.animation = "slideInFromRight 0.5s ease-out forwards";
    colorDiv.remove();
    return toastId;
}
/*
Setups rows of form
*/
export function SetupRows() {
    const elements = document.getElementsByTagName("formrow");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.classList.add("formFlexColumn");
        if (element.hasAttribute("isFirst")) {
            element.style.marginTop = "0px";
        }
        //Move all elements
        const holder = document.createElement("div");
        holder.classList.add("formFlexRow");
        while (element.lastChild != null) {
            const child = element.childNodes[0];
            if (child.tagName == "INPUTFIELD") {
                child.style.flexGrow = "1";
            }
            element.removeChild(child);
            holder.appendChild(child);
        }
        //Create label
        if (element.hasAttribute("label")) {
            const label = document.createElement("p");
            label.innerHTML = element.getAttribute("label");
            element.appendChild(label);
        }
        element.appendChild(holder);
    }
}
/**
 * Makes HTML element dragable
 * @param movedElement Moved element
 * @param dragElement Element that acts as dragger (topbar of window, ...)
 */
export function MakeElementDraggable(movedElement, dragElement) {
    if (dragElement == null) {
        dragElement = movedElement;
    }
    dragElement.addEventListener("mousedown", (event) => {
        if (movedElement.getAttribute("formIsDragged") == "true") {
            return;
        }
        //Start drag
        movedElement.setAttribute("formIsDragged", "true");
        movedElement.setAttribute("formDragLastCursor", dragElement.style.cursor);
        dragElement.style.cursor = "move";
        movedElement.setAttribute("formDragLastX", event.clientX.toString());
        movedElement.setAttribute("formDragLastY", event.clientY.toString());
    });
    function dragEnd() {
        //End drag
        movedElement.removeAttribute("formIsDragged");
        if (dragElement != null) {
            dragElement.style.cursor = movedElement.getAttribute("formDragLastCursor");
        }
        movedElement.removeAttribute("formDragLastCursor");
        movedElement.removeAttribute("formDragLastX");
        movedElement.removeAttribute("formDragLastY");
    }
    movedElement.addEventListener("mouseup", () => {
        dragEnd();
    });
    if (dragElement != movedElement) {
        dragElement.addEventListener("mouseup", () => {
            dragEnd();
        });
    }
    function drag(event) {
        //Drag
        if (movedElement.getAttribute("formIsDragged") != "true") {
            return;
        }
        let posX = Number(movedElement.getAttribute("formDragLastX")) - event.clientX;
        let posY = Number(movedElement.getAttribute("formDragLastY")) - event.clientY;
        movedElement.setAttribute("formDragLastX", event.clientX.toString());
        movedElement.setAttribute("formDragLastY", event.clientY.toString());
        movedElement.style.left = (movedElement.offsetLeft - posX) + "px";
        movedElement.style.top = (movedElement.offsetTop - posY) + "px";
    }
    movedElement.addEventListener("mousemove", (event) => {
        drag(event);
    });
    if (dragElement != movedElement) {
        dragElement.addEventListener("mousemove", (event) => {
            drag(event);
        });
    }
}
SetupRows();
//SetupTextInputs()
//SetupToggles()
SetupToasts();
customElements.define("form-input", HTMLFormInputElement);
//# sourceMappingURL=formScript.js.map