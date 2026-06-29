# EKKIEINN-UPDATE-3.md
## Leiðbeiningar fyrir Claude Code — gera ALLT hér að neðan

Read this file carefully and implement ALL items in order. Push nothing to git — the deploy system handles that.

---

## 1. Textafix — studningur/page.tsx

In `/home/deploy/karlmenn/src/app/studningur/page.tsx` around line 45:
Change: `"Aðstoð í boði í gegnum verkefnið — sumt í sjálfboðavinnu, annað fjármagnað með framlögum."`
To: `"Aðstoð í boði í gegnum verkefnið — fjármagnað með framlögum og styrktarfé."`

Also search all files under `src/` for any occurrence of `sjálfboðavinnu` and replace with contextually appropriate Icelandic text that does NOT mention volunteering.

---

## 2. Prisma — bæta isHidden við Thread

In `/home/deploy/karlmenn/prisma/schema.prisma`, inside the `Thread` model, add after `isLocked Boolean @default(false)`:
```
isHidden    Boolean @default(false)
```

Then run:
```bash
cd /home/deploy/karlmenn
npx prisma migrate dev --name add_thread_is_hidden
```

If `migrate dev` fails (prod DB), run:
```bash
npx prisma db push
```

---

## 3. Server Action — toggleThreadHidden

In `/home/deploy/karlmenn/src/app/admin/actions.ts`, add this function after `toggleThreadFlag`:

```typescript
export async function toggleThreadHidden(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) return;
  await prisma.thread.update({
    where: { id },
    data: { isHidden: !thread.isHidden },
  });
  revalidatePath(`/admin/threads/${id}`);
  revalidatePath("/admin/threads");
  revalidatePath("/forum");
}
```

---

## 4. Admin Thread Detail — bæta við Fela/Birta hnappi

In `/home/deploy/karlmenn/src/app/admin/threads/[id]/page.tsx`:

1. Import `toggleThreadHidden` alongside the other imports from `@/app/admin/actions`
2. Import `EyeOff, Eye` from `lucide-react`
3. Add this button in the button group (before the delete button):

```tsx
<form action={toggleThreadHidden}>
  <input type="hidden" name="id" value={thread.id} />
  <Button type="submit" variant={thread.isHidden ? "default" : "outline"} size="sm">
    {thread.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    {thread.isHidden ? "Birta þráð" : "Fela þráð"}
  </Button>
</form>
```

4. Show a badge in the thread header if `thread.isHidden`:
```tsx
{thread.isHidden && (
  <Badge variant="secondary" className="ml-2">Falinn</Badge>
)}
```

---

## 5. Admin Thread List — sýna hidden status

In `/home/deploy/karlmenn/src/app/admin/threads/page.tsx`:

1. Import `EyeOff` from `lucide-react`
2. In the thread title column, add after the lock icon:
```tsx
{t.isHidden && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" title="Falinn" />}
```

---

## 6. Public forum — sía út hidden þræði

In ALL public-facing Prisma queries that fetch threads (forum listing, category pages, home page), add `isHidden: false` to the `where` clause.

Search for all `prisma.thread.findMany` and `prisma.thread.findFirst` calls in `src/app` (excluding `src/app/admin`) and add `isHidden: false` to their where conditions.

Example:
```typescript
// Before:
where: { categoryId: catId }
// After:
where: { categoryId: catId, isHidden: false }
```

---

## 7. Skilmálar — skrifa inn nýjan texta

Replace the entire contents of `/home/deploy/karlmenn/src/app/skilmalar/page.tsx` with the following:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skilmálar og notendaskilyrði | ekkieinn.is",
  description: "Skilmálar og notendaskilyrði fyrir ekkieinn.is",
};

export default function SkilmalarPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Skilmálar og notendaskilyrði</h1>
      <p className="text-sm text-muted-foreground mb-10">Síðast uppfært: Júní 2025</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-10">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Um þjónustuna</h2>
          <p>
            ekkieinn.is er samfélagsvettvangur sem veitir karlmönnum, sem hafa orðið fyrir
            ofbeldi, rangar sakir eða misnotkun, aðgang að stuðningsneti, umræðuþráðum og
            upplýsingum um lögfræðilega og sálfræðilega þjónustu. Síðan er rekin af einkaaðila
            sem leggur áherslu á friðsælt og uppbyggilegt samfélag.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Ábyrgð á efni notenda</h2>
          <p>
            Notendur bera fulla og eina ábyrgð á því efni sem þeir birta á ekkieinn.is, þar með
            talið texta, myndir og tengla. ekkieinn.is ber enga ábyrgð á efni sem notendur setja
            inn, hvernig það er notað af öðrum eða afleiðingum sem kunna að leiða af birtingu þess.
          </p>
          <p className="mt-2">
            Bannað er að birta efni sem:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>er lögbrotlegt, hótandi eða ærumeiðandi</li>
            <li>inniheldur persónulegar upplýsingar um aðra án leyfis</li>
            <li>er markaðssetning eða spam</li>
            <li>er í beinni andstöðu við markmið samfélagsins</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Öryggi gagna og netárásir</h2>
          <p>
            ekkieinn.is notar eðlilegar öryggisráðstafanir til að vernda gögn notenda. Hins vegar
            er engin vefsíða 100% óviðráðanleg og ekkieinn.is ber <strong>enga ábyrgð</strong> ef
            gögn leka, eru stolið eða ef kerfið verður fyrir netárás (hacking). Notendur skrá sig
            inn á eigin áhættu og eru hvattir til að nota sterk lykilorð og vernda eigin aðgang.
          </p>
          <p className="mt-2">
            Ef grunur vaknar um öryggisbrot er hægt að hafa samband við{" "}
            <a href="mailto:info@ekkieinn.is" className="text-primary underline">
              info@ekkieinn.is
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Styrktarfé og framlög</h2>
          <p>
            ekkieinn.is tekur á móti styrktarfé til að fjármagna rekstur og þróun vefsíðunnar
            og til að bjóða upp á fjárhagslegan stuðning við lögfræðilega og sálfræðilega
            þjónustu, eftir því sem fjárhagslegar aðstæður leyfa. Hluti framlaganna fer beint í
            rekstur og tækniþróun síðunnar.
          </p>
          <p className="mt-2">
            ekkieinn.is gefur engar tryggingar um að tiltekið magn styrktarfjár verði veitt
            einstaklingum. Úthlutun fer eftir mati rekstraraðila hverju sinni.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Takmarkaðar greiðslur og endurgreiðslur</h2>
          <p>
            Greiðslur sem inntar eru af hendi á ekkieinn.is (t.d. stuðningsgjald eða framlag)
            eru að jafnaði endanlegar. Endurgreiðslubeiðnir eru teknar til skoðunar í sérstökum
            tilvikum — hafið samband við{" "}
            <a href="mailto:info@ekkieinn.is" className="text-primary underline">
              info@ekkieinn.is
            </a>{" "}
            innan 14 daga frá greiðsludegi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Takmarkaðar skaðabótaábyrgðar</h2>
          <p>
            ekkieinn.is og eigendur þjónustunnar bera enga skaðabótaábyrgð gagnvart notendum
            eða þriðja aðila vegna beinnar eða óbeinnar tjánar sem hlýst af notkun eða
            óaðgengi þjónustunnar, þar með talið gagnaleka, truflana á þjónustu eða
            mistakasendingu upplýsinga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Breytingar á skilmálum</h2>
          <p>
            ekkieinn.is áskilur sér rétt til að breyta þessum skilmálum. Verulegar breytingar
            verða tilkynntar með auðsæum hætti á vefsíðunni. Áframhaldandi notkun þjónustunnar
            eftir breytingar telst samþykki á uppfærðum skilmálum.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Lög og lögsaga</h2>
          <p>
            Þessir skilmálar lúta íslenskum lögum. Ágreiningur sem rísa kann vegna túlkunar eða
            framkvæmdar þeirra skal leystur fyrir íslenskum dómstólum.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Samband</h2>
          <p>
            Spurningar eða athugasemdir um þessa skilmála má senda á{" "}
            <a href="mailto:info@ekkieinn.is" className="text-primary underline">
              info@ekkieinn.is
            </a>
            .
          </p>
        </section>

      </div>
    </main>
  );
}
```

---

## 8. Admin Stillingar — bæta við umfangsmeiri stillingum

The current `/home/deploy/karlmenn/src/app/admin/stillingar/page.tsx` has basic settings. Expand it with these additional editable fields (use the existing `setSetting`/`getSetting` pattern from `@/lib/settings`):

Add these settings (key → label → default):
- `site_tagline` → "Undirfyrirsögn forsíðu" → "Samfélag og stuðningur fyrir karlmenn"
- `about_text` → "Um síðuna (stutt lýsing)" → "ekkieinn.is er vettvangur fyrir karlmenn sem hafa orðið fyrir ofbeldi, rangar sakir eða misnotkun."
- `contact_email` → "Netfang tengiliðar" → "info@ekkieinn.is"
- `maintenance_mode` → "Viðhaldshamur (lokar aðgang)" → "false" (checkbox)
- `new_registrations` → "Leyfa nýskráningar" → "true" (checkbox)
- `require_email_verify` → "Krefjast staðfestingar á netfangi" → "true" (checkbox)
- `forum_min_post_length` → "Lágmarkslengd þráðs (stafir)" → "20"
- `welcome_message` → "Velkomskilaboð (sýnt nýjum notendum)" → ""

Display settings in logical groups:
- **Almennt** (site_tagline, about_text, contact_email)
- **Skráning** (new_registrations, require_email_verify)
- **Vettvangsreglur** (forum_min_post_length, welcome_message)
- **Kerfið** (maintenance_mode)

The form should work like the existing settings form — server action `updateSettings` with revalidatePath.

**IMPORTANT**: The UI must be mobile-friendly. Use a clean card-based layout with clear labels, helper text, and logical grouping. Use `<Card>` components from `@/components/ui/card`.

---

## 9. Build og deploy

After making ALL changes above:

```bash
cd /home/deploy/karlmenn

# Run migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Restart PM2
/home/aiuser/.npm-local/node_modules/pm2/bin/pm2 restart ekkieinn
```

---

## Summary of changes
- [ ] Fix "sjálfboðavinnu" text in studningur/page.tsx
- [ ] Add `isHidden` to Thread schema + migrate
- [ ] Add `toggleThreadHidden` server action
- [ ] Update admin thread detail with Fela/Birta button
- [ ] Update admin thread list with hidden icon
- [ ] Filter hidden threads from public views
- [ ] Replace skilmálar page with full legal text
- [ ] Expand admin stillingar with more settings
- [ ] Build + PM2 restart
