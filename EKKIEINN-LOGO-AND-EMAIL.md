# EKKIEINN-LOGO-AND-EMAIL.md
## Verkefni: Logo á síðuna + Local SMTP email + Admin pages panel

### 1. Logo á síðuna

Logo skráin er: `/home/deploy/karlmenn/public/logo.png`

#### 1a. Navbar logo
Í `src/app/layout.tsx` (eða `src/components/Navbar.tsx` / `src/components/Header.tsx` — finndu réttu skrána):
- Settu `<Image src="/logo.png" alt="EkkiEinn.is" width={140} height={50} />` í staðinn fyrir texta "EkkiEinn.is" eða "ekkieinn"
- Ef Next.js Image component er notað, settu `priority={true}`
- Gættu þess að logoið sé tengt við `/` (forsíðu)

#### 1b. Favicon
- Afritaðu `/home/deploy/karlmenn/public/logo.png` → `/home/deploy/karlmenn/public/favicon.ico` EKKI — búðu til proper favicon:
  ```bash
  cd /home/deploy/karlmenn
  npx sharp-cli -i public/logo.png -o public/favicon-32x32.png resize 32 32
  # eða nota imagemagick ef til staðar:
  magick public/logo.png -resize 32x32 public/favicon-32x32.png 2>/dev/null || convert public/logo.png -resize 32x32 public/favicon-32x32.png
  ```
- Í `src/app/layout.tsx` í metadata:
  ```typescript
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
  }
  ```

#### 1c. Footer logo (ef footer er til)
- Settu litla útgáfu af logoi í footer, t.d. 80px breitt

#### 1d. Open Graph mynd
- Í metadata: `openGraph: { images: ['/logo.png'] }`

### 2. SMTP Email með local sendmail (ENGIN þriðja aðila þjónusta)

Notaðu **local sendmail/postfix** beint á VPS. Þetta þarfnast engrar utanaðkomandi þjónustu.

#### 2a. Athugaðu hvort sendmail/postfix er til
```bash
which sendmail || apt-get install -y sendmail
```

#### 2b. Settu upp Nodemailer með sendmail transport í `.env`
Bættu þessum línum við `/home/deploy/karlmenn/.env`:
```
SMTP_USE_SENDMAIL=true
MAIL_FROM=info@ekkieinn.is
MAIL_FROM_NAME=EkkiEinn.is
```

#### 2c. Uppfærðu email utility skrána
Finndu email utility (t.d. `src/lib/email.ts` eða `src/utils/email.ts` eða `src/lib/mailer.ts`):

```typescript
import nodemailer from 'nodemailer';

const transporter = process.env.SMTP_USE_SENDMAIL === 'true'
  ? nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail',
    })
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '25'),
      secure: false,
      tls: { rejectUnauthorized: false },
    });

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) => {
  return transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'EkkiEinn.is'}" <${process.env.MAIL_FROM || 'info@ekkieinn.is'}>`,
    to,
    subject,
    html,
    text,
  });
};
```

Ef `sendmail` er ekki til á VPS, notaðu localhost port 25 fallback (sama config).

#### 2d. Ef nodemailer er ekki installed
```bash
cd /home/deploy/karlmenn && npm install nodemailer @types/nodemailer
```

### 3. Klára Admin Pages Panel

Lestu `/home/deploy/karlmenn/EKKIEINN-PAGES-ADMIN.md` og kláraðu allt sem vantar:
- `/admin/pages` — listi af síðum
- `/admin/pages/new` — búa til nýja síðu
- `/admin/pages/[id]/edit` — breyta síðu
- Forsíðar-flokkur `about`, `legal`, `contact` — hægt að velja
- Rich text editor (einfaldur textarea er nóg)
- Sidebar navigation tengill á admin

### 4. Push

```bash
cd /home/deploy/karlmenn
git add -A
git commit -m "feat: add logo, local smtp email, admin pages panel"
git push origin beta
```

**MIKILVÆGT: Push á beta branch EINGÖNGU. ALDREI á main.**
