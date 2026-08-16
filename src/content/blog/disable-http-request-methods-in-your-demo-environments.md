---
layout: layouts/post.njk
title: Disable HTTP request methods in your demo environments
date: '2022-12-21'
permalink: /blog/disable-http-request-methods-in-your-demo-environments/
published: true
hero_image: blog/blog_hero_images/demo-env-post.jpg
og_title: Disable HTTP request methods in your demo environments
og_description: >-
  Here's a quick tip for your public demo environments. Let's say that you want
  to disable unsafe HTTP request methods, like POST and DELETE, to prevent users
  from messing up your demo instance data.
og_type: article
og_image: blog/blog_hero_images/demo-env-post.jpg
author: e9e0cc08-2054-4b6c-a5ec-699b1591125a
---
<p>Here&#39;s a quick tip for your public demo environments. Let&#39;s say that you want to disable &quot;unsafe&quot; HTTP request methods, like POST and DELETE, to prevent users from messing up your demo instance data.</p>

<p>You can use middleware class that will check for method type and generate appropriate response. Here&#39;s how to do that in Laravel.</p>

~~~php
<?php

declare(strict_types=1);

namespace Kami\Cocktail\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class FilterMethodMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $allowedRoutes = [
            'auth.login',
            'auth.logout'
        ];

        if (App::environment('demo') && !$request->isMethodSafe() && !$request->routeIs($allowedRoutes)) {
            return response()->json([
                'message' => 'This action is currently disabled!'
            ], 405);
        }

        return $next($request);
    }
}

~~~

<p>As you can see, condition check is pretty simple. We first check in what environment we are. Then we use a helpful method from Symfony request class called <code>isMethodSafe()</code>, which checks if the request is any of the following methods:</p>

<ul><li>GET</li><li>HEAD</li><li>OPTIONS</li><li>TRACE</li></ul>

<p>And the last thing is a route check since we can have some routes that we want to allow unsafe method, in this case login and logout routes.</p>

<p>Inside the condition we just return a json response with a custom message and status code.</p>
