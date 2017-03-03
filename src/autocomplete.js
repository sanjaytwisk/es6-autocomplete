/**
 * Response handler for window.fetch response
 * @param {object} response
 * @return {object}
 */
const handleResponse = response => {
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response.json();
};

/**
 * @constant
 * @type {string}
 */
const SELECTED = 'item--selected';
const ACTIVE = 'autocompleting';
const VISIBLE = 'visible';
const ARROW_UP = 38;
const ARROW_DOWN = 40;
const ENTER = 13;

/**
 * Default options object
 * @type {{minCharacters: number, fetchDelay: number, inputClassName: string, autoCompleteBaseClass: string, url: null}}
 */
const defaultOptions = {
	minCharacters: 2,
	fetchDelay: 500,
	inputClassName: 'input',
	autoCompleteBaseClass: 'autocomplete',
	url: null
};

/**
 * Class AutoComplete
 * @class
 */
class AutoComplete {

	/**
	 * Get indexes of search query in string
	 * @param {string} string
	 * @param {string} query
	 * @returns {Array}
	 */
	static getQueryIndexes(string, query) {
		const regex = new RegExp(query, 'g');
		const allMatches = [];
		let match;
		while (match = regex.exec(string)) {
			allMatches.push(match.index);
		}

		return allMatches;
	}

	/**
	 * Constructor
	 * @constructs
	 * @param {HTMLElement} element
	 * @param {object} options
	 */
	constructor(element, options) {
		if (!options.url) {
			throw new Error('Autocomplete url is mendatory');
		}
		this._options = Object.assign({}, defaultOptions, options);
		this.element = element;
		this.timeout = 0;
		this.itemsList = '';
		this.items = [];
		this.selectedIndex = -1;
		this.isOpen = false;
		this._load();
	}

	/**
	 * Load util
	 * @private
	 */
	_load() {
		this._createContainer();
		this._addEventListeners();
		this.element.setAttribute('autocomplete', 'off');
	}

	/**
	 * Add event listeners
	 * @private
	 */
	_addEventListeners() {
		this.element.addEventListener('input', evt => this._onInput(evt));
		this.element.addEventListener('click', evt => this._onFocus(evt));
		this.element.addEventListener('blur', evt => this._onBlur(evt));
		this.element.addEventListener('focus', evt => this._onFocus(evt));
		this.element.addEventListener('keyup', evt => this._onKeyup(evt));
		this.container.addEventListener('click', evt => this._onClick(evt));
	}

	/**
	 * Create the container div
	 * @private
	 */
	_createContainer() {
		this.container = document.createElement('div');
		this.container.className = this._options.autoCompleteBaseClass;
		this.element.parentNode.appendChild(this.container);
	}

	/**
	 * Key up event handler
	 * Handles arrow up, arrow down and enter keys
	 * @private
	 * @param {Event} evt - keyup event object
	 */
	_onKeyup(evt) {
		const key = evt.keyCode;
		const isSelecting = key === ARROW_UP || key === ARROW_DOWN;
		const isConfirming = key === ENTER;

		if (!this.isOpen && this.items.length && isSelecting) {
			this._render(this.itemsList);
			this.isOpen = true;
		}

		if (isSelecting && this.isOpen) {
			const direction = key === ARROW_UP ? 'up' : 'down';
			this._changeSelected(direction);
		}

		if (isConfirming && this.isOpen) {
			this._useSelected();
			this._onBlur();
		}
	}

	/**
	 * Blur event handler
	 * @private
	 */
	_onBlur() {
		// Use timeout for click event trigger
		setTimeout(() => {
			this._render('');
			this.isOpen = false;
			this.selectedIndex = -1;
			this.element.classList.remove(this.autoCompletingClassName);
		}, 150);
	}

	/**
	 * Focus event handler
	 * @private
	 */
	_onFocus() {
		if (this.items.length && !this.isOpen) {
			this._render(this.itemsList);
			this.isOpen = true;
			this.element.classList.add(this.autoCompletingClassName);
		}
	}

	/**
	 * Input event handler
	 * @private
	 * @param {event} evt
	 */
	_onInput(evt) {
		clearTimeout(this.timeout);
		this.value = evt.target.value;
		this.timeout = setTimeout(() => {
			this._fetchItems(this.value)
				.then(this._createAutoComplete.bind(this))
				.then(this._render.bind(this));
		}, this.delay);
	}

	/**
	 * Click event handler
	 * @private
	 * @param {Event} evt - click event object
	 */
	_onClick(evt) {
		const itemClicked = evt.target.classList.contains(`${this.baseClassName}__item`);
		if (itemClicked) {
			this._useSelected(evt.target);
		}
	}

	/**
	 * Create a DOM string to render the autocomplete list
	 * @private
	 * @param {string} value
	 * @returns {Promise|boolean}
	 */
	_fetchItems(value) {
		const canFetch = value.length >= this.minCharacters;
		const headers = {
			'method': 'GET',
			'credentials': 'same-origin',
			'Content-Type': 'application/json'
		};
		if (canFetch) {
			return window.fetch(this._getUrl(value), headers)
				.then(handleResponse)
				.catch(error => console.error(error.response));
		}
		return Promise.resolve(false);
	}

	/**
	 * Create auto complete
	 * @private
	 * @param {Array} items
	 * @returns {HTMLElement}
	 */
	_createAutoComplete(items) {
		if (items) {
			this.items = items;
			this.selectedIndex = -1;
			this.itemsList = this._getRenderList(this.items, this.value);
			this.isOpen = true;
			this.element.classList.add(this.autoCompletingClassName);
		} else {
			this.items = [];
			this.itemsList = '';
		}
		return this.itemsList;
	}

	/**
	 * Change the selected item
	 * @private
	 * @param {string} direction
	 */
	_changeSelected(direction) {
		const canGoUp = this.selectedIndex > 0;
		const canGoDown = this.selectedIndex < (this.items.length - 1);
		let index = this.selectedIndex;
		if (direction === 'up' && canGoUp) {
			index--;
		} else if (direction === 'down' && canGoDown) {
			index++;
		}
		this._setSelected(index);
	}

	/**
	 * Set selected item
	 * @private
	 * @param {Number} index - index of the item to select
	 */
	_setSelected(index) {
		const items = Array.from(this.container.querySelectorAll(`.${this.baseClassName}__item`));
		this.selectedIndex > -1 && items[this.selectedIndex].classList.remove(this.selectedClassName);
		items[index].classList.add(this.selectedClassName);
		this.selectedIndex = index;
	}

	/**
	 * Use the currently selected item as input value
	 * @private
	 * @param {HTMLElement|undefined} element - element to use
	 */
	_useSelected(element) {
		const selectedItem = element || this.container.querySelector(`.${this.selectedClassName}`);
		this.element.value = selectedItem.getAttribute('data-autocomplete-value');
	}

	/**
	 * Generate DOM html sting from item array
	 * @private
	 * @param {Array} items
	 * @param {string} query
	 * @returns {string}
	 */
	_getRenderList(items, query) {
		const listItems = items.map((item, index) => this._getRenderListItem(item, index, query));
		return `
            <ul class="${this.baseClassName}__list">
                ${listItems.join('\n')}
            </ul>`;
	}

	/**
	 * Get DOM list item as a string
	 * @private
	 * @param {string} item
	 * @param {number} index
	 * @param {string} query
	 * @returns {string}
	 */
	_getRenderListItem(item, index, query) {
		const activeClass = index === this.selectedIndex ? ` ${this.selectedClassName}` : '';
		const queryIndexes = AutoComplete.getQueryIndexes(item, query);
		const highlightedClassname = `${this.baseClassName}__highlight`;
		let highlighted = queryIndexes.length ? '' : item;
		if (queryIndexes.length) {
			queryIndexes.reduce((previousIndex, currentIndex, position) => {
				const end = queryIndexes[position + 1] ? queryIndexes[position + 1] : item.length;
				highlighted += `
					${item.slice(previousIndex, currentIndex)}
					<span class="${highlightedClassname}">${item.slice(currentIndex, currentIndex + query.length)}</span>
					${item.slice(currentIndex + query.length, end)}
                `;
				return end;
			}, 0);
		}
		const content = highlighted.replace(/\t/g, '').replace(/\n/g, '');
		return `<li class="${this.baseClassName}__item${activeClass}" data-autocomplete-value="${item}">${content}</li>`
	}

	/**
	 * Render the autocomplete list
	 * @private
	 * @param {string} html
	 */
	_render(html) {
		const hasHtml = html === '';
		const action = hasHtml ? 'remove' : 'add';

		this.container.innerHTML = html;
		this.container.classList[action](`${this._options.autoCompleteBaseClass}--${VISIBLE}`);
	}

	/**
	 * Get fetch url
	 * @private
	 * @param {string} query
	 * @returns {string}
	 */
	_getUrl(query) {
		return `${this._options.url}?query=${query}`;
	}

	/**
	 * GETTERS
	 */

	/**
	 * Get minimum characters
	 * @returns {number|*}
	 */
	get minCharacters() {
		return this._options.minCharacters;
	}

	/**
	 * Fetch delay
	 * @returns {number}
	 */
	get delay() {
		return this._options.fetchDelay;
	}

	/**
	 * Auto complete root element class name
	 * @returns {string}
	 */
	get baseClassName() {
		return this._options.autoCompleteBaseClass;
	}

	/**
	 * Selected item class name
	 * @returns {string}
	 */
	get selectedClassName() {
		return `${this.baseClassName}__${SELECTED}`;
	}

	/**
	 * Auto completing class name
	 * @returns {string}
	 */
	get autoCompletingClassName() {
		return `${this._options.inputClassName}--${ACTIVE}`;
	}
}

export default AutoComplete;
