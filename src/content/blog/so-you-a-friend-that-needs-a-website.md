---
layout: layouts/post.njk
title: Your friend wants a website
date: '2025-03-06'
permalink: /blog/so-you-a-friend-that-needs-a-website/
published: false
hero_image: blog/blog_hero_images/friend-website-hero.png
og_image: blog/blog_hero_images/friend-website-hero.png
---
<p>You constantly humble brag to your friends how you are software developer and how successful you are and one day they come to you asking if you can make a website for their small company, nothing special, a single webpage with a contact form, they just want some web presence.</p>

<p>Since you have experience with microservice oriented architecture, kubernetes clusters, SOLID and DDD principles in huge interconnected systems, it&#39;s been a long time since you&#39;ve actually created a simple front facing HTML website.</p>

<p>Luckily today that&#39;s pretty easy with services like Squarespace, Wix and [insert your favorite website builder here], so you point your friend to some of those online services.</p>

<p>But they are cheap, that&#39;s why they came to you, they don&#39;t want to pay monthly subscriptions and do any actual work, so they ask if you can do everything and just let them know when it&#39;s done, after all that&#39;s it&#39;s easy for you.</p>

<p>And now you are stuck, you want to help your friend, but don&#39;t want to spend too much time. Luckily the project is really simple: single page website, contact information, services information and, of course, image gallery.</p>

<p>If they need an e-commerce solution, it&#39;s still best to point them to Shopify or something similar, because you really don&#39;t want to maintain e-commerce projects (for free).</p>

<h2>Domain name</h2>

<p>Easiest and possibly most expensive step (in most cases a domain name is a yearly $10-$20 cost.). You need to register a new domain name. Discuss with your friend (now your client) on what domain name he wants. When he finds out that most of the short and memorable <code>.com</code> domains are already taken, you settle for whatever is left.</p>

<p>After choosing a domain name you need to register it with some of the domain name registrars. I&#39;ve used <em>Porkbun</em> and <em>Namecheap</em> in the past and I&#39;ve been satisfied with their service. Another options would be to check your country&#39;s domain provider, in some cases you can get a free <a href="https://en.wikipedia.org/wiki/Country_code_top-level_domain">ccTLD</a> domain name.</p>

<h2>Design and development</h2>

<p>Now comes the part that you are waiting for, to actually build a website. From my experience I would strong advise against using your own custom made solution, or even something like Wordpress or any other CMS platform because of the simple fact, somebody needs to maintain it. In future after you finally get it up and running somebody will need to either upgrade the CMS to the latest version, or even more annoying, update to the latest language you are using.</p>

<p>Luckily today there is a ton of static site generators. Popular solutions that use &quot;real&quot; programming languages in development and then build the whole site into a few .html and .css files, ready for you to serve them via your favorite webserver. I&#39;ve used Hugo and Vitepress in the past and your choice will depend on your language stack knowledge. Vitepress is your basic Vue+Typescript with some markdown files, while Hugo use golang and comes with a lot of extra functionality.</p>

<p>If you are confident in your design skills, you could fire up Figma or Photoshop and create a mockup, but in most cases you probably don&#39;t have the time and don&#39;t want to deal with all design changes and &quot;clients&quot; ideas.</p>

<p>Another alternative is use a CSS framework and just use the default styling, but probably the best way is just use a free (or paid) theme.</p>

<h2>Deployment</h2>

<p>For this step, we will continue following our principles, to keep it as cheap as possible. What you want is some free static page hosting, and luckily, options today are endless. Most of the major versioning platforms offer some sort of static page hosting, including Github, gitlab, cloudflare, ...</p>

<h2>Email</h2>

<h2>Deployment</h2>

<p>Todo</p>
