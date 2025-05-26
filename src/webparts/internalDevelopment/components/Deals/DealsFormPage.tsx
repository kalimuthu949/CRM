/* eslint-disable no-dupe-else-if */
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
  DatePicker,
  Icon,
  IDatePickerStyles,
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
import * as moment from "moment";
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
  IDealsFormData,
  IAllChoiceColumn,
  IChoice,
  IDealsFormPageNavigate,
  IAccountFormPageNavigate,
  IConfigState,
} from "../Redux/ConfigPageInterfaces";
import { useDispatch, useSelector } from "react-redux";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { setAccountFormData, setDealFormData } from "../Redux/PageData";
import { DataStore } from "./DealDataStore";

// Interfaces
interface IPlatformChoiceModal {
  isOpen: boolean;
  Platforms: IChoice[];
}
// interface IPipeLineChoiceModal {
//   isOpen: boolean;
//   pipeLineValue: string;
//   Stages: IChoice[];
// }
interface IFormShow {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}
interface IAccountData {
  ID: number;
  AccountName: string;
  Contact: IChoice[];
  AccountType: string;
  Industry: string;
  Country: string;
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

const DealsFormPage = (props: IProps): JSX.Element => {
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
  const lModalStyle: Partial<IModalStyles> = {
    main: {
      minHeight: "150px",
      width: "25%",
      padding: "20px",
      borderRadius: "6px",
    },
  };
  const DatePickerStyles: Partial<IDatePickerStyles> = {
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
  const DatePickerDisabledStyles: Partial<IDatePickerStyles> = {
    root: {
      ".ms-TextField-wrapper": {
        ".ms-TextField-fieldGroup": {
          border: "1px solid #afafaf",
          borderRadius: "6px",
          i: {
            color: "#afafaf !important",
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

  // Local Variables
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const dealFormNavigateValue: IDealsFormPageNavigate = useSelector(
    (state: any) => state.PageData.dealFormValue
  );
  let Managers: string = "";
  let _formShow: IFormShow = {
    add: false,
    delete: false,
    edit: false,
    view: false,
  };
  // let _pipeLineChoiceAdd: IPipeLineChoiceModal = {
  //   isOpen: false,
  //   pipeLineValue: "",
  //   Stages: [
  //     { name: "", code: 0 },
  //     { name: "", code: 0 },
  //   ],
  // };
  let _platformChoiceAdd: IPlatformChoiceModal = {
    isOpen: false,
    Platforms: [{ name: "", code: 0 }],
  };
  const _dealEmptyData: IDealsFormData = {
    ID: null,
    DealOwner: [ConfigureationData.currentUserEmail],
    DealOwnerId: ConfigureationData.currentUserId,
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
      DealOwner: [ConfigureationData.currentUserEmail],
      DealOwnerId: ConfigureationData.currentUserId,
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
  const configDefaults = ConfigPageDefaultValue();

  // States Variables
  const [selectedData, setSelectedData] =
    useState<IDealsFormData>(_dealEmptyData);
  const [accountData, setAccountData] = useState<IAccountData[]>([]);
  const [configAllChoices, setConfigAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  // const [pipeLineChoiceAdd, setPipeLineChoiceAdd] =
  //   useState<IPipeLineChoiceModal>({
  //     ..._pipeLineChoiceAdd,
  //   });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [formShow, setFormShow] = useState<IFormShow>(_formShow);
  const [dataChange, setDataChange] = useState<boolean>(false);
  const [platformChoiceAdd, setPlatformChoiceAdd] =
    useState<IPlatformChoiceModal>({
      ..._platformChoiceAdd,
    });
  const dispatch = useDispatch();

  // All Functions
  const GetAccountsData = async () => {
    try {
      const _accountData: any[] = await SPServices.SPReadItems({
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
      });

      if (!_accountData.length) {
        GetContactChoice();
        return;
      }

      const _tempAccountData: IAccountData[] = [];

      for (const item of _accountData) {
        const contactIds: number[] = item.ContactId || [];

        const contactPromises = contactIds.map((id) =>
          SPServices.SPReadItemUsingId({
            Listname: Config.ListNames.CRMContacts,
            SelectedId: id,
          })
        );

        const contactResults: any = await Promise.all(contactPromises);
        const _tempContactName: IChoice[] = [];

        contactResults.forEach((contactData) => {
          if (
            contactData &&
            !_tempContactName.some((c) => c.code === contactData.Id)
          ) {
            const _fullName = `${contactData.FirstName} ${
              contactData?.LastName ?? ""
            }`;
            _tempContactName.push({
              code: contactData.Id,
              name: _fullName.trim(),
            });
          }
        });

        _tempAccountData.push({
          ID: item.ID || null,
          AccountName: item.AccountName || "",
          Contact: _tempContactName,
          AccountType: item.AccountType || "",
          Industry: item.Industry || "",
          Country: item.Country || "",
        });
      }

      setAccountData(_tempAccountData);
      GetContactChoice();
    } catch (err) {
      ErrorFunction(err, "Account data get error");
    }
  };

  const GetContactChoice = async () => {
    try {
      const { allChoicesData } = ConfigureationData;
      const { pipeLine, stage, formType, id, dealFormData } =
        dealFormNavigateValue;

      const selectedPipelineCode = allChoicesData.Stage.some(
        (e) => e.code === pipeLine?.code
      )
        ? pipeLine?.code
        : "Default";

      const filteredStages = allChoicesData.Stage.filter(
        (e) => e.code === selectedPipelineCode
      );

      const ConfigAllChoicesList: IAllChoiceColumn = {
        ...allChoicesData,
        PipeLine: allChoicesData.PipeLine.filter((e) => e.name !== Managers),
        Stage: filteredStages,
        Contact: [],
        Account: [],
      };

      // Get Contacts
      const contacts: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMContacts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      if (contacts.length) {
        ConfigAllChoicesList.Contact = contacts.map((item) => {
          const fullName = `${item.FirstName || ""} ${
            item.LastName || ""
          }`.trim();
          return { code: item.Id, name: fullName };
        });
      }

      // Get Accounts
      const accounts: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMAccounts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      if (accounts.length) {
        ConfigAllChoicesList.Account = accounts.map((item) => ({
          code: item.Id,
          name: item.AccountName,
        }));
      }

      // Set choices
      setConfigAllChoices({
        ...ConfigAllChoicesList,
        Stage: allChoicesData.Stage,
      });
      setAllChoices(ConfigAllChoicesList);

      // Form Handling Logic
      if (["DealEditForm", "DealViewForm", "Acc-DF-Acc"].includes(formType)) {
        GetAllData(id);
      } else {
        setFormShow({ add: true, view: false, edit: false, delete: false });

        if (formType === "DF-AccF-DF") {
          setSelectedData(dealFormData);
        } else {
          setSelectedData({
            ..._dealEmptyData,
            PipeLine: pipeLine.name,
            Stage: stage,
          });
        }

        setLoader(false);
      }
    } catch (err) {
      ErrorFunction(err, "Get Account name Choice error");
    }
  };

  const GetAllData = async (ID: number) => {
    await SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.CRMDeals,
      SelectedId: ID,
      Select: "*,DealOwner/EMail,Account/AccountName",
      Expand: "DealOwner,Account",
    })
      .then(async (_deal: any) => {
        if (_deal) {
          let _tempContactNameChoice: IChoice[] = [];

          // Fetch Account Details:
          const accountResponse = await SPServices.SPReadItems({
            Listname: Config.ListNames.CRMAccounts,
            Select: "*",
            Filter: [
              {
                FilterKey: "ID",
                Operator: "eq",
                FilterValue: _deal?.AccountId,
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
          if (_deal.ContactsId.length) {
            for (let i = 0; i < _deal.ContactsId.length; i++) {
              await SPServices.SPReadItemUsingId({
                Listname: Config.ListNames.CRMContacts,
                SelectedId: _deal.ContactsId[i],
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

          let _platform: IChoice[] = _deal.Platform
            ? _deal.Platform.map((e: string) => {
                return { name: e, code: e };
              })
            : [];

          setSelectedData({
            ID: _deal.ID ? _deal.ID : null,
            DealOwner: _deal.DealOwner ? [_deal.DealOwner.EMail] : [],
            DealOwnerId: _deal.DealOwnerId ? _deal.DealOwnerId : null,
            DealName: _deal.DealName ? _deal.DealName : "",
            Account: _deal.AccountId
              ? {
                  name: accountName,
                  code: _deal.AccountId,
                }
              : { name: "", code: 0 },
            Contact: _tempContactNameChoice,
            AccountType: _deal.AccountType ? _deal.AccountType : "",
            LeadSource: _deal.LeadSource ? _deal.LeadSource : "",
            Industry: _deal.Industry ? _deal.Industry : "",
            Location: _deal.Location ? _deal.Location : "",
            Amount: _deal.Amount ? _deal.Amount : "",
            ClosingDate: _deal.ClosingDate ? _deal.ClosingDate : "",
            Stage: _deal.Stage
              ? { name: _deal.Stage, code: _deal.Stage }
              : configDefaults.choiceEmptyValue,
            Probability: _deal.Probability ? _deal.Probability : "",
            ExpectedRevenue: _deal.ExpectedRevenue
              ? _deal.ExpectedRevenue
              : "0",
            CampaignSource: _deal.CampaignSource ? _deal.CampaignSource : "",
            Country: _deal.Country ? _deal.Country : "",
            PipeLine: _deal.PipeLine ? _deal.PipeLine : "",
            Description: _deal.Description ? _deal.Description : "",
            Lost: _deal.Lost
              ? { name: _deal.Lost, code: _deal.Lost }
              : { code: 0, name: "" },
            Platform: _deal.Platform ? _platform : [],
            OldData: {
              ID: _deal.ID ? _deal.ID : null,
              DealOwner: _deal.DealOwner ? [_deal.DealOwner.EMail] : [],
              DealOwnerId: _deal.DealOwnerId ? _deal.DealOwnerId : null,
              DealName: _deal.DealName ? _deal.DealName : "",
              Account: _deal.AccountId
                ? {
                    name: _deal.Account.AccountName,
                    code: _deal.AccountId,
                  }
                : { name: "", code: 0 },
              Contact: _tempContactNameChoice,
              AccountType: _deal.AccountType ? _deal.AccountType : "",
              LeadSource: _deal.LeadSource ? _deal.LeadSource : "",
              Industry: _deal.Industry ? _deal.Industry : "",
              Location: _deal.Location ? _deal.Location : "",
              Amount: _deal.Amount ? _deal.Amount : "",
              ClosingDate: _deal.ClosingDate ? _deal.ClosingDate : "",
              Stage: _deal.Stage ? _deal.Stage : "",
              Probability: _deal.Probability ? _deal.Probability : "",
              ExpectedRevenue: _deal.ExpectedRevenue
                ? _deal.ExpectedRevenue
                : "0",
              CampaignSource: _deal.CampaignSource ? _deal.CampaignSource : "",
              Country: _deal.Country ? _deal.Country : "",
              PipeLine: _deal.PipeLine ? _deal.PipeLine : "",
              Description: _deal.Description ? _deal.Description : "",
              Lost: _deal.Lost
                ? { name: _deal.Lost, code: _deal.Lost }
                : { code: 0, name: "" },
              Platform: _deal.Platform ? _platform : [],
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
          setSelectedData(_dealEmptyData);
          setLoader(false);
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Deal data error");
      });
  };

  const OnChange = (text: string, value: any) => {
    const _tempSelectdData: IDealsFormData = { ...selectedData };
    // const _tempPipeLineChoices: IPipeLineChoiceModal = { ...pipeLineChoiceAdd };
    let _tempAllChoices: IAllChoiceColumn = { ...allChoices };

    if (text === "DealOwner") {
      _tempSelectdData.DealOwner = value?.length
        ? [value[0].secondaryText]
        : [];
      _tempSelectdData.DealOwnerId = value?.length ? value[0].id : null;
    } else if (text === "Account") {
      const accountObj = _tempSelectdData[text] ?? { name: "", code: 0 };
      _tempSelectdData[text] = { ...accountObj, name: value };

      if (_tempAllChoices?.Account.length) {
        const matchedAccount = _tempAllChoices.Account.find((_e) =>
          _e.name.toLowerCase().includes(value?.toLowerCase())
        );

        if (matchedAccount) {
          const accountDetails = accountData.find(
            (e) => e.ID === matchedAccount.code
          );
          if (accountDetails) {
            _tempSelectdData[text].code = accountDetails.ID;
            _tempSelectdData.Contact = accountDetails.Contact;
            _tempSelectdData.AccountType = accountDetails.AccountType;
            _tempSelectdData.Industry = accountDetails.Industry;
            _tempSelectdData.Country = accountDetails.Country;
          }
        } else {
          _tempSelectdData[text].code = 0;
        }
      }
    } else if (text === "Amount") {
      const cleanValue =
        typeof value === "string" ? value.replace(/,/g, "") : value;
      _tempSelectdData[text] = cleanValue;

      if (
        _tempSelectdData.Probability &&
        Number(_tempSelectdData.Probability) > 0
      ) {
        const revenue =
          Number(cleanValue) * (Number(_tempSelectdData.Probability) / 100);
        _tempSelectdData.ExpectedRevenue = revenue.toString();
      }
    } else if (text === "Probability") {
      _tempSelectdData[text] = value;
      const cleanAmount =
        typeof _tempSelectdData.Amount === "string"
          ? _tempSelectdData.Amount.replace(/,/g, "")
          : _tempSelectdData.Amount;

      const revenue = Math.round(Number(cleanAmount) * (Number(value) / 100));
      _tempSelectdData.ExpectedRevenue = revenue.toString();
    } else if (text === "PipeLine") {
      _tempSelectdData[text] = value;
      _tempAllChoices.Stage = configAllChoices.Stage.filter(
        (e) => e.code === value
      );
      _tempSelectdData.Stage = _tempAllChoices.Stage[0];
    } else if (text === "Stage") {
      const matchedStage = _tempAllChoices.Stage.find(
        (s) => s.name === value || s.code === value
      );
      if (matchedStage) {
        _tempSelectdData[text] = matchedStage;
      } else {
        _tempSelectdData[text] = { name: value, code: value };
      }
    } else {
      _tempSelectdData[text] = value;
    }

    // Set updated state
    setAllChoices(_tempAllChoices);
    setSelectedData(_tempSelectdData);

    // Deal edit change detection
    if (dealFormNavigateValue.formType === "DealEditForm") {
      const oldData = selectedData.OldData || {};
      const current = _tempSelectdData;

      const areEqual =
        current?.Account?.code === oldData?.Account?.code &&
        (current?.AccountType?.trim() || "") ===
          (oldData?.AccountType?.trim() || "") &&
        current?.Amount === oldData?.Amount &&
        (current?.CampaignSource?.trim() || "") ===
          (oldData?.CampaignSource?.trim() || "") &&
        ((!current?.ClosingDate && !oldData?.ClosingDate) ||
          (moment(current?.ClosingDate).isValid() &&
            moment(oldData?.ClosingDate).isValid() &&
            moment(current?.ClosingDate).isSame(
              oldData?.ClosingDate,
              "day"
            ))) &&
        current?.Contact?.length === oldData?.Contact?.length &&
        current?.Contact?.every(
          (c, i) => c?.code === oldData?.Contact?.[i]?.code
        ) &&
        (current?.Country?.trim() || "") === (oldData?.Country?.trim() || "") &&
        (current?.DealName?.trim() || "") ===
          (oldData?.DealName?.trim() || "") &&
        current?.DealOwnerId === oldData?.DealOwnerId &&
        (current?.Description?.trim() || "") ===
          (oldData?.Description?.trim() || "") &&
        current?.ExpectedRevenue === oldData?.ExpectedRevenue &&
        (current?.Industry?.trim() || "") ===
          (oldData?.Industry?.trim() || "") &&
        (current?.LeadSource?.trim() || "") ===
          (oldData?.LeadSource?.trim() || "") &&
        (current?.Location?.trim() || "") ===
          (oldData?.Location?.trim() || "") &&
        (current?.PipeLine?.trim() || "") ===
          (oldData?.PipeLine?.trim() || "") &&
        current?.Probability === oldData?.Probability &&
        (current?.Stage?.name.trim() || "") ===
          (oldData?.Stage?.name.trim() || "") &&
        current?.Lost === oldData?.Lost &&
        current?.Platform?.length === oldData?.Platform?.length &&
        current?.Platform?.every(
          (p, i) => p?.name === oldData?.Platform?.[i]?.name
        );

      setDataChange(!areEqual);
    }
  };

  const Validation = (savePage: string) => {
    let errorMsg: string = "";
    if (selectedData.DealOwner.length == 0) {
      errorMsg = "DealOwner";
    } else if (selectedData.DealName.trim() == "") {
      errorMsg = "DealName";
    } else if (!selectedData.Account?.code) {
      errorMsg = "Account";
    } else if (!selectedData.Platform?.length) {
      errorMsg = "Platform";
    } else if (selectedData.Stage?.name == "" || selectedData.Stage == null) {
      errorMsg = "Stage";
    } else if (
      selectedData.Stage?.name == "Lost" &&
      selectedData.Lost?.name == ""
    ) {
      errorMsg = "Lost";
    } else if (selectedData.Country.trim() == "") {
      errorMsg = "Country";
    } else if (selectedData.Location.trim() == "") {
      errorMsg = "Location";
    }
    setErrorMessage(errorMsg);

    if (!errorMsg) {
      setLoader(true);
      DataStore(
        savePage,
        selectedData,
        configAllChoices,
        dispatch,
        formShow,
        ErrorFunction,
        setLoader,
        // allChoices,
        setAllChoices,
        props,
        setSelectedData,
        dealFormNavigateValue,
        _dealEmptyData
      );
    }
  };

  const formatNumberWithCommas = (value: number | string) => {
    const numberValue =
      typeof value == "string" ? Number(value.replace(/,/g, "")) : value;
    return new Intl.NumberFormat("en-IN").format(Number(numberValue));
  };

  const searchItems = (event: AutoCompleteCompleteEvent, choice: string) => {
    let query = event.query.trim();
    let originalChoices = [...configAllChoices[choice]];
    let _filteredItems: typeof originalChoices = [];

    if (!query.length) {
      _filteredItems = allChoices[choice];
    } else {
      for (let i = 0; i < originalChoices.length; i++) {
        let item = originalChoices[i];
        if (item.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
          _filteredItems.push(item as (typeof originalChoices)[0]);
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

  const TempAddChoices = async () => {
    const getUniquePlatforms = (existing: IChoice[]): IChoice[] => {
      const existingNames = new Set(existing.map((p) => p.name.toLowerCase()));
      return platformChoiceAdd.Platforms.filter(
        (p) => !existingNames.has(p.name.toLowerCase())
      );
    };

    const uniquePlatforms = getUniquePlatforms(configAllChoices.Platform);

    if (uniquePlatforms.length > 0) {
      const updatedPlatformsConfig = [
        ...configAllChoices.Platform,
        ...uniquePlatforms,
      ];
      const updatedPlatformsAll = [...allChoices.Platform, ...uniquePlatforms];

      setConfigAllChoices((prev) => ({
        ...prev,
        Platform: updatedPlatformsConfig,
      }));

      setAllChoices((prev) => ({
        ...prev,
        Platform: updatedPlatformsAll,
      }));
    }

    setPlatformChoiceAdd((prev) => ({ ...prev, isOpen: false }));
    setErrorMessage("");
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setSelectedData(_dealEmptyData);
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
              {formShow.view ? "View" : formShow.edit ? "Edit" : "New"} External
              Deal
            </h2>

            <div className={styles.addUpdateBtns}>
              {formShow.view && (
                <>
                  <PrimaryButton
                    className={styles.backBtn}
                    iconProps={{ iconName: "ChromeBack" }}
                    onClick={() => {
                      if (dealFormNavigateValue.formType == "Acc-DF-Acc") {
                        props.PageNavigation("Accounts");
                      } else {
                        props.PageNavigation("Deals");
                      }
                    }}
                  >
                    Back
                  </PrimaryButton>
                  {ConfigureationData.isAdmin && (
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
                      errorMessage === "DealOwner"
                        ? peopleErrorPickerStyles
                        : formShow.view
                        ? peoplePickerDisabledStyles
                        : peoplePickerStyles
                    }
                    searchTextLimit={2}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={100}
                    defaultSelectedUsers={selectedData.DealOwner}
                    onChange={(items: IPersonaProps[]) => {
                      OnChange("DealOwner", items);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="dealName">Deal Name</label>
                <InputText
                  id="dealName"
                  placeholder="Enter a deal name"
                  style={{
                    border:
                      errorMessage === "DealName"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  disabled={formShow.view}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.DealName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("DealName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="account">Account</label>
                <div className={styles.addNewChoice}>
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
                    style={{
                      width: "85%",
                      height: "32px",
                    }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("Account", selectedValue);
                    }}
                  />
                  <PrimaryButton
                    style={{
                      cursor:
                        formShow.view || formShow.edit
                          ? "not-allowed"
                          : "pointer",
                    }}
                    className={`${styles.addBtn} ${
                      (formShow?.view || formShow?.edit) &&
                      styles.addBtnDisabled
                    }`}
                    iconProps={{ iconName: "Add" }}
                    disabled={formShow?.view || formShow.edit}
                    onClick={() => {
                      if (!formShow.view || !formShow.edit) {
                        let accountFormValue: IAccountFormPageNavigate = {
                          id: 0,
                          formType: "DF-AccF-DF",
                        };

                        let dealFormValue: IDealsFormPageNavigate = {
                          formType: "DF-AccF-DF",
                          pipeLine: dealFormNavigateValue.pipeLine,
                          stage: dealFormNavigateValue.stage,
                          id: dealFormNavigateValue.id,
                          dealFormData: selectedData,
                        };

                        dispatch(setAccountFormData(accountFormValue));
                        dispatch(setDealFormData(dealFormValue));
                        props.PageNavigation("AddAccount");
                      }
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="accountType">Account Type</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="accountType"
                    value={selectedData.AccountType}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.AccountType}
                    completeMethod={(event) =>
                      searchItems(event, "AccountType")
                    }
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose account type"
                    dropdown
                    disabled={formShow.view}
                    style={{
                      width: "100%",
                      height: "32px",
                    }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("AccountType", selectedValue);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="leadSource">Lead source</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="leadSource"
                    value={selectedData.LeadSource}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.LeadSource}
                    completeMethod={(event) => searchItems(event, "LeadSource")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose lead source"
                    dropdown
                    disabled={formShow.view}
                    style={{
                      width: "100%",
                      height: "32px",
                    }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("LeadSource", selectedValue);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="contact">Contact</label>
                <AutoComplete
                  id="contact"
                  value={selectedData.Contact}
                  className={`${styles.dropDownStyles} ${styles.multiContact} ${
                    formShow.view
                      ? "ContactMultiDisabledChoice"
                      : "ContactMultiChoice"
                  } ${formShow.view && styles.disabledStyle}`}
                  suggestions={[...allChoices.Contact]}
                  completeMethod={(event) => searchItems(event, "Contact")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose contact"
                  multiple
                  disabled={formShow.view}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    OnChange("Contact", e.value);
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
            <div className={styles.secondPage}>
              <div className={styles.allField}>
                <label htmlFor="amount">Amount</label>
                <InputText
                  id="amount"
                  placeholder="Enter a amount"
                  style={{ paddingRight: "20px" }}
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  type="text"
                  value={formatNumberWithCommas(selectedData.Amount)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue.replace(/,/g, "")))) {
                      OnChange("Amount", inputValue);
                    }
                  }}
                />
                <span className={styles.probabiltyPercentage}>₹</span>
              </div>
              <div className={styles.allField}>
                <label>Closing Date</label>
                <DatePicker
                  className={`${styles.textField} ${styles.dateField}`}
                  styles={
                    formShow.view ? DatePickerDisabledStyles : DatePickerStyles
                  }
                  disabled={formShow.view}
                  placeholder="Select a date..."
                  ariaLabel="Select a date"
                  minDate={new Date()}
                  value={
                    selectedData.ClosingDate
                      ? new Date(selectedData.ClosingDate)
                      : undefined
                  }
                  onSelectDate={(date: any) => {
                    OnChange("ClosingDate", date);
                  }}
                />
              </div>
              <div className={`${styles.allField} dealFormPage`}>
                <label htmlFor="pipeLine">Pipe Line</label>
                <Dropdown
                  id="pipeLine"
                  value={
                    allChoices.PipeLine.find(
                      (p) => p.name === selectedData.PipeLine
                    ) || null
                  }
                  className={`${styles.dropDownStyles} ${
                    formShow.view && styles.disabledStyle
                  }`}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  disabled={formShow.view}
                  style={{ width: "70%", height: "32px" }}
                  onChange={(e: DropdownChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    OnChange("PipeLine", selectedValue);
                  }}
                  options={allChoices.PipeLine}
                  optionLabel="name"
                  placeholder="Enter or choose pipe line"
                />
              </div>
              <div className={`${styles.allField} dealFormPage`}>
                <label htmlFor="stage">Stage</label>
                <Dropdown
                  id="stage"
                  value={selectedData.Stage}
                  className={`${styles.dropDownStyles} ${
                    styles.dropDownRequired
                  } ${errorMessage == "Stage" && styles.dropDownError} ${
                    formShow.view && styles.disabledDropDownAndBtnImpStyle
                  }`}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  disabled={formShow.view}
                  style={{ width: "70%", height: "32px" }}
                  onChange={(e: DropdownChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    OnChange("Stage", selectedValue);
                  }}
                  options={allChoices.Stage}
                  optionLabel="name"
                  placeholder="Enter or choose stage"
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="probability">Probability</label>
                <InputText
                  id="probability"
                  placeholder="Enter a probability"
                  disabled={formShow.view || selectedData.Amount == ""}
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={
                    selectedData.Amount == "" ? "" : selectedData.Probability
                  }
                  min={1}
                  max={100}
                  inputMode="decimal"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let inputValue = e.target.value;

                    if (/^\d*\.?\d*$/.test(inputValue)) {
                      let _inputNumber = inputValue.split(".")[0];

                      if (Number(_inputNumber) < 0) inputValue = "";
                      else if (Number(_inputNumber) > 100) inputValue = "100";
                      else inputValue = inputValue;
                      OnChange("Probability", inputValue);
                    }
                  }}
                />
                <span className={styles.probabiltyPercentage}>%</span>
              </div>
              <div className={styles.allField}>
                <label htmlFor="expectedRevenue">Expected Revenue</label>
                <InputText
                  id="expectedRevenue"
                  placeholder="Enter a expected revenue"
                  disabled
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={formatNumberWithCommas(selectedData.ExpectedRevenue)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("ExpectedRevenue", e.target.value);
                  }}
                />
                <span className={styles.probabiltyPercentage}>₹</span>
              </div>
              {selectedData.Stage?.name === "Lost" && (
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
            </div>
            <div className={styles.thirdPage}>
              <div className={styles.allField}>
                <label htmlFor="industry">Industry</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="industry"
                    value={selectedData.Industry}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.Industry}
                    completeMethod={(event) => searchItems(event, "Industry")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose industry"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("Industry", selectedValue);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="campaignSource">Campaign Source</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="campaignSource"
                    value={selectedData.CampaignSource}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.CampaignSource}
                    completeMethod={(event) =>
                      searchItems(event, "CampaignSource")
                    }
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose campaign source"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("CampaignSource", selectedValue);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="country">Country</label>
                <InputText
                  id="country"
                  placeholder="Enter a country"
                  disabled={formShow.view}
                  style={{
                    border:
                      errorMessage === "Country"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  } ${formShow.view && styles.inputRequiredDisabled}`}
                  value={selectedData.Country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("Country", e.target.value);
                  }}
                />
              </div>
              <div
                className={styles.allField}
                style={{ alignItems: "flex-start", height: 124 }}
              >
                <label htmlFor="address" style={{ paddingTop: "4px" }}>
                  Address
                </label>
                <InputTextarea
                  id="address"
                  placeholder="Enter a address"
                  readOnly={formShow.view}
                  className={`${styles.textArea} ${styles.inputRequired} ${
                    formShow.view && styles.textAddressAreaDisabled
                  }`}
                  style={{
                    border:
                      errorMessage === "Location"
                        ? "2px solid #ff0000"
                        : undefined,
                    borderLeftColor: "#ff0000",
                    borderLeftWidth: "3.5px",
                  }}
                  value={selectedData.Location}
                  rows={5}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    OnChange("Location", e.target.value);
                  }}
                />
              </div>
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
                    if (dealFormNavigateValue.formType === "DealEditForm") {
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
                        AccountType: selectedData.OldData.AccountType,
                        Amount: selectedData.OldData.Amount,
                        CampaignSource: selectedData.OldData.CampaignSource,
                        ClosingDate: selectedData.OldData.ClosingDate,
                        Contact: selectedData.OldData.Contact,
                        DealName: selectedData.OldData.DealName,
                        DealOwner: selectedData.OldData.DealOwner,
                        DealOwnerId: selectedData.OldData.DealOwnerId,
                        Description: selectedData.OldData.Description,
                        ExpectedRevenue: selectedData.OldData.ExpectedRevenue,
                        ID: selectedData.OldData.ID,
                        Industry: selectedData.OldData.Industry,
                        LeadSource: selectedData.OldData.LeadSource,
                        Location: selectedData.OldData.Location,
                        PipeLine: selectedData.OldData.PipeLine,
                        Probability: selectedData.OldData.Probability,
                        Stage: selectedData.OldData.Stage,
                      }));
                    } else {
                      if (dealFormNavigateValue.formType == "Acc-DF-Acc") {
                        if (formShow.edit) {
                          init();
                        } else {
                          props.PageNavigation("Accounts");
                        }
                      } else {
                        props.PageNavigation("Deals");
                        init();
                      }
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
                {platformChoiceAdd.Platforms.map((e: IChoice, i: number) => (
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
                            Platforms: pre.Platforms.map(
                              (platform: IChoice, index: number) =>
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
                    if (
                      platformChoiceAdd.Platforms.some((e) => e.name.trim())
                    ) {
                      const labels = platformChoiceAdd.Platforms.map(
                        (platform) => platform.name.trim()
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

export default DealsFormPage;
