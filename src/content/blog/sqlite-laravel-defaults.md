---
layout: layouts/post.njk
title: SQLite optimizations in Laravel
date: '2024-12-08'
permalink: /blog/sqlite-laravel-defaults/
published: true
hero_image: blog/blog_hero_images/blog-hero-images.webp
og_image: blog/blog_hero_images/blog-hero-images.webp
author: e9e0cc08-2054-4b6c-a5ec-699b1591125a
---
<p>SQLite has been getting more and more attention as a production ready database. It is the default database when you start a new project in Laravel, and recently I&#39;ve been using it in production for my <a href="https://barassistant.app/">small side project</a>.</p>

<p>This new popularity spawned a lot of discussion about available optimizations and better default configurations. I&#39;m not going to go through them, but here is a few good posts from the web:</p>

<ul><li><a href="https://kerkour.com/sqlite-for-servers">Optimizing SQLite for servers</a></li><li><a href="https://developer.android.com/topic/performance/sqlite-performance-best-practices">Best practices for SQLite performance</a></li><li><a href="https://briandouglas.ie/sqlite-defaults/">Sensible SQLite defaults</a></li></ul>

<p>Here I will show you how to use and enable them in your Laravel applications.</p>

<p>Laravel already supports some of the common configurations via default database connections config array. Here is the config example with recommendations from above listed posts.</p>

~~~php
'sqlite' => [
    'driver' => 'sqlite',
    'url' => env('DATABASE_URL'),
    'database' => env('DB_DATABASE', database_path('database.sqlite')),
    'prefix' => '',
    'foreign_key_constraints' => true,
    'journal_mode' => 'WAL',
    'busy_timeout' => 5000,
    'synchronous' => 'NORMAL',
],
~~~

<p>One caveat that you need to be aware of is that some of these configurations are permanent (like WAL mode) and some need to be setup before every connection to the database.</p>

<p>Laravel will automatically handle the configurations defined in the config file, but what if you want to add your own. For that you can use <code>AppServiceProvider.php</code> file and the <code>boot()</code> method.</p>

~~~php
public function boot()
{
    DB::statement('
        PRAGMA temp_store = memory;
        PRAGMA cache_size = -20000;
        PRAGMA mmap_size = 2147483648;
        PRAGMA page_size = 8192;
    ');
}
~~~

<p>This will always set the PRAGMA configurations for the current connection. To check if the configurations are applied you can use the following snippet.</p>

~~~php
<?php

use Illuminate\Support\Facades\DB;

$value = DB::select('PRAGMA temp_store');
dump($value);
~~~

<p>This will show you the current value of the configuration.</p>

<p>Also, always make sure that you consult with the <a href="https://www.sqlite.org/pragma.html">SQLite documentation</a> before you blindly start changing configuration.</p>
