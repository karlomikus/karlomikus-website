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
---
Let's begin by creating two Imagick objects and load some PDFs.

```php
<?php

declare(strict_types=1);

$controlDocument = new Imagick();
$compareDocument = new Imagick();

$controlDocument->readImage('control.pdf');
$compareDocument->readImage('compare.pdf');
```

If you try to run this code and get an exception about security policy: <code>PHP Fatal error:  Uncaught ImagickException: attempt to perform an operation not allowed by the security policy `PDF'</code>, you need to modify your ImageMagick policy to allow reading PDF files.

You can do that by opening <code>/etc/ImageMagick-6/policy.xml</code> and <a href="https://stackoverflow.com/a/59193253/389743">delete or comment out this line</a>.

```xml
<policy domain="coder" rights="none" pattern="PDF" />
```

Now if you run your script it should work without any errors.

Next let's go and actually compare our documents. We are going to use the <a href="https://www.php.net/manual/en/imagick.compareimages.php">included method</a> called <code>compareImages</code>. Add the following lines to our script.

```php
$result = $controlDocument->compareImages($compareDocument, Imagick::METRIC_ABSOLUTEERRORMETRIC);

$result[0]->setImageFormat("png");
file_put_contents('diff.png', $result[0]);
```

This method returns an array containing our reconstructed image <code>$result[0]</code> and number of pixels that are different <code>$result[1]</code> (in our case since we are using AE as our metric).

We can calculate the difference in percentages using some simple math.

```php
$diffPercentage = $result[1] * 100 / ($controlDocument->getImageWidth() * $controlDocument->getImageHeight());

echo number_format($diffPercentage, 4) . "%";
```

Here's how it looks on my example documents.

![PDF Compare](/assets/blog/pdf-compare-sources.png)

And here's the result image and difference.

```text
Document is 1.7903% different.
```

![PDF Diff](/assets/blog/result-compare.png)

Now you can easily adapt this code into your test suit.

## Additional information

- Find the [example code here](https://gist.github.com/karlomikus/e5dbbff7649d8a118471923584b084cd)
- You can control the [fuzziness](https://imagemagick.org/script/command-line-options.php#fuzz) of the pixel difference using the following code.

```php
// Add this before loading the image
// Pixels may be different by up to 5% before being considered different
$controlDocument->setOption('fuzz', '5%');
```

- You can control the image resolution.

```php
// Add this before loading the image
$controlDocument->setResolution(100, 100);
$compareDocument->setResolution(100, 100);
```
