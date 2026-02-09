<img src="https://raw.githubusercontent.com/zewish/redux-remember/master/packages/docs-website/src/assets/logo-remigrate.webp" alt="Redux Remigrate Logo" width="150" />

**CLI wrapper for Redux Remigrate**

[![NPM Version](https://img.shields.io/npm/v/remigrate.svg?style=flat-square)](https://www.npmjs.com/package/remigrate)
[![Build Status](https://github.com/zewish/redux-remember/workflows/build/badge.svg)](https://github.com/zewish/redux-remember/actions?query=workflow%3Abuild)

---

## What is this?

This package is a lightweight CLI wrapper for [redux-remigrate](https://www.npmjs.com/package/redux-remigrate).<br />
It provides a convenient way to run the `remigrate` CLI commands via `npx remigrate` without needing to install `redux-remigrate` globally.

**This package does not work on its own.** It requires `redux-remigrate` to be installed as a dependency in your project.

## Usage

```bash
cd /path/to/your-project-with-redux-remigrate-installed
npx remigrate <command>
```

Then you can run:

```bash
npx remigrate init        # Initialize migrations directory
npx remigrate create      # Create a new migration file
npx remigrate cleanup     # Remove unreferenced version files
npx remigrate validate    # Validate migrations for TypeScript errors
```

## Documentation

For full documentation, configuration options, and usage examples, visit the [official documentation](https://redux-remember.js.org/usage/migrations/).

## License

MIT
