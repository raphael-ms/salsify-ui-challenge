# Product Filtering Condition Editor UI

## Overview

This project implements a dynamic product filtering UI, allowing users to filter a product list by selecting a property (category), an operator, and (when needed) a value. The UI is built with vanilla JavaScript and uses BEM methodology for CSS class naming and modular, maintainable code.

---

## Approach

### 1. **Data-Driven UI**

- **Properties, Operators, and Products** are all defined in a central datastore.
- The UI reads from this datastore to populate the property and operator dropdowns, ensuring the UI always reflects the available data and rules.

### 2. **Dynamic Comboboxes**

- **Property Select:**  
  The first combobox lists all available properties (e.g., Product Name, Color, Category).  
  When a property is selected, the operator combobox is enabled and updated.

- **Operator Select:**  
  The second combobox lists only the valid operators for the selected property type (e.g., "Contains" for strings, "Is greater than" for numbers).  
  This mapping is defined in the README and enforced in code.

- **Value Input:**  
  Only shown when the selected operator requires a value.  
  - For `string` properties: a text input.
  - For `number` properties: a number input.
  - For `enumerated` properties: a dropdown with possible values.

### 3. **Filtering Logic**

- The filter logic is centralized in a single function.
- It applies the selected property, operator, and value to the product list, using case-insensitive matching for string comparisons.
- Operators like "Has any value" and "Has no value" do not require a value input.

### 4. **UI/UX Details**

- **Clear Button:**  
  Resets all filters and shows the full product list.
- **Responsiveness:**  
  The filter form and product table are styled to be usable on all screen sizes.
- **BEM CSS:**  
  All elements use BEM class names for clarity and maintainability.

### 5. **Maintainability**

- **Separation of Concerns:**  
  The code separates UI rendering, event handling, and filtering logic.
- **Reusable Components:**  
  The filter form and product table are modular and can be reused or extended.
- **CSS Variables:**  
  Colors and spacing are managed with CSS variables for easy theming.

---

## How to Use

1. **Select a property** from the first dropdown.
2. **Select an operator** from the second dropdown (enabled after property selection).
3. **Enter/select a value** if required by the operator.
4. The product table updates in real time to show matching products.
5. Click **Clear** to reset all filters.

---

## Key Files

- `src/components/filterForm.js` — Renders the filter UI and handles filtering logic.
- `src/components/productTable.js` — Renders the product table.
- `src/styles.css` — BEM-based, responsive styling.
- `src/datastore.js` — Contains the product, property, and operator data.
- `src/composables/useFilter.js` — Composable for managing filter state and logic. 
(I would change it to pure functions for better testability and reusability.)
- `src/composables/useFilter.spec.js` — Unit tests for the filter logic.

---

## Why This Approach?

- **User Experience:**  
  Only valid options are shown at each step, reducing user error.
- **Scalability:**  
  Adding new properties, operators, or product types requires minimal code changes.
- **Maintainability:**  
  BEM and modular JS make the codebase easy to extend and refactor.
  Also externalizes the logic to a component-based structure, allowing for easier updates and testing.

---

## Customization

- To add new properties or operators, update `datastore.js`.
- To change styling, edit the CSS variables or BEM classes in `styles.css`.

---

## Extensibility

This solution is ready to receive new properties and products.  
Simply add them to the `properties` or `products` arrays in `datastore.js` and the UI will update automatically—no further code changes are