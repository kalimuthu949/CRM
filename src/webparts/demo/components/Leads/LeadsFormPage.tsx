/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
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
import {
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  ILeadFormData,
  ILeadFormPageNavigate,
} from "../Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { setLeadFormData } from "../Redux/PageData";

// Interfaces
interface IFormShow {
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}
interface IReponse {
  LeadOwnerId: any;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  JobTitle: string;
  Email: string;
  Company: string;
  NumberOfEmployees: number;
  AnnualRevenue: string;
  WebSite: string;
  LeadStatus: string;
  LeadSource: string;
  Industry: string;
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
const LeadsFormPage = (props: IProps) => {
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
  const leadNavigateValue: ILeadFormPageNavigate = useSelector(
    (state: any) => state.PageData.leadFormValue
  );
  const configDefaults = ConfigPageDefaultValue();
  const _leadEmptyData: ILeadFormData = {
    ID: null,
    LeadOwner: [ConfigureationData.currentUserEmail],
    LeadOwnerId: ConfigureationData.currentUserId,
    FirstName: "",
    LastName: "",
    Phone: "",
    JobTitle: "",
    AnnualRevenue: "",
    Company: "",
    NumberOfEmployees: "",
    Email: "",
    WebSite: "",
    LeadStatus: "",
    LeadSource: "",
    Industry: "",
    Country: "",
    State: "",
    Description: "",
    OldData: {
      ID: null,
      LeadOwner: [ConfigureationData.currentUserEmail],
      LeadOwnerId: ConfigureationData.currentUserId,
      FirstName: "",
      LastName: "",
      Phone: "",
      JobTitle: "",
      AnnualRevenue: "",
      Company: "",
      NumberOfEmployees: "",
      Email: "",
      WebSite: "",
      LeadStatus: "",
      LeadSource: "",
      Industry: "",
      Country: "",
      State: "",
      Description: "",
    },
  };

  // States Variables
  const [selectedData, setSelectedData] =
    useState<ILeadFormData>(_leadEmptyData);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [_onChangeAllChoices, set_onChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [formShow, setFormShow] = useState<IFormShow>(
    configDefaults.formShowEmptyValue
  );
  const [dataChange, setDataChange] = useState<boolean>(false);

  // All Functions
  const GetAllChoices = async () => {
    const _allChoices = { ...ConfigureationData.allChoicesData };

    setAllChoices(_allChoices);
    set_onChangeAllChoices(_allChoices);

    if (leadNavigateValue.value == "LeadEditForm") {
      GetLeadData(leadNavigateValue.id);
    } else {
      setFormShow({
        add: true,
        view: false,
        edit: false,
        delete: false,
      });
      setSelectedData(_leadEmptyData);
      setLoader(false);
    }
  };

  const GetLeadData = (ID: number) => {
    SPServices.SPReadItemUsingId({
      Listname: Config.ListNames.CRMLeads,
      SelectedId: ID,
      Select: "*,LeadOwner/EMail",
      Expand: "LeadOwner",
    })
      .then((res: any) => {
        if (res) {
          const commonFields = {
            ID: res.ID ?? null,
            Description: res.Description ?? "",
            Email: res.Email ?? "",
            FirstName: res.FirstName ?? "",
            Industry: res.Industry ?? "",
            JobTitle: res.JobTitle ?? "",
            LastName: res.LastName ?? "",
            LeadOwner: res.LeadOwner ? [res.LeadOwner.EMail] : [],
            LeadOwnerId: res.LeadOwnerId ?? null,
            LeadSource: res.LeadSource ?? "",
            LeadStatus: res.LeadStatus ?? "",
            Phone: res.PhoneNumber ?? "",
            WebSite: res.WebSite ?? "",
            AnnualRevenue: res.AnnualRevenue ?? "0",
            Company: res.Company ?? "",
            Country: res.Country ?? "",
            State: res.State ?? "",
            NumberOfEmployees: res.NumberOfEmployees ?? "0",
          };

          setSelectedData({
            ...commonFields,
            OldData: { ...commonFields },
          });

          setFormShow({ view: true, add: false, edit: false, delete: false });
          setLoader(false);
        } else {
          setFormShow({ view: true, add: false, edit: false, delete: false });
          setSelectedData(_leadEmptyData);
          setLoader(false);
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Lead data error");
      });
  };

  const OnChange = (text: string, value: any) => {
    let _tempSelectdData = { ...selectedData };

    if (text === "LeadOwner") {
      _tempSelectdData.LeadOwner = value.length ? [value[0].secondaryText] : [];
      _tempSelectdData.LeadOwnerId = value.length ? value[0].id : null;
    } else if (text === "AnnualRevenue") {
      _tempSelectdData[text] = value == "" ? "0" : value;
    } else if (text === "NumberOfEmployees") {
      _tempSelectdData[text] =
        typeof value === "number" ? value : value.replace(/,/g, "");
    } else {
      _tempSelectdData[text] = value;
    }

    setSelectedData({ ..._tempSelectdData });

    // data change check
    if (leadNavigateValue.value === "LeadEditForm") {
      const fieldsToCompare: (keyof typeof _tempSelectdData)[] = [
        "AnnualRevenue",
        "Company",
        "Country",
        "Description",
        "Email",
        "FirstName",
        "Industry",
        "JobTitle",
        "LastName",
        "LeadOwnerId",
        "LeadSource",
        "LeadStatus",
        "NumberOfEmployees",
        "Phone",
        "State",
        "WebSite",
      ];

      const isChanged = fieldsToCompare.some((key) => {
        const updatedValue =
          typeof _tempSelectdData[key] === "string"
            ? (_tempSelectdData[key] as string).trim()
            : _tempSelectdData[key];
        const oldValue =
          typeof selectedData?.OldData?.[key] === "string"
            ? selectedData.OldData[key]?.trim()
            : selectedData?.OldData?.[key];
        return updatedValue !== oldValue;
      });

      setDataChange(isChanged);
    }
  };

  const Validation = (savePage: string) => {
    let errorMsg: string = "";

    if (selectedData.LeadOwner.length == 0) {
      errorMsg = "LeadOwner";
    } else if (selectedData.FirstName.trim() == "") {
      errorMsg = "FirstName";
    } else if (selectedData.Company.trim() == "") {
      errorMsg = "Company";
    } else if (selectedData.Phone == "") {
      errorMsg = "Phone";
    } else if (selectedData.Email.trim() == "") {
      errorMsg = "Email";
    } else if (selectedData.Country.trim() == "") {
      errorMsg = "Country";
    }

    setErrorMessage(errorMsg);

    if (!errorMsg) {
      DataStore(savePage);
    }
  };

  const formatNumberWithCommas = (value: string | number) => {
    const numberValue =
      typeof value == "string" ? Number(value.replace(/,/g, "")) : value;
    return new Intl.NumberFormat("en-IN").format(Number(numberValue));
  };

  const searchItems = (event: AutoCompleteCompleteEvent, choice: string) => {
    let query = event.query.trim();
    let originalChoices = [..._onChangeAllChoices[choice]];
    let _filteredItems: typeof originalChoices = [];

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
    const {
      LeadOwnerId,
      FirstName,
      LastName,
      Phone,
      JobTitle,
      Email,
      WebSite,
      LeadStatus,
      LeadSource,
      Industry,
      Description,
      AnnualRevenue,
      Company,
      Country,
      State,
      NumberOfEmployees,
      ID,
    } = selectedData;

    const json: IReponse = {
      LeadOwnerId,
      FirstName: FirstName.trim(),
      LastName: LastName.trim(),
      PhoneNumber: Phone,
      JobTitle: JobTitle.trim(),
      Email: Email.trim(),
      WebSite: WebSite.trim(),
      LeadStatus: LeadStatus.trim(),
      LeadSource: LeadSource.trim(),
      Industry: Industry.trim(),
      Description: Description.trim(),
      AnnualRevenue,
      Company: Company.trim(),
      Country: Country.trim(),
      State: State.trim(),
      NumberOfEmployees:
        typeof NumberOfEmployees === "number"
          ? NumberOfEmployees
          : Number(NumberOfEmployees.replace(/,/g, "")),
    };

    const addUniqueChoice = (choices: IChoice[], selectedChoice: IChoice) =>
      selectedChoice &&
      !choices.some((choice) => choice.code === selectedChoice.code)
        ? [...choices, selectedChoice]
        : choices;

    const updateAllChoices = async () => {
      const updatedChoices = {
        JobTitle: addUniqueChoice(_onChangeAllChoices.JobTitle, {
          name: JobTitle,
          code: JobTitle,
        }),
        LeadStatus: addUniqueChoice(_onChangeAllChoices.LeadStatus, {
          name: LeadStatus,
          code: LeadStatus,
        }),
        LeadSource: addUniqueChoice(_onChangeAllChoices.LeadSource, {
          name: LeadSource,
          code: LeadSource,
        }),
        Industry: addUniqueChoice(_onChangeAllChoices.Industry, {
          name: Industry,
          code: Industry,
        }),
      };

      setAllChoices((prev) => ({ ...prev, ...updatedChoices }));
      set_onChangeAllChoices((prev) => ({ ...prev, ...updatedChoices }));
    };

    try {
      if (formShow.add) {
        setLoader(true);
        await SPServices.SPAddItem({
          Listname: Config.ListNames.CRMLeads,
          RequestJSON: json,
        });

        await updateAllChoices();

        const _leadFormData: ILeadFormPageNavigate = { id: 0, value: "" };
        dispatch(setLeadFormData(_leadFormData));
        setSelectedData(_leadEmptyData);
        setLoader(false);
        props.Notify("success", "Success", "Lead added successfully");
        props.PageNavigation(savePage === "Save" ? "Leads" : "AddLead");
      } else if (formShow.edit) {
        await SPServices.SPUpdateItem({
          ID: ID ?? 0,
          Listname: Config.ListNames.CRMLeads,
          RequestJSON: json,
        });

        const _leadFormData: ILeadFormPageNavigate = { id: 0, value: "" };
        dispatch(setLeadFormData(_leadFormData));
        props.Notify("success", "Success", "Lead updated successfully");
        props.PageNavigation("Leads");
      }
    } catch (err) {
      ErrorFunction(err, formShow.add ? "Lead add error" : "Lead update error");
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
              {formShow.view ? "View" : formShow.edit ? "Edit" : "New"} lead
            </h2>

            <div className={styles.addUpdateBtns}>
              {formShow.view && (
                <>
                  <PrimaryButton
                    className={styles.backBtn}
                    iconProps={{ iconName: "ChromeBack" }}
                    onClick={() => {
                      let _leadFormData: ILeadFormPageNavigate = {
                        id: 0,
                        value: "",
                      };
                      dispatch(setLeadFormData(_leadFormData));
                      props.PageNavigation("Leads");
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
                <label>Lead Owner</label>
                <div className={`${styles.textField} ${styles.peoplePicker}`}>
                  <PeoplePicker
                    context={ConfigureationData.context}
                    personSelectionLimit={1}
                    webAbsoluteUrl={
                      ConfigureationData.context._pageContext._web.absoluteUrl
                    }
                    required
                    placeholder="Select the Person"
                    disabled={formShow.view}
                    ensureUser
                    styles={
                      errorMessage === "LeadOwner"
                        ? peopleErrorPickerStyles
                        : formShow.view
                        ? peoplePickerDisabledStyles
                        : peoplePickerStyles
                    }
                    searchTextLimit={2}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={100}
                    defaultSelectedUsers={selectedData.LeadOwner}
                    onChange={(items: IPersonaProps[]) => {
                      OnChange("LeadOwner", items);
                    }}
                  />
                </div>
              </div>
              <div className={styles.allField}>
                <label htmlFor="firstName">First name</label>
                <InputText
                  id="firstName"
                  placeholder="Enter a first name"
                  style={{
                    border:
                      errorMessage === "FirstName"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  disabled={formShow.view}
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
                <label htmlFor="companyName">Company Name</label>
                <InputText
                  id="companyName"
                  placeholder="Enter a company name"
                  disabled={formShow.view}
                  style={{
                    border:
                      errorMessage === "Company"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.Company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("Company", e.target.value);
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
              <div className={styles.allField}>
                <label htmlFor="email">Email</label>
                <InputText
                  id="email"
                  placeholder="Enter a email"
                  disabled={formShow.view}
                  style={{
                    border:
                      errorMessage === "Email"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
                  value={selectedData.Email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    OnChange("Email", e.target.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.secondPage}>
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
                <label htmlFor="leadStatus">Lead Status</label>
                <div className={styles.addNewChoice}>
                  <AutoComplete
                    id="leadStatus"
                    value={selectedData.LeadStatus}
                    className={`${styles.dropDownStyles} ${
                      formShow.view && styles.disabledStyle
                    }`}
                    suggestions={allChoices.LeadStatus}
                    completeMethod={(event) => searchItems(event, "LeadStatus")}
                    virtualScrollerOptions={{ itemSize: 38 }}
                    field="name"
                    placeholder="Enter or choose lead status"
                    dropdown
                    disabled={formShow.view}
                    style={{ width: "100%", height: "32px" }}
                    onChange={(e: AutoCompleteChangeEvent) => {
                      const selectedValue =
                        e.value && typeof e.value === "object"
                          ? e.value.name
                          : e.value;
                      OnChange("LeadStatus", selectedValue);
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
                      OnChange("AnnualRevenue", inputValue);
                    }
                  }}
                />
                <span className={styles.probabiltyPercentage}>₹</span>
              </div>
              <div className={styles.allField}>
                <label htmlFor="numberOfEmployees">Number of Employees</label>
                <InputText
                  id="numberOfEmployees"
                  placeholder="Enter a number of employees"
                  disabled={formShow.view}
                  className={`${formShow.view && styles.inputDisabled}`}
                  type="text"
                  value={formatNumberWithCommas(selectedData.NumberOfEmployees)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue.replace(/,/g, "")))) {
                      OnChange("NumberOfEmployees", inputValue);
                    }
                  }}
                />
              </div>
            </div>
            <div className={styles.thirdPage}>
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
                  style={{
                    border:
                      errorMessage === "Country"
                        ? "2px solid #ff0000"
                        : undefined,
                  }}
                  className={`${styles.inputRequired} ${
                    formShow.view && styles.inputRequiredDisabled
                  }`}
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
                    if (leadNavigateValue.value === "LeadEditForm") {
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
                        AnnualRevenue: selectedData.OldData.AnnualRevenue,
                        Company: selectedData.OldData.Company,
                        Country: selectedData.OldData.Country,
                        Description: selectedData.OldData.Description,
                        Email: selectedData.OldData.Email,
                        FirstName: selectedData.OldData.FirstName,
                        ID: selectedData.OldData.ID,
                        Industry: selectedData.OldData.Industry,
                        JobTitle: selectedData.OldData.JobTitle,
                        LastName: selectedData.OldData.LastName,
                        LeadOwner: selectedData.OldData.LeadOwner,
                        LeadOwnerId: selectedData.OldData.LeadOwnerId,
                        LeadSource: selectedData.OldData.LeadSource,
                        LeadStatus: selectedData.OldData.LeadStatus,
                        NumberOfEmployees:
                          selectedData.OldData.NumberOfEmployees,
                        Phone: selectedData.OldData.Phone,
                        State: selectedData.OldData.State,
                        WebSite: selectedData.OldData.WebSite,
                      }));
                    } else {
                      let _leadFormData: ILeadFormPageNavigate = {
                        id: 0,
                        value: "",
                      };
                      dispatch(setLeadFormData(_leadFormData));
                      props.PageNavigation("Leads");
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
    </>
  );
};

export default LeadsFormPage;
