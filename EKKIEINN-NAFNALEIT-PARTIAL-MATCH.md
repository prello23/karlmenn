# EKKIEINN-NAFNALEIT-PARTIAL-MATCH.md
## Fix nafnaleit to support partial name matching

### Problem
Searching "jóhanna" returns "Nei" even though "Jóhanna Þorbjörg Magnúsdóttir" is registered.
The current code does exact full-name match only.

### Fix
In `src/app/api/nafnaleit/route.ts`, change the matching logic from exact match to partial/substring match:

**Current (broken):**
```ts
const found = rows.some((r) => r.name.trim().toLowerCase() === target);
```

**New (fixed):**
```ts
const found = rows.some((r) => {
  const regName = r.name.trim().toLowerCase();
  // Match if: search is substring of registered name, OR registered name is substring of search
  return regName.includes(target) || target.includes(regName);
});
```

This way:
- "jóhanna" → matches "Jóhanna Þorbjörg Magnúsdóttir" ✅ (substring)
- "jóhanna þorbjörg magnúsdóttir" → matches too ✅ (exact)
- "sigríður" → matches "Sigríður Jónsdóttir" ✅

### Test
After build, verify:
1. Search "jóhanna" → Já
2. Search "jóhanna þorbjörg magnúsdóttir" → Já
3. Search "random name" → Nei

### Scope
ONLY change `src/app/api/nafnaleit/route.ts` — nothing else.
