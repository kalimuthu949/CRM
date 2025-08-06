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
import { useState } from "react";
import { DatePicker, PrimaryButton } from "@fluentui/react";
import { InputText } from "primereact/inputtext";
import { Label } from "office-ui-fabric-react";
import { Dropdown } from "primereact/dropdown";
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import {
  Config,
  DatePickerStyles,
  peopleErrorPickerStyles,
  peoplePickerStyles,
} from "../../../../ExternalRef/CommonServices/Config";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import {
  IBasicDropDown,
  ICRMProjectsListDrop,
  IPeoplePickerDetails,
} from "../../../../ExternalRef/CommonServices/interface";
import { IConfigState } from "../Redux/ConfigPageInterfaces";
import { useSelector } from "react-redux";
import { sp } from "@pnp/sp";
// import { PrincipalType } from "@pnp/sp";

const ProjectFormPage = (props: any) => {
  // Local Variables:
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const [
    initialCRMProjectsListDropContainer,
    setinitialCRMProjectsListDropContainer,
  ] = useState<ICRMProjectsListDrop>({
    ...Config.CRMProjectsDropDown,
  });
  //Local States:
  const [leadOptions, setLeadOptions] = useState<IBasicDropDown[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<{ [key: string]: boolean }>(
    {}
  );
  console.log(formData, "formData");

  //Get All choices from Project List:
  const getAllChoices = () => {
    SPServices.SPGetChoices({
      Listname: Config.ListNames.CRMProjects,
      FieldName: "ProjectStatus",
    })
      .then((res: any) => {
        let tempProjectStatus: IBasicDropDown[] = [];
        if (res?.Choices?.length) {
          res?.Choices?.forEach((val: any) => {
            tempProjectStatus.push({
              name: val,
            });
          });
        }
        setinitialCRMProjectsListDropContainer(
          (prev: ICRMProjectsListDrop) => ({
            ...prev,
            projectStaus: tempProjectStatus,
          })
        );
        SPServices.SPGetChoices({
          Listname: Config.ListNames.CRMProjects,
          FieldName: "BillingModel",
        })
          .then((res: any) => {
            let tempBillingModel: IBasicDropDown[] = [];
            if (res?.Choices?.length) {
              res?.Choices?.forEach((val: any) => {
                tempBillingModel.push({
                  name: val,
                });
              });
            }
            setinitialCRMProjectsListDropContainer(
              (prev: ICRMProjectsListDrop) => ({
                ...prev,
                BillingModel: tempBillingModel,
              })
            );
            getLeads();
          })
          .catch((err) => {
            console.log(err, "Get choice error from CRMProjects list");
          });
      })
      .catch((err) => {
        console.log(err, "Get choice error from CRMProjects list");
      });
  };

  //Data refresh and goBack mainPage function:
  const emptyDatas = () => {
    setFormData({
      ProjectID: "",
      Lead: "",
      AccountName: "",
      ProjectName: "",
      StartDate: null,
      PlannedEndDate: null,
      ProjectManager: [],
      ProjectStatus: "",
      BillingModel: "",
    });
    props?.refresh();
    props?.goBack();
  };

  //GetLeads List Data Only FirstName And ID:
  const getLeads = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMLeads,
      Select: "*",
      Orderby: "Modified",
      Orderbydecorasc: true,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "eq",
          FilterValue: "false",
        },
      ],
    })
      .then((res: any[]) => {
        const leads: IBasicDropDown[] = res.map((item) => ({
          id: item.ID,
          name: item.FirstName,
        }));
        setLeadOptions(leads);
      })
      .catch((err) => {
        console.error("Error fetching CRMLeads:", err);
      });
  };

  //Set default user in peoplepicker:
  const getSelectedEmails = (selectedUsers: IPeoplePickerDetails[]) => {
    let selectedEmails: string[] = [];
    if (selectedUsers?.length) {
      selectedUsers?.forEach((user: IPeoplePickerDetails) => {
        selectedEmails.push(user?.email);
      });
    }
    return selectedEmails;
  };

  //handleOnChange function:
  const handleOnChange = (field: string, value: any) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
    // Remove the error once user starts typing
    setErrorMessage((prevErrors) => ({
      ...prevErrors,
      [field]: !isValidField(field, value),
    }));
  };

  //Convert DatePickerShowValue :
  const convertDMYtoDate = (dateInput: any): Date | undefined => {
    try {
      if (typeof dateInput === "string") {
        const [day, month, year] = dateInput.split("/");
        return new Date(`${year}-${month}-${day}`);
      } else if (dateInput instanceof Date) {
        return dateInput;
      }
    } catch (error) {
      console.error("Invalid date input:", error);
    }
    return undefined;
  };

  //RowData is once comming then data set to the state:
  React.useEffect(() => {
    if (props?.data && leadOptions.length > 0) {
      setFormData((prev: any) => {
        const newForm = { ...props.data };
        if (props.data?.Lead && typeof props?.data?.Lead === "string") {
          const matchedLead = leadOptions.find(
            (x) => x.name === props.data.Lead
          );
          if (matchedLead) {
            newForm.Lead = matchedLead;
          }
        }
        return newForm;
      });
    }
  }, [props?.data, leadOptions]);

  //Validations:
  const isValidField = (field: string, value: any): boolean => {
    switch (field) {
      case "ProjectManager":
        return value && value.length > 0;

      case "Lead":
        return value && typeof value === "object" && value.name?.trim() !== "";

      case "ProjectStatus":
      case "BillingModel":
      case "AccountName":
      case "ProjectName":
        return value && typeof value === "string" && value.trim() !== "";

      case "StartDate":
      case "PlannedEndDate":
        return value !== null && value !== undefined;

      default:
        return true;
    }
  };
  const Validation = () => {
    let errors: { [key: string]: boolean } = {};

    if (!isValidField("ProjectManager", formData?.ProjectManager))
      errors.ProjectManager = true;
    if (!isValidField("Lead", formData?.Lead)) errors.Lead = true;
    if (!isValidField("AccountName", formData?.AccountName))
      errors.AccountName = true;
    if (!isValidField("ProjectName", formData?.ProjectName))
      errors.ProjectName = true;
    if (!isValidField("StartDate", formData?.StartDate))
      errors.StartDate = true;
    if (!isValidField("PlannedEndDate", formData?.PlannedEndDate))
      errors.PlannedEndDate = true;
    if (!isValidField("ProjectStatus", formData?.ProjectStatus))
      errors.ProjectStatus = true;
    if (!isValidField("BillingModel", formData?.BillingModel))
      errors.BillingModel = true;

    setErrorMessage(errors);

    if (Object.keys(errors).length === 0) {
      generateJson();
    }
  };

  //Json Generations:
  const generateJson = () => {
    let ProjectManagerIds: number[] = JSON.parse(
      JSON.stringify(formData?.ProjectManager)
    )
      .map((user: IPeoplePickerDetails) => user.id)
      .sort((a, b) => a - b);

    let json: any = {
      ProjectID: formData?.ProjectID,
      LeadId: formData?.Lead?.id,
      AccountName: formData?.AccountName,
      ProjectName: formData?.ProjectName,
      StartDate: SPServices.GetDateFormat(formData?.StartDate),
      PlannedEndDate: SPServices.GetDateFormat(formData?.PlannedEndDate),
      ProjectManagerId: { results: ProjectManagerIds },
      ProjectStatus: formData?.ProjectStatus,
      BillingModel: formData?.BillingModel,
    };
    if (props?.isEdit) {
      handleUpdate(json);
    } else {
      generateProjectId(json);
    }
  };

  //Update Datas to CRMProjects List:
  const handleUpdate = (json: any) => {
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CRMProjects,
      RequestJSON: json,
      ID: formData?.ID,
    })
      .then(() => {
        props.Notify("success", "Success", "Details updated successfully");
        emptyDatas();
      })
      .catch((err) => {
        console.log(
          err,
          "Update Datas to CRMProjects err in ProjectsFormPage.tsx component"
        );
      });
  };

  //Generate ProjectId:
  const generateProjectId = (json: any) => {
    sp.web.lists
      .getByTitle(Config.ListNames.CRMProjects)
      .items.orderBy("ID", false)
      .top(1)
      .get()
      .then((res: any) => {
        let format: string = "PRJ-";
        let lastId = res[0]?.ProjectID || "";
        let newId = SPServices.GenerateFormatId(format, lastId, 3);
        handleAdd({ ...json, ProjectID: newId });
      })
      .catch((err: any) =>
        console.log(
          err,
          "getDetails from CRMPojects err in ProjectsFormPage.tsx component"
        )
      );
  };

  //Add datas to CRMProjects List:
  const handleAdd = (json: any) => {
    SPServices.SPAddItem({
      Listname: Config.ListNames.CRMProjects,
      RequestJSON: json,
    })
      .then(() => {
        props.Notify("success", "Success", "Details added successfully");
        emptyDatas();
      })
      .catch((err) => {
        console.log(
          err,
          "Add Datas to CRMProjects err in ProjectsFormPage.tsx component"
        );
      });
  };

  //Initial Render:
  React.useEffect(() => {
    getAllChoices();
    if (!props?.data) {
      setFormData({
        ProjectID: "",
        Lead: "",
        AccountName: "",
        ProjectName: "",
        StartDate: null,
        PlannedEndDate: null,
        ProjectManager: [],
        ProjectStatus: "",
        BillingModel: "",
      });
    }
  }, []);

  return (
    <div className={styles.viewFormMain}>
      <div className={styles.viewFormNavBar}>
        <h2>
          {props?.isAdd
            ? "Add Projects"
            : props?.isEdit
            ? "Edit Projects"
            : "View Projects"}
        </h2>
      </div>
      <div className={styles.formPage}>
        <div className={styles.firstPage}>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Project id</Label>
            <InputText
              onChange={(e) => handleOnChange("ProjectID", e.target.value)}
              value={
                props?.isView || props?.isEdit
                  ? formData?.ProjectID
                  : "Auto generate"
              }
              disabled
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Lead</Label>
            <Dropdown
              value={formData?.Lead}
              options={leadOptions}
              optionLabel="name"
              onChange={(e) => handleOnChange("Lead", e.value)}
              disabled={props?.isView}
              style={
                errorMessage["Lead"]
                  ? { border: "2px solid #ff0000" }
                  : undefined
              }
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Account name</Label>
            <InputText
              onChange={(e) => handleOnChange("AccountName", e.target.value)}
              value={formData?.AccountName}
              disabled={props?.isView}
              style={
                errorMessage["AccountName"]
                  ? { border: "2px solid #ff0000" }
                  : undefined
              }
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Project name</Label>
            <InputText
              onChange={(e) => handleOnChange("ProjectName", e.target.value)}
              value={formData?.ProjectName}
              disabled={props?.isView}
              style={
                errorMessage["ProjectName"]
                  ? { border: "2px solid #ff0000" }
                  : undefined
              }
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Start date</Label>
            <DatePicker
              value={
                formData?.StartDate
                  ? convertDMYtoDate(formData?.StartDate)
                  : undefined
              }
              styles={
                errorMessage["StartDate"]
                  ? {
                      root: {
                        border: "2px solid #ff0000",
                        height: "35px",
                        borderRadius: "4px",
                      },
                    }
                  : DatePickerStyles
              }
              onSelectDate={(date) => handleOnChange("StartDate", date)}
              disabled={props?.isView}
            />
          </div>
        </div>
        <div className={styles.secondPage}>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Planned end date</Label>
            <DatePicker
              value={
                formData?.PlannedEndDate
                  ? convertDMYtoDate(formData?.PlannedEndDate)
                  : undefined
              }
              styles={
                errorMessage["PlannedEndDate"]
                  ? {
                      root: {
                        border: "2px solid #ff0000",
                        height: "35px",
                        borderRadius: "4px",
                      },
                    }
                  : DatePickerStyles
              }
              onSelectDate={(date) => handleOnChange("PlannedEndDate", date)}
              disabled={props?.isView}
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Project manager</Label>
            <div className={`${styles.textField} ${styles.peoplePicker}`}>
              <PeoplePicker
                styles={
                  errorMessage["ProjectManager"]
                    ? peopleErrorPickerStyles
                    : peoplePickerStyles
                }
                ensureUser
                placeholder="Select the Person"
                personSelectionLimit={1}
                context={ConfigureationData.context}
                defaultSelectedUsers={getSelectedEmails(
                  props?.data?.ProjectManager
                )}
                webAbsoluteUrl={
                  ConfigureationData.context._pageContext._web.absoluteUrl
                }
                resolveDelay={100}
                onChange={(items: any[]) =>
                  handleOnChange("ProjectManager", items)
                }
                disabled={props?.isView}
              />
            </div>
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Project Status</Label>
            <Dropdown
              options={initialCRMProjectsListDropContainer?.projectStaus}
              optionLabel="name"
              // value={{ name: formData?.ProjectStatus }}
              value={initialCRMProjectsListDropContainer?.projectStaus.find(
                (item) => item.name === formData?.ProjectStatus
              )}
              onChange={(e) => handleOnChange("ProjectStatus", e?.value?.name)}
              disabled={props?.isView}
              style={
                errorMessage["ProjectStatus"]
                  ? { border: "2px solid #ff0000", borderRadius: "4px" }
                  : undefined
              }
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Billing model</Label>
            <Dropdown
              options={initialCRMProjectsListDropContainer?.BillingModel}
              optionLabel="name"
              // value={{ name: formData?.BillingModel }}3
              value={initialCRMProjectsListDropContainer?.BillingModel.find(
                (item) => item.name === formData?.BillingModel
              )}
              onChange={(e) => handleOnChange("BillingModel", e?.value?.name)}
              disabled={props?.isView}
              style={
                errorMessage["BillingModel"]
                  ? { border: "2px solid #ff0000", borderRadius: "4px" }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
      <div className={styles.addUpdateBtns}>
        <PrimaryButton
          className={styles.cancelBtn}
          iconProps={{ iconName: "cancel" }}
          onClick={() => emptyDatas()}
        >
          Cancel
        </PrimaryButton>
        {props?.isView == false && (
          <PrimaryButton
            className={styles.updateBtn}
            iconProps={{ iconName: "Save" }}
            onClick={() => {
              Validation();
            }}
          >
            {props?.isEdit ? "Update" : "Save"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
export default ProjectFormPage;
