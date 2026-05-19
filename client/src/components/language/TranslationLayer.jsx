import { useEffect } from "react";
import { arTranslations } from "../../utils/translations";
import { useLanguage } from "../../context/LanguageContext";

const textNodeOriginals = new WeakMap();
const attrOriginals = new WeakMap();

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "CODE",
  "PRE",
  "TEXTAREA",
]);

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function translateText(value) {
  const normalized = normalizeText(value);

  if (!normalized) return value;

  return arTranslations[normalized] || value;
}

function shouldSkipElement(element) {
  if (!element || !element.tagName) return true;
  if (SKIP_TAGS.has(element.tagName)) return true;
  if (element.closest("[data-no-translate]")) return true;
  return false;
}

function translateAttributes(element, isArabic) {
  if (shouldSkipElement(element)) return;

  const attrs = ["placeholder", "title", "aria-label"];

  attrs.forEach((attr) => {
    if (!element.hasAttribute(attr)) return;

    let originalMap = attrOriginals.get(element);

    if (!originalMap) {
      originalMap = {};
      attrOriginals.set(element, originalMap);
    }

    if (!originalMap[attr]) {
      originalMap[attr] = element.getAttribute(attr);
    }

    const originalValue = originalMap[attr];

    const nextValue = isArabic ? translateText(originalValue) : originalValue;

    if (element.getAttribute(attr) !== nextValue) {
      element.setAttribute(attr, nextValue);
    }
  });
}

function translateTextNode(node, isArabic) {
  const parent = node.parentElement;

  if (!parent || shouldSkipElement(parent)) return;

  const originalValue = textNodeOriginals.get(node) || node.nodeValue;

  if (!textNodeOriginals.has(node)) {
    textNodeOriginals.set(node, originalValue);
  }

  const trimmedOriginal = normalizeText(originalValue);

  if (!trimmedOriginal) return;

  const translated = arTranslations[trimmedOriginal];
  const leadingSpace = originalValue.match(/^\s*/)?.[0] || "";
  const trailingSpace = originalValue.match(/\s*$/)?.[0] || "";
  const nextValue = isArabic && translated
    ? `${leadingSpace}${translated}${trailingSpace}`
    : originalValue;

  if (node.nodeValue !== nextValue) {
    node.nodeValue = nextValue;
  }
}

function walkAndTranslate(root, isArabic) {
  if (!root) return;

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateAttributes(root, isArabic);
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE && shouldSkipElement(node)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let node = walker.currentNode;

  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node, isArabic);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      translateAttributes(node, isArabic);
    }

    node = walker.nextNode();
  }
}

export default function TranslationLayer() {
  const { isArabic } = useLanguage();

  useEffect(() => {
    let frameId = null;

    const run = () => {
      frameId = null;
      walkAndTranslate(document.body, isArabic);
    };

    run();

    const observer = new MutationObserver(() => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(run);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      observer.disconnect();

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isArabic]);

  return null;
}
