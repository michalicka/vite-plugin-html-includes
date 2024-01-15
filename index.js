const { readFileSync } = require('fs');
const { resolve } = require('path');
const { parse } = require('node-html-parser');

function viteHTMLIncludes(options = {}) {
    const { componentsPath = '/components/' } = options;
    let config;

    function evaluateWithLocals(code, locals) {
        try {
            const args = Object.keys(locals);
            const values = Object.values(locals);
            const func = new Function(...args, `return ${code};`);
            return func(...values);
        } catch (e) {
            console.error(`Error evaluating code: ${code}`, e);
            return false; // For conditions. For expressions, adjust as needed.
        }
    }

    function processConditionals(fragment, locals) {
        fragment.querySelectorAll('if').forEach(node => {
            const condition = node.getAttribute('condition');
            const elseNode = node.nextElementSibling.tagName === 'ELSE' ? node.nextElementSibling : null;

            if (evaluateWithLocals(condition, locals)) {
                node.replaceWith(...node.childNodes);
            } else {
                node.remove();
            }

            if (elseNode) {
                if (!evaluateWithLocals(condition, locals)) {
                    elseNode.replaceWith(...elseNode.childNodes);
                } else {
                    elseNode.remove();
                }
            }
        });
    }

    function processSwitchCases(fragment, locals) {
        fragment.querySelectorAll('switch').forEach(switchNode => {
            const expression = switchNode.getAttribute('expression');
            const expressionValue = evaluateWithLocals(expression, locals);
            let hasMatched = false;

            switchNode.childNodes.forEach(child => {
                if (child.tagName === 'CASE' && !hasMatched) {
                    const caseValue = evaluateWithLocals(child.getAttribute('n'), locals);
                    if (caseValue === expressionValue) {
                        hasMatched = true;
                        child.replaceWith(...child.childNodes);
                    } else {
                        child.remove();
                    }
                } else if (child.tagName === 'DEFAULT' && !hasMatched) {
                    child.replaceWith(...child.childNodes);
                } else {
                    child.remove();
                }
            });
        });
    }

    function processEachLoops(fragment, locals) {
        fragment.querySelectorAll('each').forEach(eachNode => {
            const loop = eachNode.getAttribute('loop');
            const [match, item, index, arrayExpression] = /(\w+),\s*(\w+)\s*in\s*(\w+)/.exec(loop) || [];
            const array = evaluateWithLocals(arrayExpression, locals);
            if (!array) return;

            const nodesToReplace = [];
            array.forEach((currentItem, currentIndex) => {
                let loopLocals = { ...locals, [item]: currentItem, [index]: currentIndex };
                let clonedNode = parse(eachNode.innerHTML);
                processTemplate(clonedNode, loopLocals);
                nodesToReplace.push(...clonedNode.childNodes);
            });

            eachNode.replaceWith(...nodesToReplace);
        });
    }

    function processTemplate(fragment, locals) {
        processConditionals(fragment, locals);
        processSwitchCases(fragment, locals);
        processEachLoops(fragment, locals);
        // Implement other template processing functions here if needed
    }

    return {
        name: 'vite-plugin-html-includes',
        enforce: 'pre',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        transformIndexHtml(html) {
            const root = parse(html);
            root.querySelectorAll('include').forEach(node => {
                const src = node.getAttribute('src');
                const localsString = node.getAttribute('locals');
                let locals = {};

                if (localsString) {
                    try {
                        locals = JSON.parse(localsString);
                    } catch (e) {
                        console.error(`Error parsing locals JSON: ${localsString}`, e);
                    }
                }

                if (!src) return;

                const filePath = resolve(config.root + componentsPath + src);

                try {
                    let content = readFileSync(filePath, 'utf-8');
                    let fragment = parse(content);

                    // Process the entire template
                    processTemplate(fragment, locals);

                    node.replaceWith(fragment);
                } catch (e) {
                    console.error(`Error including file: ${filePath}`, e);
                }
            });

            return root.toString();
        }
    };
}

module.exports = viteHTMLIncludes;
