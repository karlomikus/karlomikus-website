---
layout: layouts/post.njk
title: Create LaTeX math node and mark for tiptap 2
date: '2022-04-05'
permalink: /blog/create-latex-math-node-and-mark-for-tiptap-2/
published: true
hero_image: blog/blog_hero_images/latex-node.jpg
og_title: Create LaTeX math node and mark for tiptap 2
og_description: In this guide we will create a math input component for tiptap.
og_type: article
og_image: blog/blog_hero_images/latex-node.jpg
author: e9e0cc08-2054-4b6c-a5ec-699b1591125a
---
<p><strong>Update 2023:</strong></p>

<p>TipTap now has <a href="https://tiptap.dev/docs/editor/api/extensions/mathematics">offical extension for LaTeX</a>.</p>

<p>------</p>

<p>In this guide we will create a math input component for <a href="https://tiptap.dev/">tiptap</a>.</p>

<blockquote></blockquote>

<p>Here&#39;s a picture of the finished editor project, a node view made as a Vue component, containing textarea for TeX input and a div with rendered preview.</p>

<p><img src="/assets/blog/editor2.png" alt="" />Project setup</p>

<p>I&#39;ll start with a default Vue 2 project created with <a href="https://cli.vuejs.org/guide/installation.html">Vue CLI</a>.</p>

<p>Next I&#39;ll add tiptap Vue component with the starter kit.</p>

~~~shell
yarn add @tiptap/vue-2 @tiptap/starter-kit
~~~

<p>We&#39;re going to use <a href="https://katex.org/">KaTeX </a>to render out LaTeX typesetting.</p>

<blockquote></blockquote>

~~~shell
yarn add katex
~~~

<p>Now when we run <code>yarn serve</code>, we have our app up and running.</p>

<h2>Writing the component</h2>

<p>Let&#39;s create our node view with Vue following the <a href="https://tiptap.dev/guide/node-views/vue">tiptap guide</a>.</p>

<p>First we create the component, let&#39;s call it <code>FormulaComponent.vue</code>. In template section we are going to use the following code.</p>

~~~html
<template>
  <node-view-wrapper>
      <div class="katex-component" :class="{'is-selected': selected}">
          <div class="katex-component__title">
            <h3>Math Input</h3>
            <a href="#" @click.prevent="deleteNode">Remove</a>
          </div>
          <textarea rows="3" v-model="rawFormula"></textarea>
          <div class="katex-component__formula" v-html="renderedFormula"></div>
      </div>
  </node-view-wrapper>
</template>
~~~

<p>This contains our <code>textarea</code> in which we are going to input our LaTeX math formula, a link to remove the node and a div with the rendered formula.</p>

<p>Next our script section looks like this.</p>

~~~javascript
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2'
import katex from 'katex';

export default {
  components: {
    NodeViewWrapper,
  },
  props: nodeViewProps,
  data() {
    return {
      rawFormula: this.node.attrs.content,
      options: {
        throwOnError: false,
        strict: false,
        displayMode: true,
        maxSize: 300
      }
    }
  },
  watch: {
    rawFormula(newVal, val) {
      if (newVal == val) {
        return;
      }

      this.updateAttributes({
        content: newVal,
      })
    }
  },
  computed: {
    renderedFormula() {
      if (!this.rawFormula) {
        return '';
      }

      return katex.renderToString(this.rawFormula, this.options);
    }
  }
}
~~~

<p>Our <code>data</code> contains raw formula string that we initially pull from the <code>content</code> attribute of our custom tag.</p>

<p>Then we have <code>options</code> that will contain our options object for <a href="https://katex.org/docs/options.html">katex configuration</a>.</p>

<p>We will assign a watcher to our <code>rawFormula</code> variable that will update the <code>content</code> attribute of our node.</p>

<p>And at last we have an computed property called <code>renderedFormula</code> that will actually call katex to render the given LaTeX text.</p>

<p>Next we need to create a <a href="https://prosemirror.net/docs/ref/#model.NodeSpec">prosemirror schema</a>.</p>

~~~javascript
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import Component from './FormulaComponent.vue'

export default Node.create({
  name: 'formulaComponent',

  group: 'block',

  addAttributes() {
    return {
      content: {
        default: '',
        renderHTML: attributes => {
          return {
            content: attributes.content
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'katex',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['katex', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  }
})

~~~

<p>As referenced previously we are going to need an attribute that will hold our LaTeX text called <code>content</code>.</p>

<p>Our parse and render methods are going to use custom tag called <code>&lt;katex&gt;</code>.</p>

<p>So final node HTML is going to look like this.</p>

~~~html
<katex content="\langle\nabla{L(\gamma(t),t)},d_{t}\gamma(t)\rangle\geq|\nabla{L}|_{m}|d_{t}\gamma(t)|_{m}"></katex>
~~~

<p>Next we need a way to add our node from the editor. To do this we need to create a command that will insert the node at the current cursor position.</p>

<p>Add the following to our schema.</p>

~~~javascript
addCommands() {
  return {
    addKatex: (attrs) => ({state, dispatch}) => {
      const { selection } = state
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
      const node = this.type.create(attrs)
      const transaction = state.tr.insert(position, node);

      dispatch(transaction);
    }
  }
}
~~~

<h2>Using marks for inline math</h2>

<p>For inline math formula rendering we&#39;re just gonna create a simple mark extension. It&#39;s just gonna create a <code>&lt;span&gt;</code> tag with <code>data-inline-katex</code> attribute so we can reference it later.</p>

~~~javascript
import { Mark, mergeAttributes } from '@tiptap/core'

export default Mark.create({
    name: 'formulaMark',

    excludes: '_',

    spanning: false,

    parseHTML() {
        return [
            { tag: 'span[data-inline-katex="true"]' },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, {'data-inline-katex': 'true'}), 0]
    },

    addCommands() {
        return {
            setFormulaMark: attributes => ({ commands }) => {
                return commands.setMark(this.name, attributes)
            },
            toggleFormulaMark: attributes => ({ commands }) => {
                return commands.toggleMark(this.name, attributes)
            },
            unsetFormulaMark: () => ({ commands }) => {
                return commands.unsetMark(this.name)
            },
        }
    },
})

~~~

<h2>Calling commands from editor</h2>

<p>For the actual editor we&#39;re going to follow the <a href="https://tiptap.dev/installation/vue2">steps from the tiptap docs</a>.</p>

<p>The template is going to have our buttons that will run the commands we created.</p>

~~~html
<button type="button" class="btn-editor" @click="editor.chain().focus().toggleFormulaMark().run()">
	Inline math
</button>
<button type="button" class="btn-editor" @click="editor.chain().focus().addKatex().run()">
	Math block
</button>
~~~

<h2>Displaying the resulting HTML</h2>

<p>To display our block level math we&#39;re going to select all katex elements and tell katex to render it.</p>

~~~javascript
document.querySelectorAll('katex').forEach(el =&gt; {
  katex.render(el.getAttribute('content'), el, {
    throwOnError: false,
    strict: false,
    displayMode: true,
    maxSize: 300
  });
})
~~~

<p>And to render our inline mark, we&#39;re just going to use katex render method with <code>displayMode: false</code> option.</p>

~~~javascript
document.querySelectorAll('span[data-inline-katex]').forEach(el =&gt; {
  katex.render(el.innerText, el, {
    throwOnError: false,
    displayMode: false
  });
});
~~~

<h2>Summary</h2>

<p>Check out the <a href="https://github.com/karlomikus/tiptap-latex-post">full source code here</a>, and <a href="https://karlomikus.com/posts/editor/">online demo here</a>.</p>

<p>You should check similar packages in this space.</p>

<ul><li><a href="https://github.com/mathquill/mathquill">MathQuill</a> - Type math directly in your browser.</li><li><a href="https://www.mathjax.org/">MathJax</a> - Math typesetting similar to Katex.</li><li><a href="https://github.com/benrbray/prosemirror-math">Prosemirror Math</a> - Really detailed math schema for Prosemirror.</li></ul>
