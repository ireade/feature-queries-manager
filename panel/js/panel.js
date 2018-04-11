let FEATURE_QUERY_DECLARATIONS = [];
let FEATURE_QUERY_CONDITIONS = [];
const conditionsListEl = document.getElementById('feature-queries');
const mainEl = document.querySelector('main');

const portToBackgroundScript = browser.runtime.connect();
let thisEvent = null; // see onClickConditionsList()

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
  thisEvent = event;

  // If clicked the checkbox
  if (event.target.tagName == 'INPUT') {
    portToBackgroundScript.postMessage({ 
      tabId: browser.devtools.inspectedWindow.tabId, 
      action: 'toggleCondition',
      condition: FEATURE_QUERY_CONDITIONS[event.target.parentElement.parentElement.dataset.index],
      toggleOn: event.target.checked
    });
  }

  // If clicked the button
  else if (event.target.tagName == 'BUTTON') {
    portToBackgroundScript.postMessage({ 
      tabId: browser.devtools.inspectedWindow.tabId, 
      action: 'getConditionRules',
      condition: FEATURE_QUERY_CONDITIONS[event.target.parentElement.dataset.index]
    });
  }
}

/* ************************************************************************
    start 
************************************************************************ */

function start() {
  portToBackgroundScript.postMessage({ 
    tabId: browser.devtools.inspectedWindow.tabId, 
    action: 'start' 
  });
}

function onReceiveStart(res) {
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
}

start();
document.getElementById('reload').addEventListener('click', start);

/* ************************************************************************
    portToBackgroundScript.onMessage 
************************************************************************ */

portToBackgroundScript.onMessage.addListener(function(msg) {
  switch(msg.action) {
    case 'restart':
      start();
      break;
    case 'start':
      onReceiveStart(msg); 
      break;
    case 'toggleCondition':
      break;
    case 'getConditionRules':
      displayConditionRules(msg.conditionRules, thisEvent);
      break;
  }
});
