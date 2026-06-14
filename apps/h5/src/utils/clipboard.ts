function fallbackCopy(text: string): boolean {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.top = '0';
  el.style.width = '1px';
  el.style.height = '1px';
  el.style.padding = '0';
  el.style.border = 'none';
  el.style.outline = 'none';
  el.style.opacity = '0';
  document.body.appendChild(el);

  el.focus();
  el.select();
  if (typeof el.setSelectionRange === 'function') {
    el.setSelectionRange(0, el.value.length);
  }

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }

  document.body.removeChild(el);
  return ok;
}

/** 兼容移动端 / HTTP 环境的复制 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级到 execCommand
    }
  }

  return fallbackCopy(text);
}
