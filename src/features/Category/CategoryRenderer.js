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
export class CategoryRenderer extends React.Component{
  render(){

    const currentCategory=this.props.data.auditRefs
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
        <CategoryHeader category={this.props.data}/>
        <RenderFailedClump auditRefs={failed} groups={this.props.categoryGroups}/>
        <RenderOtherClumps clumps = {clumps} groups = {this.props.categoryGroups} description={this.props.data.manualDescription}/>
        </div>    
        </div>
        </React.Fragment>  
    )
  }   
}
