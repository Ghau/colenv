let messageTemplate = document.createElement('template');
messageTemplate.innerHTML = `
<style type="text/css">
    :host {
        width: 100%;
        position: fixed;
        height: 46px;
        top: 0px;
        left: 0px;
        display: flex;
        align-items: center;
        color: white;
    
        background-color: rgba(242,12,15,0.69);
        transition: all 0.4s ease;  
    }
    .content {
        flex: 1;
        text-align: center;
    }
    .close {
        padding-right: 20px;
    }
    .close img {
        cursor: pointer;
    }
</style>
<div class="content">
    <slot name="content"></slot>
</div>
<div class="close">
    <img src="../../../resources/images/icons-close_24.png">
</div>
`;

customElements.define('message-flash', class extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'}).appendChild(messageTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        // let [close] = this.shadowRoot.querySelectorAll('img');
        // close.addEventListener('click', this.hide);
        //
        // document.addEventListener('keyup', e => this.keyUp(e));
        // this.addEventListener('click', e => this.click(e));
    }

});
