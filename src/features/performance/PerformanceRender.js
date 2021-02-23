import React from "react"
import "./performance.css"
import {useSelector} from "react-redux"
import {PerformanceHeader} from "./performanceHeader"
import {MetricsRenderer} from "./MetricsRenderer"
import {OpportunityRenderer} from "./OpportunityRenderer"
import {DiagnosticRenderer} from "./DiagnosticRenderer"
import Util from "./utils"
import I18n from "./i18n"
function showAsPassed(audit){
    switch (audit.scoreDisplayMode) {
      case 'manual':
      case 'notApplicable':
        return true;
      case 'error':
      case 'informative':
        return false;
      case 'numeric':
      case 'binary':
      default:
        return Number(audit.score) >= 0.9 ;
    }
  }
function _getWastedMs(audit){
    if (audit.result.details && audit.result.details.type === 'opportunity') {
      const details = audit.result.details;
      if (typeof details.overallSavingsMs !== 'number') {
        throw new Error('non-opportunity details passed to _getWastedMs');
      }
      return details.overallSavingsMs;
    } else {
      return Number.MIN_VALUE;
    }
  }  
function metricsgen(data){
    const metrics = [];
    for(let i=0;i<6;i++){
        metrics.push(data.audits[data.categories.performance.auditRefs[i].id]);
        console.log(metrics[i]);
    }
    return metrics;
}  
export const PerformanceRender = (props)=>{
    const data = useSelector((state)=>state.data.lighthouseData);
    const report = Util.prepareReportResult(data);
    const i18n = new I18n(report.configSettings.locale, {
      ...Util.UIStrings,
      ...report.i18n.rendererFormattedStrings,
    });
    Util.i18n = i18n;
    Util.reportJson = report; 
    //Cloning data into another variable and modifying the data
    const clone = (JSON.parse(JSON.stringify(data)));
    for (const category of Object.values(clone.categories)) {
        category.auditRefs.forEach((auditRef) => {
          const result = clone.audits[auditRef.id];
          auditRef.result = result;
        });
    } 
    const performanceCategory=clone.categories.performance.auditRefs;
    //Metrics data
    const metrics=metricsgen(data);
    
    // Opportunity data
    let opportunityAudits = performanceCategory.filter(
        (audit) =>
          audit.group === 'load-opportunities' && !showAsPassed(audit.result)
      ).sort(
        (auditA, auditB) =>
          _getWastedMs(auditB) -_getWastedMs(auditA)
      );
    console.log(performanceCategory);
    let scale=null;
    if (opportunityAudits.length) {
        const minimumScale = 2000;
        const wastedMsValues = opportunityAudits.map((audit) =>
          _getWastedMs(audit)
        );
        const maxWaste = Math.max(...wastedMsValues);
        scale = Math.max(Math.ceil(maxWaste / 1000) * 1000, minimumScale);
    }
    // Diagnostic data
    console.log(performanceCategory.filter((audit)=>audit.group==="diagnostics"))
    const diagnosticAudits = performanceCategory.filter(
        (audit) =>
          audit.group === 'diagnostics' && !showAsPassed(audit.result)
      ).sort((a, b) => {
        const scoreA =
          a.result.scoreDisplayMode === 'informative'
            ? 100
            : Number(a.result.score);
        const scoreB =
          b.result.scoreDisplayMode === 'informative'
            ? 100
            : Number(b.result.score);
        return scoreA - scoreB;
      });
    console.log(diagnosticAudits)
    return(
        <React.Fragment>
        <div class="lh-container lh-root lh-vars lh-screenshot-overlay--enabled lh-narrow">  
        <div class="lh-container">
        <div class="lh-report">       
        <div class="lh-categories">
        <div class="lh-category-wrapper">
        <div class="lh-category">
        <PerformanceHeader category={data.categories.performance}/>
        <MetricsRenderer metrics={metrics}/>
        <OpportunityRenderer opportunityAudits={opportunityAudits} scale={scale}/>
        <DiagnosticRenderer diagnosticAudits={diagnosticAudits} />
        </div>
        </div>
        </div>
        </div>
        </div>
        </div>  
        </React.Fragment>
    );
} 