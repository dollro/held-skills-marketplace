# Production System Patterns

## Prompt Management System

```python
from typing import Dict, Optional
from datetime import datetime
import json

class PromptRegistry:
    def __init__(self, storage_backend):
        self.storage = storage_backend

    def register_prompt(
        self,
        name: str,
        template: str,
        version: str,
        metadata: Dict = None
    ) -> str:
        """Register a new prompt version."""
        prompt_id = f"{name}:{version}"

        self.storage.save({
            "id": prompt_id,
            "name": name,
            "version": version,
            "template": template,
            "metadata": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        })

        return prompt_id

    def get_prompt(
        self,
        name: str,
        version: Optional[str] = None
    ) -> Dict:
        """Get prompt by name, optionally specific version."""
        if version:
            return self.storage.get(f"{name}:{version}")

        # Get latest active version
        versions = self.storage.list(prefix=f"{name}:")
        active = [v for v in versions if v["status"] == "active"]
        return max(active, key=lambda x: x["created_at"])

    def deprecate_prompt(self, name: str, version: str):
        """Mark a prompt version as deprecated."""
        prompt_id = f"{name}:{version}"
        prompt = self.storage.get(prompt_id)
        prompt["status"] = "deprecated"
        prompt["deprecated_at"] = datetime.utcnow().isoformat()
        self.storage.save(prompt)
```

## Version Deployment

```yaml
# prompt-config.yaml
prompts:
  sentiment_analysis:
    production:
      version: "2.3.1"
      model: "gpt-4"
      temperature: 0
      max_tokens: 100
    staging:
      version: "2.4.0"
      model: "gpt-4-turbo"
      temperature: 0
      max_tokens: 100
    canary:
      version: "3.0.0-beta"
      model: "gpt-4-turbo"
      traffic_percentage: 5

  code_review:
    production:
      version: "1.2.0"
      model: "claude-3-opus"
      temperature: 0.2
```

## Monitoring Setup

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Metrics
prompt_requests = Counter(
    'prompt_requests_total',
    'Total prompt requests',
    ['prompt_name', 'model', 'status']
)

prompt_latency = Histogram(
    'prompt_latency_seconds',
    'Prompt execution latency',
    ['prompt_name', 'model'],
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30]
)

prompt_tokens = Histogram(
    'prompt_tokens_total',
    'Tokens used per request',
    ['prompt_name', 'model', 'direction'],  # direction: input/output
    buckets=[100, 500, 1000, 2000, 4000, 8000]
)

active_requests = Gauge(
    'prompt_active_requests',
    'Currently active prompt requests',
    ['prompt_name']
)

class MonitoredPromptExecutor:
    def __init__(self, prompt_name: str, model: str):
        self.prompt_name = prompt_name
        self.model = model

    async def execute(self, prompt: str) -> str:
        active_requests.labels(prompt_name=self.prompt_name).inc()
        start_time = time.time()

        try:
            response = await llm.acomplete(prompt, model=self.model)

            # Record metrics
            prompt_requests.labels(
                prompt_name=self.prompt_name,
                model=self.model,
                status="success"
            ).inc()

            prompt_latency.labels(
                prompt_name=self.prompt_name,
                model=self.model
            ).observe(time.time() - start_time)

            prompt_tokens.labels(
                prompt_name=self.prompt_name,
                model=self.model,
                direction="input"
            ).observe(count_tokens(prompt))

            prompt_tokens.labels(
                prompt_name=self.prompt_name,
                model=self.model,
                direction="output"
            ).observe(count_tokens(response))

            return response

        except Exception as e:
            prompt_requests.labels(
                prompt_name=self.prompt_name,
                model=self.model,
                status="error"
            ).inc()
            raise

        finally:
            active_requests.labels(prompt_name=self.prompt_name).dec()
```

## Template Design Patterns

### Modular Template Structure

```python
class PromptTemplate:
    """Composable prompt template system."""

    def __init__(self):
        self.sections = {}

    def add_section(self, name: str, content: str, required: bool = True):
        self.sections[name] = {"content": content, "required": required}
        return self

    def render(self, **variables) -> str:
        rendered_sections = []

        for name, section in self.sections.items():
            content = section["content"]

            # Replace variables
            for var, value in variables.items():
                content = content.replace(f"{{{var}}}", str(value))

            # Check for unreplaced required variables
            if section["required"] and "{" in content:
                raise ValueError(f"Missing required variable in section {name}")

            rendered_sections.append(content)

        return "\n\n".join(rendered_sections)

# Usage
template = PromptTemplate()
template.add_section("role", """
You are a {role} specializing in {specialty}.
""")
template.add_section("context", """
Context:
{context}
""", required=False)
template.add_section("task", """
Task: {task}
""")
template.add_section("format", """
Respond in JSON format:
{output_schema}
""")

prompt = template.render(
    role="code reviewer",
    specialty="Python security",
    task="Review this code for vulnerabilities",
    output_schema='{"issues": [], "severity": ""}',
    context="This is a financial application"
)
```

## Anti-Patterns to Avoid

### Common Mistakes

1. **Vague Instructions**
   ```
   # Bad
   "Analyze this data"

   # Good
   "Analyze this sales data. Calculate: 1) total revenue, 2) top 3 products by units sold, 3) month-over-month growth rate. Format as JSON."
   ```

2. **Missing Output Format**
   ```
   # Bad
   "Classify this feedback"

   # Good
   "Classify this feedback as positive, negative, or neutral. Respond with only one word."
   ```

3. **Prompt Injection Vulnerability**
   ```
   # Bad
   f"Translate: {user_input}"

   # Good
   f"""Translate the following text to Spanish.
   Only output the translation, nothing else.

   Text to translate (delimited by triple backticks):
   ```{sanitize(user_input)}```"""
   ```

4. **Ignoring Token Limits**
   ```python
   # Bad
   prompt = system_message + full_document + user_query

   # Good
   prompt = system_message + summarize_if_needed(full_document, max_tokens=2000) + user_query
   ```

5. **No Error Handling**
   ```python
   # Bad
   response = llm.complete(prompt)
   data = json.loads(response)

   # Good
   response = llm.complete(prompt)
   try:
       data = json.loads(extract_json(response))
       validate_schema(data, expected_schema)
   except (json.JSONDecodeError, ValidationError) as e:
       logger.error(f"Failed to parse response: {e}")
       data = fallback_response()
   ```
