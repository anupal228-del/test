function getSiteContent() {
  const stored = localStorage.getItem('siteContent');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Invalid saved site content:', error);
    }
  }

  return window.SITE_CONTENT || {};
}

function resolveContentKey(source, key) {
  if (!source || !key) return undefined;
  const segments = key.split('.');
  let current = source;
  for (let segment of segments) {
    if (segment.endsWith(']')) {
      const [property, indexPart] = segment.split('[');
      const index = parseInt(indexPart, 10);
      current = current[property];
      if (!Array.isArray(current) || isNaN(index)) {
        return undefined;
      }
      current = current[index];
    } else {
      current = current[segment];
    }
    if (current === undefined) return undefined;
  }
  return current;
}

function updateElement(element, value) {
  if (value === undefined || value === null) return;
  const attrName = element.dataset.contentAttr;
  const attrKey = element.dataset.contentAttrKey;
  if (attrName) {
    const attrValue = attrKey ? resolveContentKey(getSiteContent(), attrKey) : value;
    if (attrValue !== undefined && attrValue !== null) {
      element.setAttribute(attrName, attrValue);
    }
  }

  if (Array.isArray(value) && element.dataset.contentHtml === 'true') {
    if (value.length === 0) return;
    if (typeof value[0] === 'string') {
      element.innerHTML = value.map((item) => `<li>${item}</li>`).join('');
    } else {
      element.textContent = JSON.stringify(value);
    }
    return;
  }

  if (element.dataset.contentHtml === 'true') {
    element.innerHTML = value;
  } else {
    element.textContent = value;
  }
}

function renderSiteContent() {
  const content = getSiteContent();
  document.querySelectorAll('[data-content-key]').forEach((element) => {
    const value = resolveContentKey(content, element.dataset.contentKey);
    updateElement(element, value);
  });
}

document.addEventListener('DOMContentLoaded', renderSiteContent);
