
function displayFeatureQueries(fq, featureQueryRules) {

  // console.log()

  if (!fq || fq.length == 0) {
    return;
  }
  
  var el = document.getElementById("feature-queries");

  var items = "";

  fq.forEach((item, i) => {

    const template = `<li data-index="${i}">
      <span class="toggle">
        <input type="checkbox" checked data-index="${i}">
      </span>
      <button class="details">${item}</button>
    </li>`;

    items += template;

  });

  el.innerHTML = items;


  // Add event listeners

  el.addEventListener("click", function(event) {

    if (event.target.dataset && event.target.dataset.index) {

      const data = {
        action: "toggleCondition",
        condition: fq[event.target.dataset.index],
        toggleOn: event.target.checked
      }
      
      chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, data, (response) => {});
    }

    else if (event.target.tagName == "BUTTON") {

      const data = {
        action: "getConditionRules",
        condition: fq[event.target.parentElement.dataset.index]
      };

      chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, data, (conditionRules) => {
        console.log(conditionRules);

        var result = "";

        conditionRules.forEach((cr) => {
          var template = `<section class="group">
          <h3>${cr.stylesheet}</h3>
          <pre>${cr.cssText}</pre>
          </section>`;
          result += template;
        });

        document.querySelector("main").innerHTML = result;

        const currentlySelected = document.querySelector(".selected");
        if (currentlySelected) currentlySelected.classList.remove("selected");
        event.target.parentElement.classList.add("selected");

      }); // end sendMessage




    }

  }); // end eventListener


  // Highlight first one
  const firstButton = document.querySelector('li[data-index="0"] button');
  firstButton.click();

}



function start() {
  chrome.tabs.sendMessage(chrome.devtools.inspectedWindow.tabId, { action: "start" }, (msg) => {
    displayFeatureQueries(msg.conditions, msg.featureQueryRules);
  });
}

start();

/* ************************************************************************
    onUpdated 
************************************************************************ */

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.status === "complete") {
    start();
  }
});
