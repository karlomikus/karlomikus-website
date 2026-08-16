---
layout: layouts/post.njk
title: Bar Assistant - Running a frugal side project
date: '2024-01-03'
permalink: /blog/bar-assistant-frugal-side-project/
published: true
hero_image: /assets/blog/blog_hero_images/blog-bass-stack.png
og_title: Bar Assistant - Running a frugal side project
og_description: >-
  I've launched a new website and cloud-based offering making it easier to start
  managing your cocktail recipe collection. In this write-up I'll try to go
  through on how I've orchestrated this managed offering, and how much it costs
  me.
og_type: article
og_image: /assets/blog/blog_hero_images/blog-bass-stack.png
---
I&#39;ve been making an <a href="https://github.com/karlomikus/bar-assistant">app for managing cocktail recipes</a> for a while now and recently, I&#39;ve launched a <a href="https://barassistant.app/">new website and cloud-based offering</a> making it easier to start managing your cocktail recipe collection.

In this write-up I&#39;ll try to go through on how I&#39;ve orchestrated this managed &quot;cloud&quot; offering, and how much it costs me.

## DigitalOcean Droplet (18 EUR)

I&#39;m using a basic droplet with 2GB of RAM and 2 vCPU-s. I&#39;ve been using DigitalOcean for my personal projects, including this website, for a while now, and I&#39;m satisfied with the service. I almost went to Hetzner since they seem to offer a better hardware specs for a similar amount of money, but since I&#39;m also using Spaces for S3 storage I get some bandwidth savings between official droplets and spaces.

Depending on traffic and performance I can easily resize the droplet in future.

## Docker / Services

I&#39;ve been slowly learning Docker for a few years now, and I&#39;m currently comfortable enough to setup few compose files and run most of my services in containers.

Since I already publish <a href="https://hub.docker.com/u/barassistant">docker images for Bar Assistant services</a>, production setup was pretty straightforward.

One thing however differs from a <a href="https://github.com/bar-assistant/docker">basic Bar Assistant stack setup</a>. I&#39;m using custom php-fpm image and I mount whole app directory directly as volume. This was needed since I also have another app container that handles queues, which just runs queue worker.

I also have easier access to the code if something needs to be hotfixed.

The actual API backend is standard Laravel application.

### PHP 8 + FPM + SQLite 3

Bar Assistant backend API is made <a href="https://laravel.com">with Laravel framework</a>, and the database driver is SQLite3. This is a really light setup that works great and allows fast dev cycles.

### Redis

Used for caching and queue management via Laravel horizon. Running in separate docker container.

### Paddle

Laravel has a <a href="https://laravel.com/docs/10.x/cashier-paddle">official package for handling subscription</a> based billing code called Cashier, <a href="https://www.paddle.com/">Paddle</a> is one of the supported drivers. I&#39;m very satisfied with Paddle&#39;s support and available features.

This is the first time I&#39;m implementing recurring billing so it was a learning experience.

### Meilisearch

User facing search in the app is <a href="https://www.meilisearch.com/">powered by Meilisearch</a>. Combined with official Laravel Scout package, syncing data between backend and search engine is a couple of lines of code.

### Caddy

My choice for production web server is <a href="https://caddyserver.com/">Caddy</a>. I&#39;m using it with Cloudflare provider for my SSL certificates. It&#39;s a bit annoying that you have to build a custom image if you want specific DNS providers, but overall I&#39;m happy with how easy it is to configure.

<a href="https://barassistant.app" target="_blank"><img src="/assets/blog/ogimage.png" alt="Bar Assistant marketing image" /></a>

## Plausible analytics

In general, I&#39;m not really interested in a lot of analytics data, I mostly check what pages are getting clicks and from what size devices. I&#39;m using a self-hosted <a href="https://plausible.io/">Plausible analytics</a> for a few years now and I&#39;m very happy with it. It&#39;s privacy oriented I has everything I need. I currently have around 10 websites getting tracked.

## DigitalOcean Spaces (5 EUR)

I&#39;m using S3 compatible storage offered by <a href="https://docs.digitalocean.com/products/spaces/">DigitalOcean called Spaces</a>. It&#39;s 5€ per month with included 250GB storage.

I&#39;m using it specifically for the following two services.

## Litestream + SQLite

I&#39;m using SQLite3 as my main application database. I think this is the <a href="https://blog.wesleyac.com/posts/consider-sqlite" target="_blank">best database to start a new project</a> if you don&#39;t know/want to manage a database server.

<a href="https://litestream.io/">Litestream</a> is database replication service for SQLite. It runs in background and continuously pushes database changes to my S3 storage. For a really quick and operationally simple setup you get a robust database from a &quot;small&quot; database engine as sqlite.

```yaml
access-key-id: XXX
secret-access-key: XXX

dbs:
  - path: /my/path/to/bar-assistant/database.ba3.sqlite
    replicas:
      - url: s3://bucket.ams3.digitaloceanspaces.com/database
```

## Rclone

Another use case I have for S3 storage is full backup. While Litestream handles db replication and backup, I still need to backup user uploaded media like images. <a href="https://rclone.org/">Rclone</a> was pretty easy to install and setup, it also handles deleting old backups.

I have a cronjob that runs the following script every hour. It basically zips the images folder, uploads it to s3, and cleans up. Backups are held for 7 days.

```shell
filename="backup-$(date -d "today" +"%Y%m%d%H%M").zip"
zip -r $filename uploads -q
rclone sync /path/to/$filename s3:bucket/backup
rm $filename
rclone delete s3:bucket/backup --min-age 7d
```

I&#39;m expecting that my S3 bill will increase in future since uploads folder continues to grow, but for now it&#39;s under 250GB.

## SMTP2GO

For email sending I&#39;m currently subscribed to <a href="https://www.smtp2go.com">SMTP2GO&#39;s free plan</a> that offers 1000 free emails per month. This is currently more than enough for my needs. The only emails that are being sent are transactional emails; like account confirmation, password resets and similar.

## Cloudflare

I&#39;m using <a href="https://cloudflare.com">Cloudflare</a> as my DNS and CDN provider. This is good because when I notice that a lot of popular website are down because of some global outage, I&#39;ll know for certain that Bar Assistant is down as well.

## Error tracking

Monitoring and observability is a tricky thing to be frugal about. I&#39;ve used Sentry, ELK, Bugsnag in past and I really liked them, but they all seemed like a huge overkill for my case. So I went with the dumbest route. I log everything I can to files on a disk and use <a href="https://linux.die.net/man/8/logrotate">logrotate</a> to handle log rotation.

<s>Thankfully I didn&#39;t find any serious errors in the logs, meaning the app is running perfectly and without any issues.</s>

For parsing and filtering <a href="https://lnav.org/">I use lnav</a>.

<img src="/assets/blog/lnav.png" alt="Image of lnav filtering production logs" />I&#39;m still learning all the details of that tool, but currently it&#39;s doing everything I need.

## Other services

Here&#39;s some other bits and pieces that helped me in some way.

### Figma

I use figma for most of my design stuff. In general it&#39;s just small things like creating logos, and marketing images.

### Porkbun (12 EUR)

I use <a href="https://porkbun.com/">Porkbun</a> as my domain provider. I chose them because I like their branding.

### GitHub

I use Git and <a href="https://github.com/karlomikus">GitHub</a> for my version control.

### ChatGPT

For some more complicated <a href="https://github.com/karlomikus/bar-assistant/blob/master/app/Repository/CocktailRepository.php#L23">queries</a> that I&#39;m too lazy to understand.

### Notepad.exe

This is my favorite project management software.

## Future plans

I like open source, and most of the services that I use are open source, including Bar Assistant.

In future I would also like to publish my infrastructure configuration, but I would like to first switch to <a href="https://www.ansible.com/">Ansible</a> or something similar. Currently it&#39;s a sensible mess of docker compose files, and there is no point in making it public yet <sub><small>(or, I&#39;m just too embarrassed to show it to anyone)</small></sub>.

I also plan to open all my riveting analytics dashboards to public, because Plausible has a built-in feature for that, and why not use it if it&#39;s there?

## Total

In total running Bar Assistant costs me around 30 EUR per month.
