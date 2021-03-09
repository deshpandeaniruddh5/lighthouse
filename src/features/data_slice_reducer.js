import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  lighthouseData : null,
  status : "idle",
  error : null,
}

export const fetchData  = createAsyncThunk("data/fetchData",async()=>{
    const response = await fetch('http://localhost:8000/')
    const result= await response.json()
    return result
})

const dataSlice = createSlice({
    name :"data",
    initialState,
    extraReducers:{
        [fetchData.pending]:(state , action) =>{
            state.status = "loading";
        },
        [fetchData.rejected]:(state, action) => {
            state.status = "failed";
            state.error = action.error.message;
        },
        [fetchData.fulfilled]: (state,action) =>{
            state.status= "succeeded";
            state.lighthouseData = action.payload;
        }
    }
})

export default dataSlice.reducer;
