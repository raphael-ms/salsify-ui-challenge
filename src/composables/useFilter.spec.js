import { useFilter } from './useFilter';

describe('useFilter', () => {
  let operatorSelect, operatorPlaceholder, propertySelect, operators, properties, products, datastoreBackup;

  // Mock DOM API
  let createdElements = [];
  beforeEach(() => {
    createdElements = [];
    // Mock document.createElement
    global.document = {
      createElement: jest.fn((type) => {
        const el = {
          type,
          name: '',
          className: '',
          value: '',
          options: [],
          children: [],
          parentNode: null,
          placeholder: '',
          appendChild(child) {
            this.children.push(child);
            child.parentNode = this;
          },
          removeChild(child) {
            this.children = this.children.filter(c => c !== child);
            child.parentNode = null;
          },
          cloneNode() {
            return { ...this, children: [...this.children] };
          },
          after: jest.fn(),
          set textContent(val) { this._textContent = val; },
          get textContent() { return this._textContent; }
        };
        createdElements.push(el);
        return el;
      })
    };

    // Mock select elements
    operatorSelect = {
      innerHTML: '',
      appendChild: jest.fn(),
      disabled: false,
      selectedIndex: 0,
      value: '',
      after: jest.fn(),
      children: [],
    };
    operatorPlaceholder = {
      cloneNode: jest.fn(() => ({ ...operatorPlaceholder })),
    };
    propertySelect = {
      value: '',
    };

    // Operators and properties
    operators = [
      { id: 'equals', text: 'Equals' },
      { id: 'greater_than', text: 'Is greater than' },
      { id: 'less_than', text: 'Is less than' },
      { id: 'any', text: 'Has any value' },
      { id: 'none', text: 'Has no value' },
      { id: 'in', text: 'Is any of' },
      { id: 'contains', text: 'Contains' }
    ];
    properties = [
      { id: 0, name: 'Product Name', type: 'string' },
      { id: 1, name: 'Weight', type: 'number' },
      { id: 2, name: 'Category', type: 'enumerated', values: ['tools', 'electronics'] }
    ];

    // Products
    products = [
      {
        id: 0,
        property_values: [
          { property_id: 0, value: 'Headphones' },
          { property_id: 1, value: 5 },
          { property_id: 2, value: 'electronics' }
        ]
      },
      {
        id: 1,
        property_values: [
          { property_id: 0, value: 'Hammer' },
          { property_id: 1, value: 19 },
          { property_id: 2, value: 'tools' }
        ]
      }
    ];

    // Mock window.datastore
    datastoreBackup = global.window?.datastore;
    global.window = {
      datastore: {
        getProducts: jest.fn(() => products)
      }
    };
  });

  afterEach(() => {
    global.document = undefined;
    global.window.datastore = datastoreBackup;
  });

  describe('updateOperatorOptions', () => {
    it('adds correct operator options for string property', () => {
      // ARRANGE
      propertySelect.value = 0;
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateOperatorOptions();
      // ASSERT
      expect(operatorSelect.innerHTML).toBe('');
      expect(operatorSelect.appendChild).toHaveBeenCalled();
      expect(operatorSelect.disabled).toBe(false);
      const validOps = ['equals', 'any', 'none', 'in', 'contains'];
      const addedOptions = [];
      for (let call of document.createElement.mock.calls) {
        if (call[0] === 'option') {
          const op = createdElements.find(e => e.type === 'option' && e.value);
          if (op) addedOptions.push(op.value);
        }
      }
      const appendedOps = operatorSelect.appendChild.mock.calls
        .map(call => call[0])
        .filter(opt => opt.value)
        .map(opt => opt.value);
      expect(appendedOps).toEqual(expect.arrayContaining(validOps));
    });

    it('disables operatorSelect if no property selected', () => {
      // ARRANGE
      propertySelect.value = '';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, []);
      // ACT
      filter.updateOperatorOptions();
      // ASSERT
      expect(operatorSelect.disabled).toBe(true);
    });
  });

  describe('updateValueInput', () => {
    it('does nothing for "any" or "none" operator', () => {
      // ARRANGE
      propertySelect.value = 0;
      operatorSelect.value = 'any';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      // ASSERT
      expect(document.createElement).not.toHaveBeenCalledWith('input');
      expect(document.createElement).not.toHaveBeenCalledWith('select');
    });

    it('creates select for enumerated property', () => {
      // ARRANGE
      propertySelect.value = 2;
      operatorSelect.value = 'equals';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      // ASSERT
      expect(document.createElement).toHaveBeenCalledWith('select');
      const select = createdElements.find(e => e.type === 'select');
      expect(select.children.length).toBe(2);
      expect(select.children[0].value).toBe('tools');
      expect(select.children[1].value).toBe('electronics');
      expect(operatorSelect.after).toHaveBeenCalled();
    });

    it('creates number input for number property', () => {
      // ARRANGE
      propertySelect.value = 1;
      operatorSelect.value = 'equals';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      const input = createdElements.find(e => e.type === 'number');
      // ASSERT
      expect(document.createElement).toHaveBeenCalledWith('input');
      expect(input.className).toMatch(/number/);
      expect(input.type).toBe('number');
      expect(operatorSelect.after).toHaveBeenCalled();
    });

    it('creates text input for string property', () => {
      propertySelect.value = 0;
      operatorSelect.value = 'equals';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);

      filter.updateValueInput();
      const input = createdElements.find(e => e.type === 'text');

      expect(document.createElement).toHaveBeenCalledWith('input');
      expect(input.className).toMatch(/text/);
      expect(input.type).toBe('text');
      expect(operatorSelect.after).toHaveBeenCalled();
    });

    it('sets placeholder for "in" operator', () => {
      // ARRANGE
      propertySelect.value = 0;
      operatorSelect.value = 'in';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      const input = createdElements.find(e => e.type === 'text');
      // ASSERT
      expect(input.placeholder).toBe('Comma-separated');
    });
  });

  describe('applyFilter', () => {
    it('returns all products if no property or operator selected', () => {
      // ARRANGE
      propertySelect.value = '';
      operatorSelect.value = '';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      const result = filter.applyFilter();
      // ASSERT
      expect(result).toBe(products);
    });

    it('filters by string equals (case-insensitive)', () => {
      // ARRANGE
      propertySelect.value = 0;
      operatorSelect.value = 'equals';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      createdElements.find(e => e.type === 'text').value = 'headphones';
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(1);
      expect(result[0].property_values[0].value).toBe('Headphones');
    });

    it('filters by number greater_than', () => {
      // ARRANGE
      propertySelect.value = 1;
      operatorSelect.value = 'greater_than';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      createdElements.find(e => e.type === 'number').value = '10';
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(1);
      expect(result[0].property_values[0].value).toBe('Hammer');
    });

    it('filters by enumerated equals', () => {
      // ARRANGE
      propertySelect.value = 2;
      operatorSelect.value = 'equals';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      createdElements.find(e => e.type === 'select').value = 'tools';
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(1);
      expect(result[0].property_values[0].value).toBe('Hammer');
    });

    it('filters by "in" operator (array)', () => {
      // ARRANGE
      propertySelect.value = 0;
      operatorSelect.value = 'in';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      createdElements.find(e => e.type === 'text').value = 'headphones, Hammer';
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(2);
    });

    it('filters by "contains" operator', () => {
      // ARRANGE
      propertySelect.value = 0;
      operatorSelect.value = 'contains';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      filter.updateValueInput();
      createdElements.find(e => e.type === 'text').value = 'phone';
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(1);
      expect(result[0].property_values[0].value).toBe('Headphones');
    });

    it('filters by "any" operator', () => {
      // ARRANGE
      propertySelect.value = 2;
      operatorSelect.value = 'any';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(2);
    });

    it('filters by "none" operator', () => {
      // ARRANGE
      products = [
        ...products,
        { id: 2, property_values: [{ property_id: 0, value: 'NoCat' }, { property_id: 1, value: 1 }] }
      ];
      global.window.datastore.getProducts = jest.fn(() => products);
      propertySelect.value = 2;
      operatorSelect.value = 'none';
      const filter = useFilter(operatorSelect, operatorPlaceholder, operators, propertySelect, properties);
      // ACT
      const result = filter.applyFilter();
      // ASSERT
      expect(result.length).toBe(1);
      expect(result[0].property_values[0].value).toBe('NoCat');
    });
  });
});