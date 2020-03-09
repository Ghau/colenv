customElements.define('trans-nav', class extends HTMLElement {
    static get observedAttributes() {return ['innerText'];}

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerText = browser.i18n.getMessage(this.innerText);
    }
});
