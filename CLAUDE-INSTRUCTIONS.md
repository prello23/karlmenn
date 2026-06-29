# Claude Code — Build ekkieinn.is

Lestu SPEC.md í þessum repo. 

**MIKILVÆGT:** Lénið er `ekkieinn.is` (ekki karlmenn.is). Repo heitir enn `karlmenn` en allur kóðinn á að nota `ekkieinn.is`.

Vinsamlegast gerðu eftirfarandi:

1. Búðu til fullkomið Next.js 15 app (App Router + TypeScript + Tailwind + shadcn/ui)
2. Notaðu litaþemað úr spec (background #0F1117, accent #F59E0B, text #F8F9FA)
3. Forsíðan á að hafa stóran hero: "Þú ert ekki einn." — þetta er kjarnaboðskapur
4. Settu `info@ekkieinn.is` allstaðar þar sem email er sýnt
5. Búðu til CLAUDE.md í repo root
6. Settu upp Prisma schema (SQLite í þróun, PostgreSQL í production)
7. Búðu til allar síður úr spec
8. `npm run build` á að keyra hratt

Þegar þú ert búinn, keyra: `git add -A && git commit -m "feat: initial ekkieinn.is build" && git push origin main`
