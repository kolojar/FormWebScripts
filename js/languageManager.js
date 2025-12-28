export class LanguageManager {
    Translate(key, fallbackText) {
        if (this.languageData == null) {
            return fallbackText;
        }
        const text = this.languageData[key];
        if (text == null) {
            return fallbackText;
        }
        return text;
    }
    async AsyncTranslate(key, fallbackText) {
        return new Promise(resolve => {
            if (this.languageData == null) {
                setTimeout(() => {
                    resolve(this.AsyncTranslate(key, fallbackText));
                }, 100);
                return;
            }
            const text = this.languageData[key];
            if (text == null) {
                resolve(fallbackText);
            }
            resolve(text);
        });
    }
    /**
     * Translates all elements with attributes: data-i18n - innerText
     */
    TranslateElements() {
        document.querySelectorAll("[data-i18n]").forEach(element => {
            let translation = this.Translate(element.getAttribute("data-i18n"), null);
            if (translation != null) {
                element.innerText = translation;
            }
        });
    }
    constructor(localesFolderPath, fallbackLanguage = null, forceSetFallbackLanguage = false) {
        //Set language
        this.localesFolderPath = localesFolderPath;
        const lang = localStorage.getItem("formLanguage");
        let setLang = async () => {
            if (forceSetFallbackLanguage == true) {
                if (!await this.ChangeLanguage(fallbackLanguage, true)) {
                    if (!await this.ChangeLanguage(navigator.language.split('-')[0], true)) {
                        this.ChangeLanguage("en", true);
                    }
                }
            }
            else {
                if (!await this.ChangeLanguage(lang, true)) {
                    if (!await this.ChangeLanguage(fallbackLanguage, true)) {
                        if (!await this.ChangeLanguage(navigator.language.split('-')[0], true)) {
                            this.ChangeLanguage("en", true);
                        }
                    }
                }
            }
        };
        setLang();
        //Listen for language changes
        window.addEventListener("storage", (ev) => {
            if (ev.key == "formLanguage" && ev.newValue != this.language) {
                console.log("Language change detected.");
                this.ChangeLanguage(ev.newValue);
            }
        });
    }
    /**
     * Changes language for manager and translates current page
     */
    async ChangeLanguage(language, silent = false) {
        if (language == null) {
            return false;
        }
        const responce = await fetch(this.localesFolderPath + "/" + language + ".json");
        if (responce.status != 200) {
            return false;
        }
        try {
            this.languageData = await responce.json();
        }
        catch (ex) {
            console.error(ex);
            return false;
        }
        this.language = language;
        localStorage.setItem("formLanguage", language);
        this.TranslateElements();
        if (!silent) {
            alert("Language changed, it is recomended do reload the site.");
        }
        return true;
    }
}
//# sourceMappingURL=languageManager.js.map