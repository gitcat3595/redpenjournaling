// ─── Blog configuration ────────────────────────────────────────────────────
// Path to your blog CSV file inside the site folder.
// To update: open your Excel file, File → Save As → CSV → overwrite this file.
// Content source: site/content/blog-posts.csv
// Edit `order` to change the display sequence. See content/README.md for the
// field guide; `cover_image` is rendered as a narrow editorial image band.
const BLOG_CSV_PATH = "/content/blog-posts.csv";

// ─── Utilities ─────────────────────────────────────────────────────────────

const byPath = (object, path) =>
  path.split(".").reduce((value, key) => (value ? value[key] : undefined), object);

const getLanguage = () => (window.location.pathname.startsWith("/ja") ? "ja" : "en");

const getContentName = () => {
  const path = window.location.pathname;
  if (path.includes("/privacy")) return "privacy";
  if (path.includes("/terms")) return "terms";
  if (path.includes("/blog/post")) return "blog-post";
  if (path.includes("/blog")) return "blog";
  if (path.includes("/method")) return "method";
  return "home";
};

// ─── CSV parser ─────────────────────────────────────────────────────────────

const parseCSV = (text) => {
  const records = [];
  let record = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      record.push(current);
      current = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      record.push(current);
      if (record.some(Boolean)) records.push(record);
      record = [];
      current = "";
    } else {
      current += ch;
    }
  }
  if (current || record.length) {
    record.push(current);
    records.push(record);
  }
  const headers = records[0].map((header) => header.trim());
  return records.slice(1).map((values) => {
    return headers.reduce((obj, h, i) => {
      obj[h.trim()] = (values[i] || "").trim();
      return obj;
    }, {});
  }).filter((row) => Object.values(row).some(Boolean));
};

const parseLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
};

// ─── Core renderers (used on all pages) ─────────────────────────────────────

const setText = (data) => {
  document.querySelectorAll("[data-text]").forEach((node) => {
    const value = byPath(data, node.dataset.text);
    if (typeof value === "string") {
      node.textContent = value;
      node.hidden = value.trim() === "";
    }
  });
  document.querySelectorAll("[data-placeholder]").forEach((node) => {
    const value = byPath(data, node.dataset.placeholder);
    if (typeof value === "string") node.placeholder = value;
  });
};

const renderLanguageSwitch = (language) => {
  const node = document.querySelector("[data-language-switch]");
  if (!node) return;
  node.innerHTML = "";
  const contentName = getContentName();

  const pathMap = {
    home: { en: "/", ja: "/ja/" },
    method: { en: "/method/", ja: "/ja/method/" },
    privacy: { en: "/privacy/", ja: "/ja/privacy/" },
    terms: { en: "/terms/", ja: "/ja/terms/" },
    blog: { en: "/blog/", ja: "/ja/blog/" },
    "blog-post": {
      en: `/blog/post/${window.location.search}`,
      ja: `/ja/blog/post/${window.location.search}`,
    },
  };

  const paths = pathMap[contentName] || pathMap.home;
  const links = [
    { label: "EN", href: paths.en, active: language === "en" },
    { label: "JP", href: paths.ja, active: language === "ja" },
  ];

  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.textContent = link.label;
    if (link.active) anchor.setAttribute("aria-current", "page");
    node.append(anchor);
  });
};

const renderNavigation = (data) => {
  const nav = document.querySelector('[data-list="nav.links"]');
  if (!nav) return;
  nav.innerHTML = "";
  const links = byPath(data, "nav.links");
  if (!Array.isArray(links)) return;
  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.href;
    anchor.textContent = link.label;
    if (window.location.pathname === link.href) anchor.setAttribute("aria-current", "page");
    nav.append(anchor);
  });
};

const renderSocial = (data) => {
  const iconMap = {
    Substack: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14" />
        <path d="M5 9h14" />
        <path d="M5 13h14v6l-7-3-7 3z" />
      </svg>
    `,
    Instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="4" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="16.4" cy="7.6" r=".7" />
      </svg>
    `,
    Medium: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 7.5v9" />
        <path d="M4.5 7.5l5.2 9 5.2-9" />
        <path d="M14.9 7.5v9" />
        <path d="M19.5 7.5v9" />
      </svg>
    `
  };
  document.querySelectorAll("[data-social], [data-social-footer]").forEach((node) => {
    node.innerHTML = "";
    const items = byPath(data, "social");
    if (!Array.isArray(items)) return;
    items.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.setAttribute("aria-label", link.label);
      anchor.innerHTML = `${iconMap[link.label] || link.label}<span class="sr-only">${link.label}</span>`;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      node.append(anchor);
    });
  });
};

const renderFooter = (data, language) => {
  const footer = document.querySelector("[data-footer]");
  if (!footer || !data.footer) return;
  const isJa = language === "ja";
  footer.innerHTML = `
    <div class="footer-inner">
      <span class="footer-copy">${data.footer.copy}</span>
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="${isJa ? "/ja/blog/" : "/blog/"}">${data.footer.blog}</a>
        <a href="${isJa ? "/ja/privacy/" : "/privacy/"}">${data.footer.privacy}</a>
        <a href="${isJa ? "/ja/terms/" : "/terms/"}">${data.footer.terms}</a>
      </nav>
    </div>
  `;
};

const setupMenu = () => {
  const button = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-site-menu]");
  if (!button || !menu) return;
  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
};

// ─── Home page renderers ─────────────────────────────────────────────────────

const renderDataLists = (data) => {
  document.querySelectorAll("ul[data-list]").forEach((node) => {
    const items = byPath(data, node.dataset.list);
    if (!Array.isArray(items)) return;
    node.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      node.append(li);
    });
  });
};

const renderSteps = (data) => {
  const node = document.querySelector("[data-cards]");
  if (!node) return;
  node.innerHTML = "";
  const steps = byPath(data, "method.steps");
  if (!Array.isArray(steps)) return;
  const stepIcons = {
    Write: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    `,
    Acknowledge: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    `,
    Review: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
        <circle cx="8" cy="6" r="2" />
        <circle cx="16" cy="12" r="2" />
        <circle cx="10" cy="18" r="2" />
      </svg>
    `,
    Move: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    `
  };
  steps.forEach((step, index) => {
    const card = document.createElement("article");
    card.className = "step-card";
    card.innerHTML = `
      <div class="method-step-top">
        <span class="method-step-number">STEP ${String(index + 1).padStart(2, "0")}</span>
        <span class="method-step-icon">${stepIcons[step.title] || ""}</span>
      </div>
      <h3>${step.title}</h3>
      <p>${step.text}</p>
    `;
    node.append(card);
  });
};

const renderOffers = (data) => {
  const node = document.querySelector("[data-offers]");
  if (!node) return;
  node.innerHTML = "";
  const items = byPath(data, "offers.items");
  if (!Array.isArray(items)) return;
  items.forEach((offer) => {
    const card = document.createElement("article");
    card.className = "offer-card";
    card.innerHTML = `
      <div>
        <span>${offer.type}</span>
        <h3>${offer.name}</h3>
      </div>
      <p>${offer.description}</p>
      ${offer.price ? `<strong>${offer.price}</strong>` : ""}
    `;
    node.append(card);
  });
};

const renderDetailCards = (data) => {
  const node = document.querySelector("[data-detail-cards]");
  if (!node) return;
  node.innerHTML = "";
  const items = byPath(data, node.dataset.detailCards);
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "detail-item";
    el.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    `;
    node.append(el);
  });
};

const renderFaq = (data) => {
  const node = document.querySelector("[data-faq]");
  if (!node) return;
  node.innerHTML = "";
  const items = byPath(data, "faq.items");
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    const el = document.createElement("details");
    el.className = "faq-item";
    el.innerHTML = `
      <summary class="faq-q">${item.q}</summary>
      <p class="faq-a">${item.a}</p>
    `;
    node.append(el);
  });
};

const renderTags = (data) => {
  const node = document.querySelector("[data-tags]");
  if (!node) return;
  node.innerHTML = "";
  const items = byPath(data, "corporate.tags");
  if (!Array.isArray(items)) return;
  items.forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    node.append(span);
  });
};

const renderTestimonials = (data) => {
  const node = document.querySelector("[data-testimonials]");
  if (!node) return;
  node.innerHTML = "";
  const items = byPath(data, "testimonials.items");
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "testimonial-card";
    card.innerHTML = `
      <p>"${item.quote}"</p>
      <span>${item.role}</span>
    `;
    node.append(card);
  });
};

const renderDownloadForms = (data) => {
  const language = window.location.pathname.startsWith("/ja") ? "ja" : "en";

  document.querySelectorAll("[data-download-form]").forEach((node) => {
    const download = data.download || data.hero;
    const fallback = language === "ja" ? "/ja/" : "/";
    const href = download.subscribeUrl || fallback;

    node.innerHTML = `
      <div class="download-form download-card-link">
        <div>
          <span>${download.downloadTitle}</span>
          <strong>${download.downloadText}</strong>
        </div>
        <div class="download-link-row">
          <a class="button primary" href="${href}" target="_blank" rel="noreferrer">${download.downloadButton}</a>
        </div>
        <p>${download.privacyNote}</p>
      </div>
    `;
  });
};

const renderArticles = (data) => {
  const node = document.querySelector("[data-articles]");
  if (!node) return;
  node.innerHTML = "";
  const items = byPath(data, "articles.items");
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "article-card";
    const body = `
      <span>${item.meta}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    `;
    const external = /^https?:\/\//.test(item.href || "");
    card.innerHTML = `
      ${item.href ? `<a class="article-card-link" href="${item.href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${body}<b>読む <span aria-hidden="true">→</span></b></a>` : body}
    `;
    node.append(card);
  });
};

// ─── Legal page renderer ─────────────────────────────────────────────────────

const renderLegalPage = (data) => {
  const node = document.querySelector("[data-legal-content]");
  if (!node || !data.legal) return;
  node.innerHTML = "";
  data.legal.sections.forEach((section) => {
    const div = document.createElement("div");
    div.className = "legal-section";
    div.innerHTML = `<h2>${section.heading}</h2><p>${section.body}</p>`;
    node.append(div);
  });
};

// ─── Blog renderers ──────────────────────────────────────────────────────────

const formatPostBody = (text) =>
  text
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

const renderBlogListing = async (data, language) => {
  const grid = document.querySelector("[data-blog-grid]");
  const starter = document.querySelector("[data-blog-starter]");
  const loading = document.querySelector("[data-blog-loading]");
  const error = document.querySelector("[data-blog-error]");
  if (!grid) return;

  const readMore = data.blog?.readMore || "Read more →";
  const emptyMsg = data.blog?.empty || "No posts yet.";
  const errorMsg = data.blog?.error || "Could not load posts.";
  const isJa = language === "ja";

  try {
    const response = await fetch(BLOG_CSV_PATH);
    if (!response.ok) throw new Error("fetch failed");
    const text = await response.text();
    const posts = parseCSV(text)
      .filter((p) => p.slug && p[`title_${language}`])
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    if (loading) loading.hidden = true;

    if (posts.length === 0) {
      if (error) { error.hidden = false; error.textContent = emptyMsg; }
      return;
    }

    const studioPosts = posts.filter((post) => !String(post.id).startsWith("NOTE"));
    const notePosts = posts.filter((post) => String(post.id).startsWith("NOTE"));
    const makeCard = (post) => {
      const slug = post.slug;
      const href = isJa ? `/ja/blog/post/?slug=${slug}` : `/blog/post/?slug=${slug}`;
      const keywords = (post[`keywords_${language}`] || "").split(",").map((k) => k.trim()).filter(Boolean);
      const keywordTags = keywords.map((k) => `<span class="keyword-tag">${k}</span>`).join("");
      const cover = post.cover_image
        ? `<div class="blog-cover" style="background-image: url('${post.cover_image}')" aria-hidden="true"></div>`
        : '<div class="blog-cover is-abstract" aria-hidden="true"></div>';
      const card = document.createElement("article");
      card.className = "article-card blog-card";
      card.dataset.id = post.id || "";
      card.dataset.order = post.order || "";
      card.dataset.keywords = keywords.join(",");
      card.dataset.category = post[`category_${language}`] || "";
      card.innerHTML = `
        ${cover}
        <div class="blog-card-body">
          <span class="card-category">${post[`category_${language}`] || ""}</span>
          <h3><a href="${href}">${post[`title_${language}`]}</a></h3>
          <p>${post[`excerpt_${language}`] || ""}</p>
          ${keywordTags ? `<div class="keyword-tags">${keywordTags}</div>` : ""}
          <a class="read-more" href="${href}">${readMore}</a>
        </div>
      `;
      return card;
    };

    studioPosts.forEach((post) => grid.append(makeCard(post)));

    if (starter && notePosts.length) {
      const sectionTitles = data.blog?.noteSections || {};
      const grouped = notePosts.reduce((groups, post) => {
        const category = post[`category_${language}`] || "";
        if (!groups[category]) groups[category] = [];
        groups[category].push(post);
        return groups;
      }, {});

      starter.hidden = false;
      starter.innerHTML = `
        <div class="start-here-heading">
          <p class="eyebrow">${data.blog?.startEyebrow || "Guide"}</p>
          <h2>${data.blog?.startHeading || "Start here"}</h2>
          <p>${data.blog?.startIntro || ""}</p>
        </div>
        <div class="starter-toc"></div>
      `;
      const toc = starter.querySelector(".starter-toc");
      Object.entries(grouped).forEach(([category, entries]) => {
        const group = document.createElement("section");
        group.className = "starter-group";
        group.innerHTML = `<h3>${sectionTitles[category] || category}</h3><ol></ol>`;
        const list = group.querySelector("ol");
        entries.forEach((post) => {
          const href = isJa ? `/ja/blog/post/?slug=${post.slug}` : `/blog/post/?slug=${post.slug}`;
          const item = document.createElement("li");
          item.innerHTML = `<a href="${href}">${post[`title_${language}`]}</a>`;
          list.append(item);
        });
        toc.append(group);
      });
    }
  } catch {
    if (loading) loading.hidden = true;
    if (error) { error.hidden = false; error.textContent = errorMsg; }
  }
};

const renderBlogPost = async (data, language) => {
  const node = document.querySelector("[data-blog-post]");
  if (!node) return;

  const notFoundMsg = data.page?.notFound || "Post not found.";
  const errorMsg = data.page?.error || "Could not load this post.";
  const isJa = language === "ja";

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    node.innerHTML = `<p class="error-text">${notFoundMsg}</p>`;
    return;
  }

  try {
    const response = await fetch(BLOG_CSV_PATH);
    if (!response.ok) throw new Error("fetch failed");
    const text = await response.text();
    const posts = parseCSV(text);
    const post = posts.find((p) => p.slug === slug);

    if (!post || !post[`title_${language}`]) {
      node.innerHTML = `<p class="error-text">${notFoundMsg}</p>`;
      return;
    }

    document.title = `${post[`title_${language}`]} | Red Pen Journaling`;

    const keywords = (post[`keywords_${language}`] || "").split(",").map((k) => k.trim()).filter(Boolean);
    const keywordTags = keywords.map((k) => `<span class="keyword-tag">${k}</span>`).join("");
    const imageAlt = post[`title_${language}`] || "";
    const leadImage = post.cover_image
      ? `<div class="post-lead-image" style="background-image: url('${post.cover_image}')" role="img" aria-label="${imageAlt}"></div>`
      : '<div class="post-lead-image is-abstract" aria-hidden="true"></div>';
    const closingImage = post.cover_image
      ? `<figure class="post-closing-image"><img src="${post.cover_image}" alt="${imageAlt}" loading="lazy" /></figure>`
      : "";

    node.innerHTML = `
      ${leadImage}
      <h1 class="post-title">${post[`title_${language}`]}</h1>
      <div class="post-meta">
        <span class="post-category">${post[`category_${language}`] || ""}</span>
        ${post.date ? `<span class="post-date">${post.date}</span>` : ""}
        ${post.id ? `<span class="post-id">${post.id}</span>` : ""}
      </div>
      <div class="post-body">${formatPostBody(post[`body_${language}`] || "")}</div>
      ${keywordTags ? `<div class="keyword-tags post-keywords">${keywordTags}</div>` : ""}
      ${closingImage}
    `;
  } catch {
    node.innerHTML = `<p class="error-text">${errorMsg}</p>`;
  }
};

// ─── Load & init ─────────────────────────────────────────────────────────────

const loadContent = async () => {
  const language = getLanguage();
  const contentName = getContentName();
  document.documentElement.lang = language === "ja" ? "ja" : "en";

  const response = await fetch(`/content/${language}/${contentName}.json?v=20260742`);
  const data = await response.json();

  document.title = data.meta.title;
  document.querySelector('meta[name="description"]').content = data.meta.description;

  setText(data);
  renderLanguageSwitch(language);
  renderNavigation(data);
  renderSocial(data);
  renderFooter(data, language);

  if (contentName === "home") {
    renderDataLists(data);
    renderSteps(data);
    renderOffers(data);
    renderTags(data);
    renderTestimonials(data);
    renderDownloadForms(data);
    renderArticles(data);
  } else if (contentName === "method") {
    renderDataLists(data);
    renderSteps(data);
    renderDetailCards(data);
    renderFaq(data);
    renderDownloadForms(data);
  } else if (contentName === "privacy" || contentName === "terms") {
    renderLegalPage(data);
  } else if (contentName === "blog") {
    renderBlogListing(data, language);
  } else if (contentName === "blog-post") {
    renderBlogPost(data, language);
  }

  setupMenu();
};

loadContent();
