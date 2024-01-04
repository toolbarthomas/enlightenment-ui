# Enlightenment UI

Lit Element Component library with [Enlightenment](https://github.com/toolbarthomas/enlightenment)

**Note:** Package is still under development and the current documentation is still work in progress...

## Esbuild workflow

The generated UI package includes some extra assets that should be included when one or multiple components are included within your project:
 1. A global stylesheet that defines the required UI CSS variables.
 2. Any imported asset that has been requested within a UI component like imports/requests from a stylesheet.
 3. The default SVG sprite that are used by the default packages like: Button icons, graphics/illustrations etc..

These assets have already been resolved by the default Esbuild workflow that is defined from: **node/esbuild.assets.mjs** & **node/esbuild.enlightenment-ui.mjs**; You should include the defaultLoader configuration within **node/utils/loader.mjs** in order to resolve your assets correctly within the Enlightenment structure.

**Attention!** The registered UI package does not contain the mentioned global assets. These assets will be resolved during the package installation on your machine, since these assets could require a valid license within the destination directory. Resolving the default licence files automatically during the package installation is still under consideration. You need to resolve them manually from the requested NPM directory to your web directory:

```css
/*
* Esbuild only resolves the requested file.
* A LICENSE file is present within this package and is not resolved by Esbuild.
*
* After install: dist/nunito-sans-latin-400-normal-{HASH}.woff is generated.
* The license file may need to be resolved in your usecase...
*/
@font-face {
  src: url("@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff")
}

```

#### defaultLoader

The defaultLoader defines the required loader configuration for Esbuild and should resolve the defined sources to the builder destination directory. This UI package requires some assets from the imported component assets (like webfonts and static images) and writes them to the destination directory. Most of the stylesheets are inserted within the actual generated component, but a global stylesheet is also created to expose any imported asset (see *dist/index.css*).

## Expected package structure

The package will scaffold the required file sources during the installation.
This package should be included within the actual Core Enlightenment package:

```
- js/enlightenment/enlightenment.js
- js/enlightenment/ui/...
```

The defined Components will import the Core Enlightenment package from the
parent directory (ui). This parent directory should contain the core package &
extensions since relative imports are expected.

This means you need to install both `@toolbarthomas/enlightenment` &
`@toolbarthomas/enlightenment-ui` and resolve the UI package within the
destination directory of the enlightenment package.

```js
// This example import is only resolved automatically for the Development flow.
// The generated package should be included in the resolved Enlightenment
// directory manually.
import { Enlightenment } from '../Enlightenment.js'
```