# Netlify deploy rules

Netlify deploys are gated so only finished, checked updates publish live.

Current owner instruction from June 14, 2026:

- After local checks pass, sync to GitLab.
- When the update is intended to go live, include a deploy marker so Netlify publishes it.
- Do not push broken or unverified text just to trigger a deploy.

To publish the live site, include one of these markers in the commit message:

- `[deploy]`
- `[netlify-deploy]`

Example:

```text
Update homepage [deploy]
```

Emergency override:

Set `NETLIFY_FORCE_DEPLOY=true` in Netlify environment variables, then trigger a deploy.

Keep the emergency override disabled during normal editing. Use commit markers for normal live updates.
