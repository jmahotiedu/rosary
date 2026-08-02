function isIosSafariLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)) ||
    window.matchMedia("(display-mode: standalone)").matches;
  return iOS && !standalone;
}

export function renderInstallPrompt(canInstallNative: boolean): string {
  if (canInstallNative) {
    return `<button class="install-button" type="button" data-action="install">Add to Home Screen</button>`;
  }

  if (isIosSafariLike()) {
    return `<p class="install-hint" data-install-hint>On iPhone: tap Share, then Add to Home Screen.</p>`;
  }

  return "";
}
