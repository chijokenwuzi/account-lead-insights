(function () {
  const hasToken = Boolean(
    localStorage.getItem("account_lead_insights_token") || localStorage.getItem("accountstory_token")
  );
  if (!hasToken) {
    return;
  }

  document
    .querySelectorAll(
      '.top-nav a[href="/account-lead-insights/login"], .top-nav a[href="/login"], .top-nav a[href="/lead-insights-login"]'
    )
    .forEach((node) => {
    node.remove();
  });

  document.querySelectorAll("a.cta-pill").forEach((node) => {
    node.remove();
  });
})();
