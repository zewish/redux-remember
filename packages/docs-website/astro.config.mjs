import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { visit } from 'unist-util-visit';
import gruvbox from 'starlight-theme-gruvbox';

export default defineConfig({
  site: 'https://zewish.github.io',
  base: '/redux-remember',
  trailingSlash: 'always',
  integrations: [
    react(),
    starlight({
      title: 'Redux Remember',
      favicon: 'favicon.ico',
      social: [{
        icon: 'github',
        label: 'GitHub',
        href: 'https://github.com/zewish/redux-remember'
      }],
      plugins: [gruvbox()],
      sidebar: [
        { label: 'Quick Start', slug: 'quick-start' },
        {
          label: 'Usage Guides',
          items: [
            { label: 'Usage Overview', slug: 'usage' },
            { label: 'Web Usage', slug: 'usage/web-usage' },
            { label: 'React Native Usage', slug: 'usage/react-native-usage' },
            { label: 'Custom Storage Driver', slug: 'usage/custom-storage-driver' },
            { label: 'Using in Reducers', slug: 'usage/using-in-reducers' },
            { label: 'Rehydration Gate', slug: 'usage/rehydration-gate' },
            { label: 'Error Handling', slug: 'usage/error-handling' },
            {
              label: 'Legacy Usage',
              items: [
                { label: 'Legacy Usage Overview', slug: 'usage/legacy' },
                { label: 'Web Usage', slug: 'usage/legacy/web' },
                { label: 'React Native Usage', slug: 'usage/legacy/react-native' },
                { label: 'Reducer Usage', slug: 'usage/legacy/reducers' },
              ],
            },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'API Reference Overview', slug: 'api' },
            { label: 'rememberReducer', slug: 'api/remember-reducer' },
            { label: 'rememberEnhancer', slug: 'api/remember-enhancer' },
            { label: 'Action Types', slug: 'api/actions' },
            { label: 'TypeScript Types', slug: 'api/types' },
          ],
        },
        { label: 'Demo', slug: 'demo' },
      ],
    }),
  ],
  markdown: {
    remarkPlugins: [() => (tree) => visit(tree, 'link', (node) => {
      const { url } = node;

      if (url.startsWith('https://') || !url.includes('.md')) {
        return;
      }

      const [path, ...rest] = url.split('.md');
      const hash = rest.join('');
      const fullPath = path.endsWith('/index')
        ? `${path.slice(0, -6)}/${hash}`
        : `${path}/${hash}`;

      node.url = url.startsWith('./') || url.startsWith('../')
        ? `../${fullPath}`
        : fullPath;
    })],
  },
});
