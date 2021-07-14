import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sass from "rollup-plugin-sass";
import alias from '@rollup/plugin-alias';
const path = require('path');

const plugins = [
    nodeResolve(),
    commonjs(),
    alias({
        entries: [
            { find: '@', replacement: path.resolve(path.resolve(__dirname), 'assets/js/') },
        ]
    }),
    sass({
        options: {
            includePaths: ['node_modules'],
        },
        insert: true
    }),
];

export default [
    {
        input: "assets/js/LayoutBuilder/index.js",
        treeshake: false,
        output: {
            file: "public/build/layout-builder.js",
            format: "umd",
            sourcemap: true,
        },
        plugins: plugins
    },
    {
        input: "assets/js/CustomTable/index.js",
        treeshake: false,
        output: {
            file: "public/build/custom-table.js",
            format: "umd",
            sourcemap: true,
        },
        plugins: plugins
    },
    {
        input: "assets/js/Prompt/index.js",
        treeshake: false,
        output: {
            file: "public/build/prompt.js",
            format: "umd",
            sourcemap: true,
        },
        plugins: plugins
    },
    {
        input: "assets/js/Markdown/index.js",
        treeshake: false,
        output: {
            file: "public/build/markdown.js",
            format: "umd",
            sourcemap: true,
        },
        plugins: plugins
    },
    {
        input: "assets/js/SiteDesign/index.js",
        treeshake: false,
        output: {
            file: "public/build/site-design.js",
            format: "umd",
            sourcemap: true,
        },
        plugins: plugins
    },
];
