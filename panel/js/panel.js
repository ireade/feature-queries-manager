let FEATURE_QUERY_DECLARATIONS = [];
let FEATURE_QUERY_CONDITIONS = [];
const conditionsListEl = document.getElementById('feature-queries');
const mainEl = document.querySelector('main');

function displayFeatureQueryConditionsList() {
  let content = '';

  FEATURE_QUERY_CONDITIONS.forEach((condition, i) => {
    content += `<li data-index="${i}">
      <span class="toggle">
        <input type="checkbox" checked aria-label="Toggle Feature Query ${condition}">
      </span>
      <button class="details">${condition}</button>
    </li>`;
  });

  conditionsListEl.innerHTML = content;
}

function displayConditionRules(conditionRules, event) {
  let content = '';

  conditionRules.forEach((cr) => {
    content += `<section class="group">
    <h3>${cr.stylesheet} at index:${cr.index}</h3>
    <pre><code class="css">${cr.cssText}</code></pre>
    </section>`;
  });

  mainEl.innerHTML = content;

  // Syntax highlighting
  Array.from(document.querySelectorAll('code.css')).forEach((block) => hljs.highlightBlock(block));

  // Add .selected class to list item in sidebar
  const currentlySelected = document.querySelector('.selected');
  if (currentlySelected) currentlySelected.classList.remove('selected');
  event.target.parentElement.classList.add('selected');
}

function onClickConditionsList(event) {
  // If clicked the checkbox
  if (event.target.tagName == 'INPUT') {
    browser.tabs.sendMessage(browser.devtools.inspectedWindow.tabId, {
      action: 'toggleCondition',
      condition: FEATURE_QUERY_CONDITIONS[event.target.parentElement.parentElement.dataset.index],
      toggleOn: event.target.checked
    }).then((response) => {});
  }

  // If clicked the button
  else if (event.target.tagName == 'BUTTON') {
    browser.tabs.sendMessage(browser.devtools.inspectedWindow.tabId, {
      action: 'getConditionRules',
      condition: FEATURE_QUERY_CONDITIONS[event.target.parentElement.dataset.index]
    }).then((response) => displayConditionRules(response, event));
  }
}

/* ************************************************************************
    start 
************************************************************************ */

function start() {
  browser.tabs.sendMessage(browser.devtools.inspectedWindow.tabId, { action: 'start' }).then((res) => {
    FEATURE_QUERY_DECLARATIONS = res.FEATURE_QUERY_DECLARATIONS;
    FEATURE_QUERY_CONDITIONS = res.FEATURE_QUERY_CONDITIONS;
    
    if (FEATURE_QUERY_CONDITIONS.length == 0) {
      conditionsListEl.innerHTML = '<span class="notice">No Feature Queries found on this page.</span>';
      mainEl.innerHTML = '';
    } else {
      displayFeatureQueryConditionsList();
      conditionsListEl.addEventListener('click', onClickConditionsList);
      document.querySelector('li[data-index="0"] button').click();
    }
  });
}

start();

document.getElementById('reload').addEventListener('click', start);

/* ************************************************************************
    onUpdated 
************************************************************************ */

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.status === 'complete') start();
});
