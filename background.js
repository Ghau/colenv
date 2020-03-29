function setColor(windowId, color) {
    if (color) {
        browser.theme.update(windowId, {
            images: {
                theme_frame: '',
            },
            colors: {
                toolbar_field: color
            }
        });

        return;
    }

    browser.theme.reset(windowId);
}

async function getColor(url) {
    const storage = await browser.storage.sync.get('environment');
    if (!storage.environment || !storage.environment.regExp || !storage.environment.color) {
      return;
    }
console.log(storage)
    if (new RegExp(storage.environment.regExp).test(url)) {
        return storage.environment.color;
    }
}

browser.windows.onFocusChanged.addListener(windowId => {
    browser.tabs.query({active: true, windowId: windowId}, async tabs => {
        if (tabs.length) {
            setColor(windowId, await getColor(tabs[0].url));
        }
    });
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active && changeInfo && changeInfo.url) {
        setColor(tab.windowId, await getColor(tab.url));
    }
});

browser.tabs.onActivated.addListener(async activeInfo => {
    if (activeInfo.tabId) {
      browser.tabs.get(activeInfo.tabId).then(async tab => setColor(tab.windowId, await getColor(tab.url)));
    }
});