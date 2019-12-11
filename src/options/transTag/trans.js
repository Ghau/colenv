customElements.define('trans-nav', class extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerText = browser.i18n.getMessage(this.innerText);
    }
});
