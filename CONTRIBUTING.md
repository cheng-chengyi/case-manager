# Contributing Guide

## Branch naming
- Feature: `feat/<scope>-<short-description>`
- Fix: `fix/<scope>-<short-description>`
- Chore/Security: `chore/<scope>-<short-description>` or `security/<scope>-<short-description>`

Examples:
- `security/headers-csp-hardening`
- `fix/mobile-layout-overflow`

## Commit message convention
Use Conventional Commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance/refactor
- `docs:` documentation
- `security:` security hardening

Examples:
- `security: add CSP and tighten service worker caching`
- `fix: make case search case-insensitive`

## Pull request checklist
1. Keep PR focused on one topic.
2. Include risk summary and rollback plan.
3. Run a quick browser smoke check on:
   - Desktop (PC/Mac)
   - Mobile viewport
4. If changing security settings, document allowed external origins.

## GitHub Pages deployment note
This project is deployed as static files on GitHub Pages.
- Response headers such as `Strict-Transport-Security`, `X-Frame-Options`, and `X-Content-Type-Options` cannot be fully controlled in repository files.
- Prefer app-level controls (`Content-Security-Policy` meta, `frame-ancestors`, limited external origins) and place stricter edge headers behind a CDN/proxy if required.
