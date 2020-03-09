themeSupported = browser.theme ? true : false;
browser.runtime.onMessage.addListener(async message => {
    console.log(message)
    if (message.action === 'test_url') {
        setColor(message.windowId, await getColors(message.url));
    }
});

browser.runtime.onMessage.addListener(async message => {
  if (message.action === 'test_interface') {
    setColor(message.windowId, message);
  }
});

browser.runtime.onMessage.addListener(async message => {
  if (message.action === 'export_environments') {
    const storage = await browser.storage.sync.get('environments');
    const environements = storage && storage.environments ? storage.environments : '';

    const urlFile = URL.createObjectURL(new Blob([JSON.stringify(environements)]));
    const downloading = browser.downloads.download({
      url: urlFile,
      filename: browser.i18n.getMessage('defaultExportFileName'),
      conflictAction: 'uniquify',
      saveAs: true
    });

    browser.downloads.onChanged.addListener(downloadItem => {
        if (downloadItem.state.current === 'complete') {
          URL.revokeObjectURL(urlFile);
        }
    });
  }
});

browser.runtime.onMessage.addListener(async message => {
  if (message.action === 'import_environments') {

  }
});

function setColor(windowId, environment) {
    if (environment && environment.colors) {
        browser.theme.update(windowId, {
            images: {
                theme_frame: '',
            },
            colors: environment.colors
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
                return environments[i];
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
browser.windows.onFocusChanged.addListener(async windowId => {
    const tabs = await browser.tabs.query({active: true, windowId: windowId});
    if (tabs.length) {
        if (themeSupported) {
            setColor(windowId, await getColors(tabs[0].url));
        }
    }
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active && changeInfo && changeInfo.url) {
        if (themeSupported) {
            setColor(tab.windowId, await getColors(tab.url).colors);
        }
    }
});

browser.tabs.onActivated.addListener(async activeInfo => {
    if (activeInfo.tabId) {
      browser.tabs.get(activeInfo.tabId).then(async tab => {
          if (themeSupported) {
              setColor(tab.windowId, await getColors(tab.url).colors);
          }
      });
    }
});

browser.runtime.onConnect.addListener(async port => {
    const environment = await getColors(port.sender.url)
    if (environment && environment.banner) {
        port.postMessage({name: environment.name, banner: environment.banner});
    }

});