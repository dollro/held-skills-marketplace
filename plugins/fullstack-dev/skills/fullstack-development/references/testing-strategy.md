# Testing Strategy

## Unit Tests (Business Logic)
```typescript
// Backend: Test service layer
describe('OrderService', () => {
  it('should calculate total with tax', () => {
    const items = [{ price: 100, quantity: 2 }];
    const total = orderService.calculateTotal(items, 0.08);
    expect(total).toBe(216); // 200 + 16 tax
  });
});

// Frontend: Test utility functions
describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

## Integration Tests
```typescript
// API endpoint tests
describe('POST /api/orders', () => {
  it('should create order and return 201', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ items: [{ productId: 1, quantity: 2 }] });

    expect(response.status).toBe(201);
    expect(response.body.orderId).toBeDefined();
  });
});
```

## Component Tests
```typescript
// React Testing Library
describe('OrderForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<OrderForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Quantity'), '5');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({ quantity: 5 });
  });
});
```

## End-to-End Tests
```typescript
// Playwright E2E
test('complete checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart-1"]');
  await page.click('[data-testid="checkout-button"]');

  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="card"]', '4242424242424242');
  await page.click('[data-testid="pay-button"]');

  await expect(page.locator('.order-confirmation')).toBeVisible();
});
```

## Performance Tests
```typescript
// k6 load testing
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],   // <1% errors
  },
};

export default function () {
  const res = http.get('https://api.example.com/products');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```
