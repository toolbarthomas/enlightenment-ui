# Enlightenment UI

Lit Element Component library with [Enlightenment](https://github.com/toolbarthomas/enlightenment)

**Note:** Package is still under development and the current documentation is still work in progress...

## Esbuild recipes

The generated UI package includes some extra assets that should be included when one or multiple components are included within your project:
 1. A global stylesheet that defines the required UI CSS variables.
 2. Any imported asset that has been requested within a UI component like imports/requests from a stylesheet.
 3. The default SVG sprite that are used by the default packages like: Button icons, graphics/illustrations etc..

These assets have already been resolved by the default Esbuild workflow that is defined from: **node/esbuild.assets.mjs** & **node/esbuild.enlightenment-ui.mjs**; You should include the defaultLoader configuration within **node/utils/loader.mjs** in order to resolve your assets correctly within the Enlightenment structure.

#### defaultLoader

The defaultLoader defines the required loader configuration for Esbuild and should resolve the defined sources to the builder destination directory. This UI package requires some assets from the imported component assets (like webfonts and static images) and writes them to the destination directory. Most of the stylesheets are inserted within the actual generated component, but a global stylesheet is also created to expose any imported asset (see *dist/index.css*).