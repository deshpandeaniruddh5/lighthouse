import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "./features/dataSlice";
import './App.css'
import {Lighthoseoverview} from "./features/lighouseoverview";
import {PerformanceRender} from "./features/performance/PerformanceRender";
import {AccessibilityRenderer} from "./features/Accessibility/AccessibilityRenderer"
import ReportViewer from "react-lighthouse-viewer"
import Util from "./features/performance/utils"
import I18n from "./features/performance/i18n"
function App(){
  const dispatch = useDispatch();
  const data = useSelector((state)=> state.data.lighthouseData);
  
  const dataStatus = useSelector((state)=> state.data.status);
  useEffect(()=>{
    if( dataStatus === "idle"){
      dispatch(fetchData());
    }
  },[dataStatus, dispatch]);
  if(dataStatus === "succeeded"){
    const report = Util.prepareReportResult(data);
    const i18n = new I18n(report.configSettings.locale, {
      ...Util.UIStrings,
      ...report.i18n.rendererFormattedStrings,
    });
    Util.i18n = i18n;
    Util.reportJson = report; 
    return(
      <React.Fragment>
        
        <div class="lh-container lh-root lh-vars lh-screenshot-overlay--enabled lh-narrow">  
        <div class="lh-container">
        <div class="lh-report">       
        <Lighthoseoverview categories={data.categories}/>
        <div class="lh-categories">
          
          <PerformanceRender/>
          <AccessibilityRenderer id={data.categories.accessibility.id}/>
          <AccessibilityRenderer id={data.categories.seo.id}/>
          <AccessibilityRenderer id="best-practices"/>
        </div>
        </div>
        </div>
        </div>  
      </React.Fragment>
      
    );
  }
  return (
    <p> Loading </p>
  );
}


export default App;