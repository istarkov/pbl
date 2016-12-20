/* eslint-disable */
// copied from https://github.com/zeit/hyper/blob/master/lib/hterm.js

import {hterm, lib} from 'hterm-umdjs';
import runes from './runes';
// const runes = v => v;

// import fromCharCode from './utils/key-code';
// import selection from './utils/selection';

hterm.defaultStorage = new lib.Storage.Memory();

// The current width of characters rendered in hterm
let charWidth;
// Containers to resize when char width changes
const containers = [];

// Provide selectAll to terminal viewport
hterm.Terminal.prototype.selectAll = function () {
  // If the cursorNode_ having hyperCaret we need to remove it
  if (this.cursorNode_.contains(this.hyperCaret)) {
    this.cursorNode_.removeChild(this.hyperCaret);
    // We need to clear the DOM range to reset anchorNode
    // selection.clear(this);
    // selection.all(this);
  }
};

const oldSetFontSize = hterm.Terminal.prototype.setFontSize;
hterm.Terminal.prototype.setFontSize = function (px) {
  oldSetFontSize.call(this, px);
  charWidth = this.scrollPort_.characterSize.width;
  // @TODO Maybe clear old spans from the list of spans to resize ?
  // Resize all containers to match the new whar width.
  containers.forEach(container => {
    if (container && container.style) {
      container.style.width = `${container.wcNode ? charWidth * 2 : charWidth}px`;
    }
  });
};

const oldSyncFontFamily = hterm.Terminal.prototype.syncFontFamily;
hterm.Terminal.prototype.syncFontFamily = function () {
  oldSyncFontFamily.call(this);
  this.setFontSize();
};

// override double click behavior to copy
const oldMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  if (e.type === 'dblclick') {
    // selection.extend(this);
    console.log('[hyper+hterm] ignore double click');
    return;
  }
  return oldMouse.call(this, e);
};

function containsNonLatinCodepoints(s) {
  return /[^\u0000-\u00ff]/.test(s);
}

// hterm Unicode patch
hterm.TextAttributes.splitWidecharString = function (str) {
  const context = runes(str).reduce((ctx, rune) => {
    const code = rune.codePointAt(0);
    if (code < 128 || lib.wc.charWidth(code) === 1) {
      ctx.acc += rune;
      return ctx;
    }
    if (ctx.acc) {
      ctx.items.push({str: ctx.acc});
      ctx.acc = '';
    }
    ctx.items.push({str: rune, wcNode: true});
    return ctx;
  }, {items: [], acc: ''});
  if (context.acc) {
    context.items.push({str: context.acc});
  }
  return context.items;
};

// hterm Unicode patch
lib.wc.strWidth = function (str) {
  const chars = runes(str);
  let width = 0;
  let rv = 0;

  for (let i = 0; i < chars.length; i++) {
    const codePoint = chars[i].codePointAt(0);
    width = lib.wc.charWidth(codePoint);
    if (width < 0) {
      return -1;
    }
    rv += width * ((codePoint <= 0xffff) ? 1 : 2);
  }
  return rv;
};

// hterm Unicode patch
lib.wc.substr = function (str, start, optWidth) {
  const chars = runes(str);
  let startIndex;
  let endIndex;
  let width = 0;

  for (let i = 0; i < chars.length; i++) {
    const codePoint = chars[i].codePointAt(0);
    const charWidth = lib.wc.charWidth(codePoint);
    if ((width + charWidth) > start) {
      startIndex = i;
      break;
    }
    width += charWidth;
  }

  if (optWidth) {
    width = 0;
    for (endIndex = startIndex; endIndex < chars.length && width < optWidth; endIndex++) {
      width += lib.wc.charWidth(chars[endIndex].charCodeAt(0));
    }

    if (width > optWidth) {
      endIndex--;
    }
    return chars.slice(startIndex, endIndex).join('');
  }
  return chars.slice(startIndex).join('');
};

// MacOS emoji bar support
hterm.Keyboard.prototype.onTextInput_ = function (e) {
  if (!e.data) {
    return;
  }
  runes(e.data).forEach(this.terminal.onVTKeystroke.bind(this.terminal));
};

hterm.Terminal.IO.prototype.writeUTF8 = function (string) {
  if (this.terminal_.io !== this) {
    throw new Error('Attempt to print from inactive IO object.');
  }

  if (containsNonLatinCodepoints(string)) {
    const splitString = runes(string);
    const length = splitString.length;
    this.terminal_.getTextAttributes().hasUnicode = true;

    for (let curChar = 0; curChar <= length; curChar++) {
      this.terminal_.interpret(splitString[curChar]);
    }

    this.terminal_.getTextAttributes().hasUnicode = false;
  } else {
    this.terminal_.interpret(string);
  }
};

const oldCreateContainer = hterm.TextAttributes.prototype.createContainer;
hterm.TextAttributes.prototype.createContainer = function (text) {
  const container = oldCreateContainer.call(this, text);
  if (container && container.style) {
    container.style['-webkit-font-smoothing'] = 'antialiased';
  }

  if (container.style && text.length === 1 && containsNonLatinCodepoints(text)) {
    container.style.width = `${container.wcNode ? charWidth * 2 : charWidth}px`;
    container.style.display = 'inline-block';

    // If the container has unicode text, the char can overlap neigbouring containers. We need
    // to ensure that the text is not hidden behind other containers.
    container.style.overflow = 'visible';
    container.style.position = 'relative';

    // Remember this container to resize it later when font size changes.
    containers.push(container);
  }

  return container;
};

// Do not match containers when one of them has unicode text (unicode chars need to be alone in their containers)
const oldMatchesContainer = hterm.TextAttributes.prototype.matchesContainer;
hterm.TextAttributes.prototype.matchesContainer = function (obj) {
  const content = typeof obj === 'string' ? obj : obj.textContent;
  if (containsNonLatinCodepoints(content)) {
    return false;
  }

  if (this.hasUnicode) {
    return false;
  }

  return oldMatchesContainer.call(this, obj);
};

/**
 * Override 'containersMatch' so that containers with unicode do not match anything.
 */
const oldContainersMatch = hterm.TextAttributes.containersMatch;
hterm.TextAttributes.containersMatch = function (obj1, obj2) {
  const content1 = typeof obj1 === 'string' ? obj1 : obj1.textContent;
  const content2 = typeof obj2 === 'string' ? obj2 : obj2.textContent;

  if (containsNonLatinCodepoints(content1) || containsNonLatinCodepoints(content2)) {
    return false;
  }

  return oldContainersMatch(obj1, obj2);
};

// there's no option to turn off the size overlay
hterm.Terminal.prototype.overlaySize = function () {};

// fixing a bug in hterm where a double click triggers
// a non-collapsed selection whose text is '', and results
// in an infinite copy loop
hterm.Terminal.prototype.copySelectionToClipboard = function () {
  const text = this.getSelectionText();
  if (text) {
    this.copyStringToClipboard(text);
  }
};

// passthrough all the commands that are meant to control
// hyper and not the terminal itself
const oldKeyDown = hterm.Keyboard.prototype.onKeyDown_;
hterm.Keyboard.prototype.onKeyDown_ = function (e) {
  const modifierKeysConf = this.terminal.modifierKeys;

  if (e.altKey &&
      e.which !== 16 && // Ignore other modifer keys
      e.which !== 17 &&
      e.which !== 18 &&
      e.which !== 91 &&
      modifierKeysConf.altIsMeta) {
    // EEE const char = fromCharCode(e);
    const char = 'a';
    this.terminal.onVTKeystroke('\x1b' + char);
    e.preventDefault();
  }

  if (e.metaKey &&
      e.code !== 'MetaLeft' &&
      e.code !== 'MetaRight' &&
      e.which !== 16 &&
      e.which !== 17 &&
      e.which !== 18 &&
      e.which !== 91 &&
      modifierKeysConf.cmdIsMeta) {
    // EEE const char = fromCharCode(e);
    const char = 'a';
    this.terminal.onVTKeystroke('\x1b' + char);
    e.preventDefault();
  }

  if (e.altKey || e.metaKey) {
    // hterm shouldn't consume a hyper accelerator
    return;
  }

  // Was the hyperCaret removed for selectAll
  if (!this.terminal.cursorNode_.contains(this.hyperCaret)) {
    this.terminal.focusHyperCaret();
  }

  if ((!e.ctrlKey || e.code !== 'ControlLeft') &&
      !e.shiftKey && e.code !== 'CapsLock' &&
      e.key !== 'Dead') {
    //  Test for valid keys in order to clear the terminal selection
    // selection.clear(this.terminal);
  }
  return oldKeyDown.call(this, e);
};

// we re-implement `wipeContents` to preserve the line
// and cursor position that the client is in.
// otherwise the user ends up with a completely clear
// screen which is really strange
hterm.Terminal.prototype.clearPreserveCursorRow = function () {
  this.scrollbackRows_.length = 0;
  this.scrollPort_.resetCache();

  [this.primaryScreen_, this.alternateScreen_].forEach(screen => {
    const bottom = screen.getHeight();
    if (bottom > 0) {
      this.renumberRows_(0, bottom);

      const x = screen.cursorPosition.column;
      const y = screen.cursorPosition.row;

      if (x === 0) {
        // Empty screen, nothing to do.
        return;
      }

      // here we move the row that the user was focused on
      // to the top of the screen
      this.moveRows_(y, 1, 0);

      for (let i = 1; i < bottom; i++) {
        screen.setCursorPosition(i, 0);
        screen.clearCursorRow();
      }

      // we restore the cursor position
      screen.setCursorPosition(0, x);
    }
  });

  this.syncCursorPosition_();
  this.scrollPort_.invalidate();

  // this will avoid a bug where the `wipeContents`
  // hterm API doesn't send the scroll to the top
  this.scrollPort_.redraw_();
};

const oldOnMouse = hterm.Terminal.prototype.onMouse_;
hterm.Terminal.prototype.onMouse_ = function (e) {
  // override `preventDefault` to not actually
  // prevent default when the type of event is
  // mousedown, so that we can still trigger
  // focus on the terminal when the underlying
  // VT is interested in mouse events, as is the
  // case of programs like `vtop` that allow for
  // the user to click on rows
  if (e.type === 'mousedown') {
    e.preventDefault = function () { };
  }

  return oldOnMouse.call(this, e);
};

// make background transparent to avoid transparency issues
hterm.ScrollPort.prototype.setBackgroundColor = function () {
  this.screen_.style.backgroundColor = 'transparent';
};

// will be called by the <Term/> right after the `hterm.Terminal` is instantiated
hterm.Terminal.prototype.onHyperCaret = function (caret) {
  this.hyperCaret = caret;
  let ongoingComposition = false;

  caret.addEventListener('compositionstart', () => {
    ongoingComposition = true;
  });

  // we can ignore `compositionstart` since chromium always fire it with ''
  caret.addEventListener('compositionupdate', () => {
    this.cursorNode_.style.backgroundColor = 'yellow';
    this.cursorNode_.style.borderColor = 'yellow';
  });

  // at this point the char(s) is ready
  caret.addEventListener('compositionend', () => {
    ongoingComposition = false;
    this.cursorNode_.style.backgroundColor = '';
    this.setCursorShape(this.getCursorShape());
    this.cursorNode_.style.borderColor = this.getCursorColor();
    caret.innerText = '';
  });

  // if you open the `Emoji & Symbols` (ctrl+cmd+space)
  // and select an emoji, it'll be inserted into our caret
  // and stay there until you star a compositon event.
  // to avoid that, we'll just check if there's an ongoing
  // compostion event. if there's one, we do nothing.
  // otherwise, we just remove the emoji and stop the event
  // propagation.
  // PS: this event will *not* be fired when a standard char
  // (a, b, c, 1, 2, 3, etc) is typed – only for composed
  // ones and `Emoji & Symbols`
  caret.addEventListener('input', e => {
    if (!ongoingComposition) {
      caret.innerText = '';
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // we need to capture pastes, prevent them and send its contents to the terminal
  caret.addEventListener('paste', e => {
    e.stopPropagation();
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    this.onVTKeystroke(text);
  });

  // here we replicate the focus/blur state of our caret on the `hterm` caret
  caret.addEventListener('focus', () => {
    this.cursorNode_.setAttribute('focus', true);
    this.restyleCursor_();
  });
  caret.addEventListener('blur', () => {
    this.cursorNode_.setAttribute('focus', false);
    this.restyleCursor_();
  });

  // this is necessary because we need to access the `document_` and the hyperCaret
  // on `hterm.Screen.prototype.syncSelectionCaret`
  this.primaryScreen_.terminal = this;
  this.alternateScreen_.terminal = this;
};

// ensure that our contenteditable caret is injected
// inside the term's cursor node and that it's focused
hterm.Terminal.prototype.focusHyperCaret = function () {
  if (!this.hyperCaret.parentNode !== this.cursorNode_) {
    this.cursorNode_.appendChild(this.hyperCaret);
  }
  this.hyperCaret.focus();
};

hterm.Screen.prototype.syncSelectionCaret = function () {
};

// fixes a bug in hterm, where the cursor goes back to `BLOCK`
// after the bell rings
const oldRingBell = hterm.Terminal.prototype.ringBell;
hterm.Terminal.prototype.ringBell = function () {
  oldRingBell.call(this);
  setTimeout(() => {
    this.restyleCursor_();
  }, 200);
};

// fixes a bug in hterm, where the shorthand hex
// is not properly converted to rgb
lib.colors.hexToRGB = function (arg) {
  const hex16 = lib.colors.re_.hex16;
  const hex24 = lib.colors.re_.hex24;

  function convert(hex) {
    if (hex.length === 4) {
      hex = hex.replace(hex16, (h, r, g, b) => {
        return '#' + r + r + g + g + b + b;
      });
    }
    const ary = hex.match(hex24);
    if (!ary) {
      return null;
    }

    return 'rgb(' +
      parseInt(ary[1], 16) + ', ' +
      parseInt(ary[2], 16) + ', ' +
      parseInt(ary[3], 16) +
    ')';
  }

  if (arg instanceof Array) {
    for (let i = 0; i < arg.length; i++) {
      arg[i] = convert(arg[i]);
    }
  } else {
    arg = convert(arg);
  }

  return arg;
};

export default hterm;
export {lib};
