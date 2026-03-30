const STORAGE_KEY = 'siteContent';

function getDefaultContent() {
  return window.SITE_CONTENT || {};
}

function getSavedContent() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn('Unable to parse saved content:', error);
    return null;
  }
}

function getEditableContent() {
  return getSavedContent() || getDefaultContent();
}

function createField(path, value) {
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = 'space-y-2';

  const label = document.createElement('label');
  label.className = 'block text-sm font-semibold';
  label.textContent = path;
  fieldWrapper.appendChild(label);

  if (typeof value === 'string') {
    const textarea = document.createElement('textarea');
    textarea.className = 'w-full min-h-[70px] rounded-2xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary';
    textarea.value = value;
    textarea.dataset.fieldPath = path;
    fieldWrapper.appendChild(textarea);
  } else if (typeof value === 'number') {
    const input = document.createElement('input');
    input.className = 'w-full rounded-2xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary';
    input.type = 'number';
    input.value = value;
    input.dataset.fieldPath = path;
    fieldWrapper.appendChild(input);
  } else if (Array.isArray(value)) {
    if (value.every((item) => typeof item === 'string')) {
      const textarea = document.createElement('textarea');
      textarea.className = 'w-full min-h-[90px] rounded-2xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary';
      textarea.value = value.join('\n');
      textarea.dataset.fieldPath = path;
      textarea.dataset.fieldType = 'string-array';
      fieldWrapper.appendChild(textarea);
    } else {
      const section = document.createElement('div');
      section.className = 'space-y-4';
      value.forEach((item, index) => {
        const itemHeader = document.createElement('div');
        itemHeader.className = 'text-sm font-semibold text-primary';
        itemHeader.textContent = `${path}[${index}]`;
        section.appendChild(itemHeader);
        section.appendChild(buildForm(item, `${path}[${index}]`));
      });
      fieldWrapper.appendChild(section);
    }
  } else if (typeof value === 'object' && value !== null) {
    fieldWrapper.appendChild(buildForm(value, path));
  }

  return fieldWrapper;
}

function buildForm(obj, parentPath = '') {
  const container = document.createElement('div');
  container.className = 'space-y-6';

  Object.keys(obj).forEach((key) => {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const value = obj[key];
    container.appendChild(createField(path, value));
  });

  return container;
}

function parsePath(path) {
  const segments = [];
  const regex = /([^.\[\]]+)|(\[(\d+)\])/g;
  let match;
  while ((match = regex.exec(path))) {
    if (match[1]) {
      segments.push(match[1]);
    } else if (match[3]) {
      segments.push(Number(match[3]));
    }
  }
  return segments;
}

function setDeepValue(obj, path, value) {
  const segments = parsePath(path);
  let current = obj;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
      return;
    }
    if (typeof segments[index + 1] === 'number') {
      if (!Array.isArray(current[segment])) current[segment] = [];
    } else if (typeof current[segment] !== 'object' || current[segment] === null) {
      current[segment] = {};
    }
    current = current[segment];
  });
}

function collectFormData() {
  const content = {};
  document.querySelectorAll('[data-field-path]').forEach((input) => {
    const path = input.dataset.fieldPath;
    let value = input.value;
    if (input.dataset.fieldType === 'string-array') {
      value = value.split('\n').map((item) => item.trim()).filter(Boolean);
    }
    setDeepValue(content, path, value);
  });
  return content;
}

function saveContent() {
  const newContent = collectFormData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
  alert('Site content saved locally. Open index.html or gallery.html to preview the changes.');
}

function exportContent() {
  const data = collectFormData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'site-content.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clearLocalContent() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

function loadDefaultContent() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
  const editableContent = getEditableContent();
  const formRoot = document.getElementById('editor-form');
  formRoot.appendChild(buildForm(editableContent));

  document.getElementById('save-button').addEventListener('click', saveContent);
  document.getElementById('export-button').addEventListener('click', exportContent);
  document.getElementById('reset-button').addEventListener('click', clearLocalContent);
  document.getElementById('clear-button').addEventListener('click', loadDefaultContent);
});
