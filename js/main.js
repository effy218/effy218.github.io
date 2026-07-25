/* ============================================================
   渲染 + 滚动动画
   ============================================================ */
(function () {
  "use strict";

  var DEFAULTS = window.SITE_CONTENT || {};

  /* -------- 数据读取工具 -------- */
  function getByPath(obj, path) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function val(path) {
    return getByPath(DEFAULTS, path);
  }

  /* -------- DOM 工具 -------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // 文本节点
  function ed(tag, cls, path) {
    var n = el(tag, cls);
    n.textContent = val(path);
    return n;
  }

  /* -------- 渲染：导航 -------- */
  function renderNav() {
    var nav = document.getElementById("nav");
    var brand = el("a", "nav__brand", val("meta.brand"));
    brand.href = "#top";
    var links = el("nav", "nav__links");
    (DEFAULTS.nav || []).forEach(function (item, i) {
      var a = el("a", "nav__link", val("nav." + i + ".label"));
      a.href = "#" + item.target;
      links.appendChild(a);
    });
    nav.appendChild(brand);
    nav.appendChild(links);
  }

  /* -------- 渲染：首屏 -------- */
  function renderHero(app) {
    var s = el("section", "hero");
    s.id = "top";
    s.appendChild(ed("p", "hero__kicker", "hero.kicker"));
    var name = ed("h1", "hero__name", "hero.name");
    name.id = "heroName";
    s.appendChild(name);
    s.appendChild(ed("p", "hero__title reveal", "hero.title"));
    s.appendChild(ed("p", "hero__tagline reveal", "hero.tagline"));
    s.appendChild(ed("div", "hero__scroll", "hero.scrollHint"));
    app.appendChild(s);
  }

  /* -------- 渲染：关于我 -------- */
  function renderAbout(app) {
    var s = el("section", "section about");
    s.id = "about";
    var wrap = el("div", "wrap");
    wrap.appendChild(ed("p", "kicker reveal", "about.kicker"));
    var grid = el("div", "about__grid");
    grid.appendChild(ed("h2", "about__heading reveal", "about.heading"));
    var body = el("div", "about__body reveal");
    (val("about.paragraphs") || []).forEach(function (_, i) {
      body.appendChild(ed("p", null, "about.paragraphs." + i));
    });
    var tags = el("div", "about__tags");
    (val("about.tags") || []).forEach(function (_, i) {
      tags.appendChild(ed("span", "tag", "about.tags." + i));
    });
    body.appendChild(tags);
    grid.appendChild(body);
    wrap.appendChild(grid);
    s.appendChild(wrap);
    app.appendChild(s);
  }

  /* -------- 渲染：项目 -------- */
  function renderProject(app, pIndex) {
    var p = DEFAULTS.projects[pIndex];
    var base = "projects." + pIndex;
    var s = el("section", "section project");
    s.id = p.id;
    var wrap = el("div", "wrap");

    // 头部
    var head = el("div", "project__head reveal");
    head.appendChild(ed("div", "project__index", base + ".index"));
    var titles = el("div", "project__titles");
    titles.appendChild(ed("h2", "project__title", base + ".title"));
    titles.appendChild(ed("div", "project__title-en", base + ".titleEn"));
    titles.appendChild(ed("p", "project__subtitle", base + ".subtitle"));
    titles.appendChild(ed("p", "project__meta", base + ".meta"));
    if (p.link && p.link.href) {
      var link = el("a", "project__link", p.link.label || "在线体验 →");
      link.href = p.link.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      titles.appendChild(link);
    }
    head.appendChild(titles);
    wrap.appendChild(head);

    // 封面（支持单图或两图并排）
    if (p.cover) {
      if (p.cover.items) {
        var cg = el("div", "blk-gallery cover-gallery");
        p.cover.items.forEach(function (it, ci) {
          cg.appendChild(buildShot(base + ".cover.items." + ci, it, "reveal"));
        });
        wrap.appendChild(cg);
      } else {
        wrap.appendChild(buildShot(base + ".cover", p.cover, "blk-image reveal"));
      }
    }

    // 正文
    var body = el("div", "project__body");
    (p.blocks || []).forEach(function (blk, i) {
      body.appendChild(renderBlock(blk, base + ".blocks." + i));
    });
    wrap.appendChild(body);

    s.appendChild(wrap);
    app.appendChild(s);
  }

  function buildShot(path, obj, wrapCls) {
    var box = el("div", wrapCls);
    var fig = el("figure", "shot reveal");
    var img = el("img");
    img.src = getByPath(DEFAULTS, path + ".src");
    img.alt = obj.caption || "";
    img.loading = "lazy";
    fig.appendChild(img);
    if (obj.caption != null) fig.appendChild(ed("figcaption", "shot__caption", path + ".caption"));
    box.appendChild(fig);
    return box;
  }

  function renderBlock(blk, path) {
    switch (blk.type) {
      case "h3":
        return ed("h3", "blk-h3 reveal", path + ".text");
      case "lead":
        return ed("p", "blk-lead reveal", path + ".text");
      case "p":
        return ed("p", "blk-p reveal", path + ".text");
      case "label": {
        var w = el("div", "blk-label reveal");
        w.appendChild(ed("div", "blk-label__label", path + ".label"));
        w.appendChild(ed("div", "blk-label__text", path + ".text"));
        return w;
      }
      case "metric": {
        var m = el("div", "blk-metric reveal");
        m.appendChild(ed("div", "blk-metric__name", path + ".name"));
        m.appendChild(ed("div", "blk-metric__text", path + ".text"));
        return m;
      }
      case "list": {
        var ul = el("ul", "blk-list reveal");
        (blk.items || []).forEach(function (_, j) {
          ul.appendChild(ed("li", null, path + ".items." + j));
        });
        return ul;
      }
      case "image":
        return buildShot(path, blk, "blk-image reveal");
      case "split": {
        var sp = el("div", "blk-split reveal");
        if (blk.media === "left") sp.classList.add("blk-split--media-left");
        var media = el("div", "blk-split__media");
        var fig = el("figure", "shot-long");
        var img = el("img");
        img.src = getByPath(DEFAULTS, path + ".src");
        img.alt = blk.caption || "";
        img.loading = "lazy";
        fig.appendChild(img);
        if (blk.caption != null) fig.appendChild(ed("figcaption", "shot__caption", path + ".caption"));
        media.appendChild(fig);
        var textCol = el("div", "blk-split__text");
        (blk.blocks || []).forEach(function (sb, j) {
          textCol.appendChild(renderBlock(sb, path + ".blocks." + j));
        });
        sp.appendChild(textCol);
        sp.appendChild(media);
        return sp;
      }
      case "gallery": {
        var g = el("div", "blk-gallery");
        (blk.items || []).forEach(function (it, j) {
          g.appendChild(buildShot(path + ".items." + j, it, "reveal"));
        });
        return g;
      }
      default:
        return el("div");
    }
  }

  /* -------- 渲染：技能 -------- */
  function renderSkills(app) {
    var s = el("section", "section skills");
    s.id = "skills";
    var wrap = el("div", "wrap");
    wrap.appendChild(ed("p", "kicker reveal", "skills.kicker"));
    wrap.appendChild(ed("h2", "skills__heading reveal", "skills.heading"));
    var groups = el("div", "skills__groups");
    (val("skills.groups") || []).forEach(function (grp, i) {
      var g = el("div", "skgroup reveal");
      g.appendChild(ed("div", "skgroup__name", "skills.groups." + i + ".name"));
      var list = el("div", "skgroup__list");
      (grp.items || []).forEach(function (_, j) {
        list.appendChild(ed("div", "skgroup__item", "skills.groups." + i + ".items." + j));
      });
      g.appendChild(list);
      groups.appendChild(g);
    });
    wrap.appendChild(groups);
    s.appendChild(wrap);
    app.appendChild(s);
  }

  /* -------- 渲染：联系 -------- */
  function renderContact(app) {
    var s = el("section", "section contact");
    s.id = "contact";
    var wrap = el("div", "wrap");
    wrap.appendChild(ed("p", "kicker reveal", "contact.kicker"));
    wrap.appendChild(ed("h2", "contact__heading reveal", "contact.heading"));
    wrap.appendChild(ed("p", "contact__lead reveal", "contact.lead"));
    var list = el("div", "contact__list reveal");
    (val("contact.items") || []).forEach(function (_, i) {
      var item = el("div", "contact__item");
      item.appendChild(ed("div", "contact__label", "contact.items." + i + ".label"));
      item.appendChild(ed("div", "contact__value", "contact.items." + i + ".value"));
      list.appendChild(item);
    });
    wrap.appendChild(list);
    wrap.appendChild(ed("div", "contact__footer reveal", "contact.footer"));
    s.appendChild(wrap);
    app.appendChild(s);
  }

  /* -------- 交互：滚动动画 & 导航状态 -------- */
  function setupObserver() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }

  function setupNavScroll() {
    var nav = document.getElementById("nav");
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setupParallax() {
    var name = document.getElementById("heroName");
    if (!name) return;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) name.style.transform = "translateY(" + (y * 0.18) + "px)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* -------- 启动 -------- */
  function init() {
    document.title = val("meta.siteTitle");
    var app = document.getElementById("app");
    renderNav();
    renderHero(app);
    renderAbout(app);
    renderProject(app, 0);
    renderProject(app, 1);
    renderSkills(app);
    renderContact(app);
    setupObserver();
    setupNavScroll();
    setupParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
