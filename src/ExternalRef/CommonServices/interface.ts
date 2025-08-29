//peoplePicker interface:
export interface IPeoplePickerDetails {
  id: number;
  name: string;
  email: string;
}

//ProjectDatas Interface:
export interface IProjectData {
  ID: number;
  ProjectID: string;
  Lead: string;
  LeadId: number;
  AccountName: string;
  ProjectName: string;
  StartDate: string;
  PlannedEndDate: string;
  ProjectManager: IPeoplePickerDetails[];
  ProjectStatus: string;
  BillingModel: string;
  IsApproved: boolean;
  IsProjectManager: boolean;
  BillingContactName: string;
  BillingContactEmail: string;
  BillingContactMobile: string;
  BillingAddress: string;
  Remarks: string;
}

export interface IBasicDropDown {
  name: string;
}

export interface ICRMProjectsListDrop {
  projectStaus: IBasicDropDown[];
  BillingModel: IBasicDropDown[];
}

export interface ICRMBillingsListDrop {
  Status: IBasicDropDown[];
  Currency: IBasicDropDown[];
  BillingFrequency: IBasicDropDown[];
}

export interface IDelModal {
  isOpen: boolean;
  Id: number | null;
}

//CRMBillings List Interface:
export interface IBillingsDetails {
  ID: number;
  MileStoneName: string;
  MileStoneDescription: string;
  DueDate: string;
  Amount: null;
  Status: string;
  ReminderDaysBeforeDue: string;
  Notes: string;
  Currency: string;
  MonthlyAmount: number;
  StartMonth: string;
  EndMonth: string;
  BillingFrequency: string;
  ResourceType: string;
  Rate: number;
  ProjectId: number;
}
