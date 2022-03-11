
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
        md.use(require('markdown-it-mathjax3'))
    }
}
