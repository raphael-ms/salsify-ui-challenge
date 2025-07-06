export function renderProductTable(products) {
  const properties = window.datastore.getProperties();
  const columns = properties.map(prop => prop.name.charAt(0).toUpperCase() + prop.name.slice(1));
  const table = document.createElement('table');
  table.className = 'product-table';

  const thead = document.createElement('thead');
  thead.className = 'product-table__head';
  const headerRow = document.createElement('tr');
  headerRow.className = 'product-table__row product-table__row--header';

  columns.forEach(col => {
    const th = document.createElement('th');
    th.className = 'product-table__cell product-table__cell--header';
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.className = 'product-table__body';
  products.forEach(product => {
    const row = document.createElement('tr');
    row.className = 'product-table__row';
    for (let i = 0; i < columns.length; i++) {
      const cell = document.createElement('td');
      cell.className = 'product-table__cell';
      const prop = product.property_values.find(pv => pv.property_id === i);
      cell.textContent = prop ? prop.value : '';
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  return table;
}