import markdownIt from "markdown-it";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

const highlighter = await createHighlighterCore({
  themes: [import("@shikijs/themes/dark-plus")],
  langs: [
    import("@shikijs/langs/php"),
    import("@shikijs/langs/javascript"),
    import("@shikijs/langs/shellscript"),
    import("@shikijs/langs/html"),
    import("@shikijs/langs/xml"),
    import("@shikijs/langs/sql"),
    import("@shikijs/langs/yaml"),
    import("@shikijs/langs/apache"),
    import("@shikijs/langs/ini"),
  ],
  engine: createOnigurumaEngine(() => import("shiki/wasm")),
});

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
    }).use(fromHighlighter(highlighter, { theme: "dark-plus" }))
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
