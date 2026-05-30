---
description: 'Review React code for quality, correctness, and best practices'
agent: 'agent'
argument-hint: 'File or component to review'
---

Review the provided React code and give feedback on:

- **Correctness**: Logic bugs, incorrect hook usage (stale closures, missing deps), unhandled edge cases
- **Performance**: Unnecessary re-renders, missing memoization, expensive computations in render
- **Readability**: Unclear naming, overly complex logic that should be split
- **Best practices**: Proper component composition - components should be focused
- **Proper solutions versus quick fixes**: verify if the code is a proper solution or just a quick fix that may cause issues later on. Suggest proper solutions if it's an obvious one. If
  not, suggest that at least a comment is added to explain why the quick fix is necessary and what the proper solution would be.
- **Testing**: Validate if the change of tests is appropriate for the change in code. If not, suggest what tests should be added or modified.
- **Deduplication**: Identify any duplicated code or tailwind classes and suggest ways to abstract it into reusable components or hooks if it feels like it would be beneficial for readability and maintainability.
