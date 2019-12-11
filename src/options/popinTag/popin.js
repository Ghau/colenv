let popinTemplate = document.createElement('template');
popinTemplate.innerHTML = `
<style type="text/css">
    :host {
        position: fixed;
        left: 0px; 
        right: 0px;
        top: 0px; 
        bottom: 0px;
        overflow: auto;
        opacity: 0;
        visibility: hidden;
        
        display: flex;
        align-items: center;
        justify-content: center;
    
        background-color: rgba(0,0,0,0.5);
        transition: all 0.4s ease;   
    }
    .block {
        box-shadow: 0px 0px 7px 1px grey;
        background-color: #fff;
        padding: 20px;
        min-width: 700px;
        min-height: 300px;
    }
    .close {
        text-align: right;
    }
    .close img {
        cursor: pointer;
    }
    .content {
        padding: 20px;
    }
</style>
<div class="block">
    <div class="close"><img src="../../../resources/images/icons-close_24.png"></div>
    <div class="content">
        <slot name="content"></slot>
    </div>
</div>
`;

customElements.define('popin-info', class extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'}).appendChild(popinTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        let [close] = this.shadowRoot.querySelectorAll('img');
        close.addEventListener('click', e => this.hide());

        document.addEventListener('keyup', e => this.keyUp(e));
        this.addEventListener('click', e => this.click(e));
    }

    click(e) {
        const [block] = this.shadowRoot.querySelectorAll('div');
        let parent = e.originalTarget
        while(parent) {
            if (parent === block) {
                return;
            }

            if (parent == this) {
                this.hide();
            }

            parent = parent.parentNode;
        }
    }

    keyUp(e) {
        if (e.key === 'Escape') {
            this.hide();
        }
    }

    show() {
        this.style.visibility = 'visible';
        this.style.opacity = 1;
    }

    hide() {
        this.style.visibility = 'hidden';
        this.style.opacity = 0;
    }
});
