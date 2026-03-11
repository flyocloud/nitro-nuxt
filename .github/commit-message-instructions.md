Generate commit messages using Conventional Commits compatible with semantic-release.

Use this format:
<type>[optional scope]: <description>

Rules:
- Only output the commit message, with no extra explanation
- Use lowercase for type and description
- Use the imperative mood
- Keep the subject concise
- Do not end the subject with a period

Release-relevant commit types:
- feat: for a new feature
- fix: for a bug fix

Breaking changes:
- Use ! after the type or scope when needed, for example:
  feat(api)!: remove legacy auth flow
- Add a footer for breaking changes:
  BREAKING CHANGE: explain what changed and how to migrate

Examples:
- feat(auth): add github login
- fix(api): handle empty response body
- feat(cli)!: remove deprecated init command

If the change does not affect a release, still use Conventional Commits style.