# Language-Specific Patterns

## JavaScript/TypeScript

```typescript
// TYPE SAFETY
// BAD: any defeats the purpose
function process(data: any) { ... }

// GOOD: Proper typing
interface UserData {
  id: number;
  name: string;
  email: string;
}
function process(data: UserData) { ... }

// ASYNC/AWAIT
// BAD: Mixing callbacks and promises
async function getData() {
  return new Promise((resolve, reject) => {
    fetchData((err, data) => {  // Callback inside promise
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// GOOD: Consistent async/await or promisify
import { promisify } from 'util';
const fetchDataAsync = promisify(fetchData);
async function getData() {
  return await fetchDataAsync();
}

// ERROR HANDLING
// BAD: Swallowing errors
try {
  await riskyOperation();
} catch (e) {
  // Silent failure
}

// GOOD: Proper error handling
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error: error.message, stack: error.stack });
  throw new ApplicationError('Operation failed', { cause: error });
}
```

## Python

```python
# PEP 8 COMPLIANCE
# BAD
def myFunction(x,y): return x+y

# GOOD
def my_function(x: int, y: int) -> int:
    return x + y

# CONTEXT MANAGERS
# BAD: Manual resource management
f = open('file.txt')
data = f.read()
f.close()  # May not run on exception

# GOOD: Context manager
with open('file.txt') as f:
    data = f.read()

# TYPE HINTS
# BAD: No type information
def process_users(users):
    return [u.name for u in users]

# GOOD: Full type hints
from typing import List
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

def process_users(users: List[User]) -> List[str]:
    return [u.name for u in users]

# PYTHONIC IDIOMS
# BAD
result = []
for item in items:
    if item.active:
        result.append(item.name)

# GOOD
result = [item.name for item in items if item.active]
```

## Go

```go
// ERROR HANDLING
// BAD: Ignoring errors
result, _ := riskyOperation()

// GOOD: Handle all errors
result, err := riskyOperation()
if err != nil {
    return fmt.Errorf("operation failed: %w", err)
}

// GOROUTINE SAFETY
// BAD: Race condition
var counter int
for i := 0; i < 100; i++ {
    go func() {
        counter++  // Race condition
    }()
}

// GOOD: Use mutex or atomic
var counter int64
for i := 0; i < 100; i++ {
    go func() {
        atomic.AddInt64(&counter, 1)
    }()
}

// INTERFACE DESIGN
// BAD: Large interface
type Repository interface {
    Create(entity Entity) error
    Read(id string) (Entity, error)
    Update(entity Entity) error
    Delete(id string) error
    List() ([]Entity, error)
    Search(query string) ([]Entity, error)
    // ... 20 more methods
}

// GOOD: Small, focused interfaces
type Reader interface {
    Read(id string) (Entity, error)
}

type Writer interface {
    Create(entity Entity) error
    Update(entity Entity) error
    Delete(id string) error
}
```

## Rust

```rust
// OWNERSHIP
// BAD: Unnecessary clone
fn process(data: Vec<String>) {
    let cloned = data.clone();  // Expensive, often unnecessary
    // ...
}

// GOOD: Borrow when possible
fn process(data: &[String]) {
    // Works with borrowed data
}

// LIFETIME ISSUES
// BAD: Fighting the borrow checker
fn get_first<'a>(list: &'a Vec<String>) -> &'a str {
    &list[0]  // Panic if empty
}

// GOOD: Return Option
fn get_first(list: &[String]) -> Option<&str> {
    list.first().map(|s| s.as_str())
}

// UNSAFE USAGE
// BAD: Unnecessary unsafe
unsafe fn add(a: i32, b: i32) -> i32 {
    a + b  // No unsafe operations
}

// GOOD: Only use unsafe when necessary, document why
/// # Safety
/// Caller must ensure ptr is valid and aligned
unsafe fn dereference(ptr: *const i32) -> i32 {
    *ptr
}
```

## SQL

```sql
-- INJECTION PREVENTION
-- BAD: String concatenation
EXECUTE 'SELECT * FROM users WHERE id = ' || user_input;

-- GOOD: Parameterized query
PREPARE stmt AS SELECT * FROM users WHERE id = $1;
EXECUTE stmt(user_input);

-- QUERY OPTIMIZATION
-- BAD: Correlated subquery
SELECT *,
    (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) as order_count
FROM users;

-- GOOD: JOIN with aggregation
SELECT users.*, COALESCE(order_counts.count, 0) as order_count
FROM users
LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM orders
    GROUP BY user_id
) order_counts ON users.id = order_counts.user_id;

-- INDEX USAGE
-- Check if indexes are used
EXPLAIN ANALYZE SELECT * FROM orders
WHERE created_at > '2024-01-01' AND status = 'pending';
```
