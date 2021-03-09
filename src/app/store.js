import { configureStore } from '@reduxjs/toolkit'
import dataReducer from "../features/data_slice_reducer"
export default configureStore({
  reducer:{
    data: dataReducer,
  }
})