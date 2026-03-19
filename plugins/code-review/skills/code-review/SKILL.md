---
name: code-review
description: >
  Comprehensive technical code review covering completeness, security,
  performance, and best practices. Use when reviewing PRs, auditing code
  for security vulnerabilities, analyzing performance bottlenecks, or
  checking language-specific patterns.
  Triggers: code review, review PR, security audit, performance review,
  code quality, OWASP, code smell.
---

# Code Review

Comprehensive technical knowledge for thorough code reviews covering completeness, security, performance, and best practices.

## Security Analysis

OWASP Top 10 checklist with vulnerable/secure code examples for injection, broken auth, data exposure, XXE, access control, misconfiguration, XSS, deserialization, dependency vulnerabilities, and logging.
Read `references/security-checklist.md` for the full checklist.

## Performance Analysis

Time complexity issues, database query optimization (N+1, missing indexes), memory leak patterns, async/await anti-patterns, and caching opportunities.
Read `references/performance-patterns.md` for patterns and code examples.

## Language-Specific Patterns

Idiomatic patterns and anti-patterns for JavaScript/TypeScript, Python, Go, Rust, and SQL.
Read `references/language-patterns.md` for language-specific guidance.

## Review Templates & Code Smells

Code smell detection table, review summary/issue/approval templates, and context-specific checklists (API, database migration, frontend component, security-critical).
Read `references/review-templates.md` for templates and checklists.
