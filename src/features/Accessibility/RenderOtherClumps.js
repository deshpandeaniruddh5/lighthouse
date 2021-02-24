import React from "react"
import Util from "../performance/utils"
const _setRatingClass=(score, scoreDisplayMode)=>{
    const rating = Util.calculateRating(score, scoreDisplayMode);
    let Class = 'lh-audit'+` lh-audit--${scoreDisplayMode.toLowerCase()}`;
    if(scoreDisplayMode !== 'informative'){
      Class=Class+` lh-audit--${rating}`
    }
    return Class
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
function _clumpTitles(clumpId) {
    switch(clumpId){
        case 'warning': 
            return Util.i18n.strings.warningAuditsGroupTitle
        case 'manual': 
            return Util.i18n.strings.manualAuditsGroupTitle 
        case 'passed': 
            return Util.i18n.strings.passedAuditsGroupTitle  
        default: 
            return Util.i18n.strings.notApplicableAuditsGroupTitle         
    }
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
const renderGroupAudits = (clumps,description)=>{
    const auditsGroups = []
    for (const [clumpId, groupAuditRefs] of clumps){
        const renderedAudits=groupAuditRefs.map((audit)=>renderAudit(audit))
        let Class="lh-clump lh-audit-group lh-clump--"+clumpId
        const title=_clumpTitles(clumpId)
        auditsGroups.push(
            <details className={Class} open="">
            <summary>   
            <div className="lh-audit-group__summary">    
            <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">{title}</span>
            <span class="lh-audit-group__itemcount">({groupAuditRefs.length})</span>
            <span class="lh-audit-group__description">{convertMarkdownLinkSnippets(clumpId==='manual' ? description: undefined )}</span>
            </div>
            </div>
            </summary>
            {renderedAudits}
            </details>
        )
    }
    return auditsGroups
}  
export const RenderOtherClumps = (props) =>{  
    const clumps = new Map()
    for(const [clumpId, groupAuditRefs] of props.clumps){
        if(groupAuditRefs.length===0){
            continue;
        }
        clumps.set(clumpId,groupAuditRefs);
    }
    return (renderGroupAudits(clumps,props.description))
}