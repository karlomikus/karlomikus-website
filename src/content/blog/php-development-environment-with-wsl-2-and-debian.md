---
layout: layouts/post.njk
title: PHP development environment with WSL 2 and Debian
date: '2022-03-03'
permalink: /blog/php-development-environment-with-wsl-2-and-debian/
published: true
hero_image: /assets/blog/blog_hero_images/wsl-setup.jpg
og_title: PHP development environment with WSL 2 and Debian
og_description: >-
  Setup WSL2 development environment for PHP using Apache2, PostgreSQL and
  Debian.
og_type: article
og_image: /assets/blog/blog_hero_images/wsl-setup.jpg
---
<p>Please check <a href="https://docs.microsoft.com/en-us/windows/wsl/install">WSL prerequisites</a> before attempting this setup. This guide assumes that you have at least basic knowledge of linux operating systems.</p>

<p>In this setup we will be using <a href="https://www.debian.org/">Debian</a> as our server distribution with Apache2/PHP-FPM as our web server. Also note that in this guide I sometimes reference Laravel framework, but this setup should work for most PHP projects. Let&#39;s get started with the first step.</p>

<h2>Installing Debian</h2>

<p>In your <a href="https://www.microsoft.com/en-US/p/windows-terminal/9n0dx20hk701#activetab=pivot:overviewtab">windows terminal</a> enter the following.</p>

~~~shell
wsl --install -d debian
~~~

<p>This will download and install the latest version of Debian, in this case it&#39;s Debian 11 (Bullseye). Once you have installed WSL, you will need to create a user account and password for your newly installed Linux distribution.</p>

<p>Next, access your distribution by typing <code>wsl</code> in your terminal of choice, or searching for Debian in your start menu. If you&#39;ve done everything correctly now you should be inside your Debian terminal.</p>

<p>Next let&#39;s check for upgrades.</p>

~~~shell
sudo apt update
sudo apt upgrade
~~~

<p>Then we will need to install some default packages. I&#39;m using vim as my preferred editor, you can change that as you wish.</p>

~~~shell
sudo apt-get install lsb-release git openssl curl zsh vim wget
~~~

<h2>Install Apache 2 and PHP</h2>

<p>We will be using Apache2 with PHP-FPM. Let&#39;s start by installing Apache package.</p>

~~~shell
sudo apt-get install apt-transport-https ca-certificates apache2
~~~

<p>Then we will enable some mods that we will be using.</p>

~~~shell
sudo a2enmod headers
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod remoteip
~~~

<p>Next, add yourself to the <code>www-data</code> group.</p>

~~~shell
sudo usermod -a -G www-data karlo
~~~

<p>Now we will install and setup PHP. At the time of the writing, latest version of PHP is 8.1. First we need to add PHP package repository.</p>

~~~shell
sudo wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
sudo echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
sudo apt-get update

~~~

<p>Then we can install PHP and some default extensions.</p>

~~~shell
sudo apt-get install php8.1 php8.1-pgsql php8.1-mbstring php8.1-xml php8.1-gd php8.1-imagick php8.1-curl php8.1-zip php8.1-xsl php8.1-soap php8.1-intl php8.1-bcmath
~~~

<p>Then we will setup PHP-FPM.</p>

~~~shell
sudo apt install php8.1-fpm libapache2-mod-fcgid
sudo a2enmod proxy_fcgi setenvif
sudo a2enconf php8.1-fpm
~~~

<p>Now let&#39;s restart our services.</p>

~~~shell
sudo service apache2 restart
sudo service php8.1-fpm restart
~~~

<p>If you go to <code>http://localhost</code> you should see the default apache welcome page.</p>

<h2>Apache 2 virtual hosts configuration</h2>

<p>Next step is to configure our virtual hosts. Let&#39;s start by creating a self signed certificate for SSL access.</p>

~~~shell
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/wsl.local.key -out /etc/ssl/certs/wsl.local.crt
~~~

<p>This will generate our key and certificate file. Next let&#39;s create a new virtual host configuration.</p>

~~~shell
sudo vim /etc/apache2/sites-available/website.local.conf
~~~

<p>Here are the contents of the file. Note that this setup assumes you have a PHP project in <code>/var/www/website</code> directory. You can change your <code>DocumentRoot</code> and <code>Directory</code> variables to reflect your own settings. You can also <a href="https://docs.microsoft.com/en-us/windows/wsl/filesystems">use your windows folders</a>, although I don&#39;t recommend it for performance reasons.</p>

~~~apache
<VirtualHost *:443>
    ServerName website.local

    DocumentRoot /var/www/website/public/
    <Directory /var/www/website/public>
        AllowOverride all
        Require all granted
    </Directory>

    ErrorLog /var/log/apache2/website-error.log
    CustomLog /var/log/apache2/website-access.log combined

    SSLEngine On
    SSLCertificateFile      /etc/ssl/certs/wsl.local.crt
    SSLCertificateKeyFile   /etc/ssl/private/wsl.local.key
    SSLProtocol All -SSLv2 -SSLv3
</VirtualHost>
~~~

<p>Now let&#39;s enable the site.</p>

~~~shell
sudo a2ensite website.local
sudo service apache2 reload
~~~

<h2>Accessing the website</h2>

<p>To access the website we need to modify our hosts file. You should be familiar with this process. Open your hosts file <code>C:\Windows\System32\drivers\etc\hosts</code> and add the following.</p>

~~~ini
# WSL
::1	    website.local
127.0.0.1   website.local
~~~

<p>Now if you visit <code>https://website.local/</code> you should see your PHP project.</p>

<h2>Installing database</h2>

<p>For this example we will be installing PostgreSQL.</p>

~~~shell
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
~~~

<p>To create a new database you can follow this example, first we open SQL console.</p>

~~~shell
sudo -u postgres psql
~~~

<p>Then in postgres console type the following commands.</p>

~~~sql
--- Create user 'wsluser' with password 'secret'
CREATE ROLE wsluser LOGIN PASSWORD 'secret';
--- Create database with name laravel
CREATE DATABASE "laravel" WITH ENCODING='UTF8' OWNER=wsluser TEMPLATE template0;
--- Grant access
GRANT ALL PRIVILEGES ON DATABASE "laravel" to wsluser;
~~~

<h2>Setup XDebug</h2>

<p>First we need to install XDebug extension.</p>

~~~shell
sudo apt-get install php-xdebug
~~~

<p>Then append the following to <code>/etc/php/8.1/cli/conf.d/20-xdebug.ini</code> file.</p>

~~~ini
xdebug.mode = debug
xdebug.start_with_request = yes
~~~

<p>Be sure to restart apache and php-fpm services after this setup.</p>

<h2>Additional information</h2>

<ul><li><a href="https://docs.microsoft.com/en-us/windows/wsl/setup/environment">Main documentation</a> for WSL is a great source for all your information.</li><li>You can access WSL files from Windows by visiting <code>\\wsl$\Debian</code> in explorer, or just type <code>explorer.exe .</code> inside WSL to open current folder in Windows.</li><li>To install and setup Node.js you need to <a href="https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl#install-nvm-nodejs-and-npm">follow this guide</a>.</li><li>If you are using VSCode for development you should <a href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack">check out this extension</a>.</li><li>Also you can open current folder in VSCode by typing <code>code .</code> inside WSL.</li><li>You will probably want to install composer, just follow <a href="https://getcomposer.org/download/">command-line installation instructions</a>.</li><li>If you have issues with folder permissions <a href="https://stackoverflow.com/questions/30639174/how-to-set-up-file-permissions-for-laravel">check out this post</a>.</li><li>To shutdown WSL type <code>wsl --shutdown</code> inside your windows terminal.</li><li>Also every time your start WSL you need to start all your services manually. To make this easier I created <code>start.sh</code> file inside my home directory, and I run it every time with <code>sudo ./start.sh</code>.</li></ul>

~~~shell
#!/bin/sh
service apache2 start
service postgresql start
service php8.1-fpm start
service redis-server start
~~~

<p></p>
