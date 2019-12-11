let interfaceTemplate = document.createElement('template');
interfaceTemplate.innerHTML = `
    <link rel="stylesheet" href="common.css">
    <link rel="stylesheet" href="interfaceTag/interface.css">
    <div class="interface-element">
        <label for="interfaceToolbar"><trans-nav>interfaceToolbar</trans-nav></label>
        <input type="checkbox" id="interfaceToolbar">
    </div>
    <div class="interface-element">
        <label for="interfaceFrame"><trans-nav>interfaceFrame</trans-nav></label>
        <input type="checkbox" id="interfaceFrame">
    </div>
    <div class="interface-element">
        <label for="interfaceTabSelected"><trans-nav>interfaceTabSelected</trans-nav></label>
        <input type="checkbox" id="interfaceTabSelected">
    </div>
    <div class="interface-element">
        <label for="interfaceToolbarField"><trans-nav>interfaceToolbarField</trans-nav></label>
        <input type="checkbox" id="interfaceToolbarField">
    </div>
    <div class="interface-element">
        <label for="interfaceTabLine"><trans-nav>interfaceTabLine</trans-nav></label>
        <input type="checkbox" id="interfaceTabLine">
    </div>
`;

customElements.define('interface-block', class extends HTMLElement {
    static get observedAttributes() {return ['value'];}

    constructor() {
        super();

        this.attachShadow({mode: 'open'}).appendChild(interfaceTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        let [interfaceToolbar, interfaceFrame, interfaceTabSelected, interfaceToolbarField, interfaceTabLine] = this.shadowRoot.querySelectorAll('input');

        interfaceToolbar.addEventListener('change', () => this.change());
        interfaceFrame.addEventListener('change', () => this.change());
        interfaceTabSelected.addEventListener('change', () => this.change());
        interfaceToolbarField.addEventListener('change', () => this.change());
        interfaceTabLine.addEventListener('change', () => this.change());

        if (this.getAttribute('value')) {
            this.load(this.getAttribute('value'));
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name !== 'value') {
            return;
        }

        load(newValue);
    }

    load(value) {
        if (!value) {
            return;
        }

        if (typeof value === 'string') {
            value = JSON.parse(value);
        }

        let [interfaceToolbar, interfaceFrame, interfaceTabSelected, interfaceToolbarField, interfaceTabLine] = this.shadowRoot.querySelectorAll('input');
        interfaceToolbar.checked = value.toolbar !== undefined && value.toolbar? true : false;
        interfaceFrame.checked = value.frame !== undefined && value.frame? true : false;
        interfaceTabSelected.checked = value.tab_selected !== undefined && value.tab_selected? true : false;
        interfaceToolbarField.checked = value.toolbar_field !== undefined && value.toolbar_field? true : false;
        interfaceTabLine.checked = value.tab_line !== undefined && value.tab_line? true : false;
    }

    change() {
        this.dispatchEvent(new CustomEvent('change'));
    }

    get value() {
        const [interfaceToolbar, interfaceFrame, interfaceTabSelected, interfaceToolbarField, interfaceTabLine] = this.shadowRoot.querySelectorAll('input');

        return {
            toolbar: interfaceToolbar.checked,
            frame: interfaceFrame.checked,
            tab_selected: interfaceTabSelected.checked,
            toolbar_field: interfaceToolbarField.checked,
            tab_line: interfaceTabLine.checked
        }
    }

    set value(value) {
        this.load(value);
    }
});
