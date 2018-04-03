var featureQueryRules = [];
var conditions = [];

function parseStylesheets() {

  const stylesheets = Array.from(document.styleSheets);

  stylesheets.forEach((stylesheet) => {

    let rules;

    try {
      rules = Array.from(stylesheet.cssRules);
    } catch(err) {
      console.log("Can't read cssRules from this stylesheet: " + stylesheet.href);
      return;
    }

    rules.forEach((rule, i) => {
      if (rule instanceof CSSSupportsRule) {
        featureQueryRules.push({
          stylesheet: stylesheet,
          index: i,
          rule: rule
        });
      }
    }); // rules.forEach()

  }); // stylesheets.forEach()

  featureQueryRules.forEach((rule) => {
    if (!conditions.includes(rule.rule.conditionText)) {
      conditions.push(rule.rule.conditionText);
    }
  });

  // console.log(featureQueryRules);
  // console.log(conditions);

}

function toggleCondition(condition, toggleOn) {
  featureQueryRules.forEach((rule) => {
    if (rule.rule.conditionText === condition) {
      if (toggleOn) {
        rule.stylesheet.insertRule(rule.rule.cssText, rule.index);
      } else {
        rule.stylesheet.deleteRule(rule.index);
      }
    }
  });
}

function getConditionRules(condition) {
  const conditionRules = [];

  featureQueryRules.forEach((rule) => {
    if (rule.rule.conditionText === condition) {
      conditionRules.push({
        cssText: rule.rule.cssText,
        stylesheet: rule.stylesheet.href || "&lt;style&gt;"
      });
    }
  });

  return conditionRules;
}

/* ************************************************************************
    onMessage 
************************************************************************ */

chrome.runtime.onMessage.addListener(function(msg, sender, cb) {

  switch(msg.action) {
    case "start":
      parseStylesheets();
      cb({ conditions: conditions, featureQueryRules: featureQueryRules });
      break;
    case "toggleCondition":
      toggleCondition(msg.condition, msg.toggleOn);
      cb();
    case "getConditionRules":
      var conditionRules = getConditionRules(msg.condition);
      cb(conditionRules);
  }

});
