/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAccountFormPageNavigate,
  IContactFormData,
  // IConfigState,
  // IContactFormData,
  IContactFormPageNavigate,
  IDealsFormData,
  // IDealsFormData,
  IDealsFormPageNavigate,
  IDealsPageNavigate,
  ILeadFormPageNavigate,
  IOpporFormData,
  // IOpporFormData,
  IOpportunityFormPageNavigate,
} from "./ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "./ConfigPageDefaultValue";
// import { useSelector } from "react-redux";
// import { configurationData } from "../App";

// Interfaces
export interface IPageState {
  dealValue: IDealsPageNavigate;
  dealFormValue: IDealsFormPageNavigate;
  opportunityFormValue: IOpportunityFormPageNavigate;
  accountFormValue: IAccountFormPageNavigate;
  contactFormValue: IContactFormPageNavigate;
  leadFormValue: ILeadFormPageNavigate;
}

const configDefaults = ConfigPageDefaultValue();
const _dealValue: IDealsPageNavigate = {
  managerName: {
    name: "",
    code: 0,
    eMail: "",
  },
  pipeLine: "",
  pipeLineValue: configDefaults.choiceEmptyValue,
};
const _dealEmptyData: IDealsFormData = {
  ID: null,
  DealOwner: [],
  DealOwnerId: 0,
  DealName: "",
  Account: { name: "", code: 0 },
  AccountType: "",
  LeadSource: "",
  Contact: [],
  Industry: "",
  Location: "",
  Amount: "",
  ClosingDate: "",
  Stage: { name: "(+)ve Conversation", code: "Default" },
  Probability: "",
  ExpectedRevenue: "",
  CampaignSource: "",
  Country: "",
  PipeLine: "",
  Description: "",
  Lost: { name: "", code: 0 },
  Platform: [],
  OldData: {
    ID: null,
    DealOwner: [],
    DealOwnerId: 0,
    DealName: "",
    Account: { name: "", code: 0 },
    AccountType: "",
    LeadSource: "",
    Contact: [],
    Industry: "",
    Location: "",
    Amount: "",
    ClosingDate: "",
    Stage: { name: "(+)ve Conversation", code: "Default" },
    Probability: "",
    ExpectedRevenue: "",
    CampaignSource: "",
    Country: "",
    PipeLine: "",
    Description: "",
    Lost: { name: "", code: 0 },
    Platform: [],
  },
};
const _dealFormValue: IDealsFormPageNavigate = {
  dealFormData: _dealEmptyData,
  formType: "",
  id: 0,
  pipeLine: configDefaults.choiceEmptyValue,
  stage: configDefaults.choiceEmptyValue,
};
const _opportunityEmptyData: IOpporFormData = {
  ID: null,
  OpportunityName: "",
  OpportunityOwner: [],
  OpportunityOwnerId: 0,
  Stage: "(+)ve Conversation",
  Account: configDefaults.choiceEmptyValue,
  Platform: [],
  EstimatedTime: "",
  AdminWatchList: false,
  Contact: [],
  EstimatedQuote: 0,
  InterventionNeeded: false,
  WinProbability: "",
  Description: "",
  Lost: configDefaults.choiceEmptyValue,
  OldData: {
    ID: null,
    OpportunityName: "",
    OpportunityOwner: [],
    OpportunityOwnerId: 0,
    Stage: "(+)ve Conversation",
    Account: configDefaults.choiceEmptyValue,
    Platform: [],
    EstimatedTime: "",
    AdminWatchList: false,
    Contact: [],
    EstimatedQuote: 0,
    InterventionNeeded: false,
    WinProbability: "",
    Description: "",
    Lost: configDefaults.choiceEmptyValue,
  },
};
const _opportunityFormValue: IOpportunityFormPageNavigate = {
  formShow: configDefaults.formShowEmptyValue,
  formType: "",
  id: 0,
  opportunityFormData: _opportunityEmptyData,
  pipeLineValue: configDefaults.choiceEmptyValue,
  stage: "",
};
const _contactEmptyData: IContactFormData = {
  ID: null,
  ContactOwner: [],
  ContactOwnerId: 0,
  FirstName: "",
  LastName: "",
  Phone: "",
  JobTitle: "",
  Email: "",
  Account: null,
  LeadSource: "",
  AnnualRevenue: "",
  Country: "",
  DateOfBirth: "",
  State: "",
  Description: "",
  OldData: {
    ID: null,
    ContactOwner: [],
    ContactOwnerId: 0,
    FirstName: "",
    LastName: "",
    Phone: "",
    JobTitle: "",
    Email: "",
    Account: null,
    LeadSource: "",
    AnnualRevenue: "0",
    Country: "",
    DateOfBirth: "",
    State: "",
    Description: "",
  },
};
const _conatctFormValue: IContactFormPageNavigate = {
  contactFormData: _contactEmptyData,
  formType: "",
  id: 0,
};

const mainData: IPageState = {
  dealValue: _dealValue,
  dealFormValue: _dealFormValue,
  opportunityFormValue: _opportunityFormValue,
  accountFormValue: configDefaults._accountFormValue,
  contactFormValue: _conatctFormValue,
  leadFormValue: configDefaults._leadFormValue,
};
const PageData = createSlice({
  name: "PageData",
  initialState: mainData,
  reducers: {
    setDealData: (state: any, action: PayloadAction<IDealsPageNavigate>) => {
      state.dealValue = action.payload;
    },
    setDealFormData: (
      state: any,
      action: PayloadAction<IDealsFormPageNavigate>
    ) => {
      state.dealFormValue = action.payload;
    },
    setOpportunityFormData: (
      state: any,
      action: PayloadAction<IOpportunityFormPageNavigate>
    ) => {
      state.opportunityFormValue = action.payload;
    },
    setAccountFormData: (
      state: any,
      action: PayloadAction<IAccountFormPageNavigate>
    ) => {
      state.accountFormValue = action.payload;
    },
    setContactFormData: (
      state: any,
      action: PayloadAction<IContactFormPageNavigate>
    ) => {
      state.contactFormValue = action.payload;
    },
    setLeadFormData: (
      state: any,
      action: PayloadAction<ILeadFormPageNavigate>
    ) => {
      state.leadFormValue = action.payload;
    },
  },
});

export const {
  setDealData,
  setDealFormData,
  setOpportunityFormData,
  setAccountFormData,
  setContactFormData,
  setLeadFormData,
} = PageData.actions;
export default PageData.reducer;
