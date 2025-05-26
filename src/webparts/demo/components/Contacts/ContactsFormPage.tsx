/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import styles from "../Deals/DealsFormPage.module.scss";
import {
  DatePicker,
  IDatePickerStyles,
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
import * as moment from "moment";
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
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  IContactFormData,
  IContactFormPageNavigate,
  IFormShow,
} from "../Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { setAccountFormData, setContactFormData } from "../Redux/PageData";

// Interfaces
interface IAccountSelectContactData {
  ID: number | null;
  ContactId: number[];
}
interface IResponse {
  ContactOwnerId: number;
  FirstName: string;
  LastName: string;
  AccountId: number | null;
  PhoneNumber: string;
  JobTitle: string;
  Email: string;
  LeadSource: string;
  AnnualRevenue: string;
  DateOfBirth: any;
  State: string;
  Country: string;
  Description: string;
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

const ContactsFormPage = (props: IProps) => {
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
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const contactFormNavigateValue: IContactFormPageNavigate = useSelector(
    (state: any) => state.PageData.contactFormValue
  );
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
  const configDefaults = ConfigPageDefaultValue();

  // States Variables
  const [selectedData, setSelectedData] =
    useState<IContactFormData>(_contactEmptyData);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [_onChangeAllChoices, set_onChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [accountSelectContactData, setAccountSelectContactData] = useState<
    IAccountSelectContactData[]
  >([
    {
      ID: null,
      ContactId: [],
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [formShow, setFormShow] = useState<IFormShow>({
    add: false,
    view: false,
    edit: false,
    delete: false,
  });
  const [dataChange, setDataChange] = useState<boolean>(false);

  // All Functions
  const GetAllChoices = async () => {
    try {
      const AllChoicesList: IAllChoiceColumn = {
        ...ConfigureationData.allChoicesData,
        Account: [],
      };

      const accountList: any[] = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMAccounts,
        Filter: [{ FilterKey: "IsDeleted", Operator: "ne", FilterValue: "1" }],
        Topcount: 5000,
      });

      const tempAccountSelectContactData: IAccountSelectContactData[] = [];

      if (accountList?.length) {
        for (const item of accountList) {
          AllChoicesList.Account.push({
            name: item.AccountName,
            code: item.ID,
          });

          tempAccountSelectContactData.push({
            ID: item.ContactId?.length ? item.Id : null,
            ContactId: item.ContactId || [],
          });
        }
        setAccountSelectContactData(tempAccountSelectContactData);
      }

      setAllChoices(AllChoicesList);
      set_onChangeAllChoices(AllChoicesList);

      const { formType, id, contactFormData } = contactFormNavigateValue;

      if (formType === "ContactEditForm") {
        GetLeadData(id);
      } else {
        setSelectedData(
          formType === "OppF-CF-AccF-CF-OppF" ||
            formType === "OppF-CF-OppF" ||
            formType === "CF-AccF-CF"
            ? contactFormData
            : _contactEmptyData
        );
        setFormShow({ add: true, view: false, edit: false, delete: false });
        setLoader(false);
      }
    } catch (err) {
      ErrorFunction(err, "Account name get error");
    }
  };

  const GetLeadData = (ID: number) => {
    SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.CRMContacts,
      SelectedId: ID,
      Select: "*,ContactOwner/EMail,Account/AccountName",
      Expand: "ContactOwner,Account",
    })
      .then((res: any) => {
        if (res) {
          setSelectedData({
            ID: res.ID ? res.ID : null,
            Description: res.Description ? res.Description : "",
            Email: res.Email ? res.Email : "",
            FirstName: res.FirstName ? res.FirstName : "",
            Account: res.AccountId
              ? { code: res.AccountId, name: res.Account.AccountName }
              : null,
            JobTitle: res.JobTitle ? res.JobTitle : "",
            LastName: res.LastName ? res.LastName : "",
            ContactOwner: res.ContactOwner ? [res.ContactOwner.EMail] : [],
            ContactOwnerId: res.ContactOwnerId ? res.ContactOwnerId : null,
            LeadSource: res.LeadSource ? res.LeadSource : "",
            AnnualRevenue: res.AnnualRevenue ? res.AnnualRevenue : "",
            Phone: res.PhoneNumber ? res.PhoneNumber : "",
            Country: res.Country ? res.Country : "",
            DateOfBirth: res.DateOfBirth ? res.DateOfBirth : "",
            State: res.State ? res.State : "",
            OldData: {
              ID: res.ID ? res.ID : null,
              Description: res.Description ? res.Description : "",
              Email: res.Email ? res.Email : "",
              FirstName: res.FirstName ? res.FirstName : "",
              Account: res.AccountId
                ? {
                    code: res.AccountId,
                    name: res.Account.AccountName,
                  }
                : null,
              JobTitle: res.JobTitle ? res.JobTitle : "",
              LastName: res.LastName ? res.LastName : "",
              ContactOwner: res.ContactOwner ? [res.ContactOwner.EMail] : [],
              ContactOwnerId: res.ContactOwnerId ? res.ContactOwnerId : null,
              LeadSource: res.LeadSource ? res.LeadSource : "",
              AnnualRevenue: res.AnnualRevenue ? res.AnnualRevenue : "0",
              Phone: res.PhoneNumber ? res.PhoneNumber : "",
              Country: res.Country ? res.Country : "",
              DateOfBirth: res.DateOfBirth ? res.DateOfBirth : "",
              State: res.State ? res.State : "",
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
          setSelectedData(_contactEmptyData);
          setLoader(false);
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Lead data error");
      });
  };

  const OnChange = (text: string, value: any) => {
    let _tempSelectdData = { ...selectedData };
    let _temp_onAllChoices = { ..._onChangeAllChoices };

    if (text === "ContactOwner") {
      _tempSelectdData.ContactOwner = value.length
        ? [value[0].secondaryText]
        : [];
      _tempSelectdData.ContactOwnerId = value.length ? value[0].id : null;
    } else if (text === "Account") {
      const accountName = value;
      const filteredAccount =
        accountName !== ""
          ? _temp_onAllChoices.Account.filter((_e) => {
              return _e.name.toLowerCase().includes(accountName?.toLowerCase());
            })
          : [];

      const accountCode =
        filteredAccount.length > 0 ? filteredAccount[0].code : 0;

      _tempSelectdData[text] = {
        name: accountName,
        code: accountCode,
      };
    } else {
      if (text in _tempSelectdData) {
        (_tempSelectdData as any)[text] = value;
      }
    }

    set_onChangeAllChoices({ ..._temp_onAllChoices });
    setSelectedData({ ..._tempSelectdData });

    // data change check
    if (contactFormNavigateValue.formType == "ContactEditForm") {
      if (
        _tempSelectdData?.Account?.code ==
          selectedData?.OldData?.Account?.code &&
        _tempSelectdData?.AnnualRevenue ==
          selectedData?.OldData?.AnnualRevenue &&
        _tempSelectdData?.ContactOwnerId ==
          selectedData?.OldData?.ContactOwnerId &&
        _tempSelectdData?.Country?.trim() ==
          selectedData?.OldData?.Country?.trim() &&
        _tempSelectdData?.Description?.trim() ==
          selectedData?.OldData?.Description?.trim() &&
        _tempSelectdData?.Email?.trim() ==
          selectedData?.OldData?.Email?.trim() &&
        _tempSelectdData?.FirstName?.trim() ==
          selectedData?.OldData?.FirstName?.trim() &&
        _tempSelectdData?.JobTitle == selectedData?.OldData?.JobTitle &&
        _tempSelectdData?.LastName?.trim() ==
          selectedData?.OldData?.LastName?.trim() &&
        _tempSelectdData?.LeadSource == selectedData?.OldData?.LeadSource &&
        _tempSelectdData?.Phone?.trim() ==
          selectedData?.OldData?.Phone?.trim() &&
        _tempSelectdData?.State?.trim() ==
          selectedData?.OldData?.State?.trim() &&
        ((!_tempSelectdData?.DateOfBirth &&
          !selectedData?.OldData?.DateOfBirth) ||
          (moment(_tempSelectdData?.DateOfBirth).isValid() &&
            moment(selectedData?.OldData?.DateOfBirth).isValid() &&
            moment(_tempSelectdData?.DateOfBirth).isSame(
              selectedData?.OldData?.DateOfBirth,
              "day"
            ) &&
            moment(_tempSelectdData?.DateOfBirth).isSame(
              selectedData?.OldData?.DateOfBirth,
              "month"
            ) &&
            moment(_tempSelectdData?.DateOfBirth).isSame(
              selectedData?.OldData?.DateOfBirth,
              "year"
            ))) &&
        _tempSelectdData?.State?.trim() == selectedData?.OldData?.State?.trim()
      ) {
        setDataChange(false);
      } else {
        setDataChange(true);
      }
    }
  };

  const Validation = (savePage: string) => {
    let errorMsg: string = "";

    if (selectedData.ContactOwner.length == 0) {
      errorMsg = "ContactOwner";
    } else if (selectedData.FirstName.trim() == "") {
      errorMsg = "FirstName";
    } else if (selectedData.Phone.trim() == "") {
      errorMsg = "Phone";
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

  const searchItems = (
    event: AutoCompleteCompleteEvent,
    choice: keyof IAllChoiceColumn
  ) => {
    let query = event.query.trim();
    let originalChoices = [..._onChangeAllChoices[choice]];
    let _filteredItems: // IChoice
    any[] = [];

    if (!query.length) {
      _filteredItems = _onChangeAllChoices[choice];
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
      ContactOwnerId: selectedData.ContactOwnerId,
      FirstName: selectedData.FirstName,
      LastName: selectedData.LastName,
      PhoneNumber: selectedData.Phone,
      JobTitle: selectedData.JobTitle.trim(),
      Email: selectedData.Email,
      AnnualRevenue: selectedData.AnnualRevenue,
      LeadSource: selectedData.LeadSource.trim(),
      Description: selectedData.Description,
      AccountId: selectedData.Account ? selectedData.Account.code : null,
      Country: selectedData.Country,
      DateOfBirth: selectedData.DateOfBirth
        ? moment(selectedData.DateOfBirth).format("MM/DD/YYYY")
        : null,
      State: selectedData.State,
    };

    if (formShow.add) {
      const MovePagenation = async (_contactChoice: any) => {
        await setLoader(true);

        const AllChoicesUpdate = () => {
          // All Choices temp add with duplicate checks
          const addUniqueChoice = (choices: any[], selectedChoice: any) => {
            return selectedChoice &&
              !choices.some((choice) => choice.value === selectedChoice.value)
              ? [...choices, selectedChoice]
              : choices;
          };

          const fields: string[] = ["Account", "JobTitle", "LeadSource"];

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

          // Set the updated choices
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

        if (
          contactFormNavigateValue.formType == "OppF-CF-AccF-CF-OppF" ||
          contactFormNavigateValue.formType === "OppF-CF-OppF"
        ) {
          AllChoicesUpdate();
          setSelectedData(_contactEmptyData);
          setLoader(false);
          props.Notify("success", "Success", "Contact added successfully");
          props.PageNavigation("AddOpportunity");
        } else {
          AllChoicesUpdate();
          setSelectedData(_contactEmptyData);
          setLoader(false);
          props.Notify("success", "Success", "Contact added successfully");
          props.PageNavigation(savePage === "Save" ? "Contacts" : "AddContact");
        }
      };

      await SPServices.SPAddItem({
        Listname: Config.ListNames.CRMContacts,
        RequestJSON: json,
      })
        .then(async (_addedContact: any) => {
          let _fullName: string = `${
            _addedContact?.data?.FirstName ? _addedContact?.data?.FirstName : ""
          } ${
            _addedContact?.data?.LastName ? _addedContact?.data?.LastName : ""
          }`;
          let _contactChoice = {
            label: _fullName,
            value: _addedContact?.data?.ID,
          };

          if (selectedData.Account?.name && selectedData.Account?.code) {
            await SPServices.SPUpdateItem({
              ID: selectedData.Account.code,
              Listname: Config.ListNames.CRMAccounts,
              RequestJSON: {
                ContactId: { results: [_addedContact.data.Id] },
              },
            })
              .then((_contact) => {
                MovePagenation(_contactChoice);
              })
              .catch((err: any) => {
                ErrorFunction(err, "Contact ID added in Account lookup error");
              });
          } else {
            MovePagenation(_contactChoice);
          }
        })
        .catch((err: any) => {
          ErrorFunction(err, "Contact add error");
        });
    } else if (formShow.edit) {
      await SPServices.SPUpdateItem({
        ID: selectedData.ID ?? 0,
        Listname: Config.ListNames.CRMContacts,
        RequestJSON: json,
      })
        .then(async (updated: any) => {
          const _contactId: number[] = [];

          accountSelectContactData.forEach((_e) => {
            if (
              selectedData.Account?.code === _e.ID ||
              selectedData.OldData.Account?.code === _e.ID
            ) {
              _contactId.push(..._e.ContactId);
            }
          });

          if (selectedData.Account || selectedData.OldData.Account) {
            const uniqueID = Array.from(
              new Set(
                _contactId.concat(
                  selectedData.ID !== null ? [selectedData.ID] : []
                )
              )
            );
            await SPServices.SPUpdateItem({
              ID: selectedData.Account?.code ?? 0,
              Listname: Config.ListNames.CRMAccounts,
              RequestJSON: {
                ContactId: { results: uniqueID },
              },
            })
              .then((_contact) => {
                props.Notify(
                  "success",
                  "Success",
                  "Contact updated successfully"
                );
                props.PageNavigation("Contacts");
              })
              .catch((err: any) => {
                ErrorFunction(
                  err,
                  "Account ID updated in contact lookup error"
                );
              });
          } else {
            props.Notify("success", "Success", "Contact updated successfully");
            props.PageNavigation("Contacts");
          }
        })
        .catch((err: any) => {
          ErrorFunction(err, "Contact update error");
        });
    }
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
  };

  const init = () => {
    setLoader(true);
    GetAllChoices();
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
              {formShow.view ? "View" : formShow.edit ? "Edit" : "New"} Contact
            </h2>

            <div className={styles.addUpdateBtns}>
              {formShow.view && (
                <>
                  <PrimaryButton
                    className={styles.backBtn}
                    iconProps={{ iconName: "ChromeBack" }}
                    onClick={() => {
                      let contactFormValue: IContactFormPageNavigate = {
                        contactFormData: _contactEmptyData,
                        formType: "",
                        id: 0,
                      };
                      setFormShow({
                        add: false,
                        delete: false,
                        edit: false,
                        view: false,
                      });
                      dispatch(setContactFormData(contactFormValue));
                      props.PageNavigation("Contacts");
                    }}
                  >
                    Back
                  </PrimaryButton>
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
                </>
              )}
            </div>
          </div>
          <div className={styles.formPage}>
            <div className={styles.firstPage}>
              <div className={styles.allField}>
                <label>Contact Owner</label>
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
                      errorMessage === "ContactOwner"
                        ? peopleErrorPickerStyles
                        : formShow.view
                        ? peoplePickerDisabledStyles
                        : peoplePickerStyles
                    }
                    searchTextLimit={2}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={100}
                    defaultSelectedUsers={selectedData.ContactOwner}
                    onChange={(items: IPersonaProps[]) => {
                      OnChange("ContactOwner", items);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="firstName">First name</label>
                <InputText
                  id="firstName"
                  placeholder="Enter a first name"
                  disabled={formShow.view}
                  style={{
                    border:
                      errorMessage === "FirstName"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.FirstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("FirstName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="lastName">Last name</label>
                <InputText
                  id="lastName"
                  placeholder="Enter a last name"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={selectedData.LastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("LastName", e.target.value);
                  }}
                />
              </div>

              <div className={styles.allField}>
                <label htmlFor="email">Email</label>
                <InputText
                  id="email"
                  placeholder="Enter a email"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  value={selectedData.Email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("Email", e.target.value);
                  }}
                />
              </div>
              <div className={styles.allField}>
                <label htmlFor="phone">Phone</label>
                <InputText
                  id="phone"
                  placeholder="Enter a Phone"
                  disabled={formShow.view}
                  style={{
                    border:
                      errorMessage === "Phone"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.Phone}
                  inputMode="numeric"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const phoneValue = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                    OnChange("Phone", phoneValue);
                  }}
                />
              </div>
            </div>
            <div className={styles.secondPage}>
              <div className={styles.allField}>
                <label htmlFor="account">Account</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="account"
                    value={selectedData.Account?.name}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledDropDownAndBtnAccountStyle
                    }`}
                    suggestions={allChoices.Account}
                    completeMethod={(event) => searchItems(event, "Account")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose account"
                    dropdown
                    disabled={formShow.view}
                    style={{
                      width: ConfigureationData.isAdmin ? "85%" : "100%",
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
                  {ConfigureationData.isAdmin && (
                    <PrimaryButton
                      style={{
                        cursor:
                          formShow.view || formShow.edit
                            ? "not-allowed"
                            : "pointer",
                      }}
                      className={`${styles.addBtn} ${
                        formShow.view || formShow.edit
                          ? styles.addBtnDisabled
                          : ""
                      }`}
                      disabled={formShow.view || formShow.edit}
                      iconProps={{ iconName: "Add" }}
                      onClick={() => {
                        if (!(formShow.view || formShow.edit)) {
                          const isOppForm: boolean =
                            contactFormNavigateValue.formType ===
                            "OppF-CF-AccF-CF-OppF";

                          const contactFormValue: IContactFormPageNavigate = {
                            contactFormData: selectedData,
                            formType: isOppForm
                              ? contactFormNavigateValue.formType
                              : "CF-AccF-CF",
                            id: contactFormNavigateValue.id,
                          };

                          const accountFormValue: IAccountFormPageNavigate = {
                            formType: isOppForm
                              ? contactFormNavigateValue.formType
                              : "CF-AccF-CF",
                            id: 0,
                          };

                          dispatch(setAccountFormData(accountFormValue));
                          dispatch(setContactFormData(contactFormValue));
                          props.PageNavigation("AddAccount");
                        }
                      }}
                    />
                  )}
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="jobTitle">Job Title</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="jobTitle"
                    value={selectedData.JobTitle}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.JobTitle}
                    completeMethod={(event) => searchItems(event, "JobTitle")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose job title"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("JobTitle", selectedValue);
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
                    style={{ width: "100%", height: "32px" }}
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
                <label>Date of Birth</label>
                <DatePicker
                  className={`${styles.textField} ${styles.dateField}`}
                  styles={
                    formShow.view ? DatePickerDisabledStyles : DatePickerStyles
                  }
                  disabled={formShow.view}
                  placeholder="Select a date..."
                  ariaLabel="Select a date"
                  value={
                    selectedData.DateOfBirth
                      ? new Date(selectedData.DateOfBirth)
                      : undefined
                  }
                  onSelectDate={(date: any) => {
                    OnChange("DateOfBirth", date);
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
            </div>
            <div className={styles.thirdPage}>
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
                      contactFormNavigateValue.formType === "ContactEditForm"
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
                        AnnualRevenue: selectedData.OldData.AnnualRevenue,
                        ContactOwner: selectedData.OldData.ContactOwner,
                        ContactOwnerId: selectedData.OldData.ContactOwnerId,
                        Country: selectedData.OldData.Country,
                        DateOfBirth: selectedData.OldData.DateOfBirth,
                        Description: selectedData.OldData.Description,
                        Email: selectedData.OldData.Email,
                        FirstName: selectedData.OldData.FirstName,
                        ID: selectedData.OldData.ID,
                        JobTitle: selectedData.OldData.JobTitle,
                        LastName: selectedData.OldData.LastName,
                        LeadSource: selectedData.OldData.LeadSource,
                        Phone: selectedData.OldData.Phone,
                        State: selectedData.OldData.State,
                      }));
                    } else if (
                      contactFormNavigateValue.formType ==
                        "OppF-CF-AccF-CF-OppF" ||
                      contactFormNavigateValue.formType === "OppF-CF-OppF"
                    ) {
                      props.PageNavigation("AddOpportunity");
                    } else {
                      init();
                      props.PageNavigation("Contacts");
                    }
                  }}
                >
                  Cancel
                </PrimaryButton>
                {formShow.add ? (
                  <>
                    {contactFormNavigateValue.formType !==
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

export default ContactsFormPage;
