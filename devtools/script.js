const BROWSER = chrome || browser;

BROWSER.devtools.panels.create("FQM", "images/icon@64.png", "../panel/index.html", function(panel) {});
