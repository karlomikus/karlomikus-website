---
layout: layouts/post.njk
title: Compare PDF files using PHP and ImageMagick
date: '2022-03-20'
permalink: /blog/compare-pdf-files-using-php-and-imagemagick/
published: true
hero_image: /assets/blog/blog_hero_images/pdf-compare.jpg
og_title: Compare PDF files using PHP and ImageMagick
og_description: Comparing two PDF files for use in PHP testing.
og_type: article
og_image: /assets/blog/blog_hero_images/pdf-compare.jpg
author: e9e0cc08-2054-4b6c-a5ec-699b1591125a
---
<p>Let&#39;s begin by creating two Imagick objects and load some PDFs.</p>

~~~php
<?php

declare(strict_types=1);

$controlDocument = new Imagick();
$compareDocument = new Imagick();

$controlDocument->readImage('control.pdf');
$compareDocument->readImage('compare.pdf');
~~~

<p>If you try to run this code and get an exception about security policy: <code>PHP Fatal error:  Uncaught ImagickException: attempt to perform an operation not allowed by the security policy `PDF&#39;</code>, you need to modify your ImageMagick policy to allow reading PDF files.</p>

<p>You can do that by opening <code>/etc/ImageMagick-6/policy.xml</code> and <a href="https://stackoverflow.com/a/59193253/389743">delete or comment out this line</a>.</p>

~~~xml
<policy domain="coder" rights="none" pattern="PDF" />
~~~

<p>Now if you run your script it should work without any errors.</p>

<p>Next let&#39;s go and actually compare our documents. We are going to use the <a href="https://www.php.net/manual/en/imagick.compareimages.php">included method</a> called <code>compareImages</code>. Add the following lines to our script.</p>

~~~php
$result = $controlDocument->compareImages($compareDocument, Imagick::METRIC_ABSOLUTEERRORMETRIC);

$result[0]->setImageFormat("png");
file_put_contents('diff.png', $result[0]);
~~~

<p>This method returns an array containing our reconstructed image <code>$result[0]</code> and number of pixels that are different <code>$result[1]</code> (in our case since we are using AE as our metric).</p>

<p>We can calculate the difference in percentages using some simple math.</p>

~~~php
$diffPercentage = $result[1] * 100 / ($controlDocument->getImageWidth() * $controlDocument->getImageHeight());

echo number_format($diffPercentage, 4) . "%";
~~~

<p>Here&#39;s how it looks on my example documents.</p>

<p><img src="/assets/blog/pdf-compare-sources.png" alt="" />And here&#39;s the result image and difference.</p>

~~~clike
Document is 1.7903% different.
~~~

<p><img src="/assets/blog/result-compare.png" alt="" />Now you can easily adapt this code into your test suit.</p>

<h2>Additional information</h2>

<ul><li>Find the <a href="https://gist.github.com/karlomikus/e5dbbff7649d8a118471923584b084cd">example code here</a>.</li><li>You can control the <a href="https://imagemagick.org/script/command-line-options.php#fuzz">fuzziness</a> of the pixel difference using the following code.</li></ul>

~~~php
// Add this before loading the image
// Pixels may be different by up to 5% before being considered different
$controlDocument->setOption('fuzz', '5%');
~~~

<ul><li>You can control the image resolution.</li></ul>

~~~php
// Add this before loading the image
$controlDocument->setResolution(100, 100);
$compareDocument->setResolution(100, 100);
~~~
