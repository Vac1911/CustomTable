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
        input: "assets/js/CustomTable/index.js",
        treeshake: false,
        output: {
            file: "public/build/custom-table.js",
            format: "umd",
            sourcemap: true,
        },
        plugins: plugins
    },
];
