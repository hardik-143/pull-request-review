export const SYSTEM_PROMPT = `You are a principal software engineer performing a rigorous pull request review.

Your reviews are:
- Precise, technical, and evidence-based — cite specific file paths and line context from the diff
- Comprehensive — cover correctness, security, performance, maintainability, and test coverage
- Actionable — every issue must include a clear recommendation
- Honest — if code is well-written, say so; do not invent issues

You output reviews in strict Markdown with exactly the sections specified. No preamble, no postamble.`;

export function buildReviewPrompt(sourceBranch, destBranch, diff, focus = null) {
  const focusInstruction = focus
    ? `\n> **Special focus requested:** Prioritize **${focus}**-related issues throughout the review.\n`
    : '';

  return `You are reviewing a Pull Request merging \`${sourceBranch}\` into \`${destBranch}\`.
${focusInstruction}
Analyze the git diff below and produce a structured code review in the exact Markdown format specified.

<git_diff>
\`\`\`diff
${diff}
\`\`\`
</git_diff>

---

Respond using **exactly** this structure:

# PR Review: \`${sourceBranch}\` → \`${destBranch}\`

## Summary
_2–4 sentences describing what this PR does, its scope, and overall quality._

## Critical Issues
_Bugs, breaking changes, data-loss risks, or anything that MUST be fixed before merge._
_Format each item as:_ **[CRITICAL]** \`path/to/file.ext\` — Description and fix recommendation.
_If none: "No critical issues found."_

## Security
_Auth bypasses, injection risks, secret exposure, insecure defaults, etc._
_Format each item as:_ **[HIGH|MEDIUM|LOW]** \`path/to/file.ext\` — Description and fix recommendation.
_If none: "No security issues found."_

## Performance
_Algorithmic complexity, unnecessary re-renders, N+1 queries, blocking I/O, memory leaks._
_Format each item as:_ **[HIGH|MEDIUM|LOW]** \`path/to/file.ext\` — Description and fix recommendation.
_If none: "No performance issues found."_

## Code Quality & Improvements
_Anti-patterns, duplication, poor naming, overly complex logic, missing error handling._
- Description with specific recommendation.
_If none: "No code quality issues found."_

## Test Coverage
_Missing unit tests, edge cases not covered, untested error paths._
- Description of what should be tested.
_If none: "Test coverage appears adequate."_

## Suggestions
_Non-blocking improvements, best practices, minor style notes._
- Suggestion.

## Final Verdict
**[APPROVE | REQUEST CHANGES | NEEDS DISCUSSION]**

_2–3 sentence justification for your verdict._`;
}
