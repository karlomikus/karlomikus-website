import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css/main.css");
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addFilter("humanDate", (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.valueOf())) return value;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addCollection("publishedPosts", (collectionApi) => {
    const now = new Date();

    return collectionApi
      .getFilteredByGlob("src/content/blog/*.md")
      .filter((item) => item.data.published !== false)
      .filter((item) => {
        const date = item.date || new Date(item.data.date);
        return date <= now;
      })
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: true,
      linkify: true,
      typographer: false,
    })
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
