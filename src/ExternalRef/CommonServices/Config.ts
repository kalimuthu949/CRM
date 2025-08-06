/* eslint-disable prefer-const */
import {
  IDatePickerStyles,
  IPeoplePickerItemSelectedStyles,
} from "@fluentui/react";
import { ICRMProjectsListDrop } from "./interface";
import { IModalStyles } from "office-ui-fabric-react";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Config {
  export const ListNames: IList = {
    CRMAccounts: "CRMAccounts",
    CRMContacts: "CRMContacts",
    CRMDeals: "CRMDeals",
    CRMLeads: "CRMLeads",
    CRMProjects: "CRMProjects",
    DealsKanbanOrder: "DealsKanbanOrder",
    PipeLineConfig: "PipeLineConfig",
    PMOpportunity: "PMOpportunity",
  };
  export const CRMOwners: string = "Admins";
  export const CRMManagersGroup: string = "Managers";
  export const PagenationShow: number = 8;

  //CRMProjects List DropDown:
  export const CRMProjectsDropDown: ICRMProjectsListDrop = {
    projectStaus: [],
    BillingModel: [],
  };

  //Modal popup Style:
  export const delModalStyle: Partial<IModalStyles> = {
    main: {
      minHeight: "150px",
      width: "25%",
      padding: "20px",
    },
  };
}

//DatePicker Styles:
export const DatePickerStyles: Partial<IDatePickerStyles> = {
  root: {
    ".ms-TextField-wrapper": {
      ".ms-TextField-fieldGroup": {
        border: "1px solid #00a99d",
        borderRadius: "6px",
        i: {
          color: "#00a99d !important",
        },
        "::after": {
          border: "none !important",
        },
        ".ms-TextField-field": {
          fontSize: "12px !important",
        },
      },
    },
  },
  callout: {
    ".ms-CalendarDay-dayIsToday": {
      backgroundColor: "#00a99d !important",
    },
  },
};

//PeoplePicker Styles:
export const peoplePickerStyles: Partial<IPeoplePickerItemSelectedStyles> = {
  root: {
    border: "1px solid #00A99D",
    borderRadius: "6px",
    outline: "none !important",
    borderLeftWidth: "3.5px",
    borderLeftColor: "#ff0000",
    fontSize: "12px !important",
    ".ms-BasePicker-text": {
      borderColor: "transparent !important",
      backgroundColor: "#fff !important",
      borderRadius: "6px !important",
      "::after": {
        border: "none !important",
        background: "rgb(255 255 255 / 0%)",
      },
      ".ms-BasePicker-input": {
        background: "#fff !important",
      },
      ".ms-Persona-primaryText": {
        color: "#000 !important",
        fontWeight: "400 !important",
        fontSize: "12px !important",
      },
    },
    ".ms-PickerPersona-container.is-selected": {
      background: "#00A99D !important",
    },
  },
};

//PeoplePicker Error Design:
export const peopleErrorPickerStyles: Partial<IPeoplePickerItemSelectedStyles> =
  {
    root: {
      border: "2px solid #ff0000",
      borderRadius: "6px",
      outline: "none !important",
      ".ms-BasePicker-text": {
        borderColor: "transparent !important",
        "::after": {
          border: "none !important",
        },
        ".ms-BasePicker-input": {
          background: "#fff !important",
        },
      },
    },
  };
