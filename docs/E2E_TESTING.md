# E2E Testing Guide

## Overview

E2E tests menggunakan Cypress untuk menguji seluruh user flow dari browser perspective. Tests ini mencakup:
- UI interactions (click, type, select)
- API mocking untuk deterministic testing
- Navigation flows
- Form submissions
- Data validation

## Project Structure

### Admin Dashboard
```
/frontend/apps/admin/
├── cypress/
│   ├── e2e/
│   │   ├── dashboard.cy.ts       # Dashboard tests
│   │   ├── menu-management.cy.ts # Menu CRUD tests
│   │   └── orders.cy.ts          # Orders management tests
│   ├── support/
│   │   └── e2e.ts                # Shared helpers & commands
│   └── fixtures/                 # Test data
├── cypress.config.ts             # Cypress configuration
└── package.json
```

### SuperAdmin Dashboard
```
/frontend/apps/superadmin/
├── cypress/
│   ├── e2e/
│   │   ├── tenants.cy.ts        # Tenant management tests
│   │   └── users.cy.ts          # User management tests
│   ├── support/
│   │   └── e2e.ts
│   └── fixtures/
├── cypress.config.ts
└── package.json
```

## Running Tests

### Interactive Mode (Open Cypress UI)
```bash
# Admin Dashboard
cd /frontend/apps/admin
npm run e2e

# SuperAdmin Dashboard
cd /frontend/apps/superadmin
npm run e2e
```

### Headless Mode (CI/CD)
```bash
# Admin Dashboard
cd /frontend/apps/admin
npm run e2e:run

# SuperAdmin Dashboard
cd /frontend/apps/superadmin
npm run e2e:run
```

### Run Specific Test File
```bash
# Run only menu tests
npm run e2e:run -- --spec="cypress/e2e/menu-management.cy.ts"

# Run only dashboard tests
npm run e2e:run -- --spec="cypress/e2e/dashboard.cy.ts"
```

### Run Specific Test
```bash
# Run only one test
npm run e2e:run -- --spec="cypress/e2e/menu-management.cy.ts" -s "should be able to add new menu item"
```

## Test Coverage

### Admin Dashboard Tests
| Test File | Tests | Coverage |
|-----------|-------|----------|
| dashboard.cy.ts | 3 | Dashboard loading, metrics display, navigation |
| menu-management.cy.ts | 5 | List, search, add, edit, delete menus |
| orders.cy.ts | 5 | List, filter, view details, update status |
| **Total** | **13** | **Admin workflows** |

### SuperAdmin Dashboard Tests
| Test File | Tests | Coverage |
|-----------|-------|----------|
| tenants.cy.ts | 4 | List, details, add, update tenants |
| users.cy.ts | 4 | List, filter, add, update users |
| **Total** | **8** | **SuperAdmin workflows** |

### Combined E2E Coverage
- **Total E2E Tests:** 21
- **Scenarios Covered:** 21
- **User Flows:** All critical paths

## Example Tests

### Basic Test Structure
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '*/api/endpoint', { body: [...] }).as('apiCall');
    
    // Navigate to page
    cy.visit('/page-url');
  });

  it('should do something', () => {
    // Wait for API response
    cy.wait('@apiCall');
    
    // Interact with UI
    cy.get('[data-testid="element"]').click();
    
    // Assert results
    cy.contains('Expected text').should('be.visible');
  });
});
```

### API Mocking
```typescript
// Mock successful response
cy.intercept('POST', '*/api/menus', {
  statusCode: 201,
  body: { id: 1, name: 'Menu Item' },
}).as('createMenu');

// Mock error response
cy.intercept('DELETE', '*/api/menus/*', {
  statusCode: 403,
  body: { error: 'Permission denied' },
}).as('deleteFail');
```

### Custom Commands
```typescript
// Using custom login command
cy.login('admin', 'password123');

// Using mock login
cy.mockLoginResponse('token-123', { id: 1, role: 'admin' });
```

## Writing New Tests

### 1. Identify the User Flow
- What action does the user take?
- What API calls are made?
- What should the result be?

### 2. Create Test File
```bash
touch cypress/e2e/feature-name.cy.ts
```

### 3. Write Test
```typescript
describe('Feature Description', () => {
  beforeEach(() => {
    cy.mockLoginResponse('token', { role: 'admin' });
    cy.visit('/feature-page');
  });

  it('should accomplish task', () => {
    // Arrange: Set up mock responses
    cy.intercept('GET', '*/api/data', { body: [...] }).as('getData');
    
    // Act: User interactions
    cy.get('[data-testid="button"]').click();
    cy.get('[data-testid="input"]').type('value');
    
    // Assert: Verify results
    cy.wait('@getData');
    cy.contains('Success message').should('be.visible');
  });
});
```

### 4. Add data-testid Attributes
Components need `data-testid` for reliable element selection:
```jsx
<button data-testid="add-menu-button">Add Menu</button>
<input data-testid="menu-name" placeholder="Name" />
```

## Best Practices

### 1. Use data-testid for Selection
```typescript
// ✅ Good
cy.get('[data-testid="add-button"]').click();

// ❌ Avoid
cy.get('button').contains('Add').click();
```

### 2. Mock All API Calls
```typescript
// ✅ Good - deterministic
cy.intercept('GET', '*/api/items', { body: [...] }).as('getItems');

// ❌ Avoid - flaky tests
// Calling real API
```

### 3. Wait for API Responses
```typescript
// ✅ Good
cy.intercept('POST', '*/api/submit').as('submit');
cy.get('[data-testid="submit"]').click();
cy.wait('@submit');

// ❌ Avoid
cy.get('[data-testid="submit"]').click();
cy.contains('Success').should('be.visible');  // May not wait long enough
```

### 4. Use Descriptive Test Names
```typescript
// ✅ Good
it('should display error message when form is submitted with empty name field', () => {})

// ❌ Avoid
it('should work', () => {})
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '21'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build app
        run: npm run build
      
      - name: Run E2E tests
        run: npm run e2e:run
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

## Debugging Tests

### Run Test with Debug Mode
```bash
DEBUG=cypress:* npm run e2e:run
```

### Pause Test at Specific Point
```typescript
cy.pause();  // Pauses test execution
```

### View Test in Slow Motion
```typescript
cy.get('[data-testid="button"]').click({ delay: 1000 });  // 1 second delay between actions
```

### Print Debug Information
```typescript
cy.get('[data-testid="element"]').then(($el) => {
  console.log($el.text());  // Log element text
});
```

## Common Issues

### Tests Timing Out
- Increase `defaultCommandTimeout` in cypress.config.ts
- Ensure API mocks are set up correctly
- Use `cy.wait()` for async operations

### Element Not Found
- Check `data-testid` attribute exists in component
- Ensure element is visible/not hidden
- Verify selector is correct

### API Call Not Mocked
- Add `cy.intercept()` before visiting page
- Check URL pattern matches
- Verify request method (GET, POST, etc.)

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Testing](https://docs.cypress.io/guides/guides/network-requests)
