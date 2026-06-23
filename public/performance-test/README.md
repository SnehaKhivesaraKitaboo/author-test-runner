# EPUB Performance Test

Analyze author EPUB structure (LoD, paragraph, annotation, glossary) and performance.

## Open

`http://localhost:4321/performance-test/index.html` (served by the app server — not `file://`). Also reachable from the dashboard via the **EPUB Performance Test** button.

## Staging vs production

| Environment | API host | Local authoring config |
|-------------|----------|-------------------------|
| Staging | `https://qacreate1.kitaboo.com/author` | `config/services_stag.js` |
| Production | `https://create.kitaboo.com/CAPS` | `config/services_prod.js` or `services.js` |

1. Paste full authoring URL (`courseId` + `userToken`).
2. **Validate URL** — tests token on **both** staging and production.
3. Pick **Auto-detect**, **Production**, or **Staging** (or let auto pick from token email, e.g. `sneha.prod@` → prod).
4. **Analyze EPUB** — uses the matching API host.

**Important:** Local `index.html` loads `config/services.js`. For a **production** token, `services.js` must match production (as in your repo now with `platform = "prod"`). A prod token will fail if `services.js` still points to staging.

## Session / token issues

- Production token + staging `services.js` → Session Expired in authoring and failed API in this tool.
- Use **Validate URL** to see which environment returns OK before analyzing.
