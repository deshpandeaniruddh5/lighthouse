import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { fetchData } from "./features/data_slice_reducer"
import './App.css'
import {Lighthoseoverview} from "./features/lighouseoverview"
import {PerformanceRender} from "./features/performance/PerformanceRender"
import {CategoryRenderer} from "./features/Category/CategoryRenderer"
import Util from "./features/performance/utils"
import I18n from "./features/performance/i18n"
import {PwaRenderer} from "./features/Pwa/PwaRenderer"
import ReportViewer from 'react-lighthouse-viewer';
const renderList = (report) =>{
  const li= []
  const envValues = Util.getEnvironmentDisplayValues(
    report.configSettings || {}
  );
  [
    {
      name: Util.i18n.strings.runtimeSettingsUrl,
      description: report.finalUrl,
    },
    {
      name: Util.i18n.strings.runtimeSettingsFetchTime,
      description: Util.i18n.formatDateTime(report.fetchTime),
    },
    ...envValues,
    {
      name: Util.i18n.strings.runtimeSettingsChannel,
      description: report.configSettings.channel,
    },
    {
      name: Util.i18n.strings.runtimeSettingsUA,
      description: report.userAgent,
    },
    {
      name: Util.i18n.strings.runtimeSettingsUANetwork,
      description: report.environment && report.environment.networkUserAgent,
    },
    {
      name: Util.i18n.strings.runtimeSettingsBenchmark,
      description:
        report.environment && report.environment.benchmarkIndex.toFixed(0),
    },
  ].forEach((runtime) => {
    if (!runtime.description) return
    li.push(
      <li className="lh-env__item">
        <span className="lh-env__name">{runtime.name}</span>
        <span className="lh-env__description">{runtime.description}</span>
      </li>
    )
  })
  return li
}
function App(){
  const dispatch = useDispatch();
  const data = useSelector( ( state )=> state.data.lighthouseData )
  
  const dataStatus = useSelector( ( state ) => state.data.status )
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
      <ReportViewer json={data}/>
      <div class="lh-container lh-root lh-vars lh-screenshot-overlay--enabled lh-narrow">  
      <div class="lh-container">
      <div class="lh-report">       
      <Lighthoseoverview categories={data.categories}/>
      <div class="lh-categories">
        
        <PerformanceRender/>
        <CategoryRenderer id={data.categories.accessibility.id}/>
        <CategoryRenderer id={data.categories.seo.id}/>
        <CategoryRenderer id="best-practices"/>
        <PwaRenderer/>
      </div>
      <footer className="lh-footer">
        <div className="lh-env">
          <div className="lh-env__title">Runtime Settings</div>
          <ul className="lh-env__items" id="runtime-settings">
            {renderList(report)}
          </ul>
        </div>
      </footer>
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