document.getElementById('regExp').addEventListener('keyup', (e) => {
  save();
});
document.getElementById('color').addEventListener('change', (e) => {
  save();
});

function save() {
  browser.storage.sync.set({
    environment: {
      regExp: document.getElementById('regExp').value,
      color: document.getElementById('color').value
    }
  });
}

function init() {
  browser.storage.sync.get('environment').then(data => {
    if (data.environment && data.environment.regExp) {
      document.getElementById('regExp').value = data.environment.regExp;
    }

    if (data.environment && data.environment.color) {
      document.getElementById('color').value = data.environment.color;
    }
  });
}

init();
