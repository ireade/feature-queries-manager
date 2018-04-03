
let FEATURE_QUERY_DECLARATIONS = [];
let FEATURE_QUERY_CONDITIONS = [];

/* ************************************************************************
    start
************************************************************************ */

function readStylesheets() {
  Array.from(document.styleSheets).forEach((stylesheet) => {

    let cssRules;

    try {
      cssRules = Array.from(stylesheet.cssRules);
    } catch(err) {
      return console.warn(`[FQM] Can't read cssRules from stylesheet: ${stylesheet.href}`);
    }

    cssRules.forEach((rule, i) => {
      if (rule instanceof CSSSupportsRule) FEATURE_QUERY_DECLARATIONS.push({ 
        index: i, 
        stylesheet: stylesheet,
        rule: rule });
    });

  });
}

function getConditionsFromStylesheets() {
  if (FEATURE_QUERY_DECLARATIONS.length === 0) return;

  FEATURE_QUERY_DECLARATIONS.forEach((declaration) => {
    if (!FEATURE_QUERY_CONDITIONS.includes(declaration.rule.conditionText)) {
      FEATURE_QUERY_CONDITIONS.push(declaration.rule.conditionText);
    }
  });
}

/* ************************************************************************
    toggleCondition
************************************************************************ */

function toggleCondition(condition, toggleOn) {
  FEATURE_QUERY_DECLARATIONS.forEach((declaration) => {
    if (declaration.rule.conditionText === condition) {
      if (toggleOn) {
        declaration.stylesheet.insertRule(declaration.rule.cssText, declaration.index);
      } else {
        declaration.stylesheet.deleteRule(declaration.index);
      }
    }    
  });
}

/* ************************************************************************
    getConditionRules
************************************************************************ */

function getConditionRules(condition) {
  const conditionRules = [];

  FEATURE_QUERY_DECLARATIONS.forEach((declaration) => {
    if (declaration.rule.conditionText === condition) {
      conditionRules.push({
        cssText: declaration.rule.cssText,
        index: declaration.index,
        stylesheet: declaration.stylesheet.href || '&lt;style&gt;'
      });
    }
  });

  return conditionRules;
}

/* ************************************************************************
    onMessage 
************************************************************************ */

browser.runtime.onMessage.addListener((msg) => {
  switch(msg.action) {
    case 'start':
      FEATURE_QUERY_DECLARATIONS = [];
      FEATURE_QUERY_CONDITIONS = [];
      readStylesheets();
      getConditionsFromStylesheets();
      return Promise.resolve({ 
        FEATURE_QUERY_CONDITIONS: FEATURE_QUERY_CONDITIONS, 
        FEATURE_QUERY_DECLARATIONS: FEATURE_QUERY_DECLARATIONS 
      });
      break;
    case 'toggleCondition':
      toggleCondition(msg.condition, msg.toggleOn);
      return Promise.resolve();
      break;
    case 'getConditionRules':
      const conditionRules = getConditionRules(msg.condition);
      return Promise.resolve(conditionRules);
      break;
  }
});
