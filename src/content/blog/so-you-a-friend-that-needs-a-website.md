---
layout: layouts/post.njk
title: Your friend wants a website
date: '2025-03-06'
permalink: /blog/your-friend-wants-a-website/
published: true
hero_image: /assets/blog/blog_hero_images/friend-website-hero.png
og_image: /assets/blog/blog_hero_images/friend-website-hero.png
---
You constantly humble-brag to your friends about being a software developer and how successful you are, and one day they come to you asking if you can make a website for their small company. Nothing special, a single page with a contact form. They just want some web presence.

Since you have experience with microservice oriented architecture, kubernetes clusters, SOLID and DDD principles in huge interconnected systems, it's been a long time since you've actually created a simple front facing HTML website.

Luckily today that's pretty easy with services like Squarespace, Wix and [insert your favorite website builder here], so you point your friend to some of those online services.

But they are cheap, that's why they came to you, they don't want to pay monthly subscriptions and do any actual work, so they ask if you can do everything and just let them know when it's done, after all that's it's easy for you.

And now you are stuck, you want to help your friend, but don't want to spend too much time. Luckily the project is really simple: single page website, contact information, services information and, of course, image gallery.

If they need an e-commerce solution, it's still best to point them to Shopify or something similar, because you really don't want to maintain an e-commerce project for free.

Here's how to get it done as cheaply and painlessly as possible.

## Domain name

Easiest and possibly most expensive step (in most cases a domain name is a yearly $10-$20 cost.). You need to register a new domain name. Discuss with your friend (now your client) on what domain name he wants. When he finds out that most of the short and memorable `.com` domains are already taken, you settle for whatever is left.

After choosing a domain name you need to register it with one of the domain name registrars. I've used Porkbun and Namecheap in the past and I've been satisfied with their service. Another options would be to check your country's domain provider, in some cases you can get a free [ccTLD domain name](https://en.wikipedia.org/wiki/Country_code_top-level_domain).

One tip: once you own the domain, move its DNS to Cloudflare. It's free, it's fast, and it gives you DNS, a CDN, DDoS protection and email routing, all of which we'll use later. You'll thank yourself when we get to deployment.

## Design and development

Now comes the part you've been waiting for, actually building the website. From my experience I would strongly advise against using your own custom-made solution, or even something like WordPress or any other CMS platform, for the simple fact that somebody needs to maintain it. In the future, after you finally get it up and running, somebody will need to either upgrade the CMS to the latest version, or, even more annoying, update the language runtime it's built on. You do not want to be that somebody in two years.

Luckily, today there is a ton of static site generators: popular solutions that use "real" programming languages in development and then build the whole site into a few .html and .css files, ready to serve via your favorite web server. I've used Hugo and VitePress in the past, and your choice will depend on your language stack. VitePress is basically Vue + TypeScript with some markdown files, while Hugo is written in Go and comes with a lot of extra functionality out of the box.

If you're confident in your design skills, you could fire up Figma or Photoshop and create a mockup, but in most cases you probably don't have the time and don't want to deal with all the design changes and "the client's ideas." Another alternative is to grab a CSS framework and just use the default styling, but probably the best move is to use a free (or cheap paid) theme. Both Hugo and VitePress have a healthy ecosystem of themes, pick one that already looks close to what your friend wants, swap in their logo and colors, and call it designed.

The one slightly fiddly bit is the image gallery. Most themes ship with some kind of gallery or lightbox support, so look for that when you're picking a theme rather than building your own. Two practical things: keep the images small and serve them as WebP, your friend will hand you 8 MB photos straight from their phone, so resize them before committing, and put the images in the repo instead of hot-linking, so the site stays self-contained and fast.

## Deployment

For this step we continue following our principles: keep it as cheap as possible. What you want is free static page hosting, and luckily the options today are endless. Most of the major version-control platforms offer some kind of static page hosting, including GitHub Pages, GitLab Pages and Cloudflare Pages, plus dedicated options like Netlify and Vercel.

My recommendation is Cloudflare Pages, for one simple reason: you already moved the domain's DNS to Cloudflare in the domain step, so connecting the custom domain is a couple of clicks and an automatic TLS certificate. The workflow is the same everywhere, you connect your git repository, tell it which build command your static site generator uses and which folder the built files land in, and from then on every push to main rebuilds and deploys the site automatically. No server to maintain, no runtime to patch, no database to back up. This is the whole point of going static.

## Email

A business needs an email address at its own domain - `info@theircompany.com` looks a lot more professional than `theircompany1987@gmail.com`. But you've committed to spending no money, so hosted mailboxes like Google Workspace or Microsoft 365 (~$6/month each) are out.

The free option is email forwarding. If you put the domain on Cloudflare (see, I told you), Cloudflare Email Routing is free and lets you forward `info@theircompany.com` straight to your friend's existing Gmail inbox. ImprovMX is a good alternative if your DNS lives somewhere else. Either way, incoming mail just lands in their normal inbox at no cost.

For replying, the cleanest trick is to let them send as that address from Gmail: set up a "Send mail as" alias and point its SMTP server at whatever outbound SMTP your registrar or a free provider offers, so replies come from the business address and not their personal one. It's a bit of one-time setup, but it costs nothing and looks the part.

## Contact form

Remember the contact form they asked for? Here's the catch: a static site has no backend, so it can't receive form submissions on its own. You have two honest options.

The lazy option is to skip the form entirely and use a `mailto:` link. It's not pretty, it doesn't validate, and it pops open the user's mail client, but it costs nothing and has zero moving parts. For a friend's one-page site, this is often the right call.

If you (or they) really want a real form, use a form-handling service. Netlify Forms is the easiest if you're already hosting there, with submissions showing up in the Netlify dashboard (free up to 100 per month). If you're on Cloudflare Pages or anywhere else, Formspree, Formspark and Getform all have free tiers: point your form's action at their endpoint and they'll email each submission to you. Whichever you pick, do not hand-roll a serverless function to receive the emails yourself, that's a maintenance liability you're explicitly trying to avoid.

## Can AI just do all of this?

By now you're probably thinking: can't you just paste this whole list into an AI and let it build the site for you? Honestly, partly yes, and that's exactly the angle where AI earns its keep on a project like this.

Where AI genuinely helps is the boring middle stretch. Ask it to scaffold a project with your chosen theme, generate the marketing copy from a bullet list of services your friend gave you, resize and compress the gallery photos, and wire up the contact form. That's real time saved, and it's the kind of thing that's tedious enough to procrastinate on but simple enough that the model rarely gets it badly wrong.

Where it stops helping is the parts that need accounts, money, and judgment in the real world. The AI can't register a .com, can't decide whether `bobs-plumbing-2024.com` is an embarrassing domain, can't pick which of your friend's ten logo drafts is the least bad, and can't sit through the meeting where they change their mind about the brand color for the third time.

The honest version is that AI collapses this whole thing from "a weekend of cursing at templates" into "an evening of prompting plus an evening of clicking through dashboards." It does not turn it into zero work, because the work that remains is exactly the unglamorous wiring of services part that nobody automates for free. AI just gets you there faster on day one.

So use it for the scaffolding and the copy, but don't expect to type "make me a website for my friend" and get something you can hand over without touching it. The friend still needs a website, the AI just makes you faster at being the one who builds it.

## Wrapping up

And that's it: a domain, a static site generator with a borrowed theme, free static hosting, email forwarding, and either a mailto link or a form service. Total monthly cost: zero. Total time: an evening or two, most of which is arguing with your friend about the logo.

The best part is what's not there: no CMS to upgrade, no database to back up, no runtime to patch, no monthly bill to remind them you exist. When they inevitably come back in a year asking for "just one small change," it's a markdown edit and a git push, which, if you set up deployment properly, you can even let them do themselves.
