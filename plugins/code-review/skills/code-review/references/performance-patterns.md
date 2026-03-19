# Performance Analysis Patterns

## Time Complexity Issues

| Pattern | Problem | Solution |
|-|-|-|
| Nested loops over same data | O(n^2) | Use hash map O(n) |
| Repeated array searches | O(n) per search | Build index first |
| String concatenation in loop | O(n^2) for strings | Use StringBuilder/join |
| Recursive without memoization | Exponential | Add memoization |

```python
# O(n²) - SLOW
def find_pairs(arr, target):
    pairs = []
    for i, a in enumerate(arr):
        for j, b in enumerate(arr):
            if i != j and a + b == target:
                pairs.append((a, b))
    return pairs

# O(n) - FAST
def find_pairs(arr, target):
    pairs = []
    seen = set()
    for num in arr:
        complement = target - num
        if complement in seen:
            pairs.append((complement, num))
        seen.add(num)
    return pairs
```

## Database Query Optimization

### N+1 Query Problem
```python
# N+1 PROBLEM - 1 + N queries
users = User.query.all()
for user in users:
    print(user.posts)  # Each access triggers a query

# FIXED - 1 query with eager loading
users = User.query.options(joinedload(User.posts)).all()
for user in users:
    print(user.posts)  # Already loaded
```

### Missing Indexes
```sql
-- SLOW: Full table scan
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';

-- Check with EXPLAIN
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';

-- ADD INDEX
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### Query Optimization Patterns
```sql
-- AVOID: SELECT *
SELECT * FROM users WHERE id = 1;

-- BETTER: Select only needed columns
SELECT id, name, email FROM users WHERE id = 1;

-- AVOID: LIKE with leading wildcard
SELECT * FROM products WHERE name LIKE '%phone%';

-- BETTER: Full-text search or index suffix
CREATE INDEX idx_products_name_reverse ON products(REVERSE(name));
```

## Memory Leak Patterns

```javascript
// LEAK: Event listeners not removed
class Component {
  mount() {
    window.addEventListener('resize', this.handleResize);
  }
  // Missing: unmount() to remove listener
}

// FIXED
class Component {
  mount() {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  unmount() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// LEAK: Closures holding references
function createHandler(largeData) {
  return function() {
    // largeData is retained even if not used
    console.log('clicked');
  };
}

// FIXED: Don't capture unnecessary data
function createHandler() {
  return function() {
    console.log('clicked');
  };
}
```

## Async/Await Patterns

```javascript
// SLOW: Sequential when could be parallel
async function loadData() {
  const users = await fetchUsers();       // Wait
  const products = await fetchProducts(); // Then wait
  const orders = await fetchOrders();     // Then wait
  return { users, products, orders };
}

// FAST: Parallel execution
async function loadData() {
  const [users, products, orders] = await Promise.all([
    fetchUsers(),
    fetchProducts(),
    fetchOrders()
  ]);
  return { users, products, orders };
}

// CORRECT: Sequential when dependent
async function processOrder(userId) {
  const user = await fetchUser(userId);        // Need user first
  const cart = await fetchCart(user.cartId);   // Then cart
  const order = await createOrder(user, cart); // Then order
  return order;
}
```

## Caching Opportunities

```python
# NO CACHING - Repeated expensive computation
def get_user_stats(user_id):
    # This hits DB every time
    return compute_expensive_stats(user_id)

# WITH CACHING
from functools import lru_cache

@lru_cache(maxsize=100)
def get_user_stats(user_id):
    return compute_expensive_stats(user_id)

# WITH REDIS for distributed caching
def get_user_stats(user_id):
    cache_key = f"user_stats:{user_id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)

    stats = compute_expensive_stats(user_id)
    redis.setex(cache_key, 3600, json.dumps(stats))  # 1 hour TTL
    return stats
```
