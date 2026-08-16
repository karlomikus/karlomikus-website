---
layout: layouts/post.njk
title: SQLite optimizations in Laravel
date: '2024-12-08'
permalink: /blog/sqlite-laravel-defaults/
published: true
hero_image: /assets/blog/blog_hero_images/blog-hero-images.webp
og_image: /assets/blog/blog_hero_images/blog-hero-images.webp
---
SQLite has been getting more and more attention as a production ready database. It is the default database when you start a new project in Laravel, and recently I&#39;ve been using it in production for my [small side project](https://barassistant.app/).

This new popularity spawned a lot of discussion about available optimizations and better default configurations. I&#39;m not going to go through them, but here is a few good posts from the web:

- [Optimizing SQLite for servers](https://kerkour.com/sqlite-for-servers)
- [Best practices for SQLite performance](https://developer.android.com/topic/performance/sqlite-performance-best-practices)
- [Sensible SQLite defaults](https://briandouglas.ie/sqlite-defaults)

Here I will show you how to use and enable them in your Laravel applications.

Laravel already supports some of the common configurations via default database connections config array. Here is the config example with recommendations from above listed posts.

```php
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
```

One caveat that you need to be aware of is that some of these configurations are permanent (like WAL mode) and some need to be setup before every connection to the database.

Laravel will automatically handle the configurations defined in the config file, but what if you want to add your own. For that you can use <code>AppServiceProvider.php</code> file and the <code>boot()</code> method.

```php
public function boot()
{
    DB::statement('
        PRAGMA temp_store = memory;
        PRAGMA cache_size = -20000;
        PRAGMA mmap_size = 2147483648;
        PRAGMA page_size = 8192;
    ');
}
```

This will always set the PRAGMA configurations for the current connection. To check if the configurations are applied you can use the following snippet.

```php
<?php

use Illuminate\Support\Facades\DB;

$value = DB::select('PRAGMA temp_store');
dump($value);
```

This will show you the current value of the configuration.

Also, always make sure that you consult with the [SQLite documentation](https://www.sqlite.org/pragma.html) before you blindly start changing configuration.
