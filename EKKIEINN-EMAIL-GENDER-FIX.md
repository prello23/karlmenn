# EKKIEINN-EMAIL-GENDER-FIX.md
## Bug: Email name not detected in gender scoring

### Problem
When testing with name "elvar" and email "johanna@gmail.com":
- System says "Ekkert nafn greinanlegt í netfangi" (no name detected in email)
- Gives Netfangsskor: 50% (neutral)
- But "johanna" IS a recognizable Icelandic female name (Jóhanna)

This means a woman could register with a male first name and a female email, and the system would still auto-approve.

### Fix Required

1. **Email prefix extraction must be smarter**:
   - Extract the part before `@`
   - Remove numbers and common suffixes (e.g. `johanna123` → `johanna`)
   - Split on dots/underscores (e.g. `anna.maria` → `anna`, `maria`)
   - Try each segment against the Icelandic name database (both male AND female)
   - Also try common ASCII→Icelandic mappings: `johanna`→`Jóhanna`, `gudrun`→`Guðrún`, `sigridur`→`Sigríður`, etc.

2. **If a FEMALE name is found in email**, Netfangsskor should be **0%** (not 50%)
3. **If a MALE name is found in email**, Netfangsskor should be **100%**
4. **If no name found**, keep 50% (neutral)

### ASCII→Icelandic common mappings to add
```
johanna → Jóhanna (f)
gudrun → Guðrún (f)
sigridur → Sigríður (f)
margret → Margrét (f)
kristin → Kristín (f)
helga → Helga (f)
anna → Anna (f)
maria → María (f)
bjork → Björk (f)
thorunn → Þórunn (f)
sigrun → Sigrún (f)
ragnheidur → Ragnheiður (f)
hildur → Hildur (f)
jon → Jón (m)
gunnar → Gunnar (m)
sigurdur → Sigurður (m)
gudmundur → Guðmundur (m)
olafur → Ólafur (m)
magnus → Magnús (m)
stefan → Stefán (m)
arnar → Arnar (m)
bjarni → Bjarni (m)
einar → Einar (m)
```

### Expected result after fix
- Name: "elvar", Email: "johanna@gmail.com"
- Nafnaskor: 100% (elvar = male)
- Netfangsskor: 0% (johanna = female)
- Netleitarskor: 100% (genderize says karl)
- Lokaskor: 0.6×100 + 0.3×0 + 0.1×100 = **70%**
- With default threshold 70%, this would be **borderline** — admin review needed ✅

### IMPORTANT
- Do NOT break existing functionality
- Only modify the email scoring part
- Keep the weighted formula: 0.6×name + 0.3×email + 0.1×online
