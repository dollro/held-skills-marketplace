# Review Output Templates & Code Smells

## Code Smell Detection

### Common Code Smells

| Smell | Symptom | Refactoring |
|-|-|-|
| Long Method | > 30 lines | Extract methods |
| Large Class | > 500 lines | Split responsibilities |
| Long Parameter List | > 4 params | Use object/builder |
| Duplicate Code | Copy-paste patterns | Extract shared function |
| Feature Envy | Method uses other class's data | Move method |
| Data Clumps | Same groups of parameters | Create class |
| Primitive Obsession | Using primitives for domain concepts | Create value objects |
| Switch Statements | Long switch on type | Use polymorphism |
| Parallel Inheritance | Adding class requires adding to another hierarchy | Merge hierarchies |
| Comments | Excessive comments explaining code | Improve naming/structure |

### Detection Examples

```python
# LONG PARAMETER LIST
# BAD
def create_user(first_name, last_name, email, phone, address, city, country, zip_code, role):
    ...

# GOOD
@dataclass
class UserCreateRequest:
    first_name: str
    last_name: str
    email: str
    phone: str
    address: Address
    role: str

def create_user(request: UserCreateRequest):
    ...

# FEATURE ENVY
# BAD - Order is too interested in Customer's data
class Order:
    def calculate_discount(self):
        if self.customer.loyalty_points > 100:
            if self.customer.membership == 'gold':
                return self.total * 0.2
            return self.total * 0.1
        return 0

# GOOD - Move to Customer or create service
class Customer:
    def get_discount_rate(self) -> float:
        if self.loyalty_points > 100:
            return 0.2 if self.membership == 'gold' else 0.1
        return 0

class Order:
    def calculate_discount(self):
        return self.total * self.customer.get_discount_rate()
```

## Summary Template
```markdown
## Code Review Summary

**Overall Assessment:** [Approve / Request Changes / Needs Discussion]

**Quality Score:** X/10

**Key Findings:**
- [Critical issue or highlight]
- [Important observation]
- [Notable pattern]

**Scope Reviewed:**
- Files: X
- Lines changed: Y
```

## Issue Template
```markdown
### [CRITICAL/HIGH/MEDIUM/LOW] - [Issue Title]

**Location:** `file.py:42-50`

**Problem:**
[Description of the issue]

**Current Code:**
```python
vulnerable_code_here()
```

**Suggested Fix:**
```python
secure_code_here()
```

**Why This Matters:**
[Explanation of impact]
```

## Approval Template
```markdown
## Approved

**Reviewed:** All changes in PR #123

**Verified:**
- [x] Security considerations addressed
- [x] Error handling appropriate
- [x] Tests cover critical paths
- [x] Documentation updated

**Notes:**
- [Optional minor suggestions]
```

## Review Checklist by Context

### API Endpoint Review
- [ ] Authentication required and validated
- [ ] Authorization checked for resources
- [ ] Input validation on all parameters
- [ ] Rate limiting configured
- [ ] Error responses don't leak information
- [ ] Appropriate HTTP status codes
- [ ] Response schema documented

### Database Migration Review
- [ ] Migration is reversible
- [ ] No data loss scenarios
- [ ] Indexes added for new queries
- [ ] Large table changes are batched
- [ ] Constraints validated
- [ ] Tested with production-size data

### Frontend Component Review
- [ ] Props properly typed
- [ ] Loading/error states handled
- [ ] Accessibility (a11y) considered
- [ ] Memory leaks prevented (cleanup)
- [ ] No XSS vulnerabilities
- [ ] Responsive design tested
- [ ] Performance impact assessed

### Security-Critical Change Review
- [ ] Threat modeling performed
- [ ] All OWASP Top 10 considered
- [ ] Secrets management appropriate
- [ ] Audit logging added
- [ ] Security team consulted
- [ ] Penetration testing planned
