# Prompt Patterns

## Zero-Shot Prompting
Use when the task is simple and well-defined, or the model has sufficient pre-training knowledge.

```
You are a sentiment analyzer. Classify the following text as positive, negative, or neutral.

Text: "The product arrived late but the quality exceeded my expectations."

Classification:
```

**Best for:** Simple classification, well-defined tasks, when examples aren't available

## Few-Shot Learning
Provide examples to guide the model's output format and reasoning.

```
Classify the customer feedback:

Example 1:
Feedback: "Great service, will buy again!"
Category: Positive
Priority: Low

Example 2:
Feedback: "Product broke after one day, want refund"
Category: Negative
Priority: High

Example 3:
Feedback: "Shipping was okay, product as described"
Category: Neutral
Priority: Low

Now classify:
Feedback: "The app crashes every time I try to checkout, losing customers because of this"
Category:
Priority:
```

**Example Selection Criteria:**
- Cover diverse scenarios (happy path, edge cases, errors)
- Order from simple to complex
- Include boundary cases
- Balance across categories
- Use realistic, representative data

**Dynamic Example Selection:**
```python
def select_examples(query: str, example_pool: List[Example], k: int = 3) -> List[Example]:
    """Select most relevant examples using embedding similarity."""
    query_embedding = embed(query)
    similarities = [
        (ex, cosine_similarity(query_embedding, embed(ex.text)))
        for ex in example_pool
    ]
    # Get top-k most similar, ensuring category diversity
    selected = []
    categories_seen = set()
    for ex, score in sorted(similarities, key=lambda x: -x[1]):
        if ex.category not in categories_seen or len(selected) < k:
            selected.append(ex)
            categories_seen.add(ex.category)
        if len(selected) >= k:
            break
    return selected
```

## Chain-of-Thought (CoT)
Guide the model through explicit reasoning steps.

```
Solve this problem step by step:

Problem: A store has 156 apples. They sell 47 apples in the morning and receive a shipment of 89 apples at noon. How many apples do they have at the end of the day?

Let's think through this:
1. Start with initial inventory: 156 apples
2. After morning sales: 156 - 47 = 109 apples
3. After shipment: 109 + 89 = 198 apples

Answer: 198 apples
```

**CoT Variations:**
- **Zero-shot CoT**: Add "Let's think step by step" to prompt
- **Manual CoT**: Provide explicit reasoning steps in examples
- **Auto-CoT**: Let model generate reasoning, then verify
- **Self-consistency**: Generate multiple CoT paths, majority vote

**Verification Points:**
```
After each step, verify:
- Does this step logically follow from the previous?
- Are all calculations correct?
- Have I considered all relevant information?
- Is there an alternative interpretation?
```

## Tree-of-Thought (ToT)
Explore multiple reasoning branches for complex problems.

```
Problem: Design a system that can handle 10,000 concurrent users.

Branch 1: Horizontal Scaling Approach
- Pros: Easy to scale, fault-tolerant
- Cons: Complexity in state management
- Feasibility: High

Branch 2: Vertical Scaling Approach
- Pros: Simpler architecture
- Cons: Single point of failure, limits
- Feasibility: Medium

Branch 3: Hybrid Approach
- Pros: Best of both worlds
- Cons: More complex to implement
- Feasibility: High

Evaluation: Branch 3 (Hybrid) is most promising because...
Selected path: Proceed with hybrid approach, focusing on...
```

## ReAct (Reasoning + Acting)
Combine reasoning with tool/action execution.

```
Question: What was the revenue of Apple Inc in 2023?

Thought 1: I need to find Apple's 2023 financial data. Let me search for their annual report.
Action 1: search("Apple Inc 2023 annual report revenue")
Observation 1: Apple reported total revenue of $383.3 billion for fiscal year 2023...

Thought 2: I found the information. The search result shows Apple's 2023 revenue.
Action 2: finish("Apple Inc's revenue in 2023 was $383.3 billion")
```

**ReAct Loop Structure:**
```python
def react_loop(question: str, tools: Dict[str, Callable], max_steps: int = 10):
    history = []
    for step in range(max_steps):
        # Generate thought and action
        response = llm.generate(
            f"Question: {question}\n"
            f"Previous steps: {history}\n"
            f"Available tools: {list(tools.keys())}\n"
            f"Think about what to do next, then take an action."
        )

        thought, action, action_input = parse_response(response)

        if action == "finish":
            return action_input

        # Execute action
        observation = tools[action](action_input)
        history.append({
            "thought": thought,
            "action": action,
            "observation": observation
        })

    return "Max steps reached without conclusion"
```

## Constitutional AI Pattern
Self-critique and revision based on principles.

```
Initial response: [model's first answer]

Critique based on these principles:
1. Be helpful and accurate
2. Avoid harmful content
3. Respect privacy
4. Be unbiased

Critique: The response could be improved by...

Revised response: [improved answer addressing critique]
```

## Role-Based Prompting
Assign specific persona for consistent behavior.

```
You are a senior security engineer with 15 years of experience in application security. You have deep expertise in:
- OWASP Top 10 vulnerabilities
- Secure coding practices
- Penetration testing methodologies
- Compliance frameworks (SOC 2, HIPAA, GDPR)

When reviewing code, you:
- Prioritize security issues by severity
- Provide specific remediation steps
- Reference relevant security standards
- Consider both immediate fixes and long-term improvements

Review the following code for security issues:
[code]
```
