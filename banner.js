if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    browser = chrome;
}
browser.runtime.connect().onMessage.addListener(message => {
    console.log(message);
    if (message.banner) {
        for (let type in message.banner) {
            createBanner(type, message.name, message.banner[type]);
        }
    }
});

function createBanner(type, name, color) {
    const id = `colenv_${type}`;
    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }
    let div = document.createElement('div');
    div.id = id;
    div.innerText = name;
    let close = document.createElement('a');
    close.innerText = 'X';
    close.style.position = 'absolute';
    close.style.cursor = 'pointer';
    close.style.zIndex = '9999999';
    close.addEventListener('click', e => {
        div.remove();
    });
    div.appendChild(close);

    div.style.position = 'fixed';
    div.style.backgroundColor = color;
    div.style.fontSize = '20px';
    div.style.textAlign = 'center';
    div.style.zIndex = '999999';

    switch (type) {
        case 'bottom':
                div.style.bottom = '0px';
                div.style.left = '0px';
                div.style.width = '100%';
                div.style.height = '30px';
                close.style.right = '0px';
                close.style.marginRight = '10px';
            break;
        case 'right':
                div.style.top = '0px';
                div.style.right = '0px';
                div.style.width = '30px';
                div.style.height = '100%';
                close.style.top = '0px';
                close.style.marginTop = '10px';
            break;
        case 'left':
                div.style.top = '0px';
                div.style.left = '0px';
                div.style.width = '30px';
                div.style.height = '100%';
                close.style.top = '0px';
                close.style.marginTop = '10px';
            break;
        default:
                div.style.top = '0px';
                div.style.left = '0px';
                div.style.width = '100%';
                div.style.height = '30px';
                close.style.right = '0px';
                close.style.marginRight = '10px';
    }

    document.body.appendChild(div);
}