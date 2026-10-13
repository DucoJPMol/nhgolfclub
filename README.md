# De Noordhollandse GolfClub — website

Static website (HTML, CSS, JavaScript). No build step and no dependencies.

## Structure

```
index.html              Home
club.html               De club, het bestuur, vrijwilligers, Club van 100
baan.html               De baan, dronevideo's, plaatselijke regels, handicaptabellen, hospitality
activiteiten.html       Vaste Wekelijkse Activiteiten
wedstrijden.html        Jaarplanning, Golfster en Golfer van het Jaar, archief
reglementen.html        Wedstrijdreglementen
ngf-competitie.html     NGF Competitie 2026
jeugd.html              Jeugd
lid-worden.html         Tarieven 2026, inschrijven, regelexamen, FAQ
nieuws.html             Laatste Nieuws
contact.html            Contact en tee-time aanvraag
leden.html              Voor leden
fotos.html              Invité Open 2026
statuten.html, huishoudelijk-reglement.html, privacy.html
404.html, sitemap.xml, robots.txt, vercel.json
assets/css/style.css    All styles (design tokens at the top)
assets/js/main.js       Menu, animations, calendar filters, video, lightbox, forms
assets/img/             Optimised images
```

## Preview locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173

## Deploy: GitHub + Vercel

1. Create a new repository on GitHub and push this folder as the repository root.
2. In Vercel choose **Add New → Project** and import the repository.
3. Framework preset: **Other**. Leave build command and output directory empty.
4. Deploy. `vercel.json` enables clean URLs (`/activiteiten` instead of `/activiteiten.html`),
   caching for assets, and redirects from the old WordPress addresses to the new pages.

## Before going live

- `sitemap.xml`, `robots.txt` and the canonical tags use `https://www.denoordhollandsegolfclub.nl`.
  Change that address in those places if the site goes live on another domain.
- The contact and tee-time forms open the visitor's e-mail program with the message filled in.
  To send from the page itself, connect the forms to a form service or a serverless function.
- Several links still point to tools and files on the current WordPress site
  (klassement, wedstrijdarchief, rondeoverzicht, ALV-documenten, PDF's). Keep that site
  reachable, or move those tools and files, before switching the domain.
