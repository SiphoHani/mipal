# MiPal: the safe social app for kids aged 9 to 16

MiPal is a kids-only social platform (feed, chat, games, AI buddy) with built-in protection: age and ID checks, a Safety Shield that blocks adult content, personal-info leaks and grooming patterns, a Safe Map with danger-zone alerts, an SOS button and South African emergency contacts.

## Run it
Open `index.html` in a browser (best on a phone-sized screen), or serve it: `python -m http.server 8000`.
It is a Progressive Web App: on Android/iOS use "Add to Home Screen" for an app-like experience, on desktop use "Install".

## Demo guide (2 minutes)
1. **Sign up:** age outside 9-16 is stopped. ID check and parent code are simulated (parent code: `2468`).
2. **Home:** post something; try `call me 0821234567` or `www.x.com` and watch the Shield block it. Try the safe search.
3. **Chats > Alex (new):** send two messages. Alex's 2nd reply is a grooming attempt; MiPal blocks it, pauses the account and alerts the parent.
4. **Play:** Memory Match and "Safe or Not?" earn XP and badges.
5. **Safe Map:** "Simulate a walk" triggers approaching/inside alerts for three risk zones.
6. **Pal:** type "I feel sad" or "someone is scaring me" for the empathy and help response.
7. **SOS** (red button) and **Parents** (icon, PIN `1234`) show emergency numbers, alerts and controls.

## Files
```
index.html  styles.css  app.js     the app (no build step, no dependencies)
manifest.json  sw.js  icons/       PWA install and offline support
docs/                              pitch script, design notes, roadmap, safety and privacy
```

## Deploy (free)
- **GitHub Pages:** push all files to a repo, Settings > Pages > Deploy from `main` / root.
- **Netlify / Vercel:** drag the folder in, or import the repo (no build command, output directory `.`).

## Cross-platform
One codebase runs on Android, iOS, tablets and desktop as a PWA. To publish to app stores later, wrap it with Capacitor (`npx cap add android ios`) without rewriting.

## Prototype vs production (be honest in your pitch)
| In this prototype | Needed for production |
|---|---|
| ID check and parent SMS code are simulated | Licensed identity/age-verification provider and real parent-linking |
| Rule-based Safety Shield (keywords and patterns) | ML moderation plus human moderators and reporting to authorities |
| Pal is rule-based | Child-safe LLM with strict guardrails |
| Data in browser localStorage | Secure backend, encryption, POPIA compliance (children's data is special personal information), Information Regulator registration |
| Simulated geofencing, optional real GPS | Background location with parental consent, battery-aware tracking |
| Demo friends are scripted | Real accounts with friend codes and parent-approved contacts |

Emergency numbers used (checked against government and provincial sources on 16 Oct 2026): SAPS 10111, cellphone emergency 112, ambulance 10177, Childline 116 (older line 0800 055 555), GBV Command Centre 0800 428 428. South Africa has no single national fire number, so the app points to 112 and your municipality. Government has proposed moving everything to 112, so recheck before launch.

## Tools used
Claude (design, code, pitch writing). Declare your AI tools in your submission.
