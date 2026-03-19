# Safety Mechanisms

## Input Validation

```python
import re
from typing import Tuple

class InputValidator:
    # Patterns for detecting injection attempts
    INJECTION_PATTERNS = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"system\s*:\s*you\s+are",
        r"\[INST\].*\[/INST\]",
        r"<\|im_start\|>",
        r"Human:",
        r"Assistant:",
    ]

    MAX_INPUT_LENGTH = 10000

    def validate(self, user_input: str) -> Tuple[bool, str]:
        """Validate user input for safety."""

        # Length check
        if len(user_input) > self.MAX_INPUT_LENGTH:
            return False, f"Input exceeds maximum length of {self.MAX_INPUT_LENGTH}"

        # Injection pattern check
        input_lower = user_input.lower()
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, input_lower, re.IGNORECASE):
                return False, "Input contains potentially harmful patterns"

        # Encoding check
        try:
            user_input.encode('utf-8')
        except UnicodeEncodeError:
            return False, "Input contains invalid characters"

        return True, "Valid"

    def sanitize(self, user_input: str) -> str:
        """Sanitize input while preserving meaning."""
        # Remove control characters
        sanitized = ''.join(
            char for char in user_input
            if ord(char) >= 32 or char in '\n\t'
        )

        # Escape special delimiters
        sanitized = sanitized.replace("```", "'''")

        return sanitized[:self.MAX_INPUT_LENGTH]
```

## Output Filtering

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class FilterResult:
    is_safe: bool
    filtered_content: str
    violations: List[str]
    confidence: float

class OutputFilter:
    BLOCKED_PATTERNS = [
        # PII patterns
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b\d{16}\b',  # Credit card
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email (if sensitive)
    ]

    SENSITIVE_TOPICS = [
        "illegal activities",
        "harmful content",
        "personal attacks",
    ]

    def filter(self, output: str) -> FilterResult:
        """Filter LLM output for safety."""
        violations = []
        filtered = output

        # Pattern-based filtering
        for pattern in self.BLOCKED_PATTERNS:
            matches = re.findall(pattern, filtered)
            if matches:
                violations.append(f"PII detected: {pattern}")
                filtered = re.sub(pattern, "[REDACTED]", filtered)

        # Content classification (could use another LLM)
        content_safety = self.classify_content_safety(filtered)
        if content_safety["is_harmful"]:
            violations.append(f"Harmful content: {content_safety['category']}")
            filtered = "[Content filtered for safety]"

        return FilterResult(
            is_safe=len(violations) == 0,
            filtered_content=filtered,
            violations=violations,
            confidence=content_safety["confidence"]
        )

    def classify_content_safety(self, content: str) -> Dict:
        """Classify content for safety (placeholder for actual implementation)."""
        # In production, use a safety classifier model
        return {"is_harmful": False, "category": None, "confidence": 0.95}
```

## Audit Logging

```python
import json
import logging
from datetime import datetime
from typing import Any, Dict

class PromptAuditLogger:
    def __init__(self, log_path: str = "prompt_audit.jsonl"):
        self.logger = logging.getLogger("prompt_audit")
        handler = logging.FileHandler(log_path)
        handler.setFormatter(logging.Formatter('%(message)s'))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)

    def log_interaction(
        self,
        request_id: str,
        user_id: str,
        prompt: str,
        response: str,
        model: str,
        metadata: Dict[str, Any] = None
    ):
        """Log prompt interaction for audit trail."""
        # Hash sensitive data
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()

        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id,
            "user_id": user_id,
            "prompt_hash": prompt_hash,
            "prompt_length": len(prompt),
            "response_length": len(response),
            "model": model,
            "metadata": metadata or {},
            # Store full content if compliance requires
            # "prompt": prompt,
            # "response": response,
        }

        self.logger.info(json.dumps(log_entry))
```
