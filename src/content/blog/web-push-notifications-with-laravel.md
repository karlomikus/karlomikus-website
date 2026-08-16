---
layout: layouts/post.njk
title: Web push notifications with Laravel
date: '2022-03-08'
permalink: /blog/web-push-notifications-with-laravel/
published: true
hero_image: blog/blog_hero_images/push-notifications.jpg
og_title: Web push notifications with Laravel
og_description: >-
  Implement service worker and web push notifications using Laravel and
  Javascript
og_type: article
og_image: blog/blog_hero_images/push-notifications.jpg
author: e9e0cc08-2054-4b6c-a5ec-699b1591125a
---
<p>I&#39;m going to start with the fresh Laravel installation. You should also check prerequisites of packages we are going to use.</p>

<ul><li><a href="https://github.com/web-push-libs/web-push-php">PHP Web Push</a></li><li><a href="https://laravel-notification-channels.com/webpush/">Web Push Notification Channel</a></li></ul>

<p>Code for this project is <a href="https://github.com/karlomikus/webpush-demo">available here</a>.</p>

<h2>Database and package setup</h2>

<p>You need some kind of database to store user push subscription information. In this case I&#39;m using SQLite3 since it&#39;s the simples to setup.</p>

<p>You can skip this step if you already have database ready to use.</p>

<p>First I&#39;ll pull the required packages.</p>

~~~shell
sudo apt update
sudo apt-get install sqlite3 php8.1-sqlite3 php8.1-gmp
sudo service php8.1-fpm restart
~~~

<p>Then I will create a new file in <code>database/</code> folder.</p>

~~~shell
touch database/database.sqlite
~~~

<p>The last thing is to update my <code>.env</code> file.</p>

~~~clike
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/push-project/database/database.sqlite
DB_FOREIGN_KEYS=true
~~~

<p>Laravel support multiple notification drivers. You can find them <a href="https://laravel-notification-channels.com/">all here</a>. We are going to use <a href="https://laravel-notification-channels.com/webpush/">web push</a> driver, let&#39;s pull it into our project.</p>

~~~shell
composer require laravel-notification-channels/webpush
~~~

<p>Now we need to run a command that will generate migrations and add <a href="https://blog.mozilla.org/services/2016/04/04/using-vapid-with-webpush/">VAPID keys</a> to our .env file. VAPID keys are used by push server to identify your server.</p>

~~~shell
php artisan vendor:publish --provider="NotificationChannels\WebPush\WebPushServiceProvider" --tag="migrations"
php artisan webpush:vapid
~~~

<p>Next let&#39;s run migrations and then seed the database with some test users.</p>

~~~php
php artisan migrate
php artisan db:seed
~~~

<h2>Backend code and manager endpoints</h2>

<p>In this part we&#39;re going to add our controller with some default methods we need and update our model with code for handling user push subscriptions.</p>

<p>You can use any model you want, in this case we are going to use already existing <code>User</code> model.</p>

~~~php
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable, HasPushSubscriptions;
	
	...
}
~~~

<p>Next we need a controller that will handle our subscriptions.</p>

~~~shell
php artisan make:controller NotificationManagerController
~~~

<p>Open the newly created file <code>app/Http/Controllers/NotificationManagerController.php</code>.</p>

<p>We need two methods to handle our user push subscriptions, one for subscribing and one for unsubscribing. Luckily the trait we added to our user model has methods to handle this actions.</p>

~~~php
class NotificationManagerController extends Controller
{
    public function subscribe(Request $req)
    {
        $user = User::find(1);

        $subscription = $user->updatePushSubscription(
            $req->post('endpoint'),
            $req->post('public_key'),
            $req->post('auth_token'),
            $req->post('encoding'),
        );

        return response()->json(['message' => 'Subscribed!']);
    }

    public function unsubscribe(Request $req)
    {
        $user = User::find(1);

        $user->deletePushSubscription($req->post('endpoint'));

        return response()->json(['message' => 'Unsubscribed!']);
    }
}
~~~

<p>Don&#39;t forget to register your routes</p>

~~~php
Route::post('/notifications/subscribe', [NotificationManagerController::class, 'subscribe']);
Route::post('/notifications/unsubscribe', [NotificationManagerController::class, 'unsubscribe']);
~~~

<h2>Frontend implementation</h2>

<p>First we need to create and register our <a href="https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers">service worker</a>.</p>

<blockquote></blockquote>

<p>So in short:</p>

<ul><li>We need to create javascript file and register it as a service worker</li><li>Ask user for notification permission</li><li>Get the subscription from the browser and save it in our database</li></ul>

<p>Let&#39;s create a file in our public directory called <code>sw.js</code> which will be our service worker.</p>

~~~javascript
"use strict";

self.addEventListener("install", function(event) {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const payload = event.data ? event.data.json() : {};
    event.waitUntil(self.registration.showNotification(payload.title, payload));
});
~~~

<p>Now we need to register it, we can do that in our main javascript file. Let&#39;s name this file <code>main.js</code> and put it in our <code>public/js</code> path.</p>

~~~javascript
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/sw.js");
    });
}
~~~

<p>Since we&#39;re already in our <code>main.js</code> file, we are going to add this helper method which will convert our <a href="https://w3c.github.io/push-api/#dom-pushsubscriptionoptions-applicationserverkey">VAPID key to ArrayBuffer</a>.</p>

~~~javascript
function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
    	outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
~~~

<p>Now let&#39;s create subscribe method that will POST subscription data to our backend and save it. In this example I&#39;m using Fetch API to make HTTP requests, you can use also use the included axios library.</p>

~~~javascript
function subscribe(sub) {
    const key = sub.getKey('p256dh')
    const token = sub.getKey('auth')
    const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0]

    const data = {
        endpoint: sub.endpoint,
        public_key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
        auth_token: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
        encoding: contentEncoding,
    };

    fetch('/notifications/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrftoken
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
~~~

<p>Next let&#39;s create a function that will initiate notification request from browser and call our subscribe method. Here you will need to enter VAPID public key which you can find <a href="https://laravel.com/docs/9.x/mix#environment-variables">in your environment</a>.</p>

~~~javascript
const VAPID_PUBLIC_KEY = 'your-key';

function enablePushNotifications() {
    navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
            if (subscription) {
                return subscription;
            }

            const serverKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: serverKey
            });
        }).then(subscription => {
            if (!subscription) {
                alert('Error occured while subscribing');
                return;
            }
            subscribe(subscription);
        });
    });
}
~~~

<p>Unsubscribe method is really simple, we just find the endpoint of existing subscription and send it to our backend endpoint.</p>

~~~javascript
function disablePushNotifications() {
    navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
            if (!subscription) {
                return;
            }

            subscription.unsubscribe().then(() => {
                fetch('/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrftoken
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            })
        });
    });
}
~~~

<p>Our view code is really simple. First we need to add our <a href="https://laravel.com/docs/9.x/csrf#csrf-x-csrf-token">csrf-token meta tag</a> so we can send it with our HTTP requests. Next we reference our javascript file and create buttons that will handle our events.</p>

~~~html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Web Push Demo</title>
  </head>
  <body>
	<button id="enable-push">Enable push notifications</button>
    <button id="disable-push">Disable push notifications</button>
    <script src="/js/main.js"></script>
  </body>
</html>

~~~

<p>Please not that Notification API is not supported in all browsers.</p>

<p>Biggest problem, at the time of the writing, is that there is no way to get web push notifications on iOS devices. <a href="https://webkit.org/blog/12288/working-together-on-interop-2022/">Although that is hopefully going to change in the future</a>.</p>

<p><em><strong>Update (2023-05-15):</strong></em></p>

<p><a href="https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes">Supported on iOS Safari since version 16.4.</a></p>

<h2>Creating and sending our first notification</h2>

<p>We can create new notification by using artisan console.</p>

~~~shell
php artisan make:notification NewUserActivity
~~~

<p>This will create a new class in <code>app/Notifications</code>. Update it with the following.</p>

~~~php
<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewUserActivity extends Notification
{
    use Queueable;

    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable)
    {
        return (new WebPushMessage())
            ->title('Welcome to the application')
            ->body('This is notification body content. You are successfully subscribed!');
    }
}
~~~

<p>Next we are going to add new method to our <code>NotificationManagerController</code> class that will send our notification.</p>

~~~php
use App\Notifications\NewUserActivity;

public function send()
{
    $user = User::find(1);
    $user->notify(new NewUserActivity());

    return redirect('/');
}

// Also don't forget to register new route
Route::get('/notifications/send', [NotificationManagerController::class, 'send']);
~~~

<p>Now when we visit <code>/notifications/send</code> you should see your new notification.</p>

<p>Here&#39;s how it looks in firefox.</p>

<p><img src="/assets/blog/notifcation-sent.png" alt="" />If you need some help, you can check out the <a href="https://github.com/karlomikus/webpush-demo">code for this project</a>.</p>
