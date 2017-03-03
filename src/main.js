import Autocomplete from './autocomplete';

window.onload = () => {
	const input = document.querySelector('[data-input]');
	new Autocomplete(input, { url: '/autocomplete.json' });
};
