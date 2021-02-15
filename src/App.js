import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "./features/dataSlice";
import './App.css'
import {Lighthoseoverview} from "./features/lighouseoverview";
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
    return(
      <div className="grid">
        <Lighthoseoverview categories={data.categories}/>
      </div>
    );
  }
  return (
    <p> Loading </p>
  );
}


export default App;