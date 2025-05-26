/* eslint-disable no-case-declarations */
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
import styles from "../Deals/DealsFormPage.module.scss";
import {
  IPeoplePickerItemSelectedStyles,
  IPersonaProps,
  PrimaryButton,
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
import { useDispatch, useSelector } from "react-redux";
import { setMainAllChoicesData } from "../Redux/ConfigureationData";
import {
  IAccountFormPageNavigate,
  IAccountsFormData,
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  IFormShow,
} from "../Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";

// Interfaces
interface IChoiceModalValue {
  isOpen: boolean;
  value: string;
}
interface IChoiceModal {
  IndustryValue: IChoiceModalValue;
  AccountTypeValue: IChoiceModalValue;
  RatingValue: IChoiceModalValue;
  OwnerShipValue: IChoiceModalValue;
}
interface IResponse {
  AccountOwnerId: number;
  AccountName: string;
  ParentAccountId: number | null;
  AccountType: string;
  Industry: string;
  AnnualRevenue: string;
  Rating: string;
  Ownership: string;
  WebSite: string;
  NumberOfEmployees: number | null;
  State: string;
  Country: string;
  Description: string;
  ContactId?: { results: number[] };
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

const AccountsFormPage = (props: IProps): JSX.Element => {
  // Styles Variables
  const peoplePickerStyles: Partial<IPeoplePickerItemSelectedStyles> = {
    root: {
      border: "1px solid #00A99D",
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
      ".ms-PickerPersona-container.is-selected": {
        background: "#00A99D !important",
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

  // Local Variables
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const accountFormNavigateValue: IAccountFormPageNavigate = useSelector(
    (state: any) => state.PageData.accountFormValue
  );
  const _accountEmptyData: IAccountsFormData = {
    ID: 0,
    AccountOwner: [ConfigureationData.currentUserEmail],
    AccountOwnerId: ConfigureationData.currentUserId,
    AccountName: "",
    Contact: [],
    Industry: "",
    WebSite: "",
    NumberOfEmployees: "",
    AccountType: "",
    AnnualRevenue: "",
    Country: "",
    OwnerShip: "",
    ParentAccount: { name: "", code: 0 },
    Rating: "",
    State: "",
    Description: "",
    OldData: {
      ID: 0,
      AccountOwner: [ConfigureationData.currentUserEmail],
      AccountOwnerId: ConfigureationData.currentUserId,
      AccountName: "",
      Contact: [],
      Industry: "",
      WebSite: "",
      NumberOfEmployees: "",
      AccountType: "",
      AnnualRevenue: "",
      Country: "",
      OwnerShip: "",
      ParentAccount: { name: "", code: 0 },
      Rating: "",
      State: "",
      Description: "",
    },
  };
  let _formShow: IFormShow = {
    add: false,
    delete: false,
    edit: false,
    view: false,
  };
  let _choiceValue: IChoiceModalValue = {
    isOpen: false,
    value: "",
  };
  let _choiceAdd: IChoiceModal = {
    AccountTypeValue: _choiceValue,
    IndustryValue: _choiceValue,
    OwnerShipValue: _choiceValue,
    RatingValue: _choiceValue,
  };
  const configDefaults = ConfigPageDefaultValue();

  // States Variables
  const [selectedData, setSelectedData] =
    useState<IAccountsFormData>(_accountEmptyData);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [_onChangeAllChoices, set_onChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [choiceAdd, setChoiceAdd] = useState<IChoiceModal>({
    ..._choiceAdd,
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [formShow, setFormShow] = useState<IFormShow>(_formShow);
  const [dataChange, setDataChange] = useState<boolean>(false);

  // All Functions
  const GetContactChoice = async () => {
    try {
      const AllChoicesList: IAllChoiceColumn = {
        ...ConfigureationData.allChoicesData,
        Contact: [],
        ParentAccount: [],
      };

      const contactData: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMContacts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      if (contactData?.length) {
        for (const item of contactData) {
          const fullName = `${item.FirstName || ""} ${
            item.LastName || ""
          }`.trim();
          AllChoicesList.Contact.push({
            code: item.Id,
            name: fullName,
          });
        }
      }

      const accountData: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMAccounts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      if (accountData?.length) {
        for (const item of accountData) {
          AllChoicesList.ParentAccount.push({
            code: item.Id,
            name: item.AccountName,
          });
        }
      }

      setAllChoices(AllChoicesList);
      set_onChangeAllChoices(AllChoicesList);

      if (accountFormNavigateValue.formType === "AccountEditForm") {
        GetAllData(accountFormNavigateValue.id);
      } else {
        setFormShow({ add: true, view: false, edit: false, delete: false });
        setSelectedData(_accountEmptyData);
        setLoader(false);
      }
    } catch (err) {
      ErrorFunction(err, "Error fetching contact or account choices");
    }
  };

  const GetAllData = async (ID: number) => {
    await SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.CRMAccounts,
      SelectedId: ID,
      Select: "*,AccountOwner/EMail,ParentAccount/AccountName",
      Expand: "AccountOwner,ParentAccount",
    })
      .then(async (_account: any) => {
        if (_account) {
          let _tempContactNameChoice: IChoice[] = [];

          // Contact Lookup
          if (_account.ContactId.length) {
            for (let i = 0; i < _account.ContactId.length; i++) {
              await SPServices.SPReadItems({
                Listname: Config.ListNames.CRMContacts,
                Filter: [
                  {
                    FilterKey: "Id",
                    Operator: "eq",
                    FilterValue: _account.ContactId[i],
                  },
                ],
                Topcount: 5000,
              })
                .then(async (_contacts: any) => {
                  let _firstName: string = _contacts[0].FirstName
                    ? _contacts[0].FirstName
                    : "";
                  let _lastName: string = _contacts[0].LastName
                    ? _contacts[0].LastName
                    : "";
                  let FullName: string = `${_firstName} ${_lastName}`;

                  _tempContactNameChoice.push({
                    code: _contacts[0].Id,
                    name: FullName,
                  });
                })
                .catch((err: any) => {
                  ErrorFunction(err, "Account Lookup contact data get error");
                });
            }
          }

          setSelectedData({
            ID: _account.ID ? _account.ID : null,
            Description: _account.Description ? _account.Description : "",
            AccountName: _account.AccountName ? _account.AccountName : "",
            AccountOwner: _account.AccountOwner
              ? [_account.AccountOwner.EMail]
              : [],
            AccountOwnerId: _account.AccountOwnerId
              ? _account.AccountOwnerId
              : null,
            WebSite: _account.WebSite ? _account.WebSite : "",
            Contact: _tempContactNameChoice,
            Industry: _account.Industry ? _account.Industry : "",
            NumberOfEmployees: _account.NumberOfEmployees
              ? _account.NumberOfEmployees
              : "0",
            AccountType: _account.AccountType ? _account.AccountType : "",
            AnnualRevenue: _account.AnnualRevenue
              ? _account.AnnualRevenue
              : "0",
            Country: _account.Country ? _account.Country : "",
            OwnerShip: _account.OwnerShip ? _account.OwnerShip : "",
            ParentAccount:
              _account.ParentAccountId && _account.ParentAccount.AccountName
                ? {
                    code: _account.ParentAccountId,
                    name: _account.ParentAccount.AccountName,
                  }
                : { name: "", code: 0 },
            Rating: _account.Rating ? _account.Rating : "",
            State: _account.State ? _account.State : "",
            OldData: {
              ID: _account.ID ? _account.ID : null,
              Description: _account.Description ? _account.Description : "",
              AccountName: _account.AccountName ? _account.AccountName : "",
              AccountOwner: _account.AccountOwner
                ? [_account.AccountOwner.EMail]
                : [],
              AccountOwnerId: _account.AccountOwnerId
                ? _account.AccountOwnerId
                : null,
              WebSite: _account.WebSite ? _account.WebSite : "",
              Contact: _tempContactNameChoice,
              Industry: _account.Industry ? _account.Industry : "",
              NumberOfEmployees: _account.NumberOfEmployees
                ? _account.NumberOfEmployees
                : "0",
              AccountType: _account.AccountType ? _account.AccountType : "",
              AnnualRevenue: _account.AnnualRevenue
                ? _account.AnnualRevenue
                : "0",
              Country: _account.Country ? _account.Country : "",
              OwnerShip: _account.OwnerShip ? _account.OwnerShip : "",
              ParentAccount:
                _account.ParentAccountId && _account.ParentAccount.AccountName
                  ? {
                      code: _account.ParentAccountId,
                      name: _account.ParentAccount.AccountName,
                    }
                  : { name: "", code: 0 },
              Rating: _account.Rating ? _account.Rating : "",
              State: _account.State ? _account.State : "",
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
          setSelectedData(_accountEmptyData);
          setLoader(false);
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Account data error");
      });
  };

  const OnChange = (text: string, value: any) => {
    let _tempSelectdData = { ...selectedData };
    let _tempChoiceValue: IChoiceModal = { ...choiceAdd };
    let _temp_onAllChoices = { ..._onChangeAllChoices };

    if (text === "AccountOwner") {
      _tempSelectdData.AccountOwner = value.length
        ? [value[0].secondaryText]
        : [];
      _tempSelectdData.AccountOwnerId = value.length ? value[0].id : null;
    } else if (text === "ParentAccount") {
      if (!_tempSelectdData[text]) {
        _tempSelectdData[text] = { name: "", code: 0 };
      }

      _tempSelectdData[text].name = value;

      const filteredAccount =
        value !== ""
          ? _temp_onAllChoices.ParentAccount.filter((_e) => {
              return _e.name.toLowerCase().includes(value?.toLowerCase());
            })
          : [];

      if (filteredAccount.length > 0) {
        _tempSelectdData[text].code = filteredAccount[0].code;
      } else {
        _tempSelectdData[text].code = 0;
      }
    } else if (text === "AnnualRevenue") {
      _tempSelectdData[text] = value == "" ? "0" : value;
    } else if (text === "NumberOfEmployees") {
      _tempSelectdData[text] =
        typeof value === "number" ? value : value.replace(/,/g, "");
    } else {
      _tempSelectdData[text] = value;
      _tempChoiceValue[text as keyof IChoiceModal] = value;
    }

    setChoiceAdd(_tempChoiceValue);
    set_onChangeAllChoices({ ..._temp_onAllChoices });
    setSelectedData({ ..._tempSelectdData });

    // data change check
    if (accountFormNavigateValue.formType == "AccountEditForm") {
      if (
        _tempSelectdData?.AccountName.trim() ==
          selectedData?.OldData?.AccountName.trim() &&
        _tempSelectdData?.AccountOwnerId ==
          selectedData?.OldData?.AccountOwnerId &&
        _tempSelectdData?.AccountType == selectedData?.OldData?.AccountType &&
        _tempSelectdData?.AnnualRevenue ==
          selectedData?.OldData?.AnnualRevenue &&
        _tempSelectdData?.Contact?.every(
          (_new, index) =>
            selectedData?.OldData?.Contact[index]?.name == _new.name
        ) &&
        _tempSelectdData?.Contact?.length ==
          selectedData?.OldData?.Contact?.length &&
        _tempSelectdData?.Country.trim() ==
          selectedData?.OldData?.Country.trim() &&
        _tempSelectdData?.Description.trim() ==
          selectedData?.OldData?.Description.trim() &&
        _tempSelectdData?.Industry.trim() ==
          selectedData?.OldData?.Industry.trim() &&
        _tempSelectdData?.NumberOfEmployees ==
          selectedData?.OldData?.NumberOfEmployees &&
        _tempSelectdData?.OwnerShip.trim() ==
          selectedData?.OldData?.OwnerShip.trim() &&
        _tempSelectdData?.Rating.trim() ==
          selectedData?.OldData?.Rating.trim() &&
        _tempSelectdData?.State.trim() == selectedData?.OldData?.State.trim() &&
        _tempSelectdData?.WebSite.trim() ==
          selectedData?.OldData?.WebSite.trim() &&
        _tempSelectdData?.ParentAccount?.name ==
          selectedData?.OldData?.ParentAccount?.name
      ) {
        setDataChange(false);
      } else {
        setDataChange(true);
      }
    }
  };

  const Validation = (savePage: string) => {
    let errorMsg: string = "";

    if (selectedData.AccountOwner.length == 0) {
      errorMsg = "AccountOwner";
    } else if (selectedData.AccountName.trim() == "") {
      errorMsg = "AccountName";
    }

    setErrorMessage(errorMsg);

    if (!errorMsg) {
      DataStore(savePage);
    }
  };

  const formatNumberWithCommas = (value: string) => {
    const numberValue = Number(value.replace(/,/g, ""));
    return new Intl.NumberFormat("en-IN").format(numberValue);
  };

  const searchItems = (event: AutoCompleteCompleteEvent, choice: string) => {
    let query = event?.query?.trim();
    let originalChoices = [
      ..._onChangeAllChoices[choice as keyof IAllChoiceColumn],
    ];
    let _filteredItems: IChoice[] = [];

    if (!query.length) {
      _filteredItems = _onChangeAllChoices[
        choice as keyof IAllChoiceColumn
      ] as IChoice[];
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

  const DataStore = async (savePage: string) => {
    let json: IResponse = {
      AccountOwnerId: selectedData.AccountOwnerId ?? 0,
      ParentAccountId:
        selectedData.ParentAccount?.name && selectedData.ParentAccount?.code
          ? selectedData.ParentAccount.code
          : null,
      AccountName: selectedData.AccountName,
      Industry: selectedData.Industry.trim(),
      WebSite: selectedData.WebSite,
      NumberOfEmployees: selectedData.NumberOfEmployees
        ? Number(selectedData.NumberOfEmployees)
        : null,
      AccountType: selectedData.AccountType.trim(),
      AnnualRevenue: selectedData.AnnualRevenue,
      Ownership: selectedData.OwnerShip.trim(),
      Rating: selectedData.Rating.trim(),
      Country: selectedData.Country,
      State: selectedData.State,
      Description: selectedData.Description,
    };

    if (selectedData.Contact.length) {
      json["ContactId"] = {
        results: selectedData.Contact.map((e: IChoice) => e.code),
      };
    } else {
      json["ContactId"] = {
        results: [],
      };
    }

    if (formShow.add) {
      const MovePagenation = async (_accountChoice: any) => {
        setLoader(true);

        const AllChoicesUpdate = () => {
          const addUniqueChoice = (choices: any[], selectedChoice: any) => {
            return selectedChoice &&
              !choices.some((choice) => choice.value === selectedChoice.value)
              ? [...choices, selectedChoice]
              : choices;
          };

          const fields: string[] = [
            "Industry",
            "AccountType",
            "Rating",
            "OwnerShip",
          ];

          const updatedChoices = fields.reduce((acc, field) => {
            const selectedChoice: IChoice = {
              name: selectedData[field],
              code: selectedData[field],
            };
            return {
              ...acc,
              [field]: addUniqueChoice(
                _onChangeAllChoices[field],
                selectedChoice
              ),
            };
          }, {} as Record<(typeof fields)[number], any[]>);
          let _allChoices: IAllChoiceColumn = {
            ...ConfigureationData.allChoicesData,
            ...updatedChoices,
          };

          setAllChoices({
            ..._onChangeAllChoices,
            ...updatedChoices,
          });
          set_onChangeAllChoices({
            ..._onChangeAllChoices,
            ...updatedChoices,
          });
          dispatch(setMainAllChoicesData(_allChoices));
          setLoader(false);
        };

        if (accountFormNavigateValue.formType === "DF-AccF-DF") {
          AllChoicesUpdate();
          props.Notify("success", "Success", "Account added successfully");
          props.PageNavigation("AddDeal");
        } else if (
          accountFormNavigateValue.formType === "OppF-CF-AccF-CF-OppF" ||
          accountFormNavigateValue.formType === "CF-AccF-CF"
        ) {
          AllChoicesUpdate();
          props.Notify("success", "Success", "Account added successfully");
          props.PageNavigation("AddContact");
        } else {
          AllChoicesUpdate();
          setSelectedData(_accountEmptyData);
          props.Notify("success", "Success", "Account added successfully");
          props.PageNavigation(
            `${savePage === "Save" ? "Accounts" : "AddAccount"}`
          );
        }
      };

      await SPServices.SPAddItem({
        Listname: Config.ListNames.CRMAccounts,
        RequestJSON: json,
      })
        .then(async (_addedAccount: any) => {
          let _accountChoice = {
            label: _addedAccount?.data?.AccountName,
            value: _addedAccount?.data?.ID,
          };

          if (selectedData.Contact.length) {
            for (let i = 0; i < selectedData.Contact.length; i++) {
              await SPServices.SPUpdateItem({
                ID: selectedData.Contact[i].code,
                Listname: Config.ListNames.CRMContacts,
                RequestJSON: {
                  AccountId: _addedAccount.id,
                },
              })
                .then((_contact) => {})
                .catch((err: any) => {
                  ErrorFunction(
                    err,
                    "Account item added in contact ID update error"
                  );
                });
            }
            MovePagenation(_accountChoice);
          } else {
            MovePagenation(_accountChoice);
          }
        })
        .catch((err: any) => {
          ErrorFunction(err, "Accounts item add error");
        });
    } else if (formShow.edit) {
      await SPServices.SPUpdateItem({
        ID: selectedData.ID,
        Listname: Config.ListNames.CRMAccounts,
        RequestJSON: json,
      })
        .then(async (updated: any) => {
          let _newLength: number = selectedData.Contact.length;
          let _oldLength: number = selectedData.OldData?.Contact?.length ?? 0;
          let _loopLength: number =
            _newLength < _oldLength ? _oldLength : _newLength;

          if (_newLength || _oldLength) {
            for (let i = 0; i < _loopLength; i++) {
              await SPServices.SPUpdateItem({
                ID:
                  _newLength < _oldLength
                    ? selectedData.OldData?.Contact[i]?.code ?? 0
                    : selectedData.Contact[i]?.code ?? 0,
                Listname: Config.ListNames.CRMContacts,
                RequestJSON: {
                  AccountId: selectedData.ID,
                },
              })
                .then((_contact) => {})
                .catch((err: any) => {
                  ErrorFunction(
                    err,
                    "Account item update in contact ID update error"
                  );
                });

              if (_loopLength - 1 == i) {
                props.Notify(
                  "success",
                  "Success",
                  "Account updated successfully"
                );
                props.PageNavigation("Accounts");
              }
            }
          } else {
            props.Notify("success", "Success", "Account updated successfully");
            props.PageNavigation("Accounts");
          }
        })
        .catch((err: any) => {
          ErrorFunction(err, "Accounts update error");
        });
    }
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
  };

  const init = () => {
    setLoader(true);
    GetContactChoice();
  };

  useEffect(() => {
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
              {formShow.view ? "View" : formShow.edit ? "Edit" : "New"} Account
            </h2>

            <div className={styles.addUpdateBtns}>
              {formShow.view && (
                <>
                  <PrimaryButton
                    className={styles.backBtn}
                    iconProps={{ iconName: "ChromeBack" }}
                    onClick={() => {
                      props.PageNavigation("Accounts");
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
                <label>Account Owner</label>
                <div className={`${styles.textField} ${styles.peoplePicker}`}>
                  <PeoplePicker
                    context={ConfigureationData.context}
                    webAbsoluteUrl={
                      ConfigureationData.context._pageContext._web.absoluteUrl
                    }
                    personSelectionLimit={1}
                    required
                    placeholder="Select the Person"
                    disabled={formShow.view}
                    ensureUser
                    styles={
                      errorMessage === "AccountOwner"
                        ? peopleErrorPickerStyles
                        : formShow.view
                        ? peoplePickerDisabledStyles
                        : peoplePickerStyles
                    }
                    searchTextLimit={2}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={100}
                    defaultSelectedUsers={selectedData.AccountOwner}
                    onChange={(items: IPersonaProps[]) => {
                      OnChange("AccountOwner", items);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="accountName">Account name</label>
                <InputText
                  id="accountName"
                  placeholder="Enter a account name"
                  style={{
                    border:
                      errorMessage === "AccountName"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  disabled={formShow.view}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.AccountName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("AccountName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="parentAccount">Parent Account</label>
                <AutoComplete
                  id="parentAccount"
                  value={selectedData.ParentAccount?.name}
                  className={`${styles.dropDownStyles} ${
                    formShow.view && styles.disabledStyle
                  }`}
                  suggestions={allChoices.ParentAccount}
                  completeMethod={(event) =>
                    searchItems(event, "ParentAccount")
                  }
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose parent account"
                  dropdown
                  disabled={formShow.view}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    OnChange("ParentAccount", selectedValue);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="annualRevenue">Annual Revenue</label>
                <InputText
                  id="annualRevenue"
                  placeholder="Enter a annual revenue"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  type="text"
                  value={formatNumberWithCommas(selectedData.AnnualRevenue)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue.replace(/,/g, "")))) {
                      OnChange(
                        "AnnualRevenue",
                        formatNumberWithCommas(inputValue)
                      );
                    }
                  }}
                />
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
                  suggestions={allChoices.Contact}
                  completeMethod={(event) => searchItems(event, "Contact")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose contact"
                  multiple
                  disabled={formShow.view}
                  panelStyle={{
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    OnChange("Contact", e.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.secondPage}>
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
                    style={{ width: "100%", height: "32px" }}
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
                <label htmlFor="rating">Rating</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="rating"
                    value={selectedData.Rating}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.Rating}
                    completeMethod={(event) => searchItems(event, "Rating")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose rating"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("Rating", selectedValue);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="OwnerShip">OwnerShip</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="OwnerShip"
                    value={selectedData.OwnerShip}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.OwnerShip}
                    completeMethod={(event) => searchItems(event, "OwnerShip")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose OwnerShip"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("OwnerShip", selectedValue);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="state">State</label>
                <InputText
                  id="state"
                  placeholder="Enter a state"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={selectedData.State}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("State", e.target.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.thirdPage}>
              <div className={styles.allField}>
                <label htmlFor="country">Country</label>
                <InputText
                  id="country"
                  placeholder="Enter a country"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={selectedData.Country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("Country", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="webSite">Website</label>
                <InputText
                  id="webSite"
                  placeholder="Enter a website"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={selectedData.WebSite}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("WebSite", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="numberOfEmployees">Number of Employees</label>
                <InputText
                  id="numberOfEmployees"
                  placeholder="Enter a number of employees"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  type="text"
                  value={formatNumberWithCommas(
                    selectedData.NumberOfEmployees.toString()
                  )}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue.replace(/,/g, "")))) {
                      OnChange(
                        "NumberOfEmployees",
                        formatNumberWithCommas(inputValue)
                      );
                    }
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
                  className={`${styles.textArea} ${
                    formShow.view && styles.textAreaDisabled
                  }`}
                  readOnly={formShow.view}
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
                      accountFormNavigateValue.formType === "AccountEditForm"
                    ) {
                      setFormShow({
                        add: false,
                        view: true,
                        edit: false,
                        delete: false,
                      });
                      setErrorMessage("");
                      setDataChange(false);
                      setSelectedData((pre: IAccountsFormData) => ({
                        ...pre,
                        AccountName: selectedData.OldData?.AccountName ?? "",
                        AccountOwner: selectedData.OldData?.AccountOwner ?? [],
                        AccountOwnerId:
                          selectedData.OldData?.AccountOwnerId ?? null,
                        AccountType: selectedData.OldData?.AccountType ?? "",
                        AnnualRevenue:
                          selectedData.OldData?.AnnualRevenue ?? "",
                        Contact: selectedData.OldData?.Contact ?? [],
                        Country: selectedData.OldData?.Country ?? "",
                        Description: selectedData.OldData?.Description ?? "",
                        ID: selectedData.OldData?.ID ?? 0,
                        Industry: selectedData.OldData?.Industry ?? "",
                        NumberOfEmployees:
                          selectedData.OldData?.NumberOfEmployees ?? "",
                        OwnerShip: selectedData.OldData?.OwnerShip ?? "",
                        ParentAccount: selectedData.OldData?.ParentAccount ?? {
                          name: "",
                          code: 0,
                        },
                        Rating: selectedData.OldData?.Rating ?? "",
                        State: selectedData.OldData?.State ?? "",
                        WebSite: selectedData.OldData?.WebSite ?? "",
                      }));
                    } else if (
                      accountFormNavigateValue.formType === "DF-AccF-DF"
                    ) {
                      props.PageNavigation("AddDeal");
                    } else if (
                      accountFormNavigateValue.formType ===
                        "OppF-CF-AccF-CF-OppF" ||
                      accountFormNavigateValue.formType === "CF-AccF-CF"
                    ) {
                      props.PageNavigation("AddContact");
                    } else {
                      props.PageNavigation("Accounts");
                      init();
                    }
                  }}
                >
                  Cancel
                </PrimaryButton>
                {formShow.add ? (
                  <>
                    {accountFormNavigateValue.formType !== "DF-AccF-DF" &&
                      accountFormNavigateValue.formType !== "CF-AccF-CF" &&
                      accountFormNavigateValue.formType !==
                        "OppF-CF-AccF-CF-OppF" && (
                        <PrimaryButton
                          className={styles.updateBtn}
                          iconProps={{ iconName: "SaveAndClose" }}
                          onClick={() => {
                            Validation("SaveNew");
                          }}
                        >
                          Save and New
                        </PrimaryButton>
                      )}
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
    </>
  );
};

export default AccountsFormPage;
