import { createCssVariablesTheme } from 'shiki/core';
import { createHighlighterCore } from 'shiki';
import getWasm from 'shiki/wasm';
import json from 'shiki/langs/json.mjs'
import http from 'shiki/langs/http.mjs'

let shiki;
async function init() {
    const theme = createCssVariablesTheme({
        name: 'css-vars',
        variablePrefix: '--shiki-',
        variableDefaults: {},
        fontStyle: true
    });
    shiki = await createHighlighterCore({
        loadWasm: getWasm,
        themes: [theme],
        langs: [json, http]
    });
}

function highlight(lang, content) {
    const html = shiki.codeToHtml(content, {
        lang,
        theme: 'css-vars'
    });
    return html;
};

export {
    init,
    highlight
}