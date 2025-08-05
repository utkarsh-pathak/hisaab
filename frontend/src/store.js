// src/store.js
import { configureStore, createSlice } from "@reduxjs/toolkit";

// User slice
const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser: (state, action) => action.payload,
    clearUser: () => null,
  },
});

export const { setUser, clearUser } = userSlice.actions;

// Selected group slice with expenseCreated flag
const selectedGroupSlice = createSlice({
  name: "selectedGroup",
  initialState: {
    group: null,
    expenseCreated: false, // Track if an expense was created
  },
  reducers: {
    setSelectedGroup: (state, action) => {
      state.group = action.payload;
    },
    clearSelectedGroup: (state) => {
      state.group = null;
    },
    setExpenseCreated: (state, action) => {
      state.expenseCreated = action.payload;
    },
  },
});

// Selected friend slice with expenseCreated flag
const selectedFriendSlice = createSlice({
  name: "friend",
  initialState: {
    expenseCreated: false, // Track if an expense was created
  },
  reducers: {
    expenseCreatedForFriend: (state, action) => {
      state.expenseCreated = action.payload;
    },
  },
});

export const { setSelectedGroup, clearSelectedGroup, setExpenseCreated } =
  selectedGroupSlice.actions;

export const { expenseCreatedForFriend } = selectedFriendSlice.actions;

const appContextSlice = createSlice({
  name: "appContext",
  initialState: {
    activeContext: null, // Can be 'Tags', 'Groups', 'Friends', etc.
  },
  reducers: {
    setActiveContext: (state, action) => {
      state.activeContext = action.payload;
    },
  },
});

export const { setActiveContext } = appContextSlice.actions;

// Selected tag slice
const selectedTagSlice = createSlice({
  name: "selectedTag",
  initialState: {
    tag: null,
    expenseCreated: false, // Add expenseCreated flag
  },
  reducers: {
    setSelectedTag: (state, action) => {
      state.tag = action.payload;
    },
    clearSelectedTag: (state) => {
      state.tag = null;
    },
    setExpenseCreatedForTag: (state, action) => {
      state.expenseCreated = action.payload; // Update expenseCreated flag
    },
  },
});

export const { setSelectedTag, clearSelectedTag, setExpenseCreatedForTag } =
  selectedTagSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    selectedGroup: selectedGroupSlice.reducer,
    friend: selectedFriendSlice.reducer,
    appContext: appContextSlice.reducer, // Add appContext reducer,
    selectedTag: selectedTagSlice.reducer,
  },
});

export default store;
