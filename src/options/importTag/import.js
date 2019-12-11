let importTemplate = document.createElement('template');
importTemplate.innerHTML = `
<style type="text/css">
    form {
        display: flex;
        justify-content: space-between;
    }
    :host label {
        line-height: 200%;
    }
    #importUrl {
        width: 65%;
    }
    #importUrl:invalid + div{
        background-image: url('../../../resources/images/icons-noverify_24.png');
    }
    #importUrl:valid + div{
        background-image: url('../../../resources/images/icons-verify_24.png');
    }
    .icon {
        width: 25px;
        background-repeat: no-repeat;
    }
    .pointer {
        cursor: pointer;
    }
    .sync {
        background-image: url('../../../resources/images/icons-sync_24.png');
    }
    .nosync {
        background-image: url('../../../resources/images/icons-nosync_24.png');
    }
</style>
<form>
    <label>
        <trans-nav>importUrl</trans-nav>
    </label>
    <input type="url" id="importUrl" />
    <div class="icon" id="validity"></div>
    <div class="icon pointer nosync"></div>
</form>
`;

customElements.define('import-url', class extends HTMLElement {
    content = null;
    validity = () => true;
    constructor() {
        super();

        this.attachShadow({mode: 'open'}).appendChild(importTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const [verify, refresh] = this.shadowRoot.querySelectorAll('div');
        const [input] = this.shadowRoot.querySelectorAll('input');
        refresh.addEventListener('click', () => this.change());

        input.addEventListener('keyup', () => this.change());
        input.addEventListener('blur', () => this.change());

        if (this.getAttribute('validity') && typeof this.getAttribute('validity') === 'function') {
            this.validity = this.getAttribute('validity');
        }

        if (this.getAttribute('value')) {
            this.load(this.getAttribute('value'));
        }
    }

    load(value) {
        const [input] = this.shadowRoot.querySelectorAll('input');
        input.value = value;

        this.change();
    }

    async get(url) {
        try {
            return await fetch(url).then(reponse => reponse.blob()).then(response => response.text());
        } catch (e) {
            return null;
        }

    }

    async change() {
        const [input] = this.shadowRoot.querySelectorAll('input');
        if (input.value === '') {
            this.content = null;
            input.setCustomValidity('');
            this.dispatchEvent(new CustomEvent('valid', { detail: {value: '', content: null}}));

            return;
        }

        const content = await this.get(input.value);
        if (content === this.content) {
            return;
        }

        if (content && this.validity(content)) {
            this.content = content;
            this.dispatchEvent(new CustomEvent('valid', { detail: {value: input.value, content}}));
            input.setCustomValidity('');
        } else {
            this.content = null;
            input.setCustomValidity('test');
        }
    }

    set validity(validity) {
        if (typeof validity === 'function') {
            this.validity = validity
        }
    }

    get content() {
        return this.content;
    }

    get value() {
        const [input] = this.shadowRoot.querySelectorAll('input');
        return input.value;
    }

    set value(value) {
        this.load(value);
    }
});
