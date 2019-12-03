browser.runtime.onMessage.addListener(async message => {
    if (message.action === 'test_url') {
        setColor(message.windowId, await getColors(message.url));
    }
});

browser.runtime.onMessage.addListener(async message => {
  if (message.action === 'test_interface') {
    setColor(message.windowId, message.colors);
  }
});

browser.runtime.onMessage.addListener(async message => {
  if (message.action === 'export_environments') {
      console.log("ok");
    const storage = await browser.storage.sync.get('environments');
    console.log(storage);
    const environements = storage && storage.environments ? storage.environments : '';
    console.log(environements);
    const blob = new Blob([environements]);
    console.log(URL.createObjectURL(blob));
    var downloading = browser.downloads.download({
      url : URL.createObjectURL(blob),
      filename : browser.i18n.getMessage('defaultExportFileName'),
      conflictAction : 'uniquify'
    });

    downloading.then(id => console.log(id), error => console.log(error));
  }
});

function setColor(windowId, colors) {
    if (colors) {
        browser.theme.update(windowId, {
            images: {
                theme_frame: '',
            },
            colors: colors
        });

        return;
    }

    browser.theme.reset(windowId);
}

async function getColors(url) {
    const storage = await browser.storage.sync.get('environments');
    if (!storage || !storage.environments) {
      return;
    }
    const environments = storage.environments;
    for (let i in environments) {
        for (let j in environments[i].urls) {
            let regexp = environments[i].urls[j].simplified ? simplifyRegexp(environments[i].urls[j].regexp) : environments[i].urls[j].regexp;
            let urlTest = environments[i].urls[j].hostOnly ? simplifyUrl(url) : url;
            if (new RegExp(regexp).test(urlTest)) {
                return environments[i].colors;
            }
        }
    }
}

function simplifyRegexp(regexp) {
    return regexp.split("*").map(str => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")).join(".*");
}

function simplifyUrl(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
        return '';
    }

}
browser.windows.onFocusChanged.addListener(windowId => {
    browser.tabs.query({active: true, windowId: windowId}, async tabs => {
        if (tabs.length) {
            setColor(windowId, await getColors(tabs[0].url));
        }
    });
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active && changeInfo && changeInfo.url) {
        setColor(tab.windowId, await getColors(tab.url));
    }
});

browser.tabs.onActivated.addListener(async activeInfo => {
    if (activeInfo.tabId) {
      browser.tabs.get(activeInfo.tabId).then(async tab => setColor(tab.windowId, await getColors(tab.url)));
    }
});