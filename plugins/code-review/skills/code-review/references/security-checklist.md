# Security Analysis — OWASP Top 10 Checklist

## 1. Injection (SQL, NoSQL, Command, LDAP)
```python
# VULNERABLE
query = f"SELECT * FROM users WHERE id = {user_id}"  # SQL injection
os.system(f"ls {user_input}")  # Command injection

# SECURE
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
subprocess.run(["ls", user_input], check=True, shell=False)
```

**Review checks:**
- [ ] All SQL uses parameterized queries or ORM
- [ ] No string concatenation with user input in queries
- [ ] Shell commands use subprocess with shell=False
- [ ] LDAP queries use proper escaping

## 2. Broken Authentication
```javascript
// VULNERABLE
const token = jwt.sign({ userId }, secret);  // No expiration

// SECURE
const token = jwt.sign({ userId }, secret, {
  expiresIn: '15m',
  issuer: 'your-app',
  audience: 'your-users'
});
```

**Review checks:**
- [ ] Tokens have expiration times
- [ ] Passwords use bcrypt/argon2 with appropriate cost factor
- [ ] Session tokens are regenerated on login
- [ ] Multi-factor authentication for sensitive operations
- [ ] Account lockout after failed attempts

## 3. Sensitive Data Exposure
```python
# VULNERABLE
logger.info(f"User {user.email} logged in with password {password}")
response = {"user": user.__dict__}  # May include password hash

# SECURE
logger.info(f"User {user.id} logged in")
response = {"user": user.to_safe_dict()}  # Explicit safe fields
```

**Review checks:**
- [ ] Secrets not logged or exposed in errors
- [ ] API responses exclude sensitive fields
- [ ] Data encrypted at rest and in transit
- [ ] Proper data masking in logs

## 4. XML External Entities (XXE)
```python
# VULNERABLE
from lxml import etree
tree = etree.parse(user_file)  # Allows external entities

# SECURE
parser = etree.XMLParser(resolve_entities=False, no_network=True)
tree = etree.parse(user_file, parser)
```

**Review checks:**
- [ ] XML parsing disables external entities
- [ ] DTD processing disabled
- [ ] Use JSON instead of XML where possible

## 5. Broken Access Control
```python
# VULNERABLE
@app.route('/documents/<doc_id>')
def get_document(doc_id):
    return Document.query.get(doc_id)  # No ownership check

# SECURE
@app.route('/documents/<doc_id>')
@login_required
def get_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    if doc.owner_id != current_user.id and not current_user.is_admin:
        abort(403)
    return doc
```

**Review checks:**
- [ ] Authorization checked on every request
- [ ] Direct object references validated against user
- [ ] Role/permission checks at controller level
- [ ] Default deny for new endpoints

## 6. Security Misconfiguration
```yaml
# VULNERABLE nginx config
server {
    listen 80;
    server_tokens on;  # Exposes version
}

# SECURE
server {
    listen 443 ssl;
    server_tokens off;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

**Review checks:**
- [ ] Debug mode disabled in production
- [ ] Security headers configured
- [ ] Unnecessary features/endpoints disabled
- [ ] Default credentials changed

## 7. Cross-Site Scripting (XSS)
```javascript
// VULNERABLE
element.innerHTML = userInput;  // Stored/Reflected XSS
document.write(location.hash);  // DOM-based XSS

// SECURE
element.textContent = userInput;
// Or use DOMPurify
element.innerHTML = DOMPurify.sanitize(userInput);
```

**Review checks:**
- [ ] User input HTML-escaped before rendering
- [ ] CSP headers configured
- [ ] React/Vue auto-escaping not bypassed (dangerouslySetInnerHTML)
- [ ] URL parameters validated before use

## 8. Insecure Deserialization
```python
# VULNERABLE
data = pickle.loads(user_data)  # Arbitrary code execution

# SECURE
data = json.loads(user_data)  # Only data, no code execution
# Or use safe_load for YAML
data = yaml.safe_load(user_yaml)
```

**Review checks:**
- [ ] No pickle/marshal on untrusted data
- [ ] YAML uses safe_load
- [ ] JSON preferred for serialization
- [ ] Signature verification on serialized data

## 9. Using Components with Known Vulnerabilities
```bash
# Check for vulnerabilities
npm audit
pip-audit
snyk test
```

**Review checks:**
- [ ] Dependencies up to date
- [ ] No known CVEs in dependencies
- [ ] Lock files committed
- [ ] Automated vulnerability scanning in CI

## 10. Insufficient Logging & Monitoring
```python
# GOOD logging practice
logger.info("Login successful", extra={
    "user_id": user.id,
    "ip": request.remote_addr,
    "user_agent": request.headers.get("User-Agent")
})

logger.warning("Failed login attempt", extra={
    "email": email,  # OK to log since it's the attempt
    "ip": request.remote_addr,
    "reason": "invalid_password"
})
```

**Review checks:**
- [ ] Authentication events logged
- [ ] Authorization failures logged
- [ ] Input validation failures logged
- [ ] Logs don't contain sensitive data
- [ ] Alerting on suspicious patterns
