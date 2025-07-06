import { useFilter } from '../composables/useFilter.js';

export function renderFilterForm(onFilter) {
	const properties = window.datastore.getProperties();
	const operators = window.datastore.getOperators();

	// HTML ELEMENTS SECTION
	const form = document.createElement('form');
	form.className = 'filter-form';

	// PROPERTY SELECT
	const propertySelect = document.createElement('select');
	propertySelect.name = 'property';
	propertySelect.className = 'filter-form__select filter-form__select--property';
	const propertyPlaceholder = document.createElement('option');
	propertyPlaceholder.value = '';
	propertyPlaceholder.textContent = 'Select a property...';
	propertyPlaceholder.disabled = true;
	propertyPlaceholder.selected = true;
	propertySelect.appendChild(propertyPlaceholder);
	properties.forEach(prop => {
		const option = document.createElement('option');
		option.value = prop.id;
		option.textContent = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
		propertySelect.appendChild(option);
	});

	// OPERATOR SELECT
	const operatorSelect = document.createElement('select');
	operatorSelect.name = 'operator';
	operatorSelect.className = 'filter-form__select filter-form__select--operator';
	operatorSelect.disabled = true;
	const operatorPlaceholder = document.createElement('option');
	operatorPlaceholder.value = '';
	operatorPlaceholder.textContent = 'Select an operator...';
	operatorPlaceholder.disabled = true;
	operatorPlaceholder.selected = true;
	operatorSelect.appendChild(operatorPlaceholder);

	// CLEAR BUTTON
	const clearBtn = document.createElement('button');
	clearBtn.type = 'button';
	clearBtn.textContent = 'Clear';
	clearBtn.className = 'filter-form__clear-btn';

	// IMPORTING METHODS FROM COMPOSABLE
	const {
		updateOperatorOptions,
		updateValueInput,
		applyFilter
	} = useFilter(
		operatorSelect,
		operatorPlaceholder,
		operators,
		propertySelect,
		properties,
	);

	// WHEN USER SELECTS A PROPERTY
	propertySelect.addEventListener('change', () => {
		updateOperatorOptions();
		onFilter(applyFilter());
	});

	// WHEN USER SELECTS AN OPERATOR
	operatorSelect.addEventListener('change', () => {
		updateValueInput();
		onFilter(applyFilter());
	});


	// WHEN USER INPUTS A VALUE
	form.addEventListener('input', (event) => {
		if (event.target.name === 'value') {
			onFilter(applyFilter());
		}
	});

	// WHEN USER CLICKS THE CLEAR BUTTON
	clearBtn.addEventListener('click', () => {
		propertySelect.selectedIndex = 0;
		updateOperatorOptions();
		onFilter(window.datastore.getProducts());
		operatorSelect.disabled = true;
		operatorSelect.selectedIndex = 0;
	});

	// ON MOUNT
	form.appendChild(propertySelect);
	form.appendChild(operatorSelect);
	form.appendChild(clearBtn);

	form.classList.add('filter-form--container');

	return form;
}