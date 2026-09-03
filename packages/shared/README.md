# @view/shared

The TypeScript contract shared by the API and the app: `Item`, `Category`,
`Paginated<T>`, auth DTOs, `Interaction`, `Recommendation`, `HomeFeed`,
`HealthReport`.

Deliberately has **no** `sourceUrl` / `streamUrl` field — the API strips every
upstream identifier before serialising, so these types can't carry one.

```bash
npm run build      # tsc -> dist/  (run automatically on `npm install` at the root)
```
