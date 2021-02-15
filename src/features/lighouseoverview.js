import React from "react"
import {LighthouseScores} from "./lighthouseScores"
export const Lighthoseoverview = (props)=>{
    return(
        <React.Fragment>
          <LighthouseScores category={props.categories.performance}/>
          <LighthouseScores category={props.categories.accessibility}/>
          <LighthouseScores category={props.categories["best-practices"]}/>
          <LighthouseScores category={props.categories.seo}/>
          <LighthouseScores category={props.categories.pwa} />
        </React.Fragment>
    );
}