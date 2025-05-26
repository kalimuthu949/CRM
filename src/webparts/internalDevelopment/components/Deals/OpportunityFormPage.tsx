/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-key */
/* eslint-disable no-self-assign */
/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import styles from "./DealsFormPage.module.scss";
import {
  Icon,
  IModalStyles,
  IPeoplePickerItemSelectedStyles,
  IPersonaProps,
  ITextFieldStyles,
  Modal,
  PrimaryButton,
  TextField,
} from "@fluentui/react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { useEffect, useState } from "react";
import Loading from "../../../../ExternalRef/Loader/Loading";
import { Config } from "../../../../ExternalRef/CommonServices/Config";
import { InputText } from "primereact/inputtext";
import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";
import { InputTextarea } from "primereact/inputtextarea";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import {
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  IContactFormData,
  IContactFormPageNavigate,
  IFormShow,
  IOpporFormData,
  IOpportunityFormPageNavigate,
} from "../Redux/ConfigPageInterfaces";
import { useDispatch, useSelector } from "react-redux";
import { setMainAllChoicesData } from "../Redux/ConfigureationData";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { setContactFormData, setOpportunityFormData } from "../Redux/PageData";

// Interfaces
interface IInterventionModal {
  isOpen: boolean;
  IfNeeded: boolean;
  value: string;
}
interface IPlatformChoiceModal {
  isOpen: boolean;
  Platforms: IChoice[];
}
interface IResponse {
  OpportunityOwnerId: number;
  AccountId: number | null;
  OpportunityName: string;
  Stage: string;
  EstimatedQuote: number;
  EstimatedTime: string;
  WinProbability: string;
  Lost: string;
  InterventionNeeded: boolean;
  AdminWatchList: boolean;
  Platform: {
    results: string[];
  };
  Description: string;
  ContactsId: {
    results: number[];
  };
}
interface IAccountData {
  ID: number;
  AccountName: string;
  Contact: IChoice[];
}
interface IProps {
  Notify: (
    type: "info" | "success" | "warn" | "error" | "secondary" | "contrast",
    summary: string,
    msg: string
  ) => void;
  spfxContext: any;
  pageName: string;
  PageNavigation: (pageName: string) => void;
}

// Global Variables
let Managers: string = "";

const OpportunityFormPage = (props: IProps) => {
  // Styles Variables
  const peoplePickerStyles: Partial<IPeoplePickerItemSelectedStyles> = {
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
  const peopleErrorPickerStyles: Partial<IPeoplePickerItemSelectedStyles> = {
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
  const peoplePickerDisabledStyles: Partial<IPeoplePickerItemSelectedStyles> = {
    root: {
      border: "1px solid #afafaf",
      borderRadius: "6px",
      outline: "none !important",
      borderLeftWidth: "4px",
      borderLeftColor: "#ff0000",
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
        },
      },
    },
  };
  const delModalStyle: Partial<IModalStyles> = {
    main: {
      minHeight: "130px",
      width: "25%",
      padding: "20px",
    },
  };
  const lModalStyle: Partial<IModalStyles> = {
    main: {
      minHeight: "150px",
      width: "25%",
      padding: "20px",
      borderRadius: "6px",
    },
  };
  const TextFieldsPipeLineChoiceStyles: Partial<ITextFieldStyles> = {
    root: {
      ".ms-TextField-wrapper": {
        ".ms-TextField-fieldGroup": {
          borderColor: "#00A99D !important",
          border: "1px solid #00A99D",
          borderRadius: "6px !important",
          height: "32px",
          minHeight: "30px",
          "::after": {
            border: "none !important",
          },
        },
      },
      label: {
        color: "#000 !important",
      },
      input: {
        color: "#000",
        fontWeight: "400",
        borderRadius: "6px",
      },
      i: {
        color: "#00A99D !important",
      },
    },
  };
  const TextFieldsPipeLineChoiceRequiredStyles: Partial<ITextFieldStyles> = {
    root: {
      ".ms-TextField-wrapper": {
        ".ms-TextField-fieldGroup": {
          borderColor: "#ff0000 !important",
          border: "2px solid #00A99D",
          borderRadius: "6px !important",
          height: "32px",
          minHeight: "30px",
          "::after": {
            border: "none !important",
          },
        },
      },
      label: {
        color: "#000 !important",
      },
      input: {
        color: "#000",
        fontWeight: "400",
        borderRadius: "6px",
      },
      i: {
        color: "#00A99D !important",
      },
    },
  };

  // Local Variables
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const opportunityFormNavigateValue: IOpportunityFormPageNavigate =
    useSelector((state: any) => state.PageData.opportunityFormValue);
  let _platformChoiceAdd: IPlatformChoiceModal = {
    isOpen: false,
    Platforms: [{ name: "", code: 0 }],
  };
  const configDefaults = ConfigPageDefaultValue();
  const _opportunityEmptyData: IOpporFormData = {
    ID: null,
    OpportunityName: "",
    OpportunityOwner: [ConfigureationData.currentUserEmail],
    OpportunityOwnerId: ConfigureationData.currentUserId,
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
      OpportunityOwner: [ConfigureationData.currentUserEmail],
      OpportunityOwnerId: ConfigureationData.currentUserId,
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
  const _contactEmptyData: IContactFormData = {
    ID: null,
    ContactOwner: [ConfigureationData.currentUserEmail],
    ContactOwnerId: ConfigureationData.currentUserId,
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
      ContactOwner: [ConfigureationData.currentUserEmail],
      ContactOwnerId: ConfigureationData.currentUserId,
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

  // States Variables
  const [selectedData, setSelectedData] = useState<IOpporFormData>(
    _opportunityEmptyData
  );
  const [accountData, setAccountData] = useState<IAccountData[]>([]);
  const [configAllChoices, setConfigAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [onChangeAllChoices, setOnChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [platformChoiceAdd, setPlatformChoiceAdd] =
    useState<IPlatformChoiceModal>({
      ..._platformChoiceAdd,
    });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [formShow, setFormShow] = useState<IFormShow>(
    configDefaults.formShowEmptyValue
  );
  const [dataChange, setDataChange] = useState<boolean>(false);
  const [interventionModel, setInterventionModel] =
    useState<IInterventionModal>({
      IfNeeded: false,
      isOpen: false,
      value: "",
    });

  // All Functions
  const GetAccountsData = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMAccounts,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then(async (_accountData: any[]) => {
        let _tempAccountData: IAccountData[] = [];

        if (_accountData.length) {
          for (let i = 0; i < _accountData.length; i++) {
            let item = _accountData[i];
            let _tempContactName: IChoice[] = [];

            for (let j = 0; j < item.ContactId.length; j++) {
              let contactId: number = item.ContactId[j];

              const contactData: any = await SPServices.SPReadItemUsingId({
                Listname: Config.ListNames.CRMContacts,
                SelectedId: contactId,
              });

              if (contactData) {
                let _fullName: string = `${contactData.FirstName} ${contactData?.LastName}`;

                _tempContactName.push({
                  code: contactData.Id,
                  name: _fullName,
                });
              }
            }

            _tempAccountData.push({
              ID: item.ID ? item.ID : null,
              AccountName: item.AccountName ? item.AccountName : "",
              Contact: _tempContactName,
            });

            if (_accountData.length - 1 == i) {
              setAccountData([..._tempAccountData]);
              GetContactChoice();
            }
          }
        } else {
          GetContactChoice();
        }
      })
      .catch((err: any) => ErrorFunction(err, "Account data get error"));
  };

  const GetContactChoice = async () => {
    try {
      const AllChoicesList: IAllChoiceColumn = {
        ...ConfigureationData.allChoicesData,
        Stage: ConfigureationData.allChoicesData.Stage.filter(
          (e) => e.code === Managers
        ),
        Contact: [],
        Account: [],
      };

      // Fetch Contacts
      const contacts: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMContacts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      if (contacts.length) {
        AllChoicesList.Contact = contacts.map((item) => {
          const fullName = `${item.FirstName || ""} ${
            item.LastName || ""
          }`.trim();
          return {
            code: item.Id,
            name: fullName,
          };
        });
      }

      // Fetch Accounts
      const accounts: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMAccounts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      if (accounts.length) {
        AllChoicesList.Account = accounts.map((item) => ({
          code: item.Id,
          name: item.AccountName,
        }));
      }

      // Set state updates
      setConfigAllChoices(AllChoicesList);
      setOnChangeAllChoices(AllChoicesList);
      setAllChoices(AllChoicesList);

      const { formType, id, opportunityFormData, stage } =
        opportunityFormNavigateValue;

      if (formType === "DealPMViewForm" || formType === "DealPMEditForm") {
        GetAllData(id);
      } else {
        if (
          formType === "OppF-CF-AccF-CF-OppF" ||
          formType === "OppF-CF-OppF"
        ) {
          setSelectedData(opportunityFormData);
        } else {
          setSelectedData({
            ..._opportunityEmptyData,
            Stage: stage,
          });
        }

        setFormShow({ add: true, view: false, edit: false, delete: false });
        setLoader(false);
      }
    } catch (err) {
      ErrorFunction(err, "Error fetching contact/account choices");
    }
  };

  const GetAllData = async (ID: number) => {
    await SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.PMOpportunity,
      SelectedId: ID,
      Select: "*,OpportunityOwner/EMail,Account/AccountName",
      Expand: "OpportunityOwner,Account",
    })
      .then(async (item: any) => {
        if (item) {
          let _tempContactNameChoice: IChoice[] = [];

          // Fetch Account Details:
          const accountResponse = await SPServices.SPReadItems({
            Listname: Config.ListNames.CRMAccounts,
            Select: "*",
            Filter: [
              {
                FilterKey: "ID",
                Operator: "eq",
                FilterValue: item?.AccountId,
              },
            ],
            Topcount: 1,
          });

          let accountName = "";
          if (accountResponse?.length) {
            accountResponse.forEach((items: any) => {
              accountName = items?.AccountName;
            });
          }

          // Contact Lookup
          if (item.ContactsId.length) {
            for (let i = 0; i < item.ContactsId.length; i++) {
              await SPServices.SPReadItemUsingId({
                Listname: Config.ListNames.CRMContacts,
                SelectedId: item.ContactsId[i],
              })
                .then(async (_contacts: any) => {
                  let _firstName: string = _contacts.FirstName
                    ? _contacts.FirstName
                    : "";
                  let _lastName: string = _contacts.LastName
                    ? _contacts.LastName
                    : "";
                  let FullName: string = `${_firstName} ${_lastName}`;

                  _tempContactNameChoice.push({
                    code: _contacts.Id,
                    name: FullName,
                  });
                })
                .catch((err: any) => {
                  ErrorFunction(err, "Deal Lookup contact data get error");
                });
            }
          }

          let _platform: IChoice[] = item.Platform
            ? item.Platform.map((e) => {
                return { name: e, code: e };
              })
            : [];

          await setSelectedData({
            ID: item.ID ? item.ID : null,
            OpportunityName: item.OpportunityName ? item.OpportunityName : "",
            OpportunityOwner: item.OpportunityOwner
              ? [item.OpportunityOwner.EMail]
              : [],
            OpportunityOwnerId: item.OpportunityOwnerId
              ? item.OpportunityOwnerId
              : null,
            EstimatedQuote: item.EstimatedQuote ? item.EstimatedQuote : 0,
            WinProbability: item.WinProbability ? item.WinProbability : "",
            Stage: item.Stage ? item.Stage : "",
            Contact: item.ContactsId ? _tempContactNameChoice : [],
            AdminWatchList: item.AdminWatchList ? item.AdminWatchList : false,
            InterventionNeeded: item.InterventionNeeded
              ? item.InterventionNeeded
              : false,
            Account: item.AccountId
              ? {
                  name: accountName,
                  code: item.AccountId,
                }
              : configDefaults.choiceEmptyValue,
            Description: item.Description ? item.Description : "",
            EstimatedTime: item.EstimatedTime ? item.EstimatedTime : "",
            Platform: item.Platform ? _platform : [],
            Lost: item.Lost
              ? { name: item.Lost, code: item.Lost }
              : { code: 0, name: "" },
            OldData: {
              ID: item.ID ? item.ID : null,
              OpportunityName: item.OpportunityName ? item.OpportunityName : "",
              OpportunityOwner: item.OpportunityOwner
                ? [item.OpportunityOwner.EMail]
                : [],
              OpportunityOwnerId: item.OpportunityOwnerId
                ? item.OpportunityOwnerId
                : null,
              EstimatedQuote: item.EstimatedQuote ? item.EstimatedQuote : 0,
              WinProbability: item.WinProbability ? item.WinProbability : "",
              Stage: item.Stage ? item.Stage : "",
              Contact: item.ContactsId ? _tempContactNameChoice : [],
              AdminWatchList: item.AdminWatchList ? item.AdminWatchList : false,
              InterventionNeeded: item.InterventionNeeded
                ? item.InterventionNeeded
                : false,
              Account: item.AccountId
                ? {
                    name: item.Account.AccountName,
                    code: item.AccountId,
                  }
                : configDefaults.choiceEmptyValue,
              Description: item.Description ? item.Description : "",
              EstimatedTime: item.EstimatedTime ? item.EstimatedTime : "",
              Platform: item.Platform ? _platform : [],
              Lost: item.Lost
                ? { name: item.Lost, code: item.Lost }
                : configDefaults.choiceEmptyValue,
            },
          });
          setFormShow({
            view: true,
            add: false,
            edit: false,
            delete: false,
          });
          setLoader(false);
        } else {
          setFormShow({
            view: true,
            add: false,
            edit: false,
            delete: false,
          });
          setSelectedData(_opportunityEmptyData);
          setLoader(false);
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Deal data error");
      });
  };

  const OnChange = (field: string, value: any) => {
    const updatedData = { ...selectedData };
    const updatedChoices = { ...onChangeAllChoices };

    if (field === "OpportunityOwner") {
      updatedData.OpportunityOwner = value?.length
        ? [value[0]?.secondaryText]
        : [];
      updatedData.OpportunityOwnerId = value?.length ? value[0]?.id : null;
    } else if (field === "Account") {
      const accountObj = updatedData[field] ?? { name: "", code: 0 };
      updatedData[field] = { ...accountObj, name: value };

      const matchedAccount = updatedChoices.Account.find((acc) =>
        acc.name.toLowerCase().includes(value?.toLowerCase())
      );

      if (matchedAccount) {
        updatedData[field].code = matchedAccount.code;
        updatedData.Contact =
          accountData.find((acc) => acc.ID === matchedAccount.code)?.Contact ||
          [];
      } else {
        updatedData[field].code = 0;
        updatedData.Contact = [];
      }
    } else {
      updatedData[field] = value;
    }

    setOnChangeAllChoices(updatedChoices);
    setAllChoices(updatedChoices);
    setSelectedData(updatedData);

    // Perform data change check
    if (["DealPMEditForm"].includes(opportunityFormNavigateValue.formType)) {
      const old = selectedData?.OldData;

      const platformMatch = (a: any[], b: any[]) =>
        JSON.stringify((a || []).map((e) => e?.name?.trim()).sort()) ===
        JSON.stringify((b || []).map((e) => e?.name?.trim()).sort());

      const contactMatch = (a: any[], b: any[]) =>
        a?.length === b?.length &&
        a?.every((item, i) => item?.code === b?.[i]?.code);

      const isUnchanged =
        updatedData?.Account?.code === old?.Account?.code &&
        contactMatch(updatedData?.Contact, old?.Contact) &&
        updatedData?.OpportunityName?.trim() === old?.OpportunityName?.trim() &&
        updatedData?.OpportunityOwnerId === old?.OpportunityOwnerId &&
        updatedData?.Description?.trim() === old?.Description?.trim() &&
        updatedData?.EstimatedQuote === old?.EstimatedQuote &&
        updatedData?.WinProbability === old?.WinProbability &&
        updatedData?.Stage?.trim() === old?.Stage?.trim() &&
        platformMatch(updatedData?.Platform, old?.Platform) &&
        updatedData?.EstimatedTime?.trim() === old?.EstimatedTime?.trim();

      setDataChange(!isUnchanged);
    }
  };

  const formatNumberWithCommas = (value: number | string) => {
    const numberValue =
      typeof value == "string" ? Number(value.replace(/,/g, "")) : value;
    return new Intl.NumberFormat("en-IN").format(Number(numberValue));
  };

  const searchItems = (event: AutoCompleteCompleteEvent, choice: string) => {
    let query = event.query.trim();
    let originalChoices = [...onChangeAllChoices[choice]];
    let _filteredItems: typeof originalChoices = [];

    if (!query.length) {
      _filteredItems = onChangeAllChoices[choice];
    } else {
      for (let i = 0; i < originalChoices.length; i++) {
        let item = originalChoices[i];
        if (item.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
          _filteredItems.push(item);
        }
      }
    }

    if (_filteredItems.length) {
      setAllChoices((pre) => ({
        ...pre,
        [choice]: [..._filteredItems],
      }));
    }
  };

  const Validation = (savePage: string) => {
    let errorMsg: string = "";

    if (selectedData.OpportunityOwner.length == 0) {
      errorMsg = "OpportunityOwner";
    } else if (selectedData.OpportunityName.trim() == "") {
      errorMsg = "OpportunityName";
    } else if (!selectedData.Account?.code) {
      errorMsg = "Account";
    } else if (selectedData.Stage.trim() == "" || selectedData.Stage == null) {
      errorMsg = "Stage";
    } else if (
      selectedData.Platform.map((e) => e.name?.trim()).filter(Boolean)
        .length === 0
    ) {
      errorMsg = "Platform";
    } else if (selectedData.Stage == "Lost" && selectedData.Lost.name == "") {
      errorMsg = "Lost";
    }

    setErrorMessage(errorMsg);

    if (!errorMsg) {
      if (selectedData.Stage == "Analysis/Figma/Estimation") {
        setInterventionModel({
          IfNeeded: false,
          isOpen: true,
          value: savePage,
        });
      } else {
        setLoader(true);
        DataStore(savePage);
      }
    }
  };

  const DataStore = async (savePage: string) => {
    const cleanNumber = (value: any) =>
      value ? Number(value.toString().replace(/,/g, "")) : 0;

    const getTrimmedStage = () => {
      const stage = configAllChoices.Stage.find(
        (s) => s.name.trim() === selectedData.Stage.trim()
      );
      return stage?.name.trim() || "";
    };

    const buildJsonPayload = (): IResponse => ({
      OpportunityOwnerId: selectedData.OpportunityOwnerId,
      AccountId: selectedData.Account?.code ?? null,
      OpportunityName: selectedData.OpportunityName,
      EstimatedQuote: cleanNumber(selectedData.EstimatedQuote),
      EstimatedTime: selectedData.EstimatedTime || "0",
      WinProbability: selectedData.WinProbability,
      Stage: getTrimmedStage(),
      Description: selectedData.Description,
      AdminWatchList: false,
      InterventionNeeded: selectedData.InterventionNeeded,
      Platform: {
        results: selectedData.Platform.map((e) => e.name),
      },
      Lost:
        selectedData.Lost?.name &&
        !(
          selectedData.OldData.Stage === "Lost" && selectedData.Stage !== "Lost"
        )
          ? selectedData.Lost.name
          : "",
      ContactsId: {
        results: selectedData.Contact.map((e) => e.code),
      },
    });

    const updateContactAccount = async (accountId: number) => {
      for (const contact of selectedData.Contact) {
        try {
          await SPServices.SPUpdateItem({
            ID: contact.code,
            Listname: Config.ListNames.CRMContacts,
            RequestJSON: { AccountId: accountId },
          });
        } catch (err) {
          ErrorFunction(err, "Deal item add/update in contact ID update error");
        }
      }
    };

    const updateKanbanOrder = async (addID: number, stage: string) => {
      try {
        const result: any[] = await SPServices.SPReadItems({
          Listname: Config.ListNames.DealsKanbanOrder,
          Filter: [
            { FilterKey: "Pipeline", Operator: "eq", FilterValue: Managers },
            { FilterKey: "Title", Operator: "eq", FilterValue: stage },
          ],
        });

        const { ID, IdOrder } = result[0];
        const updatedOrder = [
          addID,
          ...(IdOrder?.split(",").map(Number) || []),
        ];

        await SPServices.SPUpdateItem({
          ID,
          Listname: Config.ListNames.DealsKanbanOrder,
          RequestJSON: { IdOrder: updatedOrder.join(",") },
        });
      } catch (err) {
        ErrorFunction(err, "Deals Kanban Order update error");
      }
    };

    const updateDropdownChoices = () => {
      const fields: (keyof IAllChoiceColumn)[] = [
        "Account",
        "Platform",
        "WinProbability",
      ];

      const updatedChoices = fields.reduce((acc, field) => {
        const selected: IChoice | undefined = selectedData[field];
        const existingChoices = onChangeAllChoices[field] || [];

        // Validate selected entry before adding
        if (
          selected &&
          selected.name !== undefined &&
          selected.code !== undefined &&
          !existingChoices.some((c) => c.code === selected.code)
        ) {
          acc[field] = [
            ...existingChoices,
            { name: selected.name, code: selected.code },
          ];
        } else {
          acc[field] = existingChoices;
        }

        return acc;
      }, {} as Partial<IAllChoiceColumn>);

      const newChoices = {
        ...onChangeAllChoices,
        ...updatedChoices,
      };

      setAllChoices(newChoices);
      setOnChangeAllChoices(newChoices);

      dispatch(
        setMainAllChoicesData({
          ...ConfigureationData.allChoicesData,
          ...updatedChoices,
        })
      );
    };

    const handlePostSave = async () => {
      updateDropdownChoices();
      setSelectedData({
        ..._opportunityEmptyData,
        Stage: opportunityFormNavigateValue.stage,
      });
      setLoader(false);
      props.Notify("success", "Success", "Internal deal added successfully");
      props.PageNavigation(savePage === "Save" ? "Deals" : "AddOpportunity");
    };

    if (formShow.add) {
      setLoader(true);
      try {
        const addedItem = await SPServices.SPAddItem({
          Listname: Config.ListNames.PMOpportunity,
          RequestJSON: buildJsonPayload(),
        });

        const addedID = addedItem.data.Id;
        const addedAccountID = addedItem.data.AccountId;
        const itemStage = addedItem.data.Stage;

        if (selectedData.Contact.length) {
          await updateContactAccount(addedAccountID);
        }

        await updateKanbanOrder(addedID, itemStage);
        await handlePostSave();
      } catch (err) {
        ErrorFunction(err, "Deals item add error");
      }
    } else if (formShow.edit) {
      try {
        await SPServices.SPUpdateItem({
          ID: selectedData.ID ?? 0,
          Listname: Config.ListNames.PMOpportunity,
          RequestJSON: buildJsonPayload(),
        });

        const newLength = selectedData.Contact.length;
        const oldLength = selectedData.OldData.Contact.length;
        const loopLength = Math.max(newLength, oldLength);

        if (loopLength) {
          for (let i = 0; i < loopLength; i++) {
            const contact =
              newLength < oldLength
                ? selectedData.OldData.Contact[i]
                : selectedData.Contact[i];

            try {
              await SPServices.SPUpdateItem({
                ID: contact.code,
                Listname: Config.ListNames.CRMContacts,
                RequestJSON: { AccountId: selectedData.ID },
              });
            } catch (err) {
              ErrorFunction(
                err,
                "Deal item updated in contact ID update error"
              );
            }

            if (loopLength - 1 == i) {
              props.Notify(
                "success",
                "Success",
                "Internal deal updated successfully"
              );
              props.PageNavigation("Deals");
            }
          }
        } else {
          props.Notify(
            "success",
            "Success",
            "Internal deal updated successfully"
          );
          props.PageNavigation("Deals");
        }
      } catch (err) {
        ErrorFunction(err, "Deals update error");
      }
    }
  };

  const TempAddChoices = async () => {
    const getUniquePlatforms = (
      existingChoices: IAllChoiceColumn
    ): IChoice[] => {
      return platformChoiceAdd.Platforms.filter((newPlatform) =>
        existingChoices.Platform.every(
          (existingPlatform) =>
            existingPlatform.name.toLowerCase() !==
            newPlatform.name.toLowerCase()
        )
      ).map((platform) => ({
        name: platform.name,
        code: platform.code,
      }));
    };

    const newConfigPlatforms = getUniquePlatforms(configAllChoices);
    const newAllPlatforms = getUniquePlatforms(allChoices);
    const newOnChangePlatforms = getUniquePlatforms(onChangeAllChoices);

    setConfigAllChoices((prev) => ({
      ...prev,
      Platform: [...prev.Platform, ...newConfigPlatforms],
    }));

    setAllChoices((prev) => ({
      ...prev,
      Platform: [...prev.Platform, ...newAllPlatforms],
    }));

    setOnChangeAllChoices((prev) => ({
      ...prev,
      Platform: [...prev.Platform, ...newOnChangePlatforms],
    }));

    setPlatformChoiceAdd((prev) => ({
      ...prev,
      isOpen: false,
    }));

    setErrorMessage("");
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
  };

  const init = () => {
    setLoader(true);
    GetAccountsData();
  };

  useEffect(() => {
    Managers = Config.CRMManagersGroup;
    init();
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <div className={styles.viewFormMain}>
          <div className={styles.viewFormNavBar}>
            <h2>
              {formShow.view ? "View" : formShow.edit ? "Edit" : "New"} Internal
              Deal
            </h2>

            <div className={styles.addUpdateBtns}>
              {formShow.view && (
                <>
                  <PrimaryButton
                    className={styles.backBtn}
                    iconProps={{ iconName: "ChromeBack" }}
                    onClick={() => {
                      props.PageNavigation("Deals");
                    }}
                  >
                    Back
                  </PrimaryButton>
                  {opportunityFormNavigateValue.formType !== "MyWatchlist" && (
                    <PrimaryButton
                      className={styles.editBtn}
                      iconProps={{ iconName: "EditSolid12" }}
                      onClick={() => {
                        setFormShow({
                          add: false,
                          edit: true,
                          view: false,
                          delete: false,
                        });
                      }}
                    >
                      Edit
                    </PrimaryButton>
                  )}
                </>
              )}
            </div>
          </div>
          <div className={styles.formPage}>
            <div className={styles.firstPage}>
              <div className={styles.allField}>
                <label>Deal Owner</label>
                <div className={`${styles.textField} ${styles.peoplePicker}`}>
                  <PeoplePicker
                    context={ConfigureationData.context}
                    webAbsoluteUrl={
                      ConfigureationData.context._pageContext._web.absoluteUrl
                    }
                    personSelectionLimit={1}
                    required
                    placeholder="Select the Person"
                    disabled={
                      !ConfigureationData.isAdmin ? true : formShow.view
                    }
                    ensureUser
                    styles={
                      errorMessage === "OpportunityOwner"
                        ? peopleErrorPickerStyles
                        : formShow.view
                        ? peoplePickerDisabledStyles
                        : peoplePickerStyles
                    }
                    searchTextLimit={2}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={100}
                    defaultSelectedUsers={selectedData.OpportunityOwner}
                    onChange={(items: IPersonaProps[]) => {
                      OnChange("OpportunityOwner", items);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="OpportunityName">Deal Name</label>
                <InputText
                  id="OpportunityName"
                  placeholder="Enter a deal name"
                  style={{
                    border:
                      errorMessage === "OpportunityName"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  disabled={formShow.view}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.OpportunityName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("OpportunityName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="account">Account</label>
                <AutoComplete
                  id="account"
                  value={selectedData.Account}
                  className={`${styles.dropDownStyles} ${
                    styles.dropDownRequired
                  } ${errorMessage == "Account" && styles.dropDownError} ${
                    formShow.view && styles.disabledDropDownAndBtnImpStyle
                  }`}
                  suggestions={allChoices.Account}
                  completeMethod={(event) => searchItems(event, "Account")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose account"
                  dropdown
                  disabled={formShow.view}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    OnChange("Account", selectedValue);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="contact">Contact</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="contact"
                    value={selectedData.Contact}
                    className={`${styles.dropDownStyles} ${
                      styles.multiContact
                    } ${
                      formShow.view
                        ? "ContactMultiDisabledChoice"
                        : "ContactMultiChoice"
                    } ${formShow.view && styles.disabledStyle}`}
                    suggestions={allChoices.Contact}
                    completeMethod={(event) => searchItems(event, "Contact")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose contact"
                    multiple
                    disabled={formShow.view}
                    style={{
                      width: "85%",
                      height: "32px",
                    }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      OnChange("Contact", e.value);
                    }}
                  />
                  <PrimaryButton
                    style={{
                      cursor:
                        formShow.view || formShow?.edit
                          ? "not-allowed"
                          : "pointer",
                    }}
                    className={`${styles.addBtn} ${
                      (formShow.view || formShow?.edit) && styles.addBtnDisabled
                    }`}
                    iconProps={{ iconName: "Add" }}
                    disabled={formShow?.view || formShow?.edit}
                    onClick={() => {
                      if (!formShow.view || !formShow?.edit) {
                        let opportunityFormValue: IOpportunityFormPageNavigate =
                          {
                            opportunityFormData: selectedData,
                            formType: "OppF-CF-OppF",
                            formShow: configDefaults.formShowEmptyValue,
                            id: 0,
                            pipeLineValue: configDefaults.choiceEmptyValue,
                            stage: "",
                          };

                        let contactFormValue: IContactFormPageNavigate = {
                          id: 0,
                          formType: "OppF-CF-AccF-CF-OppF",
                          contactFormData: _contactEmptyData,
                        };
                        dispatch(setOpportunityFormData(opportunityFormValue));
                        dispatch(setContactFormData(contactFormValue));
                        props.PageNavigation("AddContact");
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.secondPage}>
              <div className={styles.allField}>
                <label htmlFor="EstimatedQuote">Estimated Quote</label>
                <InputText
                  id="EstimatedQuote"
                  placeholder="Enter a estimated quote"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  type="text"
                  value={formatNumberWithCommas(selectedData.EstimatedQuote)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue.replace(/,/g, "")))) {
                      OnChange("EstimatedQuote", inputValue);
                    }
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="EstimatedTime">Estimated Timeline</label>
                <InputText
                  id="EstimatedTime"
                  placeholder="Enter a estimated timeline"
                  style={{ paddingRight: "48px" }}
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  type="text"
                  value={selectedData.EstimatedTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue))) {
                      OnChange("EstimatedTime", inputValue);
                    }
                  }}
                />
                <span className={styles.probabiltyPercentage}>Hours</span>
              </div>
              <div className={styles.allField}>
                <label htmlFor="stage">Stage</label>
                <AutoComplete
                  id="stage"
                  value={selectedData.Stage}
                  className={`${styles.dropDownStyles} ${
                    styles.dropDownRequired
                  } ${errorMessage == "Stage" && styles.dropDownError} ${
                    formShow.view && styles.disabledDropDownAndBtnImpStyle
                  }`}
                  suggestions={allChoices.Stage}
                  completeMethod={(event) => searchItems(event, "Stage")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose stage"
                  dropdown
                  disabled={formShow.view}
                  style={{ width: "70%", height: "32px" }}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    OnChange("Stage", selectedValue);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="Platform">Platform</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="Platform"
                    value={selectedData.Platform}
                    className={`${styles.dropDownStyles} ${
                      styles.multiPlatform
                    } ${
                      errorMessage == "Platform" && styles.multiPlatformError
                    } ${
                      formShow.view
                        ? "ContactMultiDisabledChoice"
                        : "ContactMultiChoice"
                    } ${formShow.view && styles.disabledStyle}`}
                    suggestions={allChoices.Platform}
                    completeMethod={(event) => searchItems(event, "Platform")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose platform"
                    multiple
                    disabled={formShow.view}
                    style={{
                      width: "85%",
                      height: "32px",
                    }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      OnChange("Platform", e.value);
                    }}
                  />
                  <PrimaryButton
                    style={{
                      cursor: formShow.view ? "not-allowed" : "pointer",
                    }}
                    className={`${styles.addBtn} ${
                      formShow.view && styles.addBtnDisabled
                    }`}
                    disabled={formShow?.view}
                    iconProps={{ iconName: "Add" }}
                    onClick={() => {
                      setPlatformChoiceAdd({
                        isOpen: true,
                        Platforms: [{ name: "", code: 0 }],
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.thirdPage}>
              <div className={styles.allField}>
                <label htmlFor="WinProbability">Win Probability</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="WinProbability"
                    value={selectedData.WinProbability}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.WinProbability}
                    completeMethod={(event) =>
                      searchItems(event, "WinProbability")
                    }
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose win probability"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("WinProbability", selectedValue);
                    }}
                  />
                </div>
              </div>
              {selectedData.Stage === "Lost" && (
                <div className={styles.allField}>
                  <label htmlFor="lost">Lost</label>
                  <Dropdown
                    value={selectedData.Lost}
                    onChange={(e: DropdownChangeEvent) =>
                      OnChange("Lost", e.value)
                    }
                    disabled={formShow.view}
                    options={allChoices.Lost}
                    optionLabel="name"
                    placeholder="Select a Lost"
                    className={`${styles.dropDown} ${
                      errorMessage == "Lost" && styles.dropDownErrorMsg
                    } ${formShow.view ? "dropDownDisabled" : "drpDown"} 
                    ${
                      formShow.view ? styles.dropDownDisabled : styles.drpDown
                    }`}
                  />
                </div>
              )}
              <div
                className={styles.allField}
                style={{ alignItems: "flex-start", height: 124 }}
              >
                <label htmlFor="description" style={{ paddingTop: "4px" }}>
                  Description
                </label>
                <InputTextarea
                  id="description"
                  placeholder="Enter a description"
                  readOnly={formShow.view}
                  className={`${styles.textArea} ${
                    formShow.view && styles.textAreaDisabled
                  }`}
                  value={selectedData.Description}
                  rows={5}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    OnChange("Description", e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.addUpdateBtns}>
            {(formShow.edit || formShow.add) && (
              <>
                <PrimaryButton
                  className={styles.cancelBtn}
                  iconProps={{ iconName: "cancel" }}
                  onClick={() => {
                    if (
                      opportunityFormNavigateValue.formType == "DealEditForm"
                    ) {
                      setFormShow({
                        add: false,
                        view: true,
                        edit: false,
                        delete: false,
                      });
                      setErrorMessage("");
                      setDataChange(false);
                      setSelectedData((pre) => ({
                        ...pre,
                        Account: selectedData.OldData.Account,
                        Contact: selectedData.OldData.Contact,
                        AdminWatchList: selectedData.AdminWatchList,
                        EstimatedQuote: selectedData.EstimatedQuote,
                        EstimatedTime: selectedData.EstimatedTime,
                        InterventionNeeded: selectedData.InterventionNeeded,
                        OpportunityName: selectedData.OpportunityName,
                        OpportunityOwner: selectedData.OpportunityOwner,
                        OpportunityOwnerId: selectedData.OpportunityOwnerId,
                        Platform: selectedData.Platform,
                        WinProbability: selectedData.WinProbability,
                        Description: selectedData.OldData.Description,
                        ID: selectedData.OldData.ID,
                        Stage: selectedData.OldData.Stage,
                      }));
                    } else {
                      props.PageNavigation("Deals");
                    }
                  }}
                >
                  Cancel
                </PrimaryButton>
                {formShow.add ? (
                  <>
                    <PrimaryButton
                      className={styles.updateBtn}
                      iconProps={{ iconName: "SaveAndClose" }}
                      onClick={() => {
                        Validation("SaveNew");
                      }}
                    >
                      Save and New
                    </PrimaryButton>
                    <PrimaryButton
                      className={styles.updateBtn}
                      iconProps={{ iconName: "Save" }}
                      onClick={() => {
                        Validation("Save");
                      }}
                    >
                      Save
                    </PrimaryButton>
                  </>
                ) : (
                  <>
                    <PrimaryButton
                      style={{ cursor: dataChange ? "pointer" : "not-allowed" }}
                      className={styles.updateBtn}
                      iconProps={{ iconName: "Save" }}
                      onClick={() => {
                        if (dataChange) Validation("Save");
                      }}
                    >
                      Update
                    </PrimaryButton>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Managers Analysis Modal */}
      <Modal isOpen={interventionModel.isOpen} styles={delModalStyle}>
        <p className={styles.delmsg}>Chadru's intervention needed</p>
        <div className={styles.modalBtnSec}>
          <PrimaryButton
            text="No"
            className={styles.cancelBtn}
            onClick={() => {
              setInterventionModel({
                isOpen: false,
                IfNeeded: false,
                value: interventionModel.value,
              });
              DataStore(interventionModel.value);
            }}
          />
          <PrimaryButton
            text="Yes"
            className={styles.addBtn}
            onClick={() => {
              setInterventionModel({
                isOpen: false,
                IfNeeded: true,
                value: interventionModel.value,
              });
              DataStore(interventionModel.value);
            }}
          />
        </div>
      </Modal>

      {/* Pipe Line & Stages Add Model */}
      <Modal isOpen={platformChoiceAdd.isOpen} styles={lModalStyle}>
        <div className={styles.statusModal}>
          <div className={styles.statusModalHead}>
            <h2>Add Platform</h2>
            <Icon
              iconName="cancel"
              onClick={() => {
                setPlatformChoiceAdd({
                  isOpen: false,
                  Platforms: [{ name: "", code: 0 }],
                });
                setErrorMessage("");
              }}
            />
          </div>
          <div className={styles.statusModalTextField}>
            <div>
              <div className={`${styles.AddStages} AddStages stageBtnWidth`}>
                <label>Platforms</label>
                <Button
                  icon="pi pi-plus"
                  rounded
                  aria-label="Filter"
                  className="stageButton"
                  onClick={() => {
                    setPlatformChoiceAdd((pre) => ({
                      ...pre,
                      Platforms: [...pre.Platforms, { name: "", code: 0 }],
                    }));
                  }}
                />
              </div>
              <div
                className={styles.AddStagesTextField}
                style={{
                  paddingRight:
                    platformChoiceAdd.Platforms.length > 5 ? "10px" : undefined,
                }}
              >
                {platformChoiceAdd.Platforms.map((e, i) => (
                  <div className={styles.stageTextFieldAndButton} key={i}>
                    <div style={{ width: "100%" }}>
                      <TextField
                        resizable={false}
                        placeholder={`Enter a Platform ${i + 1}`}
                        className={styles.textField}
                        styles={
                          errorMessage == `Platform ${i}`
                            ? TextFieldsPipeLineChoiceRequiredStyles
                            : TextFieldsPipeLineChoiceStyles
                        }
                        value={e.name}
                        onChange={(
                          event: React.FormEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >,
                          newValue: string
                        ) => {
                          // Update the specific paltform at index i
                          setPlatformChoiceAdd((pre) => ({
                            ...pre,
                            Platforms: pre.Platforms.map((platform, index) =>
                              index === i
                                ? {
                                    ...platform,
                                    name: newValue,
                                    code: newValue.trim(),
                                  }
                                : platform
                            ),
                          }));
                        }}
                      />
                    </div>
                    {platformChoiceAdd.Platforms.length > 1 && (
                      <div
                        className={`${styles.stagesRemoveButton} stageBtnWidth`}
                      >
                        {/* Remove the stage */}
                        <Button
                          icon="pi pi-times"
                          rounded
                          severity="danger"
                          aria-label="Cancel"
                          className="stageButton"
                          onClick={() => {
                            setPlatformChoiceAdd((pre) => ({
                              ...pre,
                              Platforms: pre.Platforms.filter(
                                (_, index) => index !== i
                              ),
                            }));
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.statusBtns}>
              <div className={styles.addCancelBtns}>
                <PrimaryButton
                  className={styles.cancelBtn}
                  text="Cancel"
                  onClick={() => {
                    setPlatformChoiceAdd({
                      isOpen: false,
                      Platforms: [{ name: "", code: 0 }],
                    });
                    setErrorMessage("");
                  }}
                />
                <PrimaryButton
                  text="Submit"
                  style={{
                    cursor: platformChoiceAdd.Platforms.some((e) =>
                      e.name.trim()
                    )
                      ? "pointer"
                      : "not-allowed",
                  }}
                  onClick={() => {
                    if (platformChoiceAdd.Platforms.some((e) => e.code)) {
                      const labels = platformChoiceAdd.Platforms.map(
                        (platform) => platform.name.toLowerCase().trim()
                      );

                      // Check for empty labels
                      const emptyPlatformIndex = labels.findIndex(
                        (name) => name === ""
                      );

                      // Check for duplicate labels
                      const duplicatePlatformIndex = labels.findIndex(
                        (name, index) => labels.indexOf(name) !== index
                      );

                      // Check for duplicates with configAllChoices.Platform
                      const configLabels = configAllChoices.Platform.map(
                        (platform) =>
                          platform.name
                            ? platform.name.toLowerCase().trim()
                            : ""
                      );
                      const externalDuplicateIndex = labels.findIndex(
                        (name) =>
                          configLabels.includes(name.toLowerCase()) &&
                          name !== ""
                      );

                      if (emptyPlatformIndex !== -1) {
                        setErrorMessage(
                          `Platform ${
                            duplicatePlatformIndex == -1
                              ? emptyPlatformIndex
                              : duplicatePlatformIndex
                          }`
                        );
                      } else if (duplicatePlatformIndex !== -1) {
                        setErrorMessage(
                          `Platform ${
                            emptyPlatformIndex == -1
                              ? duplicatePlatformIndex
                              : emptyPlatformIndex
                          }`
                        );
                      } else if (externalDuplicateIndex !== -1) {
                        setErrorMessage(
                          `Platform ${
                            emptyPlatformIndex == -1
                              ? externalDuplicateIndex
                              : emptyPlatformIndex
                          }`
                        );
                      } else {
                        TempAddChoices();
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default OpportunityFormPage;
