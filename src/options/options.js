document.getElementById('test_url').addEventListener('keyup', (e) => {
    testUrl(e.target.value);
});
document.getElementById('test_url').addEventListener('change', (e) => {
    testUrl(e.target.value);
});

document.getElementById('buttonImport').addEventListener('click', () => {
  importEnvironments();
});
document.getElementById('buttonExport').addEventListener('click', () => {
    exportEnvironments();
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

function importEnvironments() {

}


browser.storage.sync.get('environments').then(data => {
    console.log(data.environments);
    if (data && data.environments) {
        document.getElementById('environments').value = data.environments;
    }

    if (data && data.environments && data.environments[0]) {
        document.getElementById('interface').value = data.environments[0].colors;
    }
});
