import React from "react"
import {LighthouseScores} from "./lighthouseScores"
export const Lighthoseoverview = (props)=>{
    return(
        <div class="lh-container lh-root lh-vars lh-screenshot-overlay--enabled lh-narrow">
        <div class="lh-header-container">
        <div class="lh-scores-wrapper">
        <div class="lh-scores-container">
        <div class="pyro">
        <div class="before"></div>
        <div class="after"></div>
        </div>
        <div class="lh-scores-header">
        <React.Fragment>
          <LighthouseScores category={props.categories.performance}/>
          <LighthouseScores category={props.categories.accessibility}/>
          <LighthouseScores category={props.categories["best-practices"]}/>
          <LighthouseScores category={props.categories.seo}/>
          <LighthouseScores category={props.categories.pwa}/>
        </React.Fragment>
        </div>
        <div class="lh-scorescale">
        <span class="lh-scorescale-range lh-scorescale-range--fail">0–49</span>
        <span class="lh-scorescale-range lh-scorescale-range--average">50–89</span>
        <span class="lh-scorescale-range lh-scorescale-range--pass">90–100</span>
        </div>
        </div>
        </div>
        </div>
        </div> 
    );
}