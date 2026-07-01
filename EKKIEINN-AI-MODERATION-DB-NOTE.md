# ADDENDUM: AI Content Moderation — API Key Location

## IMPORTANT: API key is in the DATABASE, not .env

The OpenAI API key is stored in the `Setting` table in SQLite:
- Key name: `openai_api_key`
- Value: The full `sk-proj-...` key

Also in the Setting table:
- `ai_moderation_mode` = `manual` (current setting)

### How to read the key
```typescript
import { prisma } from '@/lib/prisma';

async function getOpenAIKey(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'openai_api_key' }
  });
  return setting?.value || null;
}
```

### Moderation modes (from ai_moderation_mode setting)
- `manual` — AI analyzes but admin always reviews (current)
- `auto` — AI can auto-approve safe content, auto-reject clearly bad content
- `off` — No AI analysis, pure manual moderation

Read this setting to determine behavior in createThread pipeline.

### DO NOT put the API key in .env — it's managed through the admin UI (Setting table)
