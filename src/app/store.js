// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/seed/seedSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // add more slices here
  },
  // devTools is enabled by default in development
});

export default store;
