/**
 * Composable function to manage filtering logic for a product list.
 * It provides methods to update operator options, generate value input fields,
 * and apply filters based on selected properties, operators, and values.
 * @param {HTMLSelectElement} operatorSelect 
 * @param {HTMLOptionElement} operatorPlaceholder 
 * @param {Array<Object>} operators 
 * @param {HTMLSelectElement} propertySelect 
 * @param {Array<Object>} properties
 * @returns {Object} An object containing methods to manage filtering.
 */
export const useFilter = (
  operatorSelect,
  operatorPlaceholder,
  operators,
  propertySelect,
  properties
) => {
  let valueInput = null;

  /**
   * Gets the valid operators for a given property type.
   * @param {string} type - The type of the property (e.g., 'string', 'number', 'enumerated').
   * @returns {Array<string>} An array of valid operator IDs.
   */

  //TODO: Create constants for operator IDs and types to avoid 'magic strings'.
  function getValidOperators(type) {
    switch (type) {
      case 'string':
        return ['equals', 'any', 'none', 'in', 'contains'];
      case 'number':
        return ['equals', 'greater_than', 'less_than', 'any', 'none', 'in'];
      case 'enumerated':
        return ['equals', 'any', 'none', 'in'];
      default:
        return [];
    }
  }

  /**
   * Updates the operator options based on the selected property.
   */
  function updateOperatorOptions() {
    operatorSelect.innerHTML = '';
    operatorSelect.appendChild(operatorPlaceholder.cloneNode(true));
    operatorSelect.disabled = true;
    removeValueInput();

    const selectedProp = properties.find(p => p.id == propertySelect.value);
    if (!selectedProp) return;

    const validOps = getValidOperators(selectedProp.type);
    operators
      .filter(op => validOps.includes(op.id))
      .forEach(op => {
        const option = document.createElement('option');
        option.value = op.id;
        option.textContent = op.text;
        operatorSelect.appendChild(option);
      });
    operatorSelect.selectedIndex = 0;
    operatorSelect.disabled = false;
  }

  /**
   * Removes the value input element from the DOM.
   */
  function removeValueInput() {
    if (valueInput && valueInput.parentNode) {
      valueInput.parentNode.removeChild(valueInput);
      valueInput = null;
    }
  }

  /**
   * Modifies the value input element to the specified type, className, and inputType.
   * @param {string} type HYML element type (e.g., 'input', 'select')
   * @param {string} className Name of the class to apply to the element
   * @param {string} inputType Type of input for the element (e.g., 'text', 'number')
   * @returns {void}
   */
  function generateValueInputElement(type, className, inputType) {
    valueInput = document.createElement(type);
    valueInput.name = 'value';
    valueInput.className = className;
    if (type === 'input') valueInput.type = inputType;
  }

  /**
   * Updates the value input field based on the selected property and operator.
   * @returns {void}
   */
  function updateValueInput() {
    removeValueInput();
    const selectedProp = properties.find(p => p.id == propertySelect.value);
    const selectedOp = operatorSelect.value;
    if (!selectedProp || !selectedOp) return;

    if (['any', 'none'].includes(selectedOp)) return;

    if (selectedProp.type === 'enumerated') {
      generateValueInputElement('select', 'filter-form__select filter-form__select--value', null);
      selectedProp.values.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val.charAt(0).toUpperCase() + val.slice(1);
        valueInput.appendChild(opt);
      });
    } else if (selectedProp.type === 'number') {
      generateValueInputElement('input', 'filter-form__input filter-form__input--number', 'number');
    } else {
      generateValueInputElement('input', 'filter-form__input filter-form__input--text', 'text');
      if (selectedOp === 'in') {
        valueInput.placeholder = 'Comma-separated';
      }
    }
    operatorSelect.after(valueInput);
  }


  /**
   * Applies the selected filters to the product list.
   * @returns {Array} Filtered products based on the selected property, operator, and value.
   */
  function applyFilter() {
    const selectedPropId = parseInt(propertySelect.value, 10);
    const selectedProp = properties.find(p => p.id === selectedPropId);
    const selectedOp = operatorSelect.value;

    if (!selectedProp || !selectedOp) return window.datastore.getProducts();

    let value;
    if (['any', 'none'].includes(selectedOp)) {
      value = null;
    } else if (selectedProp.type === 'enumerated') {
      value = valueInput ? valueInput.value : undefined;
    } else if (selectedProp.type === 'number') {
      value = valueInput && valueInput.value !== '' ? Number(valueInput.value) : null;
    } else {
      if (selectedOp === 'in' && valueInput) {
        value = valueInput.value.split(',').map(v => v.trim()).filter(Boolean);
      } else if (valueInput) {
        value = valueInput.value;
      }
    }

    return window.datastore.getProducts().filter(product => {
      const propValObj = product.property_values.find(pv => pv.property_id === selectedPropId);
      const propVal = propValObj ? propValObj.value : undefined;

      switch (selectedOp) {
        case 'equals':
          return propVal !== undefined && String(propVal).toLowerCase() === String(value).toLowerCase();
        case 'greater_than':
          return propVal !== undefined && Number(propVal) > value;
        case 'less_than':
          return propVal !== undefined && Number(propVal) < value;
        case 'any':
          return propVal !== undefined && propVal !== null && propVal !== '';
        case 'none':
          return propVal === undefined || propVal === null || propVal === '';
        case 'in':
          if (Array.isArray(value)) {
            return (
              propVal !== undefined &&
              value.map(v => String(v).toLowerCase()).includes(String(propVal).toLowerCase())
            );
          } else if (typeof value === 'string') {
            return (
              propVal !== undefined &&
              value
                .split(',')
                .map(v => v.trim().toLowerCase())
                .includes(String(propVal).toLowerCase())
            );
          }
          return false;
        case 'contains':
          return (
            propVal !== undefined &&
            String(propVal).toLowerCase().includes(String(value).toLowerCase())
          );
        default:
          return true;
      }
    });
  }

  return {
    updateOperatorOptions,
    updateValueInput,
    applyFilter
  };
}