import React from "react"
import "./performance.css"
import {useSelector} from "react-redux"
import {CategoryHeader} from "./CategoryHeader"
import {MetricsRenderer} from "./MetricsRenderer"
import {OpportunityRenderer} from "./OpportunityRenderer"
import {DiagnosticRenderer} from "./DiagnosticRenderer"
import Util from "./utils"
import I18n from "./i18n"
const _setRatingClass=(score, scoreDisplayMode)=>{
  const rating = Util.calculateRating(score, scoreDisplayMode);
  let Class = 'lh-audit'+` lh-audit--${scoreDisplayMode.toLowerCase()}`;
  if(scoreDisplayMode !== 'informative'){
    Class=Class+` lh-audit--${rating}`
  }
  return Class
}
const renderAudit = (audit)=>{
  return(
          <div class={_setRatingClass(audit.result.score,audit.result.scoreDisplayMode)} id={audit.result.id}>
          <details class="lh-expandable-details" open="">
          <summary>
          <div class="lh-audit__header lh-expandable-details__summary">
            <span class="lh-audit__score-icon"></span>
            <span class="lh-audit__title-and-text">
              <span class="lh-audit__title"><span>{convertMarkdownCodeSnippets(audit.result.title)}</span></span>
              <span class="lh-audit__display-text">{audit.result.displayValue}</span>
            </span>
            <div class="lh-chevron-container"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <g class="lh-chevron__lines">
              <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
              <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
              </g>
            </svg></div>
          </div>
          </summary>
          <div class="lh-audit__description"><span>{convertMarkdownLinkSnippets(audit.result.description)}</span></div>
          </details>
          </div>
  )
}
function convertMarkdownCodeSnippets(markdownText) {
  const arr=[];
  for (const segment of Util.splitMarkdownCodeSpans(markdownText)) {
    if (segment.isCode) {
      arr.push(
          <code>{segment.text}</code>
      )
    } else {
      arr.push(segment.text)
    }
  }

  return arr;
} 
function convertMarkdownLinkSnippets(text) {
  if(!text) return null;
  const arr=[]
  for (const segment of Util.splitMarkdownLink(text)) {
    if (!segment.isLink) {
      // Plain text segment.
      arr.push(
          segment.text
      )
      continue;
    }

    // Otherwise, append any links found.
    const url = new URL(segment.linkHref);

    const DOCS_ORIGINS = ['https://developers.google.com', 'https://web.dev'];
    if (DOCS_ORIGINS.includes(url.origin)) {
      url.searchParams.set('utm_source', 'lighthouse');
      url.searchParams.set('utm_medium', 'unknown');
    }
    arr.push(
        <a rel='noopener' target="_blank" href={url.href}>{segment.text}</a>
    )
  }

  return arr ;
}
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
    //Passed Audits
    const passedAudits = performanceCategory.filter(
      (audit) =>
        (audit.group === 'load-opportunities' ||
          audit.group === 'diagnostics') &&
          showAsPassed(audit.result)
    );
    const renderedAudits=passedAudits.map((audit)=>renderAudit(audit))
    return(
        <React.Fragment>
        
        <div class="lh-category-wrapper">
        <div class="lh-category">
        <CategoryHeader category={data.categories.performance}/>
        <MetricsRenderer metrics={metrics}/>
        <OpportunityRenderer opportunityAudits={opportunityAudits} scale={scale}/>
        <DiagnosticRenderer diagnosticAudits={diagnosticAudits} />
        
        <details className="lh-clump lh-audit-group lh-clump--passed" open="">
            <summary>   
            <div className="lh-audit-group__summary">    
            <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">Passed audits</span>
            <span class="lh-audit-group__itemcount">({passedAudits.length})</span>
            </div>
            </div>
            </summary>
            {renderedAudits}
          </details>
        </div>
        </div>
          
        </React.Fragment>
    );
} 