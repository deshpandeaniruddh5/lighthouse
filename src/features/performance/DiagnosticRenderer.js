import React from "react"
function _getCanonicalizedHeadingsFromTable(tableLike) {
    if (tableLike===undefined) return null;
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

const rowrender=(item,details)=>{
    if(details.type!== "table"){
    return(<td></td>)}
    return (
        details.headings.map((heading)=>{
            if (!heading || !heading.key) {
                return <td className="lh-table-column--empty"></td>
            }
            else{
                const value = item[heading.key];
                let valueElement;
                if (value !== undefined && value !== null && typeof(value)!=="object") {
                valueElement =value
                }
                if (valueElement) {
                    const classes = `lh-table-column--${heading.itemType}`;
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
export const DiagnosticRenderer=(props) =>{
    
    const Diagnosticloader= props.diagnosticAudits.map((diagnostic)=>(
        <div class="lh-audit lh-audit--binary lh-audit--fail" id={diagnostic.result.id}>
        <details class="lh-expandable-details" open="">
        <summary>
        <div class="lh-audit__header lh-expandable-details__summary">
          <span class="lh-audit__score-icon"></span>
          <span class="lh-audit__title-and-text">
            <span class="lh-audit__title"><span>{diagnostic.result.title}</span></span>
            <span class="lh-audit__display-text"></span>
          </span>
          <div class="lh-chevron-container"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <g class="lh-chevron__lines">
            <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
            <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
            </g>
          </svg></div>
        </div>
        </summary>
        <div class="lh-audit__description"><span>{diagnostic.result.description}</span></div>
        <table class="lh-table lh-details">
            <tbody>{tablerender(diagnostic.result.details)}</tbody>
            
        </table>    
</details>
  </div>
    ))
    return(
        <div className="lh-audit-group lh-audit-group--diagnostics">
        <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">Diagnostics</span>
            <span class="lh-audit-group__description">More information about the performance of your application. These numbers don't <a rel="noopener" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=node">directly affect</a> the Performance score.</span>
        </div>
        {Diagnosticloader}
        </div>
    )
}