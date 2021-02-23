
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
function getValueType(heading){
    const valueType = heading.valueType || 'text';
    const classes = `lh-table-column--${valueType}`;
    return classes;
}
function renderTableHeader(details){
    const headings = _getCanonicalizedHeadingsFromTable(details);
    return headings.map((heading)=>(
        <th class={getValueType(heading)}><div class="lh-text">{heading.label}</div></th>
    ))

}
function getClassName(valueType){
    if(valueType==="url"){
        return "lh-table-column--url";
    }
    else if(valueType==="bytes"){
        return "lh-table-column--bytes";
    }
    else return null;
}
const rowrender=(item,details)=>{
  const headings=_getCanonicalizedHeadingsFromTable(details);
  
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
function _getCanonicalizedHeadingsFromTable(tableLike) {
    if (tableLike.type === 'opportunity') {
      return tableLike.headings;
    }

    return tableLike.headings.map((heading) =>
      _getCanonicalizedHeading(heading)
    );
}
function _getCanonicalizedHeading(heading) {
    let subItemsHeading;
    if (heading.subItemsHeading) {
      subItemsHeading = _getCanonicalizedsubItemsHeading(
        heading.subItemsHeading,
        heading
      );
    }

    return {
      key: heading.key,
      valueType: heading.itemType,
      subItemsHeading,
      label: heading.text,
      displayUnit: heading.displayUnit,
      granularity: heading.granularity,
    };
}
function _getCanonicalizedsubItemsHeading(subItemsHeading, parentHeading) {
    // Low-friction way to prevent commiting a falsy key (which is never allowed for
    // a subItemsHeading) from passing in CI.
    if (!subItemsHeading.key) {
      // eslint-disable-next-line no-console
      console.warn('key should not be null');
    }

    return {
      key: subItemsHeading.key || '',
      valueType: subItemsHeading.itemType || parentHeading.itemType,
      granularity: subItemsHeading.granularity || parentHeading.granularity,
      displayUnit: subItemsHeading.displayUnit || parentHeading.displayUnit,
    };
}

export const OpportunityRenderer = (props)=>{
    if(!props.opportunityAudits.length)
    {
        return (
            <div></div>
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
                <div class="lh-audit__title"><span>{opportunity.result.title}</span></div>
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
            <thead><tr>{renderTableHeader(opportunity.result.details)}</tr></thead>
            <tbody>{tablerender(opportunity.result.details)}</tbody>
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