import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true,
                freeze: false,
                esModule: true,
                exports: 'default',
                preserveModules: false
            }, {
                file: pkg.module,
                format: 'esm',
                sourcemap: true,
                freeze: false,
                esModule: true,
                exports: 'default',
                preserveModules: false
            }
        ],
        plugins: [
            typescript(),
            resolve(),
            commonjs(),
            babel({ babelHelpers: 'bundled' }),
        ],
    },
];