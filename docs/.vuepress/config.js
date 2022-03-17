
const shiki = require('shiki')
const { readFileSync } = require('fs')
const { path } = require('@vuepress/utils')

const modelicaGrammar = JSON.parse(readFileSync(path.resolve(__dirname, './modelica.tmLanguage.json')))
const modelica = {
  id: 'modelica',
  ext: 'mo',
  scopeName: 'source.modelica',
  grammar: modelicaGrammar,
  aliases: ['mo', 'modelica'],
}
const langs = [ modelica, ...shiki.BUNDLED_LANGUAGES ]


module.exports = {
    // site config
    lang: 'en-US',
    title: 'Linkage',

    base: '/template-dev-docs/',

    // theme and its config
    theme: '@vuepress/theme-default',
    themeConfig: {
        navbar: [
            // NavbarItem
            {
              text: 'Guide',
              link: '/guide/',
            },
            // NavbarGroup
            {
                text: 'More',
                children: ['/more/glossary.md', '/more/nomenclature.md'],
            },
        ],
    },

    plugins: [
        '@vuepress/plugin-search',
        [ '@vuepress/plugin-shiki', { theme: 'dark-plus', langs: langs } ],
        [ '@snippetors/vuepress-plugin-code-copy', { color: '#d3d3d3', backgroundColor: '#3f3f3f' } ],
    ],

    markdown: {
        code: {
            lineNumbers: false
        }
    },

    extendsMarkdown: md => {
        md.use(require('markdown-it-task-lists')),
        md.use(require('markdown-it-attribution-references')),
        md.use(require('markdown-it-figure-references')),
        md.use(require('markdown-it-table-references')),
        md.use(require('markdown-it-references')),
        md.use(require('markdown-it-mathjax3')),
        md.use(require('markdown-it-attrs')),
        md.set({ breaks: true })
    }
}
