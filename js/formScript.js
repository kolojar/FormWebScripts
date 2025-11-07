/*
Disables form and addes propried styles and animations
*/
export function DisableForm(disabled) {
    const forms = document.getElementsByClassName("formBox");
    for (let index = 0; index < forms.length; index++) {
        recursiveDisabler(forms[index], disabled);
    }
}
function recursiveDisabler(object, disabled) {
    for (let index = 0; index < object.children.length; index++) {
        const element = object.children[index];
        recursiveDisabler(element, disabled);
    }
    if (!object.hasAttribute("disableRecursiveDisable")) {
        object.setAttribute("disabled", String(disabled));
        if (!disabled) {
            object.removeAttribute("disabled");
        }
    }
}
/*
Uses checkbox as disabler
*/
//export function DisableOnCheckbox(checkBox: HTMLInputElement, target: HTMLInputElement) {
//    checkBox.addEventListener("change", function () {
//        console.log("Change");
//        
//        target.disabled = !checkBox.checked
//    })
//    target.disabled = !checkBox.checked
//}
/*
Sets wait status and message
*/
export function SetWaitStatusForm(wait, message) {
    const forms = document.getElementsByClassName("formBox");
    for (let index = 0; index < forms.length; index++) {
        let form = forms[index];
        form.style.cursor = wait ? "wait" : "";
        let status = document.getElementById("statusMessage");
        status.innerHTML = wait ? message : "";
        if (wait) {
            status.classList.add("puslatingEffectFull");
        }
        else {
            status.classList.remove("puslatingEffectFull");
        }
        DisableForm(wait);
    }
}
/*
Setups switches (toggles)
*/
export function SetupToggles() {
    const elements = document.getElementsByTagName("toggle");
    for (let i = 0; i < elements.length; i++) {
        //Prepare toggles -> CSS + subelements
        const element = elements[i];
        element.classList.add("formSwitch");
        //Label before
        const labelBefore = document.createElement("label");
        if (element.hasAttribute("labelBefore")) {
            labelBefore.classList.add("labelBefore");
            labelBefore.innerHTML = element.getAttribute("labelBefore");
        }
        element.appendChild(labelBefore);
        //Holder label
        const holder = document.createElement("label");
        holder.classList.add("toggle");
        element.appendChild(holder);
        //Input element
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = element.getAttribute("valueId");
        holder.appendChild(input);
        //Span slider
        const span = document.createElement("span");
        span.classList.add("slider");
        holder.appendChild(span);
        switchChange(element, span, input);
        //Label after
        if (element.hasAttribute("labelAfter")) {
            const labelAfter = document.createElement("span");
            labelAfter.classList.add("labelAfter");
            labelAfter.innerHTML = element.getAttribute("labelAfter");
            holder.appendChild(labelAfter);
        }
        //Click event
        element.addEventListener("click", function () {
            //console.log("Click");
            input.checked = !input.checked;
            input.dispatchEvent(new Event("change"));
            switchChange(element, span, input);
        });
        //On key down
        element.addEventListener("keydown", function (ev) {
            if (ev.code === "Space") {
                //console.log("Click");
                input.checked = !input.checked;
                input.dispatchEvent(new Event("change"));
                switchChange(element, span, input);
            }
        });
    }
}
function switchChange(element, span, input) {
    const enables = document.getElementById(element.getAttribute("enables"));
    let onColorClass = element.getAttribute("onColorClass");
    let offColorClass = element.getAttribute("offColorClass");
    const holder = element.children[1];
    if (input.checked) {
        span.classList.add(onColorClass);
        span.classList.remove(offColorClass);
        holder.classList.add("formSwitchChecked");
    }
    else {
        span.classList.remove(onColorClass);
        span.classList.add(offColorClass);
        holder.classList.remove("formSwitchChecked");
    }
    //console.log(enables);
    if (enables != null) {
        if (!input.checked) {
            enables.setAttribute("disabled", "");
            //console.log("Disabled");
        }
        else {
            enables.removeAttribute("disabled");
            //console.log("Enable");
        }
    }
}
/*
Setups text inputs
*/
export function SetupTextInputs() {
    const elements = document.getElementsByTagName("inputfield");
    for (let i = 0; i < elements.length; i++) {
        //Prepare inputs -> CSS + subelements
        const element = elements[i];
        const inputHolder = document.createElement("div");
        inputHolder.classList.add("formTextInput");
        element.appendChild(inputHolder);
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
        const img = document.createElement("img");
        img.src = element.getAttribute("icon");
        img.classList.add("formTooltipIcon");
        inputHolder.appendChild(img);
        //Input element
        const input = document.createElement("input");
        input.type = element.getAttribute("inputType");
        input.id = element.getAttribute("valueId");
        input.setAttribute("disableRecursiveDisable", "true");
        input.placeholder = element.getAttribute("placeholder");
        input.tabIndex = element.tabIndex;
        element.tabIndex = -1;
        inputHolder.appendChild(input);
        //Password img element
        if (element.getAttribute("inputType") == "password") {
            const passimg = document.createElement("img");
            if (element.getAttribute("showPass") == null) {
                element.setAttribute("showPass", "false");
            }
            updatePasswordEye(passimg, element, input);
            passimg.style.cursor = "pointer";
            passimg.addEventListener("click", function () {
                element.setAttribute("showPass", String(!(element.getAttribute("showPass") == "true")));
                updatePasswordEye(passimg, element, input);
            });
            inputHolder.appendChild(passimg);
        }
        //Color random button
        if (element.getAttribute("inputType") == "color") {
            const randomImg = document.createElement("img");
            randomImg.src = "/images/casino32.svg";
            randomImg.style.cursor = "pointer";
            randomImg.onclick = function () {
                input.value = GenerateRandomColor();
            };
            inputHolder.appendChild(randomImg);
        }
        //Click event
        element.addEventListener("click", function () {
            input.focus();
        });
    }
}
function updatePasswordEye(passimg, element, passwordField) {
    if (element.getAttribute("showPass") == "true") {
        passimg.src = "/images/visibility32.svg";
        passwordField.type = "text";
    }
    else {
        passimg.src = "/images/visibilityoff32.svg";
        passwordField.type = "password";
    }
}
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
    imgOk.src = "/images/checkCircle32.svg";
    toastImages.set("ok", imgOk);
    const imgInfo = new Image();
    imgInfo.src = "/images/info32.svg";
    toastImages.set("info", imgInfo);
    const imgWarn = new Image();
    imgWarn.src = "/images/warning32.svg";
    toastImages.set("warn", imgWarn);
    const imgError = new Image();
    imgError.src = "/images/report32.svg";
    toastImages.set("error", imgError);
    //const head = document.getElementsByTagName("head")[0] as HTMLHeadElement
    //head.appendChild(createPreloadLink("/images/info32.svg"))
    //head.appendChild(createPreloadLink("/images/warning32.svg"))
    //head.appendChild(createPreloadLink("/images/report32.svg"))
    //head.appendChild(createPreloadLink("/images/checkCircle32.svg"))
}
let toastCounter = 0;
export function SendToast(title, message, type) {
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
        img.src = toastImages.get(type).src;
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
export function SwitchToggle(toggle, value) {
    const holder = toggle.children[1];
    const input = holder.children[0];
    const span = holder.children[1];
    input.checked = value;
    input.dispatchEvent(new Event("change"));
    //console.log("Switch",toggle,value,input,span);
    switchChange(toggle, span, input);
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
SetupRows();
SetupTextInputs();
SetupToggles();
SetupToasts();
//# sourceMappingURL=formScript.js.map