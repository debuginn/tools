const THEME_KEY = "debuginn_tools_theme";
const LANG_KEY = "debuginn_tools_lang";

const translations = {
  zh: {
    cardPath: "$ pwd: ~/tools/debuginn-wx-xhs-poster",
    toolTitle: "小红书微信截图分享海报",
    eyebrow: "# > Tool Overview",
    lead: "一个偏终端风格的轻量设计工具，用来把截图快速整理成更适合分享的方形宣传图。你可以上传截图、修改标题文案、调整背景颜色，然后直接导出 PNG。",
    openTool: "$ open tool",
    blogCardPath: "$ pwd: ~/tools/debuginn-blog-cover",
    blogToolTitle: "Blog 主题图生成器",
    blogEyebrow: "# > New Tool",
    blogLead: "用来快速生成 blog 文章封面图。支持上传 Logo、设置标题与副标题，自动生成中心图标加大字发光背景的横向主题图。",
    openBlogTool: "$ open tool",
    backTop: "返回顶部"
  },
  en: {
    cardPath: "$ pwd: ~/tools/debuginn-wx-xhs-poster",
    toolTitle: "Xiaohongshu & WeChat Share Poster",
    eyebrow: "# > Tool Overview",
    lead: "A lightweight terminal-inspired design tool for turning screenshots into square share posters. Upload a screenshot, edit the copy, adjust the background, and export a PNG instantly.",
    openTool: "$ open tool",
    blogCardPath: "$ pwd: ~/tools/debuginn-blog-cover",
    blogToolTitle: "Blog Cover Generator",
    blogEyebrow: "# > New Tool",
    blogLead: "Generate glowing landscape hero images for blog posts with a centered logo, oversized title treatment, and quick PNG export.",
    openBlogTool: "$ open tool",
    backTop: "Back to top"
  }
};

function setActiveLang(lang) {
  const options = document.querySelectorAll("[data-lang-option]");
  const current = document.querySelector(".header-lang-current");
  let currentLabel = "中文";

  options.forEach((option) => {
    const isActive = option.getAttribute("data-lang-option") === lang;
    option.classList.toggle("active", isActive);
    if (isActive) currentLabel = option.textContent.trim();
  });

  if (current) current.textContent = currentLabel;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function updateThemeButton(theme) {
  const btn = document.getElementById("themeToggleBtn");
  if (!btn) return;
  btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

function applyLang(lang) {
  const dict = translations[lang] || translations.zh;
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (dict[key]) node.textContent = dict[key];
  });
  setActiveLang(lang);
}

function bindLangDropdown() {
  const dropdown = document.querySelector(".header-lang-dropdown");
  const trigger = document.getElementById("langToggleBtn");
  const options = document.querySelectorAll("[data-lang-option]");
  if (!dropdown || !trigger || !options.length) return;

  const close = () => {
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  };

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextOpen = !dropdown.classList.contains("open");
    dropdown.classList.toggle("open", nextOpen);
    trigger.setAttribute("aria-expanded", nextOpen ? "true" : "false");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const nextLang = option.getAttribute("data-lang-option");
      localStorage.setItem(LANG_KEY, nextLang);
      applyLang(nextLang);
      close();
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".header-lang-dropdown")) return;
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function init() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  const savedLang = localStorage.getItem(LANG_KEY) || "zh";
  const themeBtn = document.getElementById("themeToggleBtn");

  applyTheme(savedTheme);
  updateThemeButton(savedTheme);
  applyLang(savedLang);
  bindLangDropdown();

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
      updateThemeButton(nextTheme);
    });
  }
}

init();
