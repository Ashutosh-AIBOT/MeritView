/**
 * @type {import("puppeteer").Configuration}
 * Skips the Chrome download during `pnpm install`. Opinion PDF generation
 * (F7) needs a real Chrome binary at runtime — either install one manually
 * (`pnpm --filter backend node_modules/.bin/puppeteer browsers install chrome`)
 * when you have a working network, or set PUPPETEER_EXECUTABLE_PATH to a
 * system Chrome/Chromium install.
 */
module.exports = {
  skipDownload: true,
};
