document.getElementById('add_environment').addEventListener('click', () => {
    environmentManager.createEvironment();
});
document.getElementById('test_url').addEventListener('keyup', (e) => {
    testUrl(e.target.value);
});
document.getElementById('test_url').addEventListener('change', (e) => {
    testUrl(e.target.value);
});

const EnvironmentManager = function () {
    this.environments = new Map();

    this.createEvironment = (name = browser.i18n.getMessage('defaultEnvironmentName'), color = '#000') => {
        const template = document.getElementById('template_environment');
        const environments = document.getElementById('environments');
        const environmentTemplate = document.importNode(template.content, true);

        const uid = uuidv4();

        let [inputName, inputColor] = environmentTemplate.querySelectorAll('input');

        inputName.value = name;
        inputColor.value = color;

        const div = environmentTemplate.querySelectorAll('.environment')[0];
        div.id = uid;

        div.addEventListener('click', () => {
            this.activeEnvironment(uid);
        });
        inputName.addEventListener('keyup', () => {
            this.save();
        });
        inputName.addEventListener('change', () => {
            this.save();
        });
        inputColor.addEventListener('change', () => {
            this.save();
        });

        div.querySelectorAll('.environment-trash')[0].addEventListener('click', () => {
            if (confirm(browser.i18n.getMessage('alertDeleteEnvironment'))) {
                div.remove();
                this.environments.get(uid).urls.remove();
                this.environments.delete(uid);

                this.save()
            }
        });

        div.querySelectorAll('.environment-move')[0].addEventListener('mousedown', e => {
            e.preventDefault();

            div.style.zIndex = 100;
            let initY = e.clientY;

            const mouseMove = e => {
                e.preventDefault();
                if ((!div.previousElementSibling && initY > e.clientY) || (!div.nextElementSibling && initY < e.clientY)) {
                    div.style.top = '0px';
                    return;
                }

                div.style.top = `${-(initY - e.clientY)}px`;

                if (div.previousElementSibling && div.previousElementSibling.offsetTop + div.previousElementSibling.offsetHeight / 2 > div.offsetTop) {
                    initY -= div.previousElementSibling.offsetHeight;
                    div.style.top = `${-(initY - e.clientY)}px`;
                    div.parentNode.insertBefore(div, div.previousElementSibling);
                }

                if (div.nextElementSibling && div.nextElementSibling.offsetTop - div.nextElementSibling.offsetHeight / 2 < div.offsetTop) {
                    initY += div.nextElementSibling.offsetHeight;
                    div.style.top = `${-(initY - e.clientY)}px`;
                    div.parentNode.insertBefore(div, div.nextElementSibling.nextElementSibling);
                }
            };

            const mouseUp = () => {
                div.style.removeProperty('zIndex');
                div.style.removeProperty('top');
                document.removeEventListener('mouseup', mouseUp);
                document.removeEventListener('mousemove', mouseMove);
                this.save();
            };

            document.addEventListener('mouseup', mouseUp);
            document.addEventListener('mousemove', mouseMove);
        });

        const urls = this.createUrls(uid);

        environments.appendChild(environmentTemplate);

        const environment = {uid, div, urls, environment: {inputName, inputColor, urls: new Map()}};

        this.environments.set(uid, environment);

        this.activeEnvironment(uid);

        return environment;
    };

    this.createUrls = uid => {
        const template = document.getElementById('template_urls');
        const containerUrls = document.getElementById('container_urls');
        const urlsTemplate = document.importNode(template.content, true);

        const div = urlsTemplate.querySelectorAll('.urls')[0];
        const urlList = urlsTemplate.querySelectorAll('.urls-list')[0];

        div.querySelectorAll('button')[0].addEventListener('click', () => {
            this.createUrl(urlList, uid);
        });

        containerUrls.appendChild(urlsTemplate);

        return div;
    };

    this.createUrl = (urls, uid, { regexp = null, simplified = false, host = false} = {}) => {
        const template = document.getElementById('template_url');
        const urlTemplate = document.importNode(template.content, true);

        const div = urlTemplate.querySelectorAll('.url')[0];

        let [inputUrl, inputType, inputHost] = div.querySelectorAll('input');
        inputUrl.value = regexp;
        inputUrl.placeholder = simplified ? '*.mozilla.org' : '.*\\.mozilla\\.org';

        if (simplified) {
            inputType.checked = 'checked';
        }
        if (host) {
            inputHost.checked = 'checked';
        }
        const trashUrl = div.querySelectorAll('.url-trash')[0];

        const urlUid = uuidv4();
        this.environments.get(uid).environment.urls.set(urlUid, { inputUrl, inputType, inputHost });

        inputUrl.addEventListener('keyup', e => {
            this.save();
        });
        inputUrl.addEventListener('change', e => {
            this.save();
        });
        inputType.addEventListener('change', e => {
            inputUrl.placeholder = simplified ? '*.mozilla.org' : '.*\\.mozilla\\.org';
            this.save();
        });
        inputHost.addEventListener('change', e => {
            this.save();
        });
        trashUrl.addEventListener('click', () => {
            div.remove()
            this.environments.get(uid).environment.urls.delete(urlUid);
            this.save();
        });

        urls.appendChild(urlTemplate);
    };

    this.activeEnvironment = uidActive => {
        for (const [uid, environment] of this.environments) {
            if (uidActive === uid) {
                environment.urls.style.display = 'block';

                continue;
            }

            environment.urls.style.display = 'none';
        }
    };

    this.resetSort = () => {
        let tmpEnvironment = new Map();
        for (const environment of document.getElementById('environments').children) {
            tmpEnvironment.set(environment.id, this.environments.get(environment.id));
        }

        this.environments = tmpEnvironment;
    };

    this.save = () => {
        this.resetSort();
        const toolbar = document.getElementById('interfaceToolbar').checked;
        const frame = document.getElementById('interfaceFrame').checked;
        const tabSelected = document.getElementById('interfaceTabSelected').checked;
        const toolbarField = document.getElementById('interfaceToolbarField').checked;
        const tabLine = document.getElementById('interfaceTabLine').checked;
        let environments = [];
        for (const [uid, {environment}] of this.environments) {

            let urls = [];
            for (const [urlUid, { inputUrl, inputType, inputHost }] of environment.urls) {
                urls.push({
                    regexp: inputUrl.value,
                    simplified: inputType.checked ? false : true,
                    hostOnly: inputHost.checked ? true : false,
                });
            }

            let colors = {};
            if (toolbar) {
                colors['toolbar'] = environment.inputColor.value;
            }
            if (frame) {
                colors['frame'] = environment.inputColor.value;
            }
            if (tabSelected) {
                colors['tab_selected'] = environment.inputColor.value;
            }
            if (toolbarField) {
                colors['toolbar_field'] = environment.inputColor.value;
            }
            if (tabLine) {
                colors['tab_line'] = environment.inputColor.value;
            }

            environments.push({
                name: environment.inputName.value,
                color: environment.inputColor.value,
                colors: {
                    tab_background_ext: '#000',
                    ...colors
                },
                urls
            });
        }

        browser.storage.local.set({
            environments
        });
console.log(environments);
        testUrl(document.getElementById('test_url').value);
    };

    this.load = environments => {
        for (let i in environments) {
            let environment = this.createEvironment(environments[i].name, environments[i].color);

            for (let j in environments[i].urls) {
                this.createUrl(environment.urls.children[0], environment.uid, environments[i].urls[j]);
            }
        }
    };
};

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function testUrl(url) {
    browser.tabs.getCurrent().then(tab => {
        browser.runtime.sendMessage({action: 'test_url', windowId: tab.windowId, url});
    });
}

const environmentManager = new EnvironmentManager();

browser.storage.local.get('environments').then(({environments}) => environmentManager.load(environments));

document.getElementById('interfaceToolbar').addEventListener('change', () => {
    environmentManager.save();
})
document.getElementById('interfaceFrame').addEventListener('change', () => {
    environmentManager.save();
})
document.getElementById('interfaceTabSelected').addEventListener('change', () => {
    environmentManager.save();
})
document.getElementById('interfaceToolbarField').addEventListener('change', () => {
    environmentManager.save();
})
document.getElementById('interfaceTabLine').addEventListener('change', () => {
    environmentManager.save();
})