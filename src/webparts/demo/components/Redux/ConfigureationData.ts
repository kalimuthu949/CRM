/* eslint-disable prefer-const */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAllChoiceColumn,
  IConfigState,
  ISiteUsers,
} from "./ConfigPageInterfaces";

// Variables
let _allChoices: IAllChoiceColumn = {
  AccountType: [],
  CampaignSource: [],
  Industry: [],
  JobTitle: [],
  LeadSource: [],
  LeadStatus: [],
  OwnerShip: [],
  PipeLine: [],
  Rating: [],
  Stage: [],
  Platform: [],
  WinProbability: [],
  Lost: [],
  Contact: [],
  Account: [],
  ParentAccount: [],
};

const mainData: IConfigState = {
  context: null,
  allChoicesData: _allChoices,
  siteUsers: [],
  siteManagerUsers: [],
  siteAdminUsers: [],
  isAdmin: false,
  currentUserId: 0,
  currentUserEmail: "",
};

const ConfigureationData = createSlice({
  name: "ConfigureationData",
  initialState: mainData,
  reducers: {
    setMainSPContext: (state: any, action: PayloadAction<any | null>) => {
      state.context = action.payload;
    },
    setMainAllChoicesData: (
      state: any,
      action: PayloadAction<IAllChoiceColumn>
    ) => {
      state.allChoicesData = action.payload;
    },
    setMainSiteUsers: (
      state: any,
      action: PayloadAction<ISiteUsers[] | null>
    ) => {
      state.siteUsers = action.payload;
    },
    setMainSiteManagerUsers: (
      state: any,
      action: PayloadAction<ISiteUsers[] | null>
    ) => {
      state.siteManagerUsers = action.payload;
    },
    setMainSiteAdminUsers: (
      state: any,
      action: PayloadAction<ISiteUsers[] | null>
    ) => {
      state.siteAdminUsers = action.payload;
    },
    setMainIsAdmin: (state: any, action: PayloadAction<any | null>) => {
      state.isAdmin = action.payload;
    },
    setCurrentUserId: (state: any, action: PayloadAction<number>) => {
      state.currentUserId = action.payload;
    },
    setCurrentUserEmail: (state: any, action: PayloadAction<string>) => {
      state.currentUserEmail = action.payload;
    },
  },
});

export const {
  setMainSPContext,
  setMainAllChoicesData,
  setMainSiteUsers,
  setMainSiteManagerUsers,
  setMainSiteAdminUsers,
  setMainIsAdmin,
  setCurrentUserId,
  setCurrentUserEmail,
} = ConfigureationData.actions;
export default ConfigureationData.reducer;
