---
name: prompt-engineering
description: >
  Design, optimize, and manage LLM prompts with focus on reliability, efficiency,
  and measurable outcomes. Use when designing prompt templates, optimizing token
  usage, building evaluation frameworks, implementing safety mechanisms, or
  managing prompts in production systems.
  Triggers: prompt design, prompt optimization, LLM evaluation, prompt template,
  few-shot, chain-of-thought, prompt injection, A/B testing prompts.
---

# Prompt Engineering

Comprehensive technical knowledge for designing, optimizing, and managing prompts for large language models.

## Prompt Patterns

Zero-shot, few-shot, chain-of-thought, tree-of-thought, ReAct, constitutional AI, and role-based prompting patterns with examples.
Read `references/prompt-patterns.md` for patterns and code examples.

## Prompt Optimization Techniques

Token reduction strategies, response parsing with Pydantic validation, error handling/retry, caching, and batch processing.
Read `references/optimization.md` for techniques and code examples.

## Evaluation Frameworks

Accuracy metrics, consistency testing, edge case validation, A/B testing methodology with statistical analysis, and rollout strategies.
Read `references/evaluation.md` for frameworks and code examples.

## Safety Mechanisms

Input validation, injection detection, output filtering, PII redaction, and audit logging.
Read `references/safety.md` for patterns and code examples.

## Multi-Model Strategies

Model selection logic, fallback chains, and ensemble methods (majority vote, best-of-n).
Read `references/multi-model.md` for patterns and code examples.

## Production System Patterns

Prompt registries, version deployment, monitoring with Prometheus, modular template design, and anti-patterns to avoid.
Read `references/production-patterns.md` for patterns and code examples.
