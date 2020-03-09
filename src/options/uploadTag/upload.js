let uploadTemplate = document.createElement('template');
uploadTemplate.innerHTML = `
<style type="text/css">
    :host {
        display: flex;
        flex-direction: column;
    }
    .popin-drag{
        border: .01rem dashed;
        min-height: 300px;
        min-width: 700px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer; 
    }
    .popin-drag > img {
        width: 96px;
        height: 96px;
        transition: width 2s ease-in-out, height 2s ease-in-out;
    }
    .popin-drag > input {
        display: none;
    }
</style>
<div class="popin-drag">
    <img src="../../../resources/images/icons-upload_192.png">
    <input type="file" />
</div>
`;

customElements.define('upload-form', class extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'}).appendChild(uploadTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        let [drag] = this.shadowRoot.querySelectorAll('div');
        let [input] = this.shadowRoot.querySelectorAll('input');

        if (this.getAttribute('accept')) {
            const accept = this.getAttribute('accept');
            input.accept = accept;
            this.accept = accept.split(',');
        }

        input.addEventListener('change', () => {
            input.files[0].text().then(t => this.uploaded(t));
        });

        drag.addEventListener('click', e => input.click());

        document.addEventListener('dragover', e => e.preventDefault());

        document.addEventListener('dragenter', e => {
            if ( e.originalTarget === drag ) {
                drag.children[0].style.width = '192px';
                drag.children[0].style.height = '192px';
            }
        });

        document.addEventListener('dragleave', e => {
            if ( e.originalTarget === drag ) {
                drag.children[0].style.width = '96px';
                drag.children[0].style.height = '96px';
            }
        });

        document.addEventListener('drop', e => {
            e.preventDefault();
            if (e.dataTransfer.items) {
                if (e.dataTransfer.items[0].kind === 'file') {
                    if (this.accept && this.accept.includes(e.dataTransfer.items[0].type)) {
                        e.dataTransfer.items[0].getAsFile().text().then(t => this.uploaded(t));
                    }
                } else if (e.dataTransfer.items[0].kind === 'string') {
                    e.dataTransfer.items[0].getAsString(t => this.uploaded(t));
                }
            }
        });
    }

    uploaded(text) {
        this.dispatchEvent(new CustomEvent('upload', {detail: {text}}));
    }
});
