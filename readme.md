# Vite Plugin HTML Includes

## What it Does

This Vite plugin enhances your HTML files by allowing dynamic includes and simple templating features. It supports the following functionalities:

- Replaces `<include>` tags with the contents of the referenced HTML file.
- Allows passing of variables into included files using `locals` attribute.
- Supports simple templating with `<if>`, `<elseif>`, `<else>`, `<switch>`, `<case>`, `<default>`, and `<each>` constructs.

## Examples

### Basic Include

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

### Conditional Templating

HTML:

```
<include src="conditional.html" locals='{"page": "home"}'>
```

Output:

```
<if condition="page === 'home'">
  <p>Welcome to the Home Page</p>
</if>
<elseif condition="page === 'about'">
  <p>Welcome to the About Page</p>
</elseif>
<else>
  <p>Welcome to the Site</p>
</else>
```

### Switch Case Templating

HTML:

```
<include src="switch.html" locals='{"foo": "bar"}'>
```

Output:

```
<switch expression="foo">
  <case n="'bar'">
    <p>Foo really is bar! Revolutionary!</p>
  </case>
  <case n="'wow'">
    <p>Foo is wow, oh man.</p>
  </case>
  <default>
    <p>Foo is probably just foo in the end.</p>
  </default>
</switch>
```

### Loop Templating

HTML:

```
<include src="list.html" locals='{"items": ["Item 1", "Item 2"]}'>
```

Output:

```
<each loop="item, index in items">
  <p>{{ index }}: {{ item }}</p>
</each>
```

## Usage

Import `viteHTMLIncludes` from `@kingkongdevs/vite-plugin-html-includes`

```
import viteHTMLIncludes from '@kingkongdevs/vite-plugin-html-includes';
```

Add the viteHTMLIncludes to your `vite.config.js` file's plugins array:

```
plugins: [
  viteHTMLIncludes({
    componentsDir: '/components/',
  }),
]
```

### Escaping Characters

Since we need to pass a JSON object via a HTML attribute, we need to encode certain characters to avoid breaking the attribute (particularly apostrophes and quote characters).

```html
<!-- ❌ Using an apostrophe directly will break the HTML attribute -->
<include src="snippet.html" locals='{"text": "this won't work"}'></include>

<!-- ✅ Encoding the apostrophe as an HTML character will work -->
<include src="snippet.html" locals='{"text": "this won&apos;t break it"}'></include>

<!-- ✅ You can also use a numeric character reference to escape the apostrophe -->
<include src="snippet.html" locals='{"text": "this won&#39;t break it either"}'></include>
```

You can use [an online tool](https://emn178.github.io/online-tools/html_encode.html) to assist with converting strings to a suitable format.

## Plugin Options

### componentsDir

- #### Type: `string`
- #### Default: `'/components/'`
  The directory (relative to the root of your project) where your component files can be found
