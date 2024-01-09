# Vite Plugin HTML Includes

## What it does
Replaces `<include>` tags in your HTML files with the contents of the corresponding HTML tag.

## Example

HTML:
```
<include src="footer.html">
```

Output:
```
<footer>
  <p>This is the contents of my footer.html file</p>
</footer>
```

## Usage
Import `viteHTMLIncludes` from `@kingkongdevs/vite-plugin-html-includes`

```
import viteHTMLIncludes from @kingkongdevs/vite-plugin-html-includes'
```


Add the viteHTMLIncludes to your `vite.config.js` file's plugins array:
```
plugins: [
  viteHTMLIncludes({
    componentsDir: '/components/',
  }),
]
```

## Plugin Options
### componentsDir
- #### Type: `string`
- #### Default: `'/components/'`
  The directory (relative to the root of your project) where your component files can be found
