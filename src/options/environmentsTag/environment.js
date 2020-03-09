let environmentsTemplate = document.createElement('template');
environmentsTemplate.innerHTML = `
    <link rel="stylesheet" href="common.css">
    <link rel="stylesheet" href="environmentsTag/enviroments.css">
    <div class="column environments">
        <div id="environments"></div>
        <button><trans-nav>buttonAddEnvironment</trans-nav></button>
    </div>
    <div class="column">
        <div id="urls-container"></div>
    </div>
`;

customElements.define('environments-container', class extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }

  constructor() {
    super();

    this.environments = new Map();
    this.isMove = false;

    this.attachShadow({mode: 'open'}).appendChild(environmentsTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.querySelectorAll('button')[0].addEventListener('click', () => {
      this.activate(this.createEnvironment());
    });

    if (this.getAttribute('value')) {
      this.load(this.getAttribute('value'));
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'value') {
      return;
    }

    load(newValue);
  }

  reset() {
    for (const [environment] of this.environments) {
      this.delete(environment);
    }
  }

  load(value) {
    this.reset();

    if (!value) {
      return;
    }
    if (typeof value === 'string') {
      value = JSON.parse(value);
    }

    if (!value instanceof Array) {
      value = [];
    }

    for (let i in value) {
      this.createEnvironment({name: value[i].name, color: value[i].color}, value[i].urls);
    }

    if (this.environments.size > 0) {
      this.activate(this.environments.keys().next().value);
    }
  }

  createEnvironment(value = null, urlsValue = null) {
    const environment = document.createElement('environment-container');
    environment.value = value;
    const urls = document.createElement('urls-container');
    urls.value = urlsValue;
    this.environments.set(environment, urls);
    this.shadowRoot.getElementById('environments').appendChild(environment);
    this.shadowRoot.getElementById('urls-container').appendChild(urls);

    environment.addEventListener('moveStart', e => this.environmentMove(e));
    environment.addEventListener('change', () => this.change());
    environment.addEventListener('select', e => this.activate(e.target));
    environment.addEventListener('remove', () => {
      if (this.isMove) {
        return;
      }

      this.delete(environment);
      if (this.environments.size > 0) {
        this.activate(this.environments.keys().next().value);
      }
      this.change();
    });

    urls.addEventListener('change', e => this.change());

    return environment;
  }

  change() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  environmentMove(e) {
    this.isMove = true;
    e.detail.originalEvent.preventDefault();
    const environment = e.target;

    environment.style.zIndex = 100;
    let initY = e.detail.originalEvent.clientY;

    const mouseMove = e => {
      e.preventDefault();
      if ((!environment.previousElementSibling && initY > e.clientY) || (!environment.nextElementSibling && initY < e.clientY)) {
        environment.style.top = '0px';
        return;
      }

      environment.style.top = `${-(initY - e.clientY)}px`;

      if (environment.previousElementSibling && environment.previousElementSibling.offsetTop + environment.previousElementSibling.offsetHeight / 2 > environment.offsetTop) {
        initY -= environment.previousElementSibling.offsetHeight;
        environment.style.top = `${-(initY - e.clientY)}px`;
        environment.parentNode.insertBefore(environment, environment.previousElementSibling);
      }

      if (environment.nextElementSibling && environment.nextElementSibling.offsetTop - environment.nextElementSibling.offsetHeight / 2 < environment.offsetTop) {
        initY += environment.nextElementSibling.offsetHeight;
        environment.style.top = `${-(initY - e.clientY)}px`;
        environment.parentNode.insertBefore(environment, environment.nextElementSibling.nextElementSibling);
      }
    };

    const mouseUp = () => {
      environment.style.removeProperty('z-index');
      environment.style.removeProperty('top');
      document.removeEventListener('mouseup', mouseUp);
      document.removeEventListener('mousemove', mouseMove);
      this.isMove = false;
      this.resetSort();
      this.change();
    };

    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('mousemove', mouseMove);
  }

  delete(env) {
    this.environments.get(env).remove();
    this.environments.delete(env);
  }

  activate(env) {
    for (const [environment, urls] of this.environments) {
      if (env === environment) {
        environment.select();
        urls.select();

        continue;
      }

      environment.unselect();
      urls.unselect();
    }
  }

  resetSort() {
    let tmpEnvironment = new Map();
    for (const environment of this.shadowRoot.getElementById('environments').children) {
      tmpEnvironment.set(environment, this.environments.get(environment));
    }

    this.environments = tmpEnvironment;
  }

  get value() {
    let environments = [];
    // console.log(this.environments);
    for (const [environment, urls] of this.environments) {
      if (urls.value.length === 0) {
        continue;
      }

      environments.push({
        ...environment.value,
        urls: urls.value
      });
    }

    return environments;
  }

  set value(value) {
    this.load(value);
  }
});

let environmentTemplate = document.createElement('template');
environmentTemplate.innerHTML = `
    <link rel="stylesheet" href="common.css">
    <link rel="stylesheet" href="environmentsTag/enviroment.css">
    <div class="move">
        <img src="../../../resources/images/icons-menu_24.png">
    </div>
    <div class="name">
        <input type="text" />
    </div>
    <div class="color">
        <input type="color" />
    </div>
    <div class="edit">
        <img src="../../../resources/images/icons-modifier_24.png">
    </div>
    <div class="trash">
        <img src="../../../resources/images/icons-trash_24.png">
    </div>
`;

customElements.define('environment-container', class extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }

  constructor() {
    super();

    this.active = false;

    this.attachShadow({mode: 'open'}).appendChild(environmentTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    let [inputName, inputColor] = this.shadowRoot.querySelectorAll('input');
    let [move, edit, trash] = this.shadowRoot.querySelectorAll('img');

    inputName.addEventListener('keyup', () => this.dispatchEvent(new CustomEvent('change')));
    inputName.addEventListener('change', () => this.dispatchEvent(new CustomEvent('change')));
    inputColor.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('change'));
      if (this.active) {
        this.select();
      }
    });

    move.addEventListener('mousedown', e => this.dispatchEvent(new CustomEvent('moveStart', {detail: {originalEvent: e}})));

    edit.addEventListener('click', () => this.dispatchEvent(new CustomEvent('select')));

    trash.addEventListener('click', () => {
      if (confirm(browser.i18n.getMessage('alertDeleteEnvironment'))) {
        this.remove();
      }
    });

    if (this.getAttribute('value')) {
      this.load(this.getAttribute('value'));
    }
  }

  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('remove'));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'value') {
      return;
    }

    load(newValue);
  }

  select() {
    this.active = true;
    const color = this.shadowRoot.querySelectorAll('input')[1];
    this.style.boxShadow = '0px 0px 10px 1px black';
  }

  unselect() {
    this.active = false;
    this.style.boxShadow = '0px 0px 2px 1px grey';
  }

  load(value) {
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      value = JSON.parse(value);
    }

    let [inputName, inputColor] = this.shadowRoot.querySelectorAll('input');
    inputName.value = value.name !== undefined ? value.name : '';
    inputColor.value = value.color !== undefined ? value.color : '';
  }

  get value() {
    let [inputName, inputColor] = this.shadowRoot.querySelectorAll('input');

    return {name: inputName.value, color: inputColor.value};
  }

  set value(value) {
    this.load(value);
  }
});

let urlsTemplate = document.createElement('template');
urlsTemplate.innerHTML = `
    <link rel="stylesheet" href="common.css">
    <div class="urls">
        <div id="urls-list"></div>
        <button id="add_url"><trans-nav>buttonAddUrl</trans-nav></button>
    </div>
`;

customElements.define('urls-container', class extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }

  constructor() {
    super();

    this.urls = new Set();

    this.attachShadow({mode: 'open'}).appendChild(urlsTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.getElementById('add_url').addEventListener('click', () => this.createUrl());

    if (this.getAttribute('value')) {
      this.load(this.getAttribute('value'));
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'value') {
      return;
    }

    load(newValue);
  }

  reset() {
    for (const url of this.urls) {
      this.urls.delete(url);
    }
  }

  load(value) {
    this.reset();

    if (!value) {
      return;
    }
    if (typeof value === 'string') {
      value = JSON.parse(value);
    }

    if (!value instanceof Array) {
      value = [];
    }

    for (let i in value) {
      this.createUrl({regexp: value[i].regexp, simplified: value[i].simplified, hostOnly: value[i].hostOnly});
    }
  }

  createUrl(value = null) {
    const url = document.createElement('url-container');
    url.value = value;

    this.urls.add(url);
    this.shadowRoot.getElementById('urls-list').appendChild(url);

    url.addEventListener('change', () => this.dispatchEvent(new CustomEvent('change')));
    url.addEventListener('remove', () => {
      this.urls.delete(url);
      this.dispatchEvent(new CustomEvent('change'));
    });

    return url;
  }

  select() {
    this.style.display = 'block';
  }

  unselect() {
    this.style.display = 'none';
  }

  get value() {
    return Array.from([...this.urls]).filter(url => url.isValid()).map(url => url.value);
  }

  set value(value) {
    this.load(value);
  }
});

let urlTemplate = document.createElement('template');
urlTemplate.innerHTML = `
<link rel="stylesheet" href="common.css">
<link rel="stylesheet" href="environmentsTag/url.css">
<style type="text/css">
    .italic {
        font-style: italic;
    }
</style>
<div class="url-regexp">
    <input type="text" class="url-name-input" />
</div>
<div class="url-checkbox">
    <label class="i18n-label-url-type">
        <trans-nav class="checkbox-explanation">labelUrlType</trans-nav>
        <input type="checkbox" />
    </label>
</div>
<div class="url-checkbox checkbox-explanation">
    <label class="i18n-label-url-host">
        <trans-nav class="checkbox-explanation">labelUrlHost</trans-nav>
        <span class="italic"></span>
        <input type="checkbox"/>
    </label>
</div>
<div class="url-trash">
    <img src="../../../resources/images/icons-trash_24.png">
</div>
`;

customElements.define('url-container', class extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'}).appendChild(urlTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    [this.urlInput, this.typeInput, this.hostInput] = this.shadowRoot.querySelectorAll('input');
    [this.trash] = this.shadowRoot.querySelectorAll('img');

    this.urlInput.placeholder = this.getUrlPlaceHolder(true);

    this.urlInput.addEventListener('change', () => this.dispatchEvent(new CustomEvent('change')));
    this.urlInput.addEventListener('keyup', () => this.dispatchEvent(new CustomEvent('change')));
    this.typeInput.addEventListener('change', e => {
      this.urlInput.placeholder = this.getUrlPlaceHolder(!e.target.checked);
      this.dispatchEvent(new CustomEvent('change'));
    });
    this.hostInput.addEventListener('change', () => this.dispatchEvent(new CustomEvent('change')));
    this.trash.addEventListener('click', () => this.remove());
  }

  disconnectedCallback() {
    this.dispatchEvent(new CustomEvent('remove'));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== 'value') {
      return;
    }

    load(newValue);
  }

  load(value) {
    if (!value) {
      return;
    }

    if (typeof value === 'string') {
      value = JSON.parse(value);
    }

    let [urlInput, typeInput, hostInput] = this.shadowRoot.querySelectorAll('input');
    urlInput.value = value.regexp !== undefined ? value.regexp : '';
    const simplified = value.simplified !== undefined && value.simplified ? true : false;
    typeInput.checked = !simplified;
    urlInput.placeholder = this.getUrlPlaceHolder(simplified);
    hostInput.checked = value.hostOnly !== undefined && value.hostOnly ? true : false;
  }

  getUrlPlaceHolder(bool) {
    return bool ? '*.mozilla.org' : '.*\\.mozilla\\.org';
  }

  isValid() {
    const [urlInput, typeInput, hostInput] = this.shadowRoot.querySelectorAll('input');

    if (urlInput.value === '') {
      return false;
    }

    if (typeInput.checked) {
      try {
        new RegExp(urlInput);
      } catch (e) {
        return false;
      }
    }

    return true;
  }

  get value() {
    const [urlInput, typeInput, hostInput] = this.shadowRoot.querySelectorAll('input');

    if (!this.isValid) {
      return null;
    }

    return {
      regexp: urlInput.value,
      simplified: typeInput.checked ? false : true,
      hostOnly: hostInput.checked ? true : false
    };
  }

  set value(value) {
    this.load(value);
  }
});
