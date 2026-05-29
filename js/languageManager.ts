export class LanguageManager {
    private languageData: any = {}
    readonly localesFolderPathMain: string | null
    readonly localesFolderPathApp: string | null
    private language: string = ""

    Translate(key: string, fallbackText: string | null = null): string {
        if (this.languageData == null) {
            return fallbackText == null ? key : fallbackText
        }
        const text = this.languageData[key]
        if (text == null) {
            return fallbackText == null ? key : fallbackText
        }
        return text
    }

    async AsyncTranslate(key: string, fallbackText: string): Promise<string> {
        return new Promise(resolve => {
            if (this.languageData == null) {
                setTimeout(() => {
                    resolve(this.AsyncTranslate(key, fallbackText))
                }, 100)
                return
            }
            const text = this.languageData[key]
            if (text == null) {
                resolve(fallbackText)
            }
            resolve(text)
        })
    }

    /**
     * Translates all elements with attributes: data-i18n - innerText
     */
    TranslateElements() {
        document.querySelectorAll("[data-i18n]").forEach(element => {
            let translation = this.Translate(element.getAttribute("data-i18n") as string, "")
            if (translation != null) {
                (element as HTMLElement).innerText = translation
            }
        })
    }

    constructor(fallbackLanguage: string = "", forceSetFallbackLanguage: boolean = false) {
        //Load langpath main
        const metaElement1 = document.querySelector('meta[name="form-locales-main"]')
        if (metaElement1 != null) {
            this.localesFolderPathMain = (metaElement1 as HTMLMetaElement).content
        } else {
            console.warn("No FormWebScripts locales provided!");
            this.localesFolderPathMain = null;
        }

        //Load langpath
        const metaElement2 = document.querySelector('meta[name="form-locales"]')
        if (metaElement2 != null) {
            this.localesFolderPathApp = (metaElement2 as HTMLMetaElement).content
        } else {
            this.localesFolderPathApp = null
        }

        //Set language
        const lang = localStorage.getItem("formLanguage")
        let setLang = async () => {
            if (forceSetFallbackLanguage == true) {
                if (!await this.ChangeLanguage(fallbackLanguage, true)) {
                    if (! await this.ChangeLanguage(navigator.language.split('-')[0], true)) {
                        this.ChangeLanguage("en", true)
                    }
                }
            } else {
                if (! await this.ChangeLanguage(lang as string, true)) {
                    if (!await this.ChangeLanguage(fallbackLanguage, true)) {
                        if (! await this.ChangeLanguage(navigator.language.split('-')[0], true)) {
                            this.ChangeLanguage("en", true)
                        }
                    }
                }
            }
        }
        setLang()

        //Listen for language changes
        window.addEventListener("storage", (ev: StorageEvent) => {
            if (ev.key == "formLanguage" && ev.newValue != this.language) {
                console.log("Language change detected.");
                this.ChangeLanguage(ev.newValue as string)
            }
        })
    }

    /**
     * Changes language for manager and translates current page
     */
    async ChangeLanguage(language: string, silent = false): Promise<boolean> {
        //Ignore null language
        if (language == null) { return false }

        //Load main languages
        if (this.localesFolderPathMain != null) {
            const responce = await fetch(this.localesFolderPathMain + "./" + language + ".json")
            if (responce.status != 200) {
                return false
            }
            try {
                this.languageData = await responce.json()
            } catch (ex) {
                console.error(ex);
                return false;
            }
        }

        //Load main languages
        if (this.localesFolderPathApp != null) {
            const responce2 = await fetch(this.localesFolderPathMain + "./" + language + ".json")
            if (responce2.status != 200) {
                return false
            }
            try {
                this.languageData = { ...this.languageData, ...await responce2.json() }
            } catch (ex) {
                console.error(ex);
                return false;
            }
        }

        //Set language
        this.language = language
        localStorage.setItem("formLanguage", language)

        //Do first translation
        this.TranslateElements()
        if (!silent) {
            alert("Language changed, it is recomended do reload the site.")
        }
        return true
    }
}