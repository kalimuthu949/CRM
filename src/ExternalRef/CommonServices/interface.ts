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
}

export interface IBasicDropDown {
  name: string;
}

export interface ICRMProjectsListDrop {
  projectStaus: IBasicDropDown[];
  BillingModel: IBasicDropDown[];
}

export interface IDelModal {
  isOpen: boolean;
  Id: number | null;
}
