# ES6 Auto complete
ES6 Auto complete is a vanilla js auto complete plugin to be used with a module bundler like Browserify or Webpack.

## Fetch
This plugin uses window.fetch to load data asynchronous. Depending on which browsers you want to support, you might need to include
a window.fetch polyfill. MDN suggets using this polyfill: https://github.com/github/fetch.

## Installation
You can either use npm to install the plugin to your node modules, or download the autocomplete.js file manually
and include it in your project files. To install with npm use:
```
npm install --save git+https://git@github.com/sanjaytwisk/es6-autocomplete.git
```
## Usage
To use the plugin simply import it into your bundle and initialize it on a DOM element with an options object, containing at least a `url`:
```javascript
import AutoComplete from 'es6-autocomplete';
```

```javascript
const element = document.querySelector('.input');
const autoComplete = new AutoComplete(element, { url: '/autocomplete.json' });
```

### Options

`minCharacters: number`

Character threshold for autocomplete to fetch data

`fetchDelay: number (milliseconds)`

Delay between input change and data fetching. resets on each input change

`inputClassName: string`

Class name of the input element

`autoCompleteBaseClass: string`

Base class name for the autocomplete container and child elements. the plugin uses BEM guidelines for class names

`url`

Url to fetch async autocomplete list. The plugin and appends `?query={input}` to the url in order to fetch the data.

## BEM
ES6 Autocomplete uses BEM as a guideline for class names. The HTML will be rendered in the following structure:
```html
<div class="{autoCompleteBaseClass}">
	<ul class="{autoCompleteBaseClass}__list">
		<li class="{autoCompleteBaseClass}__item">
			some text m
			<span class="{autoCompleteBaseClass}__highlight">at</span>
			ching input query
		</li>
	</ul>
</div>
```
The default class names are derived from the base class `autocomplete`:
```
container	= .autocomplete
list 		= .autocomplete__list
list item 	= .autocomplete__item
hightlight 	= .autocomplete__hightlight
```
Checkout example.scss in the src folder for a styling example

## Development
If you want to contribute to this plugin, fork this repository and create a pull request.
I've set up a gulp that compiles scss/js and fires up a simple http server. To use gulp run:
```
npm install -g gulp
```
After installing gulp globally, run to following command in the root folder:
```
npm install
```