/*! fingrid-card 1.0.0 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e5;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e5) => {
  const o6 = 1 === t3.length ? t3[0] : e5.reduce((e6, s4, o7) => e6 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o7 + 1], t3[0]);
  return new n(o6, t3, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e5 = "";
  for (const s4 of t4.cssRules) e5 += s4.cssText;
  return r(e5);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e5 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t3);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t4 = i5.getPropertyOptions(e5), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t4.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e5 = false, h3) {
    if (void 0 !== t3) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t3]), i5 ?? (i5 = r6.getPropertyOptions(t3)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r6._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t3) && (this._$Ej.set(t3, r6 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r6) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e5 && this._$Em !== t3 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e5 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t4) => this._$ET(t4, this[t4]))), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t4 of r6.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t4).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t4));
        if (y2.test(r6.tagName)) {
          const t4 = r6.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t4[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r6.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t3), h3._$AT(t3, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t3) : 6 === r6.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e5 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t4 = new R(e5, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t3) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o6 = !a2(t3) || t3 !== this._$AH && t3 !== E, o6 && (this._$AH = t3);
    else {
      const e6 = t3;
      let n5, r6;
      for (t3 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t3 = A : t3 !== A && (t3 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e5, h3) {
    super(t3, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t3, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t3 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t3.firstChild), t3;
  }
  update(t3) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t3 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t3 = Object.create(t3)).wrapped = true), s4.set(r6.name, t3), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t3, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t3, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t3, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t3) {
  return (e5, o6) => "object" == typeof o6 ? r4(t3, e5, o6) : ((t4, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t4), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t3, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "Fingrid",
    description: "Finland's electricity production, consumption, cross-border flows and grid state, from the Fingrid integration",
    invalid_configuration: "Invalid configuration",
    invalid_height: "Invalid height. height and max_height must be positive numbers of pixels, and height_mode auto, fixed or max.",
    invalid_row_step: "Invalid rounding. row_step must be full or half.",
    not_found: "The Fingrid integration isn't set up"
  },
  status: {
    power_system_state: "Power system state",
    shortage_status: "Electricity shortage"
  },
  totals: {
    production: "Production",
    consumption: "Consumption",
    net_export: "Net export"
  },
  map: {
    label: "Finland's cross-border electricity flows"
  },
  borders: {
    norway: "Norway",
    northern_sweden: "Northern Sweden",
    central_sweden: "Central Sweden",
    estonia: "Estonia",
    aland_sweden: "\xC5land\u2013Sweden",
    export: "export",
    import: "import"
  },
  mix: {
    nuclear: "Nuclear",
    hydro: "Hydro",
    wind: "Wind",
    district_heating_cogeneration: "District heating",
    industrial_cogeneration: "Industry",
    reserve_and_small_scale: "Other"
  },
  forecast: {
    wind_forecast: "Wind",
    solar_forecast: "Solar",
    consumption_forecast: "Consumption",
    unavailable: "The forecast isn't available"
  },
  details: {
    emission: "Emission factor {value} gCO\u2082/kWh",
    non_fossil: "Non-fossil {value} %",
    batteries: "Batteries charging {charging} MW, discharging {discharging} MW"
  },
  editor: {
    show_status: "Grid state and electricity shortage",
    show_totals: "Production, consumption and net export",
    show_map: "Map of the cross-border flows",
    show_borders: "Cross-border flows as a list",
    show_aland: "\xC5land\u2013Sweden",
    show_aland_helper: "\xC5land belongs to the Swedish bidding zone SE3, so this flow isn't across Finland's border. Shown while its sensor is enabled.",
    show_mix: "Production by type",
    show_forecast: "Forecasts for three days",
    show_details: "Emission factor, non-fossil share and batteries",
    row_step: "Rounding in a sections view",
    row_step_helper: "With automatic row height, the card's height is rounded up to whole rows, or to half rows to save space.",
    row_step_full: "Whole rows",
    row_step_half: "Half rows"
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "Fingrid",
    description: "Suomen s\xE4hk\xF6n tuotanto, kulutus, rajasiirrot ja s\xE4hk\xF6j\xE4rjestelm\xE4n tila Fingrid-integraatiosta",
    invalid_configuration: "Virheelliset asetukset",
    invalid_height: "Virheellinen korkeus. Korkeuksien (height ja max_height) on oltava positiivisia lukuja pikselein\xE4, ja korkeustilan (height_mode) auto, fixed tai max.",
    invalid_row_step: "Virheellinen py\xF6ristys. Py\xF6ristyksen (row_step) on oltava full tai half.",
    not_found: "Fingrid-integraatiota ei ole lis\xE4tty"
  },
  status: {
    power_system_state: "S\xE4hk\xF6j\xE4rjestelm\xE4n k\xE4ytt\xF6tilanne",
    shortage_status: "S\xE4hk\xF6pula"
  },
  totals: {
    production: "Tuotanto",
    consumption: "Kulutus",
    net_export: "Nettovienti"
  },
  map: {
    label: "Suomen rajasiirrot"
  },
  borders: {
    norway: "Norja",
    northern_sweden: "Pohjois-Ruotsi",
    central_sweden: "Keski-Ruotsi",
    estonia: "Viro",
    aland_sweden: "Ahvenanmaa\u2013Ruotsi",
    export: "vienti",
    import: "tuonti"
  },
  mix: {
    nuclear: "Ydinvoima",
    hydro: "Vesivoima",
    wind: "Tuulivoima",
    district_heating_cogeneration: "Kaukol\xE4mp\xF6",
    industrial_cogeneration: "Teollisuus",
    reserve_and_small_scale: "Muu"
  },
  forecast: {
    wind_forecast: "Tuuli",
    solar_forecast: "Aurinko",
    consumption_forecast: "Kulutus",
    unavailable: "Ennuste ei ole saatavilla"
  },
  details: {
    emission: "P\xE4\xE4st\xF6kerroin {value} gCO\u2082/kWh",
    non_fossil: "Fossiiliton {value} %",
    batteries: "Akkujen lataus {charging} MW, purku {discharging} MW"
  },
  editor: {
    show_status: "K\xE4ytt\xF6tilanne ja s\xE4hk\xF6pula",
    show_totals: "Tuotanto, kulutus ja nettovienti",
    show_map: "Rajasiirtojen kartta",
    show_borders: "Rajasiirrot listana",
    show_aland: "Ahvenanmaa\u2013Ruotsi",
    show_aland_helper: "Ahvenanmaa kuuluu Ruotsin tarjousalueeseen SE3, joten t\xE4m\xE4 siirto ei kulje Suomen rajan yli. N\xE4kyy, kun sen anturi on k\xE4yt\xF6ss\xE4.",
    show_mix: "Tuotanto lajeittain",
    show_forecast: "Ennusteet kolmeksi p\xE4iv\xE4ksi",
    show_details: "P\xE4\xE4st\xF6kerroin, fossiiliton osuus ja akut",
    row_step: "Py\xF6ristys osioihin jaetussa n\xE4kym\xE4ss\xE4",
    row_step_helper: "Automaattisella rivikorkeudella kortin korkeus py\xF6ristet\xE4\xE4n yl\xF6sp\xE4in kokonaisiin riveihin, tai tilan s\xE4\xE4st\xE4miseksi puolikkaisiin riveihin.",
    row_step_full: "Kokonaisiin riveihin",
    row_step_half: "Puolikkaisiin riveihin"
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  const code = (language ?? "en").split(/[-_]/)[0].toLowerCase();
  return read(LANGUAGES[code], key) ?? read(LANGUAGES.en, key) ?? key;
}
function read(table, key) {
  let value2 = table;
  for (const part of key.split(".")) {
    if (value2 === null || typeof value2 !== "object") {
      return void 0;
    }
    value2 = value2[part];
  }
  return typeof value2 === "string" ? value2 : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/height.ts
var HEIGHT_MODES = ["auto", "fixed", "max"];
var pixels = (value2) => value2 == null || typeof value2 === "number" && Number.isFinite(value2) && value2 > 0;
function validHeight(config) {
  return (config.height_mode == null || HEIGHT_MODES.includes(config.height_mode)) && pixels(config.height) && pixels(config.max_height);
}
function heightMode(config) {
  return config.height_mode ?? (config.height ? "fixed" : config.max_height ? "max" : "auto");
}
var ROW_HEIGHT = 56;
var ROW_GAP = 8;
function heightStyle(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout === "grid" && typeof rows === "number") {
    return "height: 100%";
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return `height: ${Math.max(config.height, minimum)}px`;
  }
  return mode === "max" && config.max_height ? `max-height: ${Math.max(config.max_height, minimum)}px` : "";
}
function gridMinRows(minimum) {
  return Math.max(1, Math.ceil((minimum + ROW_GAP) / (ROW_HEIGHT + ROW_GAP)));
}
function heightCardSize(config, content, minimum = 0) {
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return Math.max(1, Math.round(Math.max(config.height, minimum) / 50));
  }
  return mode === "max" && config.max_height ? Math.max(1, Math.min(content, Math.round(Math.max(config.max_height, minimum) / 50))) : content;
}

// src/rows.ts
var ROW_STEPS = ["full", "half"];
var ROW_PX = 64;
var ROW_GAP_PX = 8;
function validRowStep(config) {
  return config.row_step === void 0 || config.row_step === null || ROW_STEPS.includes(config.row_step);
}
var step = (config) => config.row_step === "half" ? ROW_PX / 2 : ROW_PX;
var SLACK_PX = 0.01;
function drawnScale(card) {
  const layout = Number.parseFloat(getComputedStyle(card).width) || 0;
  const drawn = card.getBoundingClientRect().width;
  return layout > 0 && drawn > 0 ? drawn / layout : 1;
}
function filledHeight(content, config, limit = Infinity) {
  return Math.min(Math.max(1, Math.ceil((content - SLACK_PX + ROW_GAP_PX) / step(config))) * step(config) - ROW_GAP_PX, limit);
}
function fillLimit(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout !== "grid" || typeof rows === "number") {
    return 0;
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return 0;
  }
  if (mode !== "max" || !config.max_height) {
    return Infinity;
  }
  const down = Math.floor((config.max_height + ROW_GAP_PX) / step(config)) * step(config) - ROW_GAP_PX;
  return Math.max(down, filledHeight(minimum, config));
}
function filledStyle(config, layout, minimum, filled) {
  const limit = fillLimit(config, layout, minimum);
  if (!limit) {
    return heightStyle(config, layout, minimum);
  }
  return [limit < Infinity && `max-height: ${limit}px`, filled && `min-height: ${filled}px`].filter(Boolean).join("; ");
}
function rowStepSchema(config, text) {
  if (heightMode(config) === "fixed" && config.height) {
    return [];
  }
  return [
    {
      name: "row_step",
      selector: {
        select: { mode: "dropdown", options: ROW_STEPS.map((value2) => ({ value: value2, label: text(`editor.row_step_${value2}`) })) }
      }
    }
  ];
}
function rowStepData(config) {
  return { ...config, row_step: config.row_step ?? "full" };
}
function tidyRowStep(config) {
  const tidied = { ...config };
  if (tidied.row_step !== "half" || heightMode(tidied) === "fixed" && tidied.height) {
    delete tidied.row_step;
  }
  return tidied;
}

// src/types.ts
var DEFAULTS = {
  show_status: true,
  show_totals: true,
  show_map: true,
  show_borders: false,
  show_aland: true,
  show_mix: true,
  show_forecast: true,
  show_details: true
};
function shows(config, part) {
  const value2 = config?.[part];
  return typeof value2 === "boolean" ? value2 : DEFAULTS[part];
}

// src/editor.ts
function schema(config, text) {
  const aland = shows(config, "show_map") || shows(config, "show_borders");
  return [
    { name: "show_status", selector: { boolean: {} } },
    { name: "show_totals", selector: { boolean: {} } },
    { name: "show_map", selector: { boolean: {} } },
    { name: "show_borders", selector: { boolean: {} } },
    ...aland ? [{ name: "show_aland", selector: { boolean: {} } }] : [],
    { name: "show_mix", selector: { boolean: {} } },
    { name: "show_forecast", selector: { boolean: {} } },
    { name: "show_details", selector: { boolean: {} } },
    ...rowStepSchema(config, text)
  ];
}
var FingridCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = { type: "custom:fingrid-card" };
  }
  setConfig(config) {
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    return b2`
            <ha-form
                .hass=${this.hass}
                .data=${{ ...DEFAULTS, ...rowStepData(this.config) }}
                .schema=${schema(this.config, (key) => this.text(key))}
                .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
  }
  valueChanged(event) {
    const config = tidyRowStep(event.detail.value);
    for (const [key, value2] of Object.entries(DEFAULTS)) {
      if (config[key] === value2 || config[key] === void 0 || config[key] === null) {
        delete config[key];
      }
    }
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  text(key) {
    return translate(this.language(), key);
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], FingridCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], FingridCardEditor.prototype, "config", 2);
if (!customElements.get("fingrid-card-editor")) {
  customElements.define("fingrid-card-editor", FingridCardEditor);
}

// src/finland.ts
var FINLAND = [
  [24.16, 65.81],
  [23.91, 66.15],
  [23.7, 66.25],
  [23.7, 66.48],
  [23.87, 66.58],
  [23.99, 66.81],
  [23.64, 67.13],
  [23.63, 67.23],
  [23.77, 67.33],
  [23.73, 67.42],
  [23.45, 67.46],
  [23.54, 67.61],
  [23.5, 67.88],
  [23.64, 67.95],
  [23.32, 68.13],
  [23.18, 68.14],
  [23.1, 68.26],
  [22.85, 68.37],
  [22, 68.52],
  [20.92, 68.91],
  [20.9, 68.98],
  [20.62, 69.04],
  [20.68, 69.07],
  [21.07, 69.04],
  [21.07, 69.21],
  [21.27, 69.27],
  [21.59, 69.27],
  [22.3, 68.86],
  [22.41, 68.72],
  [23.32, 68.65],
  [23.71, 68.71],
  [23.85, 68.81],
  [24.94, 68.59],
  [25.09, 68.64],
  [25.25, 68.82],
  [25.58, 68.89],
  [25.75, 68.99],
  [25.77, 69.28],
  [26.01, 69.65],
  [26.53, 69.92],
  [27.13, 69.91],
  [27.59, 70.04],
  [27.89, 70.06],
  [28.41, 69.82],
  [29.14, 69.67],
  [29.33, 69.47],
  [28.85, 69.18],
  [28.97, 69.02],
  [28.41, 68.9],
  [28.78, 68.81],
  [28.47, 68.49],
  [28.69, 68.19],
  [29.34, 68.06],
  [29.99, 67.67],
  [29.94, 67.55],
  [29.24, 67.1],
  [29.07, 66.89],
  [29.9, 66.09],
  [30.09, 65.79],
  [30.1, 65.68],
  [29.72, 65.62],
  [29.82, 65.57],
  [29.61, 65.25],
  [29.81, 65.2],
  [29.83, 65.15],
  [29.6, 64.97],
  [29.78, 64.8],
  [30.11, 64.73],
  [29.99, 64.52],
  [30.11, 64.37],
  [30.49, 64.24],
  [30.53, 64.08],
  [30.21, 63.8],
  [29.99, 63.74],
  [31.18, 63.21],
  [31.53, 62.89],
  [31.19, 62.48],
  [29.25, 61.29],
  [27.8, 60.54],
  [27.46, 60.46],
  [27.21, 60.54],
  [26.53, 60.41],
  [26.57, 60.62],
  [26.38, 60.42],
  [26.2, 60.41],
  [25.96, 60.47],
  [26.04, 60.34],
  [25.76, 60.27],
  [25.66, 60.33],
  [25.16, 60.19],
  [24.6, 60.11],
  [24.45, 60.02],
  [23.46, 59.99],
  [23.02, 59.82],
  [23.2, 60.02],
  [22.99, 60.1],
  [22.91, 60.21],
  [22.75, 60.06],
  [22.46, 60.03],
  [22.58, 60.38],
  [22.26, 60.4],
  [21.85, 60.51],
  [21.81, 60.59],
  [21.61, 60.53],
  [21.44, 60.6],
  [21.36, 60.97],
  [21.57, 61.48],
  [21.5, 61.55],
  [21.61, 61.59],
  [21.26, 61.99],
  [21.34, 62.28],
  [21.17, 62.41],
  [21.1, 62.62],
  [21.47, 63.03],
  [21.65, 63.04],
  [21.55, 63.2],
  [21.9, 63.21],
  [22.32, 63.31],
  [22.24, 63.44],
  [22.35, 63.44],
  [22.32, 63.5],
  [22.4, 63.49],
  [22.53, 63.65],
  [22.76, 63.68],
  [23.6, 64.04],
  [24.28, 64.52],
  [24.56, 64.8],
  [24.94, 64.88],
  [25.29, 64.86],
  [25.23, 64.95],
  [25.37, 65.01],
  [25.26, 65.14],
  [25.35, 65.48],
  [25.24, 65.55],
  [24.67, 65.67],
  [24.58, 65.76],
  [24.63, 65.86],
  [24.4, 65.78],
  [24.16, 65.81]
];

// src/fingrid.ts
function fingridSensors(hass) {
  const found = {};
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry?.platform === "fingrid" && entry.translation_key) {
      found[entry.translation_key] = entry.entity_id;
    }
  }
  return found;
}
function value(hass, sensors, key) {
  const entity = sensors[key] ? hass.states[sensors[key]] : void 0;
  if (!entity || entity.state === "" || entity.state === "unavailable" || entity.state === "unknown") {
    return void 0;
  }
  const parsed = Number(entity.state);
  return Number.isFinite(parsed) ? parsed : void 0;
}
var BORDERS = [
  { key: "export_norway", name: "norway", from: [27, 70], to: [27, 70.9], label: "right" },
  { key: "export_northern_sweden", name: "northern_sweden", from: [24, 65.95], to: [22.5, 65.95], label: "left" },
  { key: "export_central_sweden", name: "central_sweden", from: [21.3, 61.6], to: [19.6, 61.6], label: "left" },
  { key: "export_estonia", name: "estonia", from: [24.9, 60.15], to: [24.9, 59.35], label: "right" }
];
var ALAND = { key: "export_aland_sweden", name: "aland_sweden", from: [19.9, 60.2], to: [18.5, 60.2], label: "left" };
var ALAND_ISLAND = [
  [19.65, 60.08],
  [19.95, 59.98],
  [20.3, 60.06],
  [20.38, 60.22],
  [20.15, 60.4],
  [19.78, 60.38],
  [19.56, 60.24]
];
var MIX = ["nuclear", "hydro", "wind", "district_heating_cogeneration", "industrial_cogeneration", "reserve_and_small_scale"];
function mixShares(hass, sensors) {
  const readings = MIX.map((key) => ({ key, value: value(hass, sensors, key) })).filter(
    (reading) => reading.value !== void 0
  );
  const total = readings.reduce((sum, reading) => sum + Math.max(0, reading.value), 0);
  return readings.map((reading) => ({ ...reading, share: total > 0 ? Math.max(0, reading.value) / total : 0 }));
}
function arrowWidth(megawatts) {
  return 2 + Math.min(Math.abs(megawatts), 1500) / 1500 * 6;
}
var FORECASTS = ["wind_forecast", "solar_forecast", "consumption_forecast"];
function forecastPoints(response) {
  const rows = response?.forecast;
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => ({
    start: Date.parse(String(row?.start)),
    // Number(null) would be 0, a value no row has.
    value: typeof row?.value === "number" ? row.value : Number.NaN
  })).filter((point) => Number.isFinite(point.start) && Number.isFinite(point.value)).sort((a3, b3) => a3.start - b3.start);
}
function chartTop(series) {
  const highest = Math.max(0, ...series.flat().map((point) => point.value));
  return Math.max(2e3, Math.ceil(highest / 2e3) * 2e3);
}
function polyline(points, start, end, top, width, height) {
  const span = Math.max(1, end - start);
  return points.filter((point) => point.start >= start && point.start <= end).map((point) => `${round((point.start - start) / span * width)},${round(height - Math.max(0, point.value) / top * height)}`).join(" ");
}
var round = (n5) => Math.round(n5 * 10) / 10;
function severity(state) {
  switch (state) {
    case "normal":
      return "ok";
    case "weakened":
    case "possible":
      return "warning";
    case "endangered":
    case "blackout":
    case "high_risk":
    case "shortage":
      return "error";
    case "restoring":
      return "info";
    default:
      return "none";
  }
}

// src/fingrid-card.ts
var CARD_VERSION = "1.0.0";
var PADDING = 16;
var GAP = 12;
var HEADER_HEIGHT = 32;
var HEADER_WITH_STATUS_HEIGHT = 56;
var TOTALS_HEIGHT = 44;
var MAP_HEIGHT = 260;
var BORDER_ROW_HEIGHT = 30;
var MIX_HEIGHT = 78;
var CHART_HEIGHT = 120;
var FORECAST_HEIGHT = CHART_HEIGHT + 18 + 24;
var DETAILS_HEIGHT = 34;
var MIX_COLOURS = {
  nuclear: "var(--fingrid-nuclear-color, #a58bff)",
  hydro: "var(--fingrid-hydro-color, #4fa8f0)",
  wind: "var(--fingrid-wind-color, #45c779)",
  district_heating_cogeneration: "var(--fingrid-district-heating-color, #f0b440)",
  industrial_cogeneration: "var(--fingrid-industry-color, #f08a40)",
  reserve_and_small_scale: "var(--fingrid-other-color, #8fa0bd)"
};
var FORECAST_COLOURS = {
  wind_forecast: MIX_COLOURS.wind,
  solar_forecast: "var(--fingrid-solar-color, #ffd54f)",
  consumption_forecast: "var(--primary-text-color)"
};
var LON_SCALE = 9;
var LAT_SCALE = 20;
var WEST = 12.5;
var EAST = 33;
var NORTH = 71.4;
var SOUTH = 59;
var project = ([lon, lat]) => [(lon - WEST) * LON_SCALE, (NORTH - lat) * LAT_SCALE];
var FingridCard = class extends i4 {
  constructor() {
    super(...arguments);
    this.forecastFailed = false;
    this.filled = 0;
    /** The forecast sensors' last updates when the forecast was last asked for, so it is asked again only when one moves on. */
    this.forecastKey = "";
    this.resizes = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(() => this.measureSoon());
  }
  static getConfigElement() {
    return document.createElement("fingrid-card-editor");
  }
  static getStubConfig() {
    return {};
  }
  setConfig(config) {
    if (!config) {
      throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
    }
    if (!validHeight(config)) {
      throw new Error(translate(browserLanguage(), "common.invalid_height"));
    }
    if (!validRowStep(config)) {
      throw new Error(translate(browserLanguage(), "common.invalid_row_step"));
    }
    this.config = config;
  }
  /** In units of 50 px, for a masonry view. */
  getCardSize() {
    return heightCardSize(this.config ?? {}, Math.ceil(this.minimumHeight() / 50), this.minimumHeight());
  }
  /** The map, the chart and the three totals need about a phone's section, so the card takes a whole section. */
  getGridOptions() {
    return { columns: 12, min_columns: 12, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizes?.disconnect();
    cancelAnimationFrame(this.frame ?? 0);
  }
  willUpdate(changed) {
    if (changed.has("hass") || changed.has("config")) {
      this.readForecasts();
    }
  }
  render() {
    if (!this.hass || !this.config) {
      return A;
    }
    const sensors = this.sensors();
    if (Object.keys(sensors).length === 0) {
      return b2`<ha-card style=${this.cardStyle()}
                ><div class="content"><div class="message">${this.text("common.not_found")}</div></div></ha-card
            >`;
    }
    const config = this.config;
    return b2`
            <ha-card style=${this.cardStyle()}>
                <div class="content">
                    <div class="part header">
                        <span class="title">${this.text("common.name")}</span>
                        ${shows(config, "show_status") ? this.status(sensors) : A}
                    </div>
                    ${shows(config, "show_totals") ? b2`<div class="part">${this.totals(sensors)}</div>` : A}
                    ${shows(config, "show_map") ? b2`<div class="part">${this.map(sensors)}</div>` : A}
                    ${shows(config, "show_borders") ? b2`<div class="part">${this.borders(sensors)}</div>` : A}
                    ${shows(config, "show_mix") ? b2`<div class="part">${this.mix(sensors)}</div>` : A}
                    ${shows(config, "show_forecast") ? b2`<div class="part">${this.forecast(sensors)}</div>` : A}
                    ${shows(config, "show_details") ? b2`<div class="part">${this.details(sensors)}</div>` : A}
                </div>
            </ha-card>
        `;
  }
  updated() {
    const card = this.renderRoot.querySelector("ha-card");
    if (card && this.isConnected) {
      this.resizes?.observe(card);
      this.measureSoon();
    }
  }
  sensors() {
    const from = this.hass?.entities;
    if (!this.found || this.found.from !== from) {
      this.found = { from, sensors: this.hass ? fingridSensors(this.hass) : {} };
    }
    return this.found.sensors;
  }
  status(sensors) {
    const chip = (key, icon) => {
      const entity = sensors[key] ? this.hass.states[sensors[key]] : void 0;
      if (!entity) {
        return A;
      }
      const shown = this.hass.formatEntityState?.(entity) ?? entity.state;
      const name = this.text(`status.${key}`);
      return b2`<span class="chip ${severity(entity.state)}" title=${`${name} ${shown}`}
                ><ha-icon .icon=${icon}></ha-icon>${shown}</span
            >`;
    };
    return b2`<span class="chips"
            >${chip("power_system_state", "mdi:traffic-light")}${chip("shortage_status", "mdi:flash-alert")}</span
        >`;
  }
  totals(sensors) {
    const total = (key, signed = false) => {
      const reading = value(this.hass, sensors, key);
      return b2`<div class="total">
                <div class="number">
                    ${reading === void 0 ? "\u2013" : b2`${signed && reading > 0 ? "+" : ""}${this.number(reading)}<span class="unit"> MW</span>`}
                </div>
                <div class="label">${this.text(`totals.${key}`)}</div>
            </div>`;
    };
    return b2`<div class="totals">${total("production")}${total("consumption")}${total("net_export", true)}</div>`;
  }
  shownBorders(sensors) {
    return [...BORDERS, ...shows(this.config, "show_aland") ? [ALAND] : []].filter((border) => sensors[border.key]);
  }
  map(sensors) {
    const [width, height] = project([EAST, SOUTH]);
    const outline = FINLAND.map((point) => project(point).join(",")).join(" ");
    const borders = this.shownBorders(sensors);
    const aland = borders.includes(ALAND);
    return b2`<svg class="map" viewBox="0 0 ${width} ${height}" role="img" aria-label=${this.text("map.label")}>
            <defs>
                <marker id="export" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                    <path d="M0,0L10,5L0,10z" class="export-fill" />
                </marker>
                <marker id="import" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                    <path d="M0,0L10,5L0,10z" class="import-fill" />
                </marker>
            </defs>
            <polygon class="land" points=${outline} />
            ${aland ? w`<polygon class="land" points=${ALAND_ISLAND.map((point) => project(point).join(",")).join(" ")} />` : A}
            ${borders.map((border) => this.arrow(border, value(this.hass, sensors, border.key)))}
        </svg>`;
  }
  arrow(border, reading) {
    const [x1, y1] = project(border.from);
    const [x2, y22] = project(border.to);
    const known = reading !== void 0;
    const exporting = (reading ?? 0) >= 0;
    const [sx, sy, ex, ey] = exporting ? [x1, y1, x2, y22] : [x2, y22, x1, y1];
    const kind = known ? exporting ? "export" : "import" : "unknown";
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const middleY = (y1 + y22) / 2;
    const clear = 3 + 1.5 * arrowWidth(reading ?? 0);
    const [lx, anchor] = border.label === "left" ? [left - clear, "end"] : [right + clear, "start"];
    const ly = border.label === "left" ? middleY - 2 : middleY;
    return w`
            <line class="arrow ${kind}" x1=${sx} y1=${sy} x2=${ex} y2=${ey} stroke-width=${arrowWidth(reading ?? 0)}
                marker-end=${known ? `url(#${kind})` : ""} />
            <text class="flow ${kind}" x=${lx} y=${ly} text-anchor=${anchor}>${known ? this.number(Math.abs(reading)) : "\u2013"}</text>
            <text class="place" x=${lx} y=${ly + 10} text-anchor=${anchor}>${this.text(`borders.${border.name}`)}</text>
        `;
  }
  borders(sensors) {
    return b2`<div class="rows">
            ${this.shownBorders(sensors).map((border) => {
      const reading = value(this.hass, sensors, border.key);
      const kind = reading === void 0 ? "unknown" : reading >= 0 ? "export" : "import";
      return b2`<div class="row">
                    <span>${this.text(`borders.${border.name}`)}</span>
                    <span class="flow ${kind}"
                        >${reading === void 0 ? "\u2013" : `${this.text(`borders.${kind}`)} ${this.megawatts(Math.abs(reading))}`}</span
                    >
                </div>`;
    })}
        </div>`;
  }
  mix(sensors) {
    const shares = mixShares(this.hass, sensors);
    return b2`
            <div class="bar">
                ${shares.map((share) => b2`<span style="flex-grow: ${share.share}; background: ${MIX_COLOURS[share.key]}"></span>`)}
            </div>
            <div class="legend">
                ${shares.map(
      (share) => b2`<span
                            ><i style="background: ${MIX_COLOURS[share.key]}"></i>${this.text(`mix.${share.key}`)}
                            ${this.number(share.value)}</span
                        >`
    )}
            </div>
        `;
  }
  forecast(sensors) {
    const keys = FORECASTS.filter((key) => sensors[key]);
    if (this.forecastFailed || keys.length === 0) {
      return b2`<div class="message small">${this.text("forecast.unavailable")}</div>`;
    }
    const series = keys.map((key) => this.forecasts?.[key] ?? []);
    const all = series.flat();
    if (all.length === 0) {
      return b2`<div class="chart" style="height: ${CHART_HEIGHT + 18}px"></div>
                <div class="legend"></div>`;
    }
    const start = Math.min(...all.map((point) => point.start));
    const end = Math.max(...all.map((point) => point.start));
    const top = chartTop(series);
    const width = 300;
    const days = this.dayStarts(start, end).map((at) => {
      const x2 = (at - start) / Math.max(1, end - start) * width;
      return w`<line class="day" x1=${x2} x2=${x2} y1="0" y2=${CHART_HEIGHT} />`;
    });
    const labels = this.dayStarts(start, end).filter((at) => (at - start) / Math.max(1, end - start) < 0.8).map((at) => b2`<span style="left: ${(at - start) / Math.max(1, end - start) * 100}%">${this.day(at)}</span>`);
    return b2`
            <div class="chart">
                <svg viewBox="0 0 ${width} ${CHART_HEIGHT}" preserveAspectRatio="none" style="height: ${CHART_HEIGHT}px">
                    ${days}
                    ${keys.map(
      (key, index) => w`<polyline class="series" points=${polyline(series[index], start, end, top, width, CHART_HEIGHT)}
                                style="stroke: ${FORECAST_COLOURS[key]}" vector-effect="non-scaling-stroke" />`
    )}
                </svg>
                <span class="top">${this.megawatts(top)}</span>
                <div class="days">${labels}</div>
            </div>
            <div class="legend">
                ${keys.map((key) => {
      const now = value(this.hass, sensors, key);
      return b2`<span
                        ><i style="background: ${FORECAST_COLOURS[key]}"></i>${this.text(`forecast.${key}`)}
                        ${now === void 0 ? "\u2013" : this.number(now)}</span
                    >`;
    })}
            </div>
        `;
  }
  details(sensors) {
    const parts = [];
    const emission = value(this.hass, sensors, "emission_factor_consumption");
    if (emission !== void 0) {
      parts.push(this.text("details.emission").replace("{value}", this.number(emission)));
    }
    const share = value(this.hass, sensors, "non_fossil_share");
    if (share !== void 0) {
      parts.push(this.text("details.non_fossil").replace("{value}", this.number(share)));
    }
    const charging = value(this.hass, sensors, "battery_charging");
    const discharging = value(this.hass, sensors, "battery_discharging");
    if (charging !== void 0 && discharging !== void 0) {
      parts.push(
        this.text("details.batteries").replace("{charging}", this.number(charging)).replace("{discharging}", this.number(discharging))
      );
    }
    return b2`<div class="details">${parts.map((part) => b2`<span>${part}</span>`)}</div>`;
  }
  /** Asks for the forecasts again when one of the forecast sensors has moved on, which it does each quarter of an hour. */
  readForecasts() {
    if (!this.hass?.callWS || !shows(this.config, "show_forecast")) {
      return;
    }
    const sensors = this.sensors();
    const ids = FORECASTS.map((key2) => sensors[key2]).filter((id) => Boolean(id));
    const key = ids.map((id) => this.hass.states[id]?.last_updated ?? "").join("|");
    if (ids.length === 0 || key === this.forecastKey) {
      return;
    }
    this.forecastKey = key;
    this.hass.callWS({
      type: "call_service",
      domain: "fingrid",
      service: "get_forecast",
      target: { entity_id: ids },
      return_response: true
    }).then((result) => {
      const forecasts = {};
      for (const forecastKey of FORECASTS) {
        if (sensors[forecastKey]) {
          forecasts[forecastKey] = forecastPoints(result.response?.[sensors[forecastKey]]);
        }
      }
      this.forecasts = forecasts;
      this.forecastFailed = false;
    }).catch(() => {
      this.forecastFailed = true;
    });
  }
  /** The local midnights between start and end, in the user's time zone. */
  dayStarts(start, end) {
    const date = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: this.timeZone() });
    const starts = [];
    let previous = date.format(start);
    for (let at = Math.ceil(start / 9e5) * 9e5; at <= end; at += 9e5) {
      const today = date.format(at);
      if (today !== previous) {
        starts.push(at);
        previous = today;
      }
    }
    return starts;
  }
  day(at) {
    return new Intl.DateTimeFormat(this.language(), {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      timeZone: this.timeZone()
    }).format(at);
  }
  /** The height the parts need at the narrowest the card gets, from its settings alone. */
  minimumHeight() {
    const config = this.config;
    const parts = [shows(config, "show_status") ? HEADER_WITH_STATUS_HEIGHT : HEADER_HEIGHT];
    if (shows(config, "show_totals")) parts.push(TOTALS_HEIGHT);
    if (shows(config, "show_map")) parts.push(MAP_HEIGHT);
    if (shows(config, "show_borders")) parts.push(BORDER_ROW_HEIGHT * (BORDERS.length + (shows(config, "show_aland") ? 1 : 0)));
    if (shows(config, "show_mix")) parts.push(MIX_HEIGHT);
    if (shows(config, "show_forecast")) parts.push(FORECAST_HEIGHT);
    if (shows(config, "show_details")) parts.push(DETAILS_HEIGHT);
    return 2 * PADDING + parts.reduce((sum, part) => sum + part, 0) + GAP * (parts.length - 1);
  }
  measureSoon() {
    cancelAnimationFrame(this.frame ?? 0);
    this.frame = requestAnimationFrame(() => this.fillRows());
  }
  /**
   * In a sections view whose rows are left automatic, the card takes the whole rows its content needs, or the half rows
   * with `row_step: half`, so the cards under it stay on the rows. The room left over is spread between the parts.
   */
  fillRows() {
    const card = this.renderRoot.querySelector("ha-card");
    const content = card?.querySelector(":scope > .content");
    if (!card || !content || !card.clientWidth) {
      return;
    }
    const limit = fillLimit(this.config ?? {}, this.layout, this.minimumHeight());
    if (!limit) {
      this.filled = 0;
      return;
    }
    const scale = drawnScale(card);
    const parts = [...content.children];
    const style = getComputedStyle(card);
    const needed = parts.reduce((sum, part) => sum + part.getBoundingClientRect().height / scale, 0) + GAP * (parts.length - 1) + 2 * PADDING + px(style.borderTopWidth) + px(style.borderBottomWidth);
    this.filled = filledHeight(needed, this.config ?? {}, limit);
  }
  cardStyle() {
    return filledStyle(this.config ?? {}, this.layout, this.minimumHeight(), this.filled);
  }
  megawatts(reading) {
    return `${this.number(reading)} MW`;
  }
  number(reading) {
    return new Intl.NumberFormat(this.language(), { maximumFractionDigits: 0 }).format(reading);
  }
  timeZone() {
    return this.hass?.locale?.time_zone === "server" ? this.hass.config?.time_zone : void 0;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
  text(key) {
    return translate(this.language(), key);
  }
  static get styles() {
    return i`
            ha-card {
                container-type: inline-size;
                overflow: hidden;
                /* Its own transition: all would slide every change in the rows filled. */
                transition: none;
                /* A card taller than its parts, on filled or held rows, spreads the room between them. */
                display: flex;
                flex-direction: column;
            }
            .content {
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: ${GAP}px;
                padding: ${PADDING}px;
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                min-height: ${HEADER_HEIGHT}px;
                box-sizing: border-box;
            }
            .title {
                font-size: 16px;
                font-weight: 500;
            }
            .chips {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                justify-content: flex-end;
            }
            .chip {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                line-height: 16px;
                padding: 4px 10px 4px 6px;
                border-radius: 14px;
                white-space: nowrap;
                color: var(--secondary-text-color);
                background: rgba(127, 127, 127, 0.12);
                --mdc-icon-size: 16px;
            }
            .chip.ok {
                color: var(--success-color, #43a047);
                background: color-mix(in srgb, var(--success-color, #43a047) 14%, transparent);
            }
            .chip.warning {
                color: var(--warning-color, #ffa600);
                background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent);
            }
            .chip.error {
                color: var(--error-color, #db4437);
                background: color-mix(in srgb, var(--error-color, #db4437) 14%, transparent);
            }
            .chip.info {
                color: var(--info-color, #039be5);
                background: color-mix(in srgb, var(--info-color, #039be5) 14%, transparent);
            }
            .totals {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }
            .number {
                font-size: 22px;
                line-height: 30px;
                white-space: nowrap;
            }
            .unit {
                font-size: 13px;
                /* A smaller font on the line would otherwise make the line taller. */
                line-height: 0;
                color: var(--secondary-text-color);
            }
            /* At a card under 400 px, where three numbers of 22 px don't fit side by side. */
            @container (max-width: 400px) {
                .number {
                    font-size: 19px;
                }
            }
            .label,
            .legend,
            .details,
            .place,
            .days,
            .top {
                color: var(--secondary-text-color);
                font-size: 12px;
            }
            .map {
                display: block;
                width: 100%;
                height: ${MAP_HEIGHT}px;
            }
            .land {
                fill: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
                stroke: color-mix(in srgb, var(--primary-text-color) 30%, transparent);
                stroke-width: 0.8;
            }
            .arrow {
                stroke-linecap: round;
            }
            .arrow.export,
            .flow.export {
                stroke: var(--primary-color);
                color: var(--primary-color);
            }
            .arrow.import,
            .flow.import {
                stroke: var(--warning-color, #ffa600);
                color: var(--warning-color, #ffa600);
            }
            .arrow.unknown {
                stroke: var(--disabled-text-color, #8f8f8f);
            }
            .export-fill {
                fill: var(--primary-color);
            }
            .import-fill {
                fill: var(--warning-color, #ffa600);
            }
            text.flow {
                font-size: 11px;
                fill: currentColor;
                stroke: none;
            }
            text.place {
                font-size: 9px;
                fill: var(--secondary-text-color);
            }
            .rows .row {
                display: flex;
                justify-content: space-between;
                gap: 8px;
                min-height: ${BORDER_ROW_HEIGHT}px;
                align-items: center;
                border-top: 1px solid var(--divider-color);
                box-sizing: border-box;
            }
            .rows .row:first-child {
                border-top: none;
            }
            .bar {
                display: flex;
                height: 14px;
                border-radius: 7px;
                overflow: hidden;
            }
            .bar span {
                flex-basis: 0;
            }
            .legend {
                display: flex;
                flex-wrap: wrap;
                gap: 2px 12px;
                margin-top: 6px;
                line-height: 18px;
            }
            .legend i {
                display: inline-block;
                width: 9px;
                height: 9px;
                border-radius: 2px;
                margin-right: 4px;
            }
            .chart {
                position: relative;
            }
            .chart svg {
                display: block;
                width: 100%;
            }
            .series {
                fill: none;
                stroke-width: 2;
            }
            .day {
                stroke: var(--divider-color);
                stroke-width: 1;
                vector-effect: non-scaling-stroke;
            }
            .top {
                position: absolute;
                top: 0;
                left: 2px;
                font-size: 11px;
            }
            .days {
                position: relative;
                height: 18px;
            }
            .days span {
                position: absolute;
                top: 2px;
                padding-left: 4px;
                font-size: 11px;
                white-space: nowrap;
            }
            .details {
                display: flex;
                flex-wrap: wrap;
                gap: 2px 12px;
                line-height: 16px;
            }
            .message {
                color: var(--secondary-text-color);
            }
            .message.small {
                font-size: 12px;
            }
        `;
  }
};
__decorateClass([
  n4({ attribute: false })
], FingridCard.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], FingridCard.prototype, "layout", 2);
__decorateClass([
  r5()
], FingridCard.prototype, "config", 2);
__decorateClass([
  r5()
], FingridCard.prototype, "forecasts", 2);
__decorateClass([
  r5()
], FingridCard.prototype, "forecastFailed", 2);
__decorateClass([
  r5()
], FingridCard.prototype, "filled", 2);
var px = (value2) => Number.parseFloat(value2) || 0;
if (!customElements.get("fingrid-card")) {
  console.info(
    `%c  FINGRID-CARD 
%c  ${CARD_VERSION}    `,
    "color: lightblue; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray"
  );
  const registry = window;
  registry.customCards = registry.customCards ?? [];
  registry.customCards.push({
    type: "fingrid-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/fingrid#fingrid-card",
    preview: true
  });
  customElements.define("fingrid-card", FingridCard);
}
export {
  FingridCard
};
