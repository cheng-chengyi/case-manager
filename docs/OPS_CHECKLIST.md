# Ops Checklist (Low-touch workflow)

## 1) Online security verification (URL can be replaced)
Use the script with any target URL to avoid hard-coding one endpoint.

```bash
bash scripts/security-audit.sh "${TARGET_URL}"
```

Example (staging):
```bash
TARGET_URL="https://example.github.io/case-manager-preview/" bash scripts/security-audit.sh
```

What it checks:
- CSP/referrer meta in page HTML
- service worker + manifest hooks
- response headers commonly managed by edge (HSTS/XFO/XCTO)

## 2) One-command local checks
```bash
npm run check
```

## 3) Minimal release flow (PC / Mac / mobile)
1. Create branch: `fix/...` or `security/...`
2. Implement small focused change.
3. Run:
   - `npm run check`
   - `bash scripts/security-audit.sh "${TARGET_URL}"`
4. Visual smoke check:
   - Desktop (PC or Mac): open dashboard + archive page
   - Mobile viewport: nav drawer + sync UI
5. Commit with conventional message (`fix:`, `security:`, `docs:`).
6. Open PR with:
   - risk summary
   - rollback plan
   - command outputs

## 4) Rollback
- Revert the latest commit on main, then redeploy Pages.
