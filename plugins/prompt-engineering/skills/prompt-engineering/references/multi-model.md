# Multi-Model Strategies

## Model Selection Logic

```python
from enum import Enum
from typing import Callable

class ModelTier(Enum):
    FAST = "fast"       # GPT-3.5, Claude Instant, Gemini Flash
    BALANCED = "balanced"  # GPT-4, Claude Sonnet
    POWERFUL = "powerful"  # GPT-4 Turbo, Claude Opus

class ModelRouter:
    def __init__(self):
        self.routes = {
            ModelTier.FAST: ["gpt-3.5-turbo", "claude-3-haiku"],
            ModelTier.BALANCED: ["gpt-4", "claude-3-5-sonnet"],
            ModelTier.POWERFUL: ["gpt-4-turbo", "claude-3-opus"],
        }

    def select_model(
        self,
        task_complexity: str,
        latency_requirement: int,  # ms
        budget_per_call: float,    # USD
        accuracy_requirement: float
    ) -> str:
        """Select optimal model based on requirements."""

        # Simple routing logic
        if latency_requirement < 500 and accuracy_requirement < 0.9:
            tier = ModelTier.FAST
        elif accuracy_requirement > 0.95 or task_complexity == "high":
            tier = ModelTier.POWERFUL
        else:
            tier = ModelTier.BALANCED

        # Return first available model in tier
        return self.routes[tier][0]

    def route_by_task(self, task_type: str) -> str:
        """Route based on task type."""
        routing_table = {
            "classification": ModelTier.FAST,
            "summarization": ModelTier.BALANCED,
            "code_generation": ModelTier.POWERFUL,
            "translation": ModelTier.FAST,
            "reasoning": ModelTier.POWERFUL,
            "extraction": ModelTier.BALANCED,
        }
        tier = routing_table.get(task_type, ModelTier.BALANCED)
        return self.routes[tier][0]
```

## Fallback Chains

```python
class FallbackChain:
    def __init__(self, models: List[str], timeout: int = 30):
        self.models = models
        self.timeout = timeout

    async def execute(self, prompt: str) -> Dict:
        """Execute with automatic fallback."""
        last_error = None

        for model in self.models:
            try:
                response = await asyncio.wait_for(
                    llm.acomplete(prompt, model=model),
                    timeout=self.timeout
                )
                return {
                    "success": True,
                    "model_used": model,
                    "response": response,
                    "fallback_count": self.models.index(model)
                }
            except asyncio.TimeoutError:
                last_error = f"Timeout for {model}"
            except Exception as e:
                last_error = str(e)

        return {
            "success": False,
            "error": last_error,
            "models_tried": self.models
        }

# Usage
chain = FallbackChain([
    "gpt-4-turbo",      # Primary
    "claude-3-opus",    # Fallback 1
    "gpt-4",            # Fallback 2
    "claude-3-sonnet",  # Fallback 3
])
```

## Ensemble Methods

```python
from collections import Counter

class PromptEnsemble:
    def __init__(self, models: List[str], strategy: str = "majority_vote"):
        self.models = models
        self.strategy = strategy

    async def execute(self, prompt: str) -> Dict:
        """Execute prompt across multiple models and aggregate."""

        # Get responses from all models
        tasks = [
            llm.acomplete(prompt, model=model)
            for model in self.models
        ]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        valid_responses = [
            r for r in responses if not isinstance(r, Exception)
        ]

        if self.strategy == "majority_vote":
            # For classification tasks
            votes = Counter(valid_responses)
            winner, count = votes.most_common(1)[0]
            return {
                "result": winner,
                "confidence": count / len(valid_responses),
                "agreement": votes
            }

        elif self.strategy == "best_of_n":
            # Use a judge model to select best response
            judge_prompt = f"""
            Select the best response from these options:
            {chr(10).join(f'{i+1}. {r}' for i, r in enumerate(valid_responses))}

            Return only the number of the best response.
            """
            selection = await llm.acomplete(judge_prompt, model="gpt-4")
            selected_idx = int(selection.strip()) - 1
            return {
                "result": valid_responses[selected_idx],
                "all_responses": valid_responses
            }
```
