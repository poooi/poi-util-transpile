# Poi-util-transpile

Util for transpiling poi plugins

## compatibility

This util is designed for `poi 7.6.0` and later versions. Other versions are not guaranteed. An `apiVer` for `7.6.0-beta.1` is probably necessary if you use features like `async/await` that was transpiled with different presets in previous babel config.

## Howto

You're expected to use `npm^5` and `node^7.6`.

- install this package as dev-dependecy:

```shell
npm install --save-dev poi-util-transpile
```
- add prepublish and postpublish (optional) scripts in `package.json` section:

```json
    "prepublish": "poi-plugin-transpile",
    "postpublish": "git clean -f && git checkout .",
```

## Usage

```
Usage: poi-util-transpile [source] [options]

Options:
  --sm, --source-map  save sourcemap to .js.map file                   [boolean]
  --replace           removes .es files                                [boolean]
  -h, --help          Show help                                        [boolean]
```
