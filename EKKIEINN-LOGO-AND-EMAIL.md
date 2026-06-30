# EKKIEINN-LOGO-AND-EMAIL.md
## Verkefni: Logo + SMTP Email setup fyrir ekkieinn.is

---

## 1. Logo — setja inn á síðuna

Logo myndin er í repo: `public/logo.png` — þú þarft að bæta henni við.

### Skref:

#### 1a. Afrita logo
Logoið er þegar pushed á repo sem `public/logo.png`. Notaðu það.

#### 1b. Favicon
- Búðu til `/public/favicon.ico` og `/public/icon.png` úr `/public/logo.png`
- Í `app/layout.tsx` (eða `pages/_app.tsx`) — settu metadata:
```tsx
export const metadata = {
  title: 'EkkiEinn.is',
  description: 'Þú ert ekki einn',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    images: ['/logo.png'],
  },
}
```

#### 1c. Navbar/Header
Í header component — replace existing logo/text með:
```tsx
import Image from 'next/image'
// ...
<Image src="/logo.png" alt="EkkiEinn.is" width={150} height={50} />
```

Ef engin header er til — bættu við í layout.tsx efst á síðunni.

#### 1d. Footer
Sömu logo mynd í footer, lítið, t.d. 100x33px.

---

## 2. SMTP Email — info@ekkieinn.is

Settu upp Brevo (Sendinblue) SMTP í `.env` skránni.

### .env breytingar — bæta við:
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=elvarpa@gmail.com
SMTP_PASS=<BREVO_API_KEY_HERE>
SMTP_FROM=info@ekkieinn.is
SMTP_FROM_NAME=EkkiEinn.is
```

**ATH:** Þú þarft að:
1. Fara á app.brevo.com
2. Skrá þig inn eða búa til reikning með elvarpa@gmail.com
3. Fara í SMTP & API → Generate SMTP key
4. Setja key-inn í SMTP_PASS í /home/deploy/karlmenn/.env

### Nodemailer uppsetning
Athugaðu hvort `lib/email.ts` eða `lib/mailer.ts` sé til. Ef til — uppfærðu til að nota þessar env breytur:
```ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})
```

Ef email library er ekki til — búðu til `lib/email.ts` með þessari uppsetningu og `sendEmail(to, subject, html)` function.

### Staðfestu
Eftir uppsetningu — athugaðu hvort contact form á /hafa-samband (eða /contact) sendi email á info@ekkieinn.is.

---

## 3. Push á beta branch

Þegar allt er klárað:
```bash
git add -A
git commit -m "feat: add logo everywhere + SMTP email setup"
git push origin beta
```

---

## Mikilvægt
- ALDREI push á main — alltaf beta
- Logo skrá: `/public/logo.png`
- PM2 restart eftir .env breytingar: `pm2 restart ekkieinn`
