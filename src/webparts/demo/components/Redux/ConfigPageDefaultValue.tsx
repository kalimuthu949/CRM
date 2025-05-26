/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useSelector } from "react-redux";
// import { Config } from "../../../../ExternalRef/CommonServices/Config";
import {
  IAllChoiceColumn,
  ILeadFormPageNavigate,
  IAccountFormPageNavigate,
  IDealsPageNavigate,
  IFormShow,
  IManagerChoices,
  IChoice,
} from "./ConfigPageInterfaces";

export const ConfigPageDefaultValue = () => {
  // Choices
  const LeadsStatusOrder: string[] = [
    "Not Contacted",
    "Attempted to Contact",
    "Contacted",
    "Lost Lead",
    "Contact in Future",
  ];
  const LeadsSourceOrder: string[] = [
    "Cold Call",
    "Referral",
    "LinkedIn Ads",
    "Google Ads",
    "Webinars",
  ];
  const StageOrder: string[] = [
    "(+)ve Conversation",
    "Analysis/Figma/Estimation",
    "Quote Submitted",
    "Won",
    "Lost",
  ];
  const PipeLineOrder: string[] = ["Default"];
  const WinProbabilityOrder: string[] = ["Low", "Medium", "High"];
  const choiceEmptyValue: IChoice = { code: 0, name: "" };
  const formShowEmptyValue: IFormShow = {
    add: false,
    delete: false,
    edit: false,
    view: false,
  };
  const dealManagerNameEmptyValue: IManagerChoices = {
    code: 0,
    eMail: "",
    name: "",
  };
  const emptyAllChoices: IAllChoiceColumn = {
    Contact: [],
    AccountType: [],
    Account: [],
    ParentAccount: [],
    Industry: [],
    LeadSource: [],
    PipeLine: [],
    Stage: [],
    CampaignSource: [],
    Lost: [],
    Platform: [],
    JobTitle: [],
    OwnerShip: [],
    Rating: [],
    WinProbability: [],
    LeadStatus: [],
  };

  // Form Page Navigate
  const _dealValue: IDealsPageNavigate = {
    managerName: dealManagerNameEmptyValue,
    pipeLine: "",
    pipeLineValue: choiceEmptyValue,
  };
  const _leadFormValue: ILeadFormPageNavigate = {
    id: 0,
    value: "",
  };
  const _accountFormValue: IAccountFormPageNavigate = {
    id: 0,
    formType: "",
  };

  return {
    LeadsStatusOrder,
    LeadsSourceOrder,
    StageOrder,
    PipeLineOrder,
    WinProbabilityOrder,
    choiceEmptyValue,
    formShowEmptyValue,
    dealManagerNameEmptyValue,
    emptyAllChoices,
    _dealValue,
    _leadFormValue,
    _accountFormValue,
  };
};
