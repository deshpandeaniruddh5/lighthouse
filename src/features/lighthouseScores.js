import React from "react"
import './lighthousescores.css'
export const LighthouseScores = (props) =>{
    const s= parseInt(parseFloat(props.category.score)*100);
    return(
        <React.Fragment>
          <div className="score-container">  
          <div className="scores">
             {s}
          </div>
          <svg>
              <circle cx="70" cy="70" r="50" fill="#cce6ff"></circle>
          </svg>
          <div className="title">
            {props.category.title}
          </div> 
          </div>
        </React.Fragment>
        
    );
}
