import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'node-html-parser';

function viteHTMLIncludes(options = {}) {
    const { componentsPath = '/components/' } = options;
    let config;

    return {
        name: 'vite-plugin-html-includes',
        enforce: 'pre',
        configResolved(resolvedConfig) {
            // store the resolved config
            config = resolvedConfig;
        },
        transformIndexHtml(html) {
            const root = parse(html);
            root.querySelectorAll('include').forEach(node => {
                const src = node.getAttribute('src');
                if (!src) return;

                const filePath = resolve(config.root + componentsPath + src);

                try {
                    const content = readFileSync(filePath, 'utf-8');
                    const fragment = parse(content);
                    // Here, you can manipulate 'fragment' as needed
                    node.replaceWith(fragment);
                } catch (e) {
                    console.error(`Error including file: ${filePath}`, e);
                }
            });

            return root.toString();
        }
    };
}

export default viteHTMLIncludes;
