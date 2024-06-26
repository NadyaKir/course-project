import { combineReducers } from "@reduxjs/toolkit";
import collectionsReducer from "./collectionsSlice";
import authReducer from "./authSlice";
import itemReducer from "./itemSlice";
import tagsReducer from "./tagsSlice";
import searchReducer from "./searchSlice";

const rootReducer = combineReducers({
  collections: collectionsReducer,
  auth: authReducer,
  items: itemReducer,
  tags: tagsReducer,
  search: searchReducer,
});

export default rootReducer;
