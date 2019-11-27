browser.runtime.onMessage.addListener(async message => {
    if (message.action === 'test_url') {
        setColor(message.windowId, await getColors(message.url));
    }
});

function setColor(windowId, colors) {
    console.log(colors);
    if (colors) {
        browser.theme.update(windowId, {
            images: {
                theme_frame: '',
            },
            // colors: {
            //     toolbar: color,
            //     frame: color,
            //     tab_background_ext: '#000',
            // }
            colors: colors
        });

        return;
    }

    // browser.theme.reset(windowId);
}

async function getColors(url) {
    const { environments } = await browser.storage.local.get('environments');
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
    return new URL(url).hostname;
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
    browser.tabs.get(activeInfo.tabId).then(async tab => setColor(tab.windowId, await getColors(tab.url)));
});