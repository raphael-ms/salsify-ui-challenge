import { renderProductTable } from './components/productTable.js';
import { renderFilterForm } from './components/filterForm.js';

const app = document.getElementById('app');

const filterContainer = document.createElement('div');
const tableContainer = document.createElement('div');
app.appendChild(filterContainer);
app.appendChild(tableContainer);

filterContainer.appendChild(renderFilterForm(onFilter));

function render(products) {
  tableContainer.innerHTML = '';
  tableContainer.appendChild(renderProductTable(products));
}

function onFilter(filteredProducts) {
  render(filteredProducts);
}

render(window.datastore.getProducts());