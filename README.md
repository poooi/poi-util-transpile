# Poi-util-transpile


[![npm package][npm-badge]][npm]

Util for transpiling poi plugins

## Compatibility

This util is designed for `poi 7.6.0` and later versions. Other versions are not guaranteed. An `apiVer` for `7.6.0-beta.1` is probably necessary if you use features like `async/await` that was transpiled with different presets in previous babel config.

## Howto

You're expected to use `npm^5` and `node^7.6`.

- install this package as dev-dependecy:

```shell
npm install --save-dev poi-util-transpile
```
- add `prepack` and `postpublish` (optional) scripts in `package.json` section:

note: since `prepublish` script is also run during `npm install`, we use newly introduced `prepack` instead.

```json
    "prepack": "poi-util-transpile",
    "postpublish": "git clean -f && git checkout .",
```

## Usage

```
Usage: poi-plugin-transpile [source] [options]

Options:
  --sm, --source-map  saves sourcemap to .js.map file and/or inline. same as
                      babel sourceMaps option, if provided with no value, it
                      will default to true                              [string]
  --replace           removes .es files                                [boolean]
  -h, --help          Show help                                        [boolean]
```

## Changelog
### 8.2.0
use `babel@7-beta.40` following main poi's settings, code might not be compatible since the target is set to `Electron 1.8`.

### 8.0.0
add `babel-plugin-closure-elimination`, this does not break the compatibility with 7.6.x ~ 7.10.x

[npm-badge]: https://img.shields.io/npm/v/poi-util-transpile.svg?style=flat-square
[npm]: https://www.npmjs.org/package/poi-util-transpile
