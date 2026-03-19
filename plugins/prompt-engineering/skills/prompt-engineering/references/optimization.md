# Prompt Optimization Techniques

## Token Reduction Strategies

**Compression techniques:**
```
# Instead of verbose instructions:
"Please analyze the following piece of code and identify any potential security vulnerabilities that might exist within it, paying special attention to input validation, authentication mechanisms, and data handling practices."

# Use concise instructions:
"Analyze this code for security vulnerabilities. Focus on: input validation, auth, data handling."
```

**Context pruning:**
- Remove redundant information
- Summarize long contexts
- Use references instead of full content
- Extract only relevant sections

**Output constraints:**
```
Respond with JSON only. No explanations.
Format: {"sentiment": "positive|negative|neutral", "confidence": 0.0-1.0}
```

## Response Parsing

**Structured output formats:**
```
Respond in this exact format:
```json
{
  "analysis": {
    "summary": "Brief summary (max 50 words)",
    "issues": [
      {
        "type": "security|performance|style",
        "severity": "critical|high|medium|low",
        "description": "Issue description",
        "fix": "Suggested fix"
      }
    ],
    "score": 0-100
  }
}
```
```

**Parsing with validation:**
```python
from pydantic import BaseModel, validator
from typing import List, Literal

class Issue(BaseModel):
    type: Literal["security", "performance", "style"]
    severity: Literal["critical", "high", "medium", "low"]
    description: str
    fix: str

    @validator('description')
    def description_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v

class Analysis(BaseModel):
    summary: str
    issues: List[Issue]
    score: int

    @validator('score')
    def score_in_range(cls, v):
        if not 0 <= v <= 100:
            raise ValueError('Score must be 0-100')
        return v

def parse_llm_response(response: str) -> Analysis:
    # Extract JSON from response
    json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
    if json_match:
        return Analysis.parse_raw(json_match.group(1))
    return Analysis.parse_raw(response)
```

## Error Handling and Retry Strategies

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

class LLMError(Exception):
    pass

class RateLimitError(LLMError):
    pass

class InvalidResponseError(LLMError):
    pass

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type(RateLimitError)
)
def call_llm_with_retry(prompt: str, model: str) -> str:
    try:
        response = llm.complete(prompt, model=model)

        # Validate response
        if not response or len(response.strip()) < 10:
            raise InvalidResponseError("Response too short")

        return response

    except RateLimitException:
        raise RateLimitError("Rate limited, will retry")
    except Exception as e:
        raise LLMError(f"LLM call failed: {e}")
```

## Cache Optimization

```python
import hashlib
from functools import lru_cache
from redis import Redis

redis_client = Redis()

def get_cache_key(prompt: str, model: str, temperature: float) -> str:
    """Generate deterministic cache key."""
    content = f"{prompt}:{model}:{temperature}"
    return f"llm:{hashlib.sha256(content.encode()).hexdigest()}"

def cached_llm_call(
    prompt: str,
    model: str,
    temperature: float = 0.0,
    cache_ttl: int = 3600
) -> str:
    """LLM call with Redis caching."""
    # Only cache deterministic calls (temperature=0)
    if temperature == 0:
        cache_key = get_cache_key(prompt, model, temperature)
        cached = redis_client.get(cache_key)
        if cached:
            return cached.decode()

    response = llm.complete(prompt, model=model, temperature=temperature)

    if temperature == 0:
        redis_client.setex(cache_key, cache_ttl, response)

    return response
```

## Batch Processing

```python
from typing import List
import asyncio

async def batch_process_prompts(
    prompts: List[str],
    model: str,
    batch_size: int = 10,
    max_concurrent: int = 5
) -> List[str]:
    """Process prompts in batches with concurrency control."""
    semaphore = asyncio.Semaphore(max_concurrent)

    async def process_one(prompt: str) -> str:
        async with semaphore:
            return await llm.acomplete(prompt, model=model)

    results = []
    for i in range(0, len(prompts), batch_size):
        batch = prompts[i:i + batch_size]
        batch_results = await asyncio.gather(
            *[process_one(p) for p in batch],
            return_exceptions=True
        )
        results.extend(batch_results)

    return results
```
