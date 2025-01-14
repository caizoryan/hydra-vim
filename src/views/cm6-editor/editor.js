/* eslint-disable no-eval */
import { EditorView } from "codemirror"
import { autocompletion } from "@codemirror/autocomplete"
import { vim, Vim } from "@replit/codemirror-vim"
import { syntaxTree } from "@codemirror/language"
import { placeholder, keymap } from "@codemirror/view"
import { hydraSetup } from "./editor-setup.js"
import { javascript } from "@codemirror/lang-javascript"
import { flashCode, flashAll, flashTheme } from "./hydra-flash.js";
import hydraKeymaps from "./hydra-keymaps.js"

import EventEmitter from 'nanobus'
import beautify from 'js-beautify'

import { javascriptLanguage } from "@codemirror/lang-javascript"


const tagOptions = [
  "noise",
  "voronoi",
  "osc",
  "shape",
  "gradient",
  "src",
  "solid",
  "prev",

  "rotate",
  "scale",
  "pixelate",
  "repeat",
  "repeatX",
  "repeatY",
  "kaleid",
  "scroll",
  "scrollX",
  "scrollY",

  "posterize",
  "shift",
  "invert",
  "contrast",
  "brightness",
  "luma",
  "thresh",
  "color",
  "saturate",
  "hue",
  "colorama",
  "sum",
  "r",
  "g",
  "b",
  "a",

  "add",
  "sub",
  "layer",
  "blend",
  "mult",
  "diff",
  "mask",

  "modulateRepeat",
  "modulateRepeatX",
  "modulateRepeatY",
  "modulateKaleid",
  "modulateScrollX",
  "modulateScrollY",
  "modulate",
  "modulateScale",
  "modulatePixelate",
  "modulateRotate",
  "modulateHue",

  "render",
  "update",
  "setResolution",
  "hush",
  "setFunction",
  "speed",
  "bpm",
  "width",
  "height",
  "time",
  "mouse",

  "fast",
  "smooth",
  "ease",
  "offset",
  "fit",

  "fft",
  "setSmooth",
  "setCutoff",
  "setBins",
  "setScale",
  "hide",
  "show",

].map(tag => ({ label: tag + "()", type: "keyword" }))

function completeJSDoc(context) {
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
  // if (nodeBefore.name != "BlockComment" ||
  //   context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 3) != "/**")
  //   return null
  let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
  let tagBefore = /.\w*$/.exec(textBefore)
  if (!tagBefore && !context.explicit) return null

  return {
    from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
    options: tagOptions,
    validFor: /^(.\w*)?$/
  }
}

const jsDocCompletions = javascriptLanguage.data.of({
  autocomplete: completeJSDoc
})

export default class Editor extends EventEmitter {
  constructor(parent, emit) {
    super()
    console.log("*** Editor class created");
    var self = this

    Vim.defineEx('write', 'w', function() {
      console.log("ss fuck")
      emit('editor: eval all')
    });

    this.cm = new EditorView({
      lineWrapping: true,
      extensions: [
        hydraSetup,
        javascript(),
        vim(),
        autocompletion(),
        jsDocCompletions,
        placeholder('//\n// Type some code on a new line (such as "osc().out()"), and press CTRL+shift+enter'),
        flashCode((code, shouldUpdateURL = false) => {
          emit('repl: eval', code)
          if (shouldUpdateURL) emit('gallery: save to URL', code)
        }),
        flashTheme,
        keymap.of(hydraKeymaps(emit))
      ],
      parent: parent,

    })
    // window.cm = this.cm
    // window.editor = this
  }

  clear() {
    this.setValue('')
  }

  flashCode() {
    flashAll(this.cm)
    //this.cm.dispatch({ effects: flashEffect.of({ from : 0, to: this.cm.state.doc.length, shouldUpdateURL: true}) });
  }

  setValue(val) {
    this.cm.dispatch({
      changes: { from: 0, to: this.cm.state.doc.length, insert: val }
    })
  }

  getValue() {
    this.cm.state.doc.toString()
  }

  formatCode() {
    const formatted = beautify(this.cm.state.doc.toString()
      , { indent_size: 2, "break_chained_methods": true /*"indent_with_tabs": true*/ })
    // this.cm.setValue(formatted)

    this.cm.dispatch({
      changes: { from: 0, to: this.cm.state.doc.length, insert: formatted }
    })
  }

  addCodeToTop(code = '') {
    this.cm.dispatch({
      changes: { from: 0, insert: `${code}\n\n` }
    })

  }

  // hide() {
  //   console.log('hiding')
  //   var l = document.getElementsByClassName('CodeMirror')[0]
  //   var m = document.getElementById('modal-header')
  //   l.style.opacity = 0
  //   m.style.opacity = 0
  //   this.isShowing = false
  // }

  // show() {
  //   var l = document.getElementsByClassName('CodeMirror')[0]
  //   var m = document.getElementById('modal-header')
  //   l.style.opacity= 1
  //   m.style.opacity = 1
  //   l.style.pointerEvents = 'all'
  //   this.isShowing = true
  // }

  toggle() {

  }


}

