let interfaceTemplate = document.createElement('template');
interfaceTemplate.innerHTML = `
    <link rel="stylesheet" href="common.css">
    <link rel="stylesheet" href="interfaceTag/interface.css">
    <h3>Browser UI</h3>
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
    <h3>Page integration</h3>
    <div class="interface-element">
        <label for="interfaceTopBanner"><trans-nav>interfaceTopBanner</trans-nav></label>
        <input type="checkbox" id="interfaceTopBanner">
    </div>
    <div class="interface-element">
        <label for="interfaceBottomBanner"><trans-nav>interfaceBottomBanner</trans-nav></label>
        <input type="checkbox" id="interfaceBottomBanner">
    </div>
    <div class="interface-element">
        <label for="interfaceRightBanner"><trans-nav>interfaceRightBanner</trans-nav></label>
        <input type="checkbox" id="interfaceRightBanner">
    </div>
    <div class="interface-element">
        <label for="interfaceLeftBanner"><trans-nav>interfaceLeftBanner</trans-nav></label>
        <input type="checkbox" id="interfaceTopBanner">
    </div>
`;

customElements.define('interface-block', class extends HTMLElement {
    static get observedAttributes() {return ['value'];}

    constructor() {
        super();

        this.attachShadow({mode: 'open'}).appendChild(interfaceTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        for (let input of this.shadowRoot.querySelectorAll('input')) {
            input.addEventListener('change', () => this.change());
        }

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

        let [
            interfaceToolbar,
            interfaceFrame,
            interfaceTabSelected,
            interfaceToolbarField,
            interfaceTabLine,
            interfaceTopBanner,
            interfaceBottomBanner,
            interfaceRightBanner,
            interfaceLeftBanner,
        ] = this.shadowRoot.querySelectorAll('input');

        interfaceToolbar.checked = value.colors.toolbar !== undefined;
        interfaceFrame.checked = value.colors.frame !== undefined;
        interfaceTabSelected.checked = value.colors.tab_selected !== undefined;
        interfaceToolbarField.checked = value.colors.toolbar_field !== undefined;
        interfaceTabLine.checked = value.colors.tab_line !== undefined;
        interfaceTopBanner.checked = value.banner.top !== undefined ;
        interfaceBottomBanner.checked = value.banner.bottom !== undefined ;
        interfaceRightBanner.checked = value.banner.right !== undefined ;
        interfaceLeftBanner.checked = value.banner.left !== undefined ;
    }

    change() {
        this.dispatchEvent(new CustomEvent('change'));
    }

    get value() {
        const [
            interfaceToolbar,
            interfaceFrame,
            interfaceTabSelected,
            interfaceToolbarField,
            interfaceTabLine,
            interfaceTopBanner,
            interfaceBottomBanner,
            interfaceRightBanner,
            interfaceLeftBanner,
        ] = this.shadowRoot.querySelectorAll('input');

        return {
            colors: {
                toolbar: interfaceToolbar.checked,
                frame: interfaceFrame.checked,
                tab_selected: interfaceTabSelected.checked,
                toolbar_field: interfaceToolbarField.checked,
                tab_line: interfaceTabLine.checked
            },
            banner: {
                top: interfaceTopBanner.checked,
                bottom: interfaceBottomBanner.checked,
                right: interfaceRightBanner.checked,
                left: interfaceLeftBanner.checked
            }
        }
    }

    set value(value) {
        this.load(value);
    }
});
