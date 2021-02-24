import React from "react"
import Util from "../performance/utils"
import DetailsRenderer from "../performance/details-renderer"
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
  function getValueType(heading){
    const valueType = heading.valueType || 'text';
    const classes = `lh-table-column--${valueType}`;
    return classes;
  }
  function renderTableHeader(details){
    if(!details) return null
    if(details.type!== "table"){
      return null}
    const headings = DetailsRenderer._getCanonicalizedHeadingsFromTable(details);
    return headings.map((heading)=>(
        <th class={getValueType(heading)}><div class="lh-text">{heading.label}</div></th>
    ))
  
  }
  const rowrender=(item,details)=>{
      const headings=DetailsRenderer._getCanonicalizedHeadingsFromTable(details);
      if(details.type!== "table"){
      return null}
      return (
          headings.map((heading)=>{
              if (!heading || !heading.key) {
                  return <td className="lh-table-column--empty"></td>
              }
              else{
                  const value = item[heading.key];
                  let valueElement;
                  if (value !== undefined && value !== null) {
                    console.log(value)
                  valueElement = DetailsRenderer._renderTableValue(value, heading)
                  }
                  if (valueElement) {
                      const classes = `lh-table-column--${heading.valueType}`;
                      return (<td className={classes}>
                          {valueElement}
                      </td>)
                    } else {
  
                      return(<td className="lh-table-column--empty"></td>)
                    }
              }
          })
      )
  }
  const tablerender=(details)=>{
      if(!details) return null;
      if(details.type!=='table') return null
      if(!details.items){
          return (null);
      }
      if (details.items.length===0){
          return (null);
      }
      return (details.items.map((item)=>(
          <tr>{rowrender(item,details)}</tr>
      )))
  } 
const renderAudit = (audit)=>{
    console.log(tablerender(audit.result.details));
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
            <table class="lh-table lh-details">

            <thead><tr>{renderTableHeader(audit.result.details)}</tr></thead>
            <tbody>{tablerender(audit.result.details)}</tbody>
            
            </table>    
            </details>
            </div>
    )
}
const renderGroupAudits = (grouped,groups)=>{
    const failedAuditsGroups = []
    for (const [groupId, groupAuditRefs] of grouped){
        const failedAuditsGroup=groupAuditRefs.map((audit)=>renderAudit(audit))
        failedAuditsGroups.push(
            <div className="lh-audit-group lh-audit-group--diagnostics">
            <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">{groups[groupId].title}</span>
            <span class="lh-audit-group__description">{groups[groupId].description}</span>
            </div>
            {failedAuditsGroup}
            </div>
        )
    }
    return failedAuditsGroups
}
export const  RenderFailedClump = (props)=>{
    const grouped = new Map();

    // Add audits without a group first so they will appear first.
    const notAGroup = 'NotAGroup';
    grouped.set(notAGroup, []);

    for(const auditRef of props.auditRefs) {
      const groupId = auditRef.group || notAGroup;
      const groupAuditRefs = grouped.get(groupId) || [];
      groupAuditRefs.push(auditRef);
      grouped.set(groupId, groupAuditRefs);
    }
    const failedNoGroupAudits = grouped.get(notAGroup);
    grouped.delete(notAGroup);
    const renderNoGroupAudits = failedNoGroupAudits.map((audit)=>(renderAudit(audit)))
    

    
    return (
        <div className="lh-clump--failed">
            {renderNoGroupAudits}
            {renderGroupAudits(grouped,props.groups,)}
        </div>
    )
}