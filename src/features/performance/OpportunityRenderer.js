
import React from "react"
import DetailsRenderer from "./details-renderer"
function selectClass(score){
    score=parseFloat(score);
    if(score < 0.5) return "lh-audit lh-audit--load-opportunity lh-audit--numeric lh-audit--fail"
    else return "lh-audit lh-audit--load-opportunity lh-audit--numeric lh-audit--average"
}
function getNumeric(value){
    value=(parseFloat(value)/1000).toFixed(2);
    return value;
}
function generateStyle(details,scale){
    const sparklineWidthPct = `${(details.overallSavingsMs / scale) * 100}%`;
    return {width:sparklineWidthPct};
}


export const OpportunityRenderer = (props)=>{
    if(!props.opportunityAudits.length)
    {
        return (
            null
        );
    } 
    const opportunityloader = props.opportunityAudits.map((opportunity)=>(
        <div class={selectClass(opportunity.result.score)}>
        <details class="lh-expandable-details" open="">
        <summary>
          <div class="lh-audit__header lh-expandable-details__summary">
            <div class="lh-load-opportunity__cols">
              <div class="lh-load-opportunity__col lh-load-opportunity__col--one">
                <span class="lh-audit__score-icon"></span>
                <div class="lh-audit__title"><span>{DetailsRenderer.convertMarkdownLinkSnippets(opportunity.result.title)}</span></div>
              </div>
              <div class="lh-load-opportunity__col lh-load-opportunity__col--two">
                <div class="lh-load-opportunity__sparkline" title={opportunity.result.displayValue}>
                  <div class="lh-sparkline"><div class="lh-sparkline__bar" style={generateStyle(opportunity.result.details,props.scale)}></div></div>
                </div>
                <div class="lh-audit__display-text" title={opportunity.result.displayValue}>{getNumeric(opportunity.result.numericValue,props.scale)}</div>
                <div class="lh-chevron-container"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <g class="lh-chevron__lines">
                <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                </g>
                </svg></div>
              </div>
              
            </div>
          </div>
        </summary>
        <table class="lh-table lh-details">
            <thead><tr>{DetailsRenderer.renderTableHeader(opportunity.result.details)}</tr></thead>
            <tbody>{DetailsRenderer.tablerender(opportunity.result.details)}</tbody>
            <tbody></tbody>
        </table>    
        </details>
        </div>
    ))
    return(
        <div class="lh-audit-group lh-audit-group--load-opportunities"><div class="lh-audit-group__header"><span class="lh-audit-group__title">Opportunities</span><span class="lh-audit-group__description">These suggestions can help your page load faster. They don't <a rel="noopener" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=node">directly affect</a> the Performance score.</span></div>
        <div class="lh-load-opportunity__header lh-load-opportunity__cols">
        <div class="lh-load-opportunity__col lh-load-opportunity__col--one">Opportunity</div>
        <div class="lh-load-opportunity__col lh-load-opportunity__col--two">Estimated Savings</div>
        </div>
        {opportunityloader}
        </div>
    );
}