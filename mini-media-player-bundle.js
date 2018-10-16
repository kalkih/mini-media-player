const directives = new WeakMap();
const isDirective = (o) => typeof o === 'function' && directives.has(o);

const isCEPolyfill = window.customElements !== undefined &&
    window.customElements.polyfillWrapFlushCallback !== undefined;
const removeNodes = (container, startNode, endNode = null) => {
    let node = startNode;
    while (node !== endNode) {
        const n = node.nextSibling;
        container.removeChild(node);
        node = n;
    }
};

const noChange = {};

const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
const rewritesStyleAttribute = (() => {
    const el = document.createElement('div');
    el.setAttribute('style', '{{bad value}}');
    return el.getAttribute('style') !== '{{bad value}}';
})();
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        const _prepareTemplate = (template) => {
            const content = template.content;
            const walker = document.createTreeWalker(content, 133
                                          , null, false);
            let previousNode;
            let currentNode;
            while (walker.nextNode()) {
                index++;
                previousNode = currentNode;
                const node = currentNode = walker.currentNode;
                if (node.nodeType === 1                        ) {
                    if (node.hasAttributes()) {
                        const attributes = node.attributes;
                        let count = 0;
                        for (let i = 0; i < attributes.length; i++) {
                            if (attributes[i].value.indexOf(marker) >= 0) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            const stringForPart = result.strings[partIndex];
                            const name = lastAttributeNameRegex.exec(stringForPart)[2];
                            const attributeLookupName = (rewritesStyleAttribute && name === 'style') ?
                                'style$' :
                                /^[a-zA-Z-]*$/.test(name) ? name : name.toLowerCase();
                            const attributeValue = node.getAttribute(attributeLookupName);
                            const strings = attributeValue.split(markerRegex);
                            this.parts.push({ type: 'attribute', index, name, strings });
                            node.removeAttribute(attributeLookupName);
                            partIndex += strings.length - 1;
                        }
                    }
                    if (node.tagName === 'TEMPLATE') {
                        _prepareTemplate(node);
                    }
                }
                else if (node.nodeType === 3                     ) {
                    const nodeValue = node.nodeValue;
                    if (nodeValue.indexOf(marker) < 0) {
                        continue;
                    }
                    const parent = node.parentNode;
                    const strings = nodeValue.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    partIndex += lastIndex;
                    for (let i = 0; i < lastIndex; i++) {
                        parent.insertBefore((strings[i] === '') ? createMarker() :
                            document.createTextNode(strings[i]), node);
                        this.parts.push({ type: 'node', index: index++ });
                    }
                    parent.insertBefore(strings[lastIndex] === '' ?
                        createMarker() :
                        document.createTextNode(strings[lastIndex]), node);
                    nodesToRemove.push(node);
                }
                else if (node.nodeType === 8                        ) {
                    if (node.nodeValue === marker) {
                        const parent = node.parentNode;
                        const previousSibling = node.previousSibling;
                        if (previousSibling === null || previousSibling !== previousNode ||
                            previousSibling.nodeType !== Node.TEXT_NODE) {
                            parent.insertBefore(createMarker(), node);
                        }
                        else {
                            index--;
                        }
                        this.parts.push({ type: 'node', index: index++ });
                        nodesToRemove.push(node);
                        if (node.nextSibling === null) {
                            parent.insertBefore(createMarker(), node);
                        }
                        else {
                            index--;
                        }
                        currentNode = previousNode;
                        partIndex++;
                    }
                    else {
                        let i = -1;
                        while ((i = node.nodeValue.indexOf(marker, i + 1)) !== -1) {
                            this.parts.push({ type: 'node', index: -1 });
                        }
                    }
                }
            }
        };
        _prepareTemplate(element);
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const isTemplatePartActive = (part) => part.index !== -1;
const createMarker = () => document.createComment('');
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

class TemplateInstance {
    constructor(template, processor, options) {
        this._parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this._parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this._parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const parts = this.template.parts;
        let partIndex = 0;
        let nodeIndex = 0;
        const _prepareInstance = (fragment) => {
            const walker = document.createTreeWalker(fragment, 133                                             , null, false);
            let node = walker.nextNode();
            while (partIndex < parts.length && node !== null) {
                const part = parts[partIndex];
                if (!isTemplatePartActive(part)) {
                    this._parts.push(undefined);
                    partIndex++;
                }
                else if (nodeIndex === part.index) {
                    if (part.type === 'node') {
                        const part = this.processor.handleTextExpression(this.options);
                        part.insertAfterNode(node);
                        this._parts.push(part);
                    }
                    else {
                        this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                    }
                    partIndex++;
                }
                else {
                    nodeIndex++;
                    if (node.nodeName === 'TEMPLATE') {
                        _prepareInstance(node.content);
                    }
                    node = walker.nextNode();
                }
            }
        };
        _prepareInstance(fragment);
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}

class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isTextBinding = true;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            html += s;
            const close = s.lastIndexOf('>');
            isTextBinding =
                (close > -1 || isTextBinding) && s.indexOf('<', close + 1) === -1;
            if (!isTextBinding && rewritesStyleAttribute) {
                html = html.replace(lastAttributeNameRegex, (match, p1, p2, p3) => {
                    return (p2 === 'style') ? `${p1}style$${p3}` : match;
                });
            }
            html += isTextBinding ? nodeMarker : marker;
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }
}

const isPrimitive = (value) => (value === null ||
    !(typeof value === 'object' || typeof value === 'function'));
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = this.parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (v != null &&
                    (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
                else {
                    text += typeof v === 'string' ? v : String(v);
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
class AttributePart {
    constructor(comitter) {
        this.value = undefined;
        this.committer = comitter;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive$$1 = this.value;
            this.value = noChange;
            directive$$1(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
class NodePart {
    constructor(options) {
        this.value = undefined;
        this._pendingValue = undefined;
        this.options = options;
    }
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    appendIntoPart(part) {
        part._insert(this.startNode = createMarker());
        part._insert(this.endNode = createMarker());
    }
    insertAfterPart(ref) {
        ref._insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive$$1 = this._pendingValue;
            this._pendingValue = noChange;
            directive$$1(this);
        }
        const value = this._pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this._commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this._commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this._commitNode(value);
        }
        else if (Array.isArray(value) || value[Symbol.iterator]) {
            this._commitIterable(value);
        }
        else if (value.then !== undefined) {
            this._commitPromise(value);
        }
        else {
            this._commitText(value);
        }
    }
    _insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this._insert(value);
        this.value = value;
    }
    _commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        if (node === this.endNode.previousSibling &&
            node.nodeType === Node.TEXT_NODE) {
            node.textContent = value;
        }
        else {
            this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
        }
        this.value = value;
    }
    _commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value && this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this._commitNode(fragment);
            this.value = instance;
        }
    }
    _commitIterable(value) {
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            itemPart = itemParts[partIndex];
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    _commitPromise(value) {
        this.value = value;
        value.then((v) => {
            if (this.value === value) {
                this.setValue(v);
                this.commit();
            }
        });
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this._pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive$$1 = this._pendingValue;
            this._pendingValue = noChange;
            directive$$1(this);
        }
        if (this._pendingValue === noChange) {
            return;
        }
        const value = !!this._pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
        }
        this.value = value;
        this._pendingValue = noChange;
    }
}
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single =
            (strings.length === 2 && strings[0] === '' && strings[1] === '');
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
let eventOptionsSupported = false;
try {
    const options = {
        get capture() {
            eventOptionsSupported = true;
            return false;
        }
    };
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, options);
}
catch (_e) {
}
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this._pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive$$1 = this._pendingValue;
            this._pendingValue = noChange;
            directive$$1(this);
        }
        if (this._pendingValue === noChange) {
            return;
        }
        const newListener = this._pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this, this._options);
        }
        this._options = getOptions(newListener);
        if (shouldAddListener) {
            this.element.addEventListener(this.eventName, this, this._options);
        }
        this.value = newListener;
        this._pendingValue = noChange;
    }
    handleEvent(event) {
        const listener = (typeof this.value === 'function') ?
            this.value :
            (typeof this.value.handleEvent === 'function') ?
                this.value.handleEvent :
                () => null;
        listener.call(this.eventContext || this.element, event);
    }
}
const getOptions = (o) => o &&
    (eventOptionsSupported ?
        { capture: o.capture, passive: o.passive, once: o.once } :
        o.capture);

class DefaultTemplateProcessor {
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const comitter = new PropertyCommitter(element, name.slice(1), strings);
            return comitter.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const comitter = new AttributeCommitter(element, name, strings);
        return comitter.parts;
    }
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = new Map();
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.get(result.strings);
    if (template === undefined) {
        template = new Template(result, result.getTemplateElement());
        templateCache.set(result.strings, template);
    }
    return template;
}
const templateCaches = new Map();

const parts = new WeakMap();
const render = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};

const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

const walkerNodeFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT;
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
}
const countNodes = (node) => {
    let count = (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}

const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
}
else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected.` +
        `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and` +
        `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
const shadyTemplateFactory = (scopeName) => (result) => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = new Map();
        templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.get(result.strings);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new Template(result, element);
        templateCache.set(result.strings, template);
    }
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
const removeStylesFromLitTemplates = (scopeName) => {
    TEMPLATE_TYPES.forEach((type) => {
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.forEach((template) => {
                const { element: { content } } = template;
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s) => {
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
const prepareTemplateStyles = (renderedDOM, template, scopeName) => {
    shadyRenderSet.add(scopeName);
    const styles = renderedDOM.querySelectorAll('style');
    if (styles.length === 0) {
        return;
    }
    const condensedStyle = document.createElement('style');
    for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    removeStylesFromLitTemplates(scopeName);
    insertNodeIntoTemplate(template, condensedStyle, template.element.content.firstChild);
    window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
    if (window.ShadyCSS.nativeShadow) {
        const style = template.element.content.querySelector('style');
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    }
    else {
        template.element.content.insertBefore(condensedStyle, template.element.content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
const render$1 = (result, container, options) => {
    const scopeName = options.scopeName;
    const hasRendered = parts.has(container);
    render(result, container, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
    if (container instanceof ShadowRoot && compatibleShadyCSSVersion &&
        result instanceof TemplateResult) {
        if (!shadyRenderSet.has(scopeName)) {
            const part = parts.get(container);
            const instance = part.value;
            prepareTemplateStyles(container, instance.template, scopeName);
        }
        if (!hasRendered) {
            window.ShadyCSS.styleElement(container.host);
        }
    }
};

const fromBooleanAttribute = (value) => value !== null;
const toBooleanAttribute = (value) => value ? '' : null;
const notEqual = (value, old) => {
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    reflect: false,
    hasChanged: notEqual
};
const microtaskPromise = new Promise((resolve) => resolve(true));
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING = 1 << 3;
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this._updateState = 0;
        this._instanceProperties = undefined;
        this._updatePromise = microtaskPromise;
        this._changedProperties = new Map();
        this._reflectingProperties = undefined;
        this.initialize();
    }
    static get observedAttributes() {
        this._finalize();
        const attributes = [];
        for (const [p, v] of this._classProperties) {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        }
        return attributes;
    }
    static createProperty(name, options = defaultPropertyDeclaration) {
        if (!this.hasOwnProperty('_classProperties')) {
            this._classProperties = new Map();
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
        this._classProperties.set(name, options);
        if (this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        Object.defineProperty(this.prototype, name, {
            get() { return this[key]; },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this._requestPropertyUpdate(name, oldValue, options);
            },
            configurable: true,
            enumerable: true
        });
    }
    static _finalize() {
        if (this.hasOwnProperty('_finalized') && this._finalized) {
            return;
        }
        const superCtor = Object.getPrototypeOf(this);
        if (typeof superCtor._finalize === 'function') {
            superCtor._finalize();
        }
        this._finalized = true;
        this._attributeToPropertyMap = new Map();
        const props = this.properties;
        const propKeys = [
            ...Object.getOwnPropertyNames(props),
            ...(typeof Object.getOwnPropertySymbols === 'function')
                ? Object.getOwnPropertySymbols(props)
                : []
        ];
        for (const p of propKeys) {
            this.createProperty(p, props[p]);
        }
    }
    static _attributeNameForProperty(name, options) {
        const attribute = options !== undefined && options.attribute;
        return attribute === false
            ? undefined
            : (typeof attribute === 'string'
                ? attribute
                : (typeof name === 'string' ? name.toLowerCase()
                    : undefined));
    }
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    static _propertyValueFromAttribute(value, options) {
        const type = options && options.type;
        if (type === undefined) {
            return value;
        }
        const fromAttribute = type === Boolean
            ? fromBooleanAttribute
            : (typeof type === 'function' ? type : type.fromAttribute);
        return fromAttribute ? fromAttribute(value) : value;
    }
    static _propertyValueToAttribute(value, options) {
        if (options === undefined || options.reflect === undefined) {
            return;
        }
        const toAttribute = options.type === Boolean
            ? toBooleanAttribute
            : (options.type &&
                options.type.toAttribute ||
                String);
        return toAttribute(value);
    }
    initialize() {
        this.renderRoot = this.createRenderRoot();
        this._saveInstanceProperties();
    }
    _saveInstanceProperties() {
        for (const [p] of this.constructor
            ._classProperties) {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        }
    }
    _applyInstanceProperties() {
        for (const [p, v] of this._instanceProperties) {
            this[p] = v;
        }
        this._instanceProperties = undefined;
    }
    createRenderRoot() {
        return this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        if ((this._updateState & STATE_HAS_UPDATED)) {
            if (window.ShadyCSS !== undefined) {
                window.ShadyCSS.styleElement(this);
            }
        }
        else {
            this.requestUpdate();
        }
    }
    disconnectedCallback() { }
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attrValue = ctor._propertyValueToAttribute(value, options);
        if (attrValue !== undefined) {
            const attr = ctor._attributeNameForProperty(name, options);
            if (attr !== undefined) {
                this._updateState = this._updateState | STATE_IS_REFLECTING;
                if (attrValue === null) {
                    this.removeAttribute(attr);
                }
                else {
                    this.setAttribute(attr, attrValue);
                }
                this._updateState = this._updateState & ~STATE_IS_REFLECTING;
            }
        }
    }
    _attributeToProperty(name, value) {
        if (!(this._updateState & STATE_IS_REFLECTING)) {
            const ctor = this.constructor;
            const propName = ctor._attributeToPropertyMap.get(name);
            if (propName !== undefined) {
                const options = ctor._classProperties.get(propName);
                this[propName] =
                    ctor._propertyValueFromAttribute(value, options);
            }
        }
    }
    requestUpdate(name, oldValue) {
        if (name !== undefined) {
            const options = this.constructor
                ._classProperties.get(name) ||
                defaultPropertyDeclaration;
            return this._requestPropertyUpdate(name, oldValue, options);
        }
        return this._invalidate();
    }
    _requestPropertyUpdate(name, oldValue, options) {
        if (!this.constructor
            ._valueHasChanged(this[name], oldValue, options.hasChanged)) {
            return this.updateComplete;
        }
        if (!this._changedProperties.has(name)) {
            this._changedProperties.set(name, oldValue);
        }
        if (options.reflect === true) {
            if (this._reflectingProperties === undefined) {
                this._reflectingProperties = new Map();
            }
            this._reflectingProperties.set(name, options);
        }
        return this._invalidate();
    }
    async _invalidate() {
        if (!this._hasRequestedUpdate) {
            this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
            let resolver;
            const previousValidatePromise = this._updatePromise;
            this._updatePromise = new Promise((r) => resolver = r);
            await previousValidatePromise;
            this._validate();
            resolver(!this._hasRequestedUpdate);
        }
        return this.updateComplete;
    }
    get _hasRequestedUpdate() {
        return (this._updateState & STATE_UPDATE_REQUESTED);
    }
    _validate() {
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        if (this.shouldUpdate(this._changedProperties)) {
            const changedProperties = this._changedProperties;
            this.update(changedProperties);
            this._markUpdated();
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
        else {
            this._markUpdated();
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    get updateComplete() { return this._updatePromise; }
    shouldUpdate(_changedProperties) {
        return true;
    }
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined &&
            this._reflectingProperties.size > 0) {
            for (const [k, v] of this._reflectingProperties) {
                this._propertyToAttribute(k, this[k], v);
            }
            this._reflectingProperties = undefined;
        }
    }
    updated(_changedProperties) { }
    firstUpdated(_changedProperties) { }
}
UpdatingElement._attributeToPropertyMap = new Map();
UpdatingElement._finalized = true;
UpdatingElement._classProperties = new Map();
UpdatingElement.properties = {};

class LitElement extends UpdatingElement {
    update(changedProperties) {
        super.update(changedProperties);
        const templateResult = this.render();
        if (templateResult instanceof TemplateResult) {
            this.constructor
                .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
    }
    render() { }
}
LitElement.render = render$1;

const MEDIA_INFO = [
  { attr: 'media_title' },
  { attr: 'media_artist' },
  { attr: 'media_series_title' },
  { attr: 'media_season', prefix: 'S' },
  { attr: 'media_episode', prefix: 'E'}
];
const ICON = {
  'prev': 'mdi:skip-previous',
  'next': 'mdi:skip-next',
  'power': 'mdi:power',
  'volume_up': 'mdi:volume-high',
  'volume_down': 'mdi:volume-medium',
  'send': 'mdi:send',
  'dropdown': 'mdi:chevron-down',
  'mute': {
    true: 'mdi:volume-off',
    false: 'mdi:volume-high'
  },
  'playing': {
    true: 'mdi:pause',
    false: 'mdi:play'
  }
};
class MiniMediaPlayer extends LitElement {
  constructor() {
    super();
  }
  static get properties() {
    return {
      _hass: Object,
      config: Object,
      entity: Object,
      source: String,
      position: Number
    };
  }
  set hass(hass) {
    const entity = hass.states[this.config.entity];
    this._hass = hass;
    if (entity && this.entity !== entity)
      this.entity = entity;
  }
  setConfig(config) {
    if (!config.entity || config.entity.split('.')[0] !== 'media_player')
      throw new Error('Specify an entity from within the media_player domain.');
    const conf = Object.assign({
      artwork: 'default',
      artwork_border: false,
      background: false,
      group: false,
      hide_controls: false,
      hide_icon: false,
      hide_info: false,
      hide_mute: false,
      hide_power: false,
      hide_volume: false,
      icon: false,
      max_volume: 100,
      more_info: true,
      power_color: false,
      scroll_info: false,
      short_info: false,
      show_progress: false,
      show_source: false,
      show_tts: false,
      title: '',
      volume_stateless: false
    }, config);
    conf.max_volume = Number(conf.max_volume) || 100;
    conf.short_info = (conf.short_info || conf.scroll_info ? true : false);
    this.config = conf;
  }
  shouldUpdate(changedProps) {
    const change = changedProps.has('entity')
      || changedProps.has('source')
      || changedProps.has('position');
    if (change) {
      if (this.config.show_progress) this._checkProgress();
      return true;
    }
  }
  updated() {
    if (this.config.scroll_info) this._hasOverflow();
  }
  render({_hass, config, entity} = this) {
    if (!entity) return;
    const artwork = this._computeArtwork();
    const hide_controls = (config.hide_controls || config.hide_volume) || false;
    const short = (hide_controls || config.short_info);
    return html`
      ${this._style()}
      <ha-card ?group=${config.group}
        ?more-info=${config.more_info} ?has-title=${config.title !== ''}
        artwork=${config.artwork} ?has-artwork=${artwork} state=${entity.state}
        ?hide-icon=${config.hide_icon} ?hide-info=${this.config.hide_info}
        @click='${(e) => this._handleMore()}'>
        <div class='bg' ?bg=${config.background}
          style='background-image: url("${this._computeBackground()}")'>
        </div>
        <header>${config.title}</header>
        <div class='entity flex'>
          ${this._renderIcon()}
          <div class='entity__info' ?short=${short}>
            <div class='entity__info__name' ?has-info=${this._hasMediaInfo()}>
              ${this._computeName()}
            </div>
            ${this._renderMediaInfo(short)}
          </div>
          <div class='entity__control-row--top flex'>
            ${this._renderPowerStrip(entity)}
          </div>
        </div>
        ${this._isActive() && !hide_controls ? this._renderControlRow(entity) : html``}
        ${config.show_tts ? this._renderTts() : html``}
        ${config.show_progress ? this._renderProgress(entity) : ''}
      </ha-card>`;
  }
  _computeName() {
    return this.config.name || this.entity.attributes.friendly_name;
  }
  _computeBackground() {
    const artwork = this._computeArtwork();
    return artwork && this.config.artwork == "cover" ? artwork : this.config.background;
  }
  _computeArtwork() {
    return (this.entity.attributes.entity_picture
      && this.entity.attributes.entity_picture != '')
      && this.config.artwork !== 'none'
      ? this.entity.attributes.entity_picture
      : false;
  }
  _computeIcon() {
    return this.config.icon
      ? this.config.icon : this.entity.attributes.icon
      || 'mdi:cast';
  }
  _hasOverflow() {
    const element = this.shadowRoot.querySelector('.marquee');
    const status = element.clientWidth > (element.parentNode.clientWidth);
    element.parentNode.parentNode.setAttribute('scroll', status);
  }
  _renderIcon() {
    if (this.config.hide_icon) return;
    const artwork = this._computeArtwork();
    if (this._isActive() && artwork && this.config.artwork == 'default') {
      return html`
        <div class='entity__artwork' ?border=${this.config.artwork_border}
          style='background-image: url("${artwork}")'
          state=${this.entity.state}>
        </div>`;
    }
    return html`
      <div class='entity__icon'>
        <ha-icon icon='${this._computeIcon()}'></ha-icon>
      </div>
    `;
  }
  _renderPower() {
    return html`
      <paper-icon-button class='power-button'
        .icon=${ICON['power']}
        @click='${(e) => this._callService(e, "toggle")}'
        ?color=${this.config.power_color && this._isActive()}>
      </paper-icon-button>`;
  }
  _renderMediaInfo(short) {
    const items = MEDIA_INFO.map(item => {
      return Object.assign({
        info: this._getAttribute(item.attr),
        prefix: item.prefix || ''
      }, item);
    }).filter(item => item.info !== '');
    return html`
      <div class='entity__info__media' ?short=${short}>
        ${this.config.scroll_info ? html`
          <div>
            <div class='marquee'>
              ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
            </div>
          </div>` : '' }
          ${items.map(item => html`<span>${item.prefix + item.info}</span>`)}
      </div>`;
  }
  _renderProgress(entity) {
    const show = this._showProgress();
    return html`
      <paper-progress max=${entity.attributes.media_duration}
        value=${this.position} class='progress transiting ${!show ? "hidden" : ""}'>
      </paper-progress>`;
  }
  _renderPowerStrip(entity, {config} = this) {
    const active = this._isActive();
    if (entity.state == 'unavailable') {
      return html`
        <span class='unavailable'>
          ${this._getLabel('state.default.unavailable', 'Unavailable')}
        </span>`;
    }
    return html`
      <div class='select flex'>
        ${active && config.hide_controls && !config.hide_volume ? this._renderVolControls(entity) : html``}
        ${active && config.hide_volume && !config.hide_controls ? this._renderMediaControls(entity) : html``}
        <div class='flex right'>
          ${config.show_source !== false ? this._renderSource(entity) : html``}
          ${!config.hide_power ? this._renderPower(active) : html``}
        <div>
      </div>`;
  }
  _renderSource(entity) {
    const sources = entity.attributes['source_list'] || false;
    const source = entity.attributes['source'] || '';
    if (sources) {
      const selected = sources.indexOf(source);
      return html`
        <paper-menu-button class='source-menu' slot='dropdown-trigger'
          .horizontalAlign=${'right'} .verticalAlign=${'top'}
          .verticalOffset=${40} .noAnimations=${true}
          @click='${(e) => e.stopPropagation()}'>
          <paper-button class='source-menu__button' slot='dropdown-trigger'>
            ${this.config.show_source !== 'small' ? html`
            <span class='source-menu__source'>${this.source || source}</span>` : '' }
            <iron-icon .icon=${ICON['dropdown']}></iron-icon>
          </paper-button>
          <paper-listbox slot='dropdown-content' selected=${selected}
            @click='${(e) => this._handleSource(e)}'>
            ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
          </paper-listbox>
        </paper-menu-button>`;
    }
  }
  _renderControlRow(entity) {
    return html`
      <div class='control-row flex flex-wrap justify' ?wrap=${this.config.volume_stateless}>
        ${this._renderVolControls(entity)}
        ${this._renderMediaControls(entity)}
      </div>`;
  }
  _renderMediaControls(entity) {
    const playing = entity.state == 'playing';
    return html`
      <div class='flex'>
        <paper-icon-button .icon=${ICON["prev"]}
          @click='${(e) => this._callService(e, "media_previous_track")}'>
        </paper-icon-button>
        <paper-icon-button .icon=${ICON.playing[playing]}
          @click='${(e) => this._callService(e, "media_play_pause")}'>
        </paper-icon-button>
        <paper-icon-button .icon=${ICON["next"]}
          @click='${(e) => this._callService(e, "media_next_track")}'>
        </paper-icon-button>
      </div>`;
  }
  _renderVolControls(entity) {
    const muted = entity.attributes.is_volume_muted || false;
    if (this.config.volume_stateless) {
      return this._renderVolButtons(entity, muted);
    } else {
      return this._renderVolSlider(entity, muted);
    }
  }
  _renderMuteButton(muted) {
    if (!this.config.hide_mute)
      return html`
        <paper-icon-button .icon=${ICON.mute[muted]}
          @click='${(e) => this._callService(e, "volume_mute", { is_volume_muted: !muted })}'>
        </paper-icon-button>`;
  }
  _renderVolSlider(entity, muted = false) {
    const volumeSliderValue = entity.attributes.volume_level * 100;
    return html`
      <div class='vol-control flex'>
        <div>
          ${this._renderMuteButton(muted)}
        </div>
        <paper-slider ?disabled=${muted}
          @change='${(e) => this._handleVolumeChange(e)}'
          @click='${(e) => e.stopPropagation()}'
          min='0' max=${this.config.max_volume} value=${volumeSliderValue}
          ignore-bar-touch pin>
        </paper-slider>
      </div>`;
  }
  _renderVolButtons(entity, muted = false) {
    return html`
      <div class='flex'>
        ${this._renderMuteButton(muted)}
        <paper-icon-button .icon=${ICON.volume_down}
          @click='${(e) => this._callService(e, "volume_down")}'>
        </paper-icon-button>
        <paper-icon-button .icon=${ICON.volume_up}
          @click='${(e) => this._callService(e, "volume_up")}'>
        </paper-icon-button>
      </div>`;
  }
  _renderTts() {
    return html`
      <div class='tts flex justify'>
        <paper-input class='tts__input' no-label-float
          placeholder=${this._getLabel('ui.card.media_player.text_to_speak', 'Say')}...
          @click='${(e) => e.stopPropagation()}'>
        </paper-input>
        <div>
          <paper-button @click='${(e) => this._handleTts(e)}'>
            SEND
          </paper-button>
        </div>
      </div>`;
  }
  _callService(e, service, options, component = 'media_player') {
    e.stopPropagation();
    options = (options === null || options === undefined) ? {} : options;
    options.entity_id = options.entity_id || this.config.entity;
    this._hass.callService(component, service, options);
  }
  _handleVolumeChange(e) {
    e.stopPropagation();
    const volPercentage = parseFloat(e.target.value);
    const vol = volPercentage > 0 ? volPercentage / 100 : 0;
    this._callService(e, 'volume_set', { volume_level: vol });
  }
  _handleTts(e) {
    e.stopPropagation();
    const input = this.shadowRoot.querySelector('#tts paper-input');
    const options = { message: input.value };
    this._callService(e, this.config.show_tts + '_say' , options, 'tts');
    input.value = '';
  }
  _handleMore({config} = this) {
    if(config.more_info)
      this._fire('hass-more-info', { entityId: config.entity });
  }
  _handleSource(e) {
    e.stopPropagation();
    const source = e.target.getAttribute('value');
    const options = { 'source': source };
    this._callService(e, 'select_source' , options);
    this.source = source;
  }
  _fire(type, detail, options) {
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    this.dispatchEvent(e);
    return e;
  }
  async _checkProgress() {
    if (this._isPlaying() && this._showProgress()) {
      if (!this._positionTracker) {
        this._positionTracker = setInterval(() => this.position = this._currentProgress(), 1000);
      }
    } else if (this._positionTracker) {
      clearInterval(this._positionTracker);
      this._positionTracker = null;
    }
    if (this._showProgress) this.position = this._currentProgress();
  }
  _showProgress() {
    return (
      (this._isPlaying() || this._isPaused())
      && 'media_duration' in this.entity.attributes
      && 'media_position' in this.entity.attributes
      && 'media_position_updated_at' in this.entity.attributes);
  }
  _currentProgress() {
    let progress = this.entity.attributes.media_position;
    if (this._isPlaying()) {
      progress += (Date.now() - new Date(this.entity.attributes.media_position_updated_at).getTime()) / 1000.0;
    }
    return progress;
  }
  _isPaused() {
    return this.entity.state === 'paused';
  }
  _isPlaying() {
    return this.entity.state === 'playing';
  }
  _isActive() {
    return (this.entity.state !== 'off' && this.entity.state !== 'unavailable') || false;
  }
  _hasMediaInfo() {
    const items = MEDIA_INFO.map(item => {
      return this._getAttribute(item.attr);
    }).filter(item => item !== '');
    return items.length == 0 ? false : true;
  }
  _getAttribute(attr, {entity} = this) {
    return entity.attributes[attr] || '';
  }
  _getLabel(label, fallback = 'unknown') {
    const lang = this._hass.selectedLanguage || this._hass.language;
    const resources = this._hass.resources[lang];
    return (resources && resources[label] ? resources[label] : fallback);
  }
  _style() {
    return html`
      <style>
        div:empty { display: none; }
        ha-card {
          padding: 16px;
          position: relative;
        }
        header {
          display: none;
        }
        ha-card[has-title] header {
          display: block;
          font-size: var(--paper-font-headline_-_font-size);
          font-weight: var(--paper-font-headline_-_font-weight);
          letter-spacing: var(--paper-font-headline_-_letter-spacing);
          line-height: var(--paper-font-headline_-_line-height);
          padding: 24px 16px 16px;
          position: relative;
        }
        ha-card[has-title] {
          padding-top: 0px;
        }
        ha-card[group] {
          background: none;
          box-shadow: none;
          padding: 0;
        }
        ha-card[group][artwork='cover'][has-artwork] .entity__info {
          margin-top: 10px;
        }
        ha-card[more-info] {
          cursor: pointer;
        }
        ha-card[artwork='cover'][has-artwork] .bg,
        .bg[bg] {
          opacity: 1;
          transition: opacity .5s ease-in;
        }
        ha-card[artwork='cover'][has-artwork] paper-icon-button,
        ha-card[artwork='cover'][has-artwork] ha-icon,
        ha-card[artwork='cover'][has-artwork] .entity__info,
        ha-card[artwork='cover'][has-artwork] .entity__info__name,
        ha-card[artwork='cover'][has-artwork] paper-button,
        ha-card[artwork='cover'][has-artwork] header,
        ha-card[artwork='cover'][has-artwork] .select span,
        ha-card[artwork='cover'][has-artwork] .source-menu__button[focused] iron-icon {
          color: #FFFFFF;
        }
        ha-card[artwork='cover'][has-artwork] paper-input {
          --paper-input-container-color: #FFFFFF;
          --paper-input-container-input-color: #FFFFFF;
        }
        .bg {
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
          opacity: 0;
          transition: opacity .5s ease-in;
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
        }
        ha-card[artwork='cover'][has-artwork] .bg:before {
          background: #000000;
          content: '';
          opacity: .5;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
        }
        .flex {
          display: flex;
          display: -ms-flexbox;
          display: -webkit-flex;
          flex-direction: row;
        }
        .flex-wrap[wrap] {
          flex-wrap: wrap;
        }
        .justify {
          -webkit-justify-content: space-between;
          justify-content: space-between;
        }
        .hidden {
          display: none;
        }
        .entity__info {
          margin-left: 8px;
          display: block;
          position: relative;
        }
        .control-row, .tts {
          margin-left: 56px;
          position: relative;
          transition: margin-left 0.25s;
        }
        ha-card[hide-icon] .control-row,
        ha-card[hide-icon] .tts,
        ha-card[hide-info] .control-row,
        ha-card[hide-info] .tts {
          margin-left: 0;
        }
        .entity__info[short] {
          max-height: 40px;
          overflow: hidden;
        }
        .entity__icon {
          color: var(--paper-item-icon-color, #44739e);
        }
        .entity__artwork, .entity__icon {
          background-position: center center;
          background-repeat: no-repeat;
          background-size: cover;
          border-radius: 100%;
          height: 40px;
          line-height: 40px;
          margin-right: 8px;
          min-width: 40px;
          position: relative;
          text-align: center;
          width: 40px;
        }
        .entity__artwork[border] {
          border: 2px solid var(--primary-text-color);
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
        .entity__artwork[state='playing'] {
          border-color: var(--accent-color);
        }
        .entity__info__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity__info__name[has-info] {
          line-height: 20px;
        }
        .entity__info__name, .entity__control-row--top {
          line-height: 40px;
        }
        .entity__info__name,
        paper-icon-button,
        paper-button,
        .select span {
          color: var(--primary-text-color);
          position: relative;
        }
        .entity__info__media {
          color: var(--secondary-text-color);
        }
        .entity__info__media[short] {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity__info__media[scroll='true'] > span {
          visibility: hidden;
        }
        .entity__info__media[scroll='true'] > div {
          animation: move 10s linear infinite;
          overflow: visible;
        }
        .entity__info__media[scroll='true'] .marquee {
          animation: slide 10s linear infinite;
          visibility: visible;
        }
        .entity__info__media[scroll='true'] {
          text-overflow: clip;
          mask-image: linear-gradient(to right, transparent 0%, var(--secondary-text-color) 5%, var(--secondary-text-color) 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, var(--secondary-text-color) 5%, var(--secondary-text-color) 95%, transparent 100%);
        }
        .marquee {
          visibility: hidden;
          position: absolute;
          white-space: nowrap;
        }
        ha-card[artwork='cover'][has-artwork] .entity__info__media,
        .power-button[color] {
          color: var(--accent-color) !important;
          transition: color .25s ease-in-out;
        }
        .entity__info__media span:before {
          content: ' - ';
        }
        .entity__info__media span:first-of-type:before {
          content: '';
        }
        .entity__info__media span:empty,
        .source-menu span:empty {
          display: none;
        }
        .tts__input {
          cursor: text;
          flex: 1;
          -webkit-flex: 1;
        }
        .entity__control-row--top {
          padding-left: 5px;
        }
        .select .vol-control {
          max-width: 200px;
        }
        .entity__control-row--top,
        .select {
          justify-content: flex-end;
          margin-right: 0;
          margin-left: auto;
          width: auto;
        }
        .entity__control-row--top paper-slider {
          flex: 1;
        }
        .entity__control-row--top paper-slider {
          height: 40px;
        }
        .vol-control {
          flex: 1;
          min-width: 120px;
          max-height: 40px;
        }
        paper-slider {
          max-width: 400px;
          min-width: 100px;
          width: 100%;
        }
        paper-input {
          opacity: .75;
          --paper-input-container-color: var(--primary-text-color);
          --paper-input-container-focus-color: var(--accent-color);
        }
        paper-input[focused] {
          opacity: 1;
        }
        .source-menu {
          padding: 0;
          height: 40px;
        }
        .source-menu[focused] iron-icon {
          transform: rotate(180deg);
            color: var(--accent-color);
        }
        .source-menu__button[focused] iron-icon {
          color: var(--primary-text-color);
          transform: rotate(0deg);
        }
        .source-menu__button {
          height: 40px;
          line-height: 20px;
          margin: 0;
          min-width: 0;
          text-transform: initial;
        }
        .source-menu__source {
          display: block;
          max-width: 60px;
          overflow: hidden;
          position: relative;
          text-overflow: ellipsis;
          width: auto;
          white-space: nowrap;
        }
        paper-progress {
          bottom: 0;
          height: var(--paper-progress-height, 4px);
          left: 0;
          position: absolute;
          right: 0;
          width: 100%;
          --paper-progress-active-color: var(--accent-color);
          --paper-progress-container-color: rgba(150,150,150,0.25);
          --paper-progress-transition-duration: 1s;
          --paper-progress-transition-timing-function: linear;
          --paper-progress-transition-delay: 0s;
        }
        ha-card[state='paused'] paper-progress {
          --paper-progress-active-color: var(--disabled-text-color, rgba(150,150,150,.5));
        }
        ha-card[group] paper-progress {
          position: relative
        }
        .unavailable {
          white-space: nowrap;
        }
        ha-card[hide-info] .entity__info,
        ha-card[hide-info] .entity__artwork,
        ha-card[hide-info] .entity__icon {
          display: none;
        }
        ha-card[hide-info] .entity__control-row--top,
        ha-card[hide-info] .select {
          justify-content: space-between;
        }
        ha-card[hide-info] .right {
          justify-content: flex-end;
          margin-left: auto;
        }
        ha-card[hide-info] .entity__control-row--top,
        .entity__control-row--top,
        .select,
        ha-card[hide-info] .select {
          flex: 1
        }
        @keyframes slide {
          from {transform: translate(0, 0); }
          to {transform: translate(-100%, 0); }
        }
        @keyframes move {
          from {transform: translate(100%, 0); }
          to {transform: translate(0, 0); }
        }
        @media screen and (max-width: 325px) {
          .control-row, .tts {
            margin-left: 0;
          }
          .source-menu__source {
            display: none;
          }
        }
      </style>
    `;
  }
  getCardSize() {
    return 1;
  }
}
customElements.define('mini-media-player', MiniMediaPlayer);
