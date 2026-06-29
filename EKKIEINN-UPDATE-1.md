# Uppfærðar kröfur — ekkieinn.is

## 1. Admin stjórnkerfi — allar síður

Admin panel (`/admin`) á að innihalda ALL þessar síður:
- Þræðir (forum threads) — lista, skoða, eyða
- Notendur — lista, breyta, eyða
- **Flokkar** — lista, bæta við, **BREYTA NAFNI**, eyða
- Síður (static pages) ef einhverjar
- Stillingar

## 2. Breyting nafna flokka í admin

Í `/admin/flokkar` (eða `/admin/categories`):
- Admin getur breytt nafni á flokki (edit inline eða modal)
- Admin getur bætt við nýjum flokki
- Admin getur eytt flokki (með confirmation)

## 3. Þolanda- og geranda-upplýsingar í þráðum

Þegar notandi býr til nýjan þráð (`/samfelag/nytt` eða `/forum/new`):

### Viðbótarreiti (PRIVATE — sjást ALDREI á þræðinum sjálfum):
- **Nafn þolanda** (text input, optional) — skráist aðeins í DB
- **Nafn geranda** (text input, optional) — skráist aðeins í DB

### Skýring sem sýna á notanda (texti undir reitunum):
> "Þessar upplýsingar eru einungis notaðar til lögfræðilegrar aðstoðar ef fleiri mál um sama geranda berast til okkar. Þær verða aldrei sýnilegar á þræðinum."

### Í Prisma schema (Thread model):
```prisma
victimName   String?  // nafn þolanda - NEVER shown publicly
perpetratorName String? // nafn geranda - NEVER shown publicly
```

### Í admin þráðaskoðun:
- Admin getur séð þessar upplýsingar í `/admin/threads/[id]`
- Admin getur leitað eftir geranda nafni til að finna tengd mál

## 4. Prisma DB schema uppfærsla

Ganga úr skugga um að Thread model innihaldi:
```prisma
model Thread {
  id             String   @id @default(cuid())
  title          String
  content        String
  categoryId     String
  authorId       String
  victimName     String?   // private
  perpetratorName String?  // private
  isAnonymous    Boolean  @default(true)
  isPinned       Boolean  @default(false)
  isLocked       Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  category       Category @relation(fields: [categoryId], references: [id])
  author         User     @relation(fields: [authorId], references: [id])
  replies        Reply[]
}
```

## MIKILVÆGT
- victimName og perpetratorName eru ALDREI sýnileg á frontend
- Aðeins admin getur séð þær í stjórnkerfinu
- Þegar notandi sér þráðinn — ekkert um þessa reiti
