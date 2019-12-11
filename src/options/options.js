document.getElementById('test_url').addEventListener('keyup', (e) => {
    testUrl(e.target.value);
});
document.getElementById('test_url').addEventListener('change', (e) => {
    testUrl(e.target.value);
});

document.getElementById('buttonImport').addEventListener('click', () => {
    const popin = document.getElementById('popin_info');
    popin.show();
    const upload = document.getElementById('import');
    upload.addEventListener('upload', e => {
        document.getElementById('upload_error').innerHTML = '';
        try {
            const env = JSON.parse(e.detail.text);
            if (!validateEnvironment(env)) {
                throw new Error('Json bad format');
            }

            popin.hide();
            importEnvironments(env);
        } catch (e) {
            document.getElementById('upload_error').innerHTML = e.message;
        }
    })

});
document.getElementById('buttonExport').addEventListener('click', () => {
    exportEnvironments();
});
document.getElementById('importUrl').validity = text => {
    try {
        const env = JSON.parse(text);
        if (!validateEnvironment(env)) {
            throw new Error('Json bad format');
        }

        return true;
    } catch (e) {
        return false;
    }
};
document.getElementById('importUrl').addEventListener('valid', e => {
    browser.storage.sync.set({importUrl: e.detail.value});

    if (e.detail.content) {
        document.getElementById('environments').value = e.detail.content;
save();
        return;
    }
});
document.getElementById('environments').addEventListener('change', () => {
    save();
});
document.getElementById('interface').addEventListener('change', () => {
    save();
});
document.getElementById('testInterface').addEventListener('click', () => {
  testInterface(formatColor(document.getElementById('interface').value, document.getElementById('testInterfaceColor').value));
});

function save() {
    browser.storage.sync.set({environments: getFormatedValues()});
}

function getImportUrl() {
    return document.getElementById('importUrl').url;
}

function getFormatedValues() {
    const interfaceValue = document.getElementById('interface').value;
    const environments = document.getElementById('environments').value;
    let formatedEnvironments = [];
    for (let i in environments) {
        formatedEnvironments.push({
            ...environments[i],
            colors: formatColor(interfaceValue, environments[i].color)
        });
    }

    return formatedEnvironments;
}

function formatColor(input, color) {
    let colors = {tab_background_ext: '#000'};
    for (let i in input) {
        if (input[i]) {
            colors[i] = color;
        }
    }

    return colors;
}

function validateEnvironment(env) {
    if (!env instanceof Array) {
        return false;
    }

    for (var i in env) {
        if (!env[i].hasOwnProperty('name') || !env[i].hasOwnProperty('color') || !env[i].hasOwnProperty('urls')) {
            return false;
        }
    }

    return true;
}

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

function testInterface(colors) {
  browser.tabs.getCurrent().then(tab => {
    browser.runtime.sendMessage({action: 'test_interface', windowId: tab.windowId, colors});
  });
}

function exportEnvironments() {
  browser.runtime.sendMessage({action: 'export_environments'});
}

function importEnvironments(env) {
    browser.storage.sync.set({environments: env});
}

browser.storage.sync.get('importUrl').then(data => {
    console.log(data.importUrl);
    if (data && data.importUrl) {
        document.getElementById('importUrl').value = data.importUrl;
    }
});

browser.storage.sync.get('environments').then(data => {
    console.log(data);
    if (data && data.environments) {
        document.getElementById('environments').value = data.environments;
    }

    if (data && data.environments && data.environments[0]) {
        document.getElementById('interface').value = data.environments[0].colors;
    }
});
