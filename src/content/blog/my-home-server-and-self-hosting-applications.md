---
layout: layouts/post.njk
title: My home server and self hosting applications
date: '2022-09-29'
permalink: /blog/my-home-server-and-self-hosting-applications/
published: true
hero_image: blog/blog_hero_images/blog-self-hosted.jpg
og_title: My home server and self hosting applications (2022)
og_description: How I configured my home server for self hosting applications.
og_type: article
og_image: blog/blog_hero_images/blog-self-hosted.jpg
author: e9e0cc08-2054-4b6c-a5ec-699b1591125a
---
<h2>Hardware</h2>

<ul><li>Raspberry Pi 3 Model B</li><li>Asus RT-AX58U</li><li>Huawei HG8145V5 (provided by my ISP)</li><li>Personal desktop PC</li></ul>

<p>I&#39;m using a Raspberry Pi for my main server. This thing is small but powerful. Also I have my desktop PC with a few services running on it which are more resource intensive.</p>

<p>My main access to the internet is through my ISP provided ONT device using fiber connection. I&#39;m currently using it only as a modem and I have my own router connected to it.</p>

<p><img src="/assets/blog/serverstack.jpg" alt="Neatly tucked server stack" /></p>

<h2>Software</h2>

<p>I&#39;m running everything in docker containers. This whole thing started as a practical tutorial for me to learn Docker and networking. I have a single docker compose stack on raspberry pi, and another stack on my PC.</p>

<p>Here&#39;s a list of software I have running on my Raspberry PI:</p>

<ul><li><strong><a href="https://adguard.com/en/adguard-home/overview.html">AdGuard Home</a></strong></li></ul>

<p>I chose AdGuard for my network wide ad blocking over PiHole because I had all kind of issues trying to run PiHole from a container. AdGuard worked on a first try. I think whatever you choose it&#39;s going to work fine. I still need to <a href="https://labzilla.io/blog/force-dns-pihole">setup forcing all DNS requests</a> through Raspberry to get rid of YouTube ads on my TV.</p>

<ul><li><strong><a href="https://www.home-assistant.io/">Home Assistant</a></strong></li></ul>

<p>I have a growing collection of smart devices and I&#39;m using HASS as my hub for all of them.</p>

<p>These 2 services are running in <a href="https://docs.docker.com/network/host/">host network mode</a>. For rest of the services I have created internal docker network.</p>

<ul><li><strong><a href="https://traefik.io/traefik/">Traefik</a></strong></li></ul>

<p>I&#39;m using Traefik as my reverse proxy. There are a lot of options in this space including Nginx and Caddy, which are all valid, but this was my choice since I wanted to try something new. I really like the web GUI that it provides and also you can configure pretty much everything you need via docker labels.</p>

<ul><li><strong><a href="https://github.com/portainer/portainer">Portainer</a></strong></li></ul>

<p>Portainer is excellent choice for a quick overview of all your containers. It&#39;s simple to setup and easy to use. I have 2 environments configured, one for my Raspberry and one for my desktop PC.</p>

<p><img src="/assets/blog/portainer.png" alt="Portainer environments" /></p>

<ul><li><strong><a href="https://github.com/WeeJeWel/wg-easy">WG Easy</a></strong></li></ul>

<p>I&#39;m using <a href="https://www.wireguard.com/">Wireguard</a> as my VPN. WG Easy makes managing VPN clients easy with a simple web GUI. It really lives up to it&#39;s name.</p>

<ul><li><strong><a href="https://github.com/RobinLinus/snapdrop">Snapdrop</a></strong></li></ul>

<p>This is really cool small application. It&#39;s using web sockets to communicate and send files to everyone on the network that has the app opened. It&#39;s similar to Apple Airdrop.</p>

<ul><li><strong><a href="https://jellyfin.org/">Jellyfin</a></strong></li></ul>

<p>This is my media center of choice. It&#39;s running on my desktop PC since it&#39;s the place where I usually have all my media. Also on desktop PC I can <a href="https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html#getting-started">enable GPU access for docker containers</a> which allows me to enable hardware acceleration for transcoding in Jellyfin. With that setup I can easily stream 4K/HEVC videos without any stutters.</p>

<ul><li><strong><a href="https://github.com/louislam/uptime-kuma">Uptime Kuma</a></strong></li></ul>

<p>I&#39;m using this to notify me when any of the services go down. This includes my personal webpage and analytics. I have it setup to send notifications via email using <a href="https://www.smtp2go.com/">SMTP2GO</a> as my SMTP provider.</p>

<ul><li><strong><a href="https://cockpit-project.org/">Cockpit</a></strong></li></ul>

<p>I&#39;m using cockpit project for managing and status checking of my Raspberry server.</p>

<h2>Network</h2>

<p>First step in network configuration is to setup static IP for server on your local network. Every router software is different but that option should be somewhere in DHCP/LAN settings. In my case I have ASUS router with a custom firmware called <a href="https://www.asuswrt-merlin.net/">Asuswrt-Merlin</a>.</p>

<p>Next I used port forwarding to open a port for my VPN access.</p>

<p>I want to access my services with nice looking URLs instead of using IP:Port, and for that you need a domain name. I have already got one as you can probably tell. I switched from <a href="https://www.namecheap.com/">Namecheap</a> advanced DNS setup to Cloudflare DNS. In there I have a setup for wildcard A record which points to my LAN server IP.</p>

<p><img src="/assets/blog/cf-example.png" alt="A record example setup" />So now, with properly configured reverse proxy, I can access my service by visiting <code>myservice.lan.karlomikus.com</code>.</p>

<p>Also while I&#39;m in DNS configuration I have added additional A record for my VPN access that points to my public IP. Since I don&#39;t want to pay for static public IP, <a href="https://github.com/karlomikus/php-ddns">I have made a PHP script</a> that checks if my current public IP is the same as the one configured in DNS. Another option is to use a free <a href="https://en.wikipedia.org/wiki/Dynamic_DNS">DDNS service</a> like DuckDNS.</p>

<h2>Stuff I&#39;m not sold on yet</h2>

<p>These are services which I&#39;m not sure I will continue to use after initial testing.</p>

<ul><li><strong><a href="https://github.com/paperless-ngx/paperless-ngx">Paperless NGX</a></strong></li></ul>

<p>I think this is excellent application, but I don&#39;t have a lot of documents. The ones I frequently need I have in my OneDrive, and for the rest I don&#39;t really care. I think this is great application to install if you plan to digitize all of your paper trail, but for mine needs it&#39;s overkill.</p>

<ul><li><strong><a href="https://grocy.info/">Grocy</a></strong></li></ul>

<p>This is inventory management software for your house. I think it takes a lot of time and self discipline to use this to full potential. I got far with documenting everything I had in my fridge/bathroom/pantry but it&#39;s a lot of mental overhead, and I don&#39;t see myself using it consistently in future.</p>

<h2>Stuff I want to try</h2>

<p>These are services that I still didn&#39;t setup properly, but in future I would want to try them out.</p>

<p><strong><a href="https://nextcloud.com/">Nextcloud</a></strong><strong> </strong>- Personal cloud service. I&#39;m currently using OneDrive for my cloud storage, but in future I would like to setup Nextcloud instance. The issue is that I first need to setup server backups and I&#39;m worried about availability. Most of the service currently running are not critical, and I can live without them, this one needs to be more stable and always available.</p>

<p><strong><a href="https://github.com/dani-garcia/vaultwarden">Vaultwarden</a></strong><strong> </strong>- I&#39;m currently using 1Password, for personal and work needs. But I would like to switch to BitWarden to save money by paying one service fewer.</p>

<p><strong>Torrent management </strong>- I&#39;m currently manually handle all my torrent &quot;stuff&quot;. I would like to setup Sonarr/Radarr/Bazarr/QBittorrent stack to handle all that automatically.</p>

<p><strong>Backup solution</strong> - I still need to setup backups for all my server side data. The idea is to take snapshots and upload them to some cloud storage.</p>

<p><strong>Monitoring setup</strong> - I also want to setup some monitoring dashboard using Grafana/Prometheus.</p>

<p><strong>Dashboard</strong> - This is low priority, but a homepage with a list of all my services would be nice. For now, bookmark folder named &quot;Local&quot; works fine.</p>

<p><strong><a href="https://goauthentik.io/">Authentik</a></strong> - SSO Solution for all my services.</p>

<h2>Summary</h2>

<p>I learned a lot of stuff trying to setup all this. I have a better understanding in managing docker containers, configuring a reverse proxy and a lot of networking stuff and how it&#39;s all connected.</p>

<p>I think, the most used features from all of this are: using HASS to warmup/cooldown my home before I get to it, and using Jellyfin to stream media on my TV.</p>

<p>You can check my docker compose setup in <a href="https://github.com/karlomikus/selfhosted">my github repo</a>.</p>
