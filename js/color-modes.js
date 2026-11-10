/**
 * Color mode: locked to light.
 *
 * The dashboard uses a light Boston College theme (see css/bc-theme.css), so the
 * light/dark/auto switcher has been removed. This sets light mode on <html>
 * and dispatches ColorSchemeChange so the charts pick up the theme colors.
 */

(() => {
  // Clear any dark/auto preference saved by the old theme switcher
  localStorage.removeItem('coreui-free-bootstrap-admin-template-theme');

  document.documentElement.setAttribute('data-coreui-theme', 'light');
  document.documentElement.dispatchEvent(new Event('ColorSchemeChange'));
})();
