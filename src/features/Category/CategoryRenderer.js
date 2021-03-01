import React from "react"
import {useSelector} from "react-redux"
import {RenderFailedClump} from "./RenderFailedClump"
import {RenderOtherClumps} from "./RenderOtherClumps"
import {CategoryHeader} from "../performance/CategoryHeader"
import Util from "../performance/utils"
function _auditHasWarning(audit) {
    return Boolean(audit.result.warnings && audit.result.warnings.length);
  }
function _getClumpIdForAuditRef(auditRef) {
    const scoreDisplayMode = auditRef.result.scoreDisplayMode;
    if (scoreDisplayMode === 'manual' || scoreDisplayMode === 'notApplicable') {
      return scoreDisplayMode;
    }

    if (Util.showAsPassed(auditRef.result)) {
      if (_auditHasWarning(auditRef)) {
        return 'warning';
      } else {
        return 'passed';
      }
    } else {
      return 'failed';
    }
  }
export const CategoryRenderer = (props)=>{

    const data = useSelector((state)=>state.data.lighthouseData)
    const clone = (JSON.parse(JSON.stringify(data)))

    for (const category of Object.values(clone.categories)) {
        category.auditRefs.forEach((auditRef) => {
          const result = clone.audits[auditRef.id]
          auditRef.result = result
        })
    } 

    const currentCategory=clone.categories[props.id].auditRefs
    const clumps = new Map()
    clumps.set('failed', [])
    clumps.set('warning', [])
    clumps.set('manual', [])
    clumps.set('passed', [])
    clumps.set('notApplicable', [])
     
    for (const auditRef of currentCategory) {
        const clumpId =_getClumpIdForAuditRef(auditRef)
        const clump = (clumps.get(clumpId))
        clump.push(auditRef)
        clumps.set(clumpId, clump)
    }
    const failed = clumps.get('failed') 
    clumps.delete('failed')
    
    return (
      <React.Fragment>
      
        <div class="lh-category-wrapper">
        <div class="lh-category">
        <CategoryHeader category={data.categories[props.id]}/>

        <RenderFailedClump auditRefs={failed} groups={clone.categoryGroups}/>
        <RenderOtherClumps clumps = {clumps} groups = {clone.categoryGroups} description={clone.categories[props.id].manualDescription}/>
        </div>    
        </div>
        </React.Fragment>  
    )
}
