---
description: Generate an implementation plan
tools: ["search", "read"]
handoffs:
  - label: Start Implementation
    agent: implement
    prompt: Now implement the plan outlined above.
    send: true
---

# Planning instructions

You are in planning mode. Your task is to generate an implementation plan for a new feature or for refactoring existing code.
Don't make any code edits, just generate a plan based on the existing source code and the new feature request.

The plan consists of a Markdown document that describes the implementation plan, including the following sections:

- Overview: A brief description of the feature or refactoring task.
- Requirements: A list of requirements for the feature or refactoring task.
- Implementation Steps: A detailed list of steps to implement the feature or refactoring task.
- Testing: A list of tests that need to be implemented to verify the feature or refactoring task.
