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
import selfComponentStyles from "./Projects.module.scss";
import "../../../../ExternalRef/CSS/Style.css";
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
  IPeoplePickerDetails,
} from "../../../../ExternalRef/CommonServices/interface";
import { IConfigState } from "../Redux/ConfigPageInterfaces";
import { useSelector } from "react-redux";
import { sp } from "@pnp/sp";
import Billings from "../Billings/Billings";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import Loading from "../../../../ExternalRef/Loader/Loading";
import { Dialog } from "primereact/dialog";

const ProjectFormPage = (props: any) => {
  // Local Variables:
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  //Local States:
  const [leadOptions, setLeadOptions] = useState<IBasicDropDown[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [files, setFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<any[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [billingsData, setBillingsData] = useState<any[]>([]);
  const [PMOusers, setPMOusers] = useState<IPeoplePickerDetails[]>([]);
  const [DHusers, setDHusers] = useState<IPeoplePickerDetails[]>([]);
  const [isApproval, setIsApproval] = useState<any>({
    boolean: false,
    id: null,
  });
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
      BillingContactName: "",
      BillingContactEmail: "",
      BillingContactMobile: "",
      BillingAddress: "",
      Remarks: "",
    });
    props?.refresh();
    props?.goBack();
  };

  //Get Billings Data:
  const getBillingsAddDetails = (details: any) => {
    setBillingsData(details);
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
        getPMOGroupUsers();
        getDHGroupMembers();
      })
      .catch((err) => {
        console.error("Error fetching CRMLeads:", err);
      });
  };

  //Get Group Members:
  const getPMOGroupUsers = () => {
    SPServices.getSPGroupMember({
      GroupName: Config.GroupNames.PMO,
    })
      .then((res: any) => {
        const tempUsers: IPeoplePickerDetails[] = [];
        res.forEach((items: any) => {
          tempUsers.push({
            id: items?.Id,
            email: items?.Email,
            name: items?.Title,
          });
        });
        setPMOusers([...tempUsers]);
      })
      .catch((err) => {
        console.log(err, "Get PMO group users error in projectsFormPage.tsx");
      });
  };

  //Get DH Group members:
  const getDHGroupMembers = () => {
    SPServices.getSPGroupMember({
      GroupName: Config.GroupNames.DH,
    })
      .then((res) => {
        const tempDHusers: IPeoplePickerDetails[] = [];
        res.forEach((items: any) => {
          tempDHusers.push({
            id: items?.Id,
            email: items?.Email,
            name: items?.Title,
          });
        });
        setDHusers([...tempDHusers]);
      })
      .catch((err) => {
        console.log(err, "Get DH group users errro in projectsFormPage.tsx");
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
      LoadExistingFiles(props?.data?.ID);
    }
  }, [props?.data, leadOptions]);

  //LoadExistingFiles in Library:
  const LoadExistingFiles = async (id: number) => {
    const projectId = `${id}`;
    sp.web.lists
      .getByTitle(Config.LibraryNames?.ProjectFiles)
      .items.select(
        "*,FileLeafRef,FileRef,FileDirRef,Author/Id,Author/Title,Author/EMail"
      )
      .filter(`project eq '${projectId}' and IsDelete eq false`)
      .expand("File,Author")
      .orderBy("Modified", false)
      .get()
      .then((res: any) => {
        let tempData: any = [];
        if (res?.length) {
          res?.forEach((val: any) => {
            tempData.push({
              name: val?.File?.Name || "",
              ulr: val?.File?.ServerRelativeUrl || "",
              createdDate: val?.Created ? new Date(val?.Created) : null,
              authorEmail: val?.Author?.EMail || "",
            });
          });
        }
        setFiles([...tempData]);
      })
      .catch((err: any) => {
        console.log(
          err,
          "Get existing files data error in ProjectsFormPage.tsx component"
        );
      });
  };

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
      case "BillingContactName":
      case "BillingContactEmail":
      case "BillingContactMobile":
      case "BillingAddress":
      case "Remarks":
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
    if (!isValidField("BillingContactName", formData?.BillingContactName))
      errors.BillingContactName = true;
    if (!isValidField("BillingContactEmail", formData?.BillingContactEmail))
      errors.BillingContactEmail = true;
    if (!isValidField("BillingContactMobile", formData?.BillingContactMobile))
      errors.BillingContactMobile = true;
    if (!isValidField("BillingAddress", formData?.BillingAddress))
      errors.BillingAddress = true;
    if (!isValidField("Remarks", formData?.Remarks)) errors.Remarks = true;

    setErrorMessage(errors);

    if (Object.keys(errors).length === 0) {
      generateJson();
    }
  };

  //Json Generations:
  const generateJson = () => {
    setLoader(true);
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
      BillingContactName: formData?.BillingContactName,
      BillingContactEmail: formData?.BillingContactEmail,
      BillingContactMobile: formData?.BillingContactMobile,
      BillingAddress: formData?.BillingAddress,
      Remarks: formData?.Remarks,
    };
    if (props?.isEdit) {
      handleUpdate(json);
    } else {
      generateProjectId(json);
    }
  };

  //Update Datas to CRMProjects List:
  const handleUpdate = async (json: any) => {
    try {
      // 1. Update CRMProjects main item
      await SPServices.SPUpdateItem({
        Listname: Config.ListNames.CRMProjects,
        RequestJSON: json,
        ID: formData?.ID,
      });

      // 2. Commit deletes in ProjectFiles library
      if (deletedFiles.length > 0) {
        for (const file of deletedFiles) {
          const items = await sp.web.lists
            .getByTitle(Config.LibraryNames?.ProjectFiles)
            .items.filter(`FileLeafRef eq '${file.name}'`)
            .select("Id", "FileLeafRef")
            .get();

          if (items.length > 0) {
            const itemId = items[0].Id;
            await sp.web.lists
              .getByTitle(Config.LibraryNames?.ProjectFiles)
              .items.getById(itemId)
              .update({
                IsDelete: true,
              });
          }
        }
        setDeletedFiles([]);
      }

      // 3. Add new files to library
      if (files?.length > 0) {
        // filter new files only
        const newFiles = files.filter((f: any) => f.objectURL);

        if (newFiles.length > 0) {
          await addAttachmentsInLibrary(formData?.ID, newFiles);
        }
      }

      props.Notify("success", "Success", "Details updated successfully");
      setLoader(false);
      emptyDatas();
      sessionStorage.removeItem("billingsData");
    } catch (err) {
      console.log(
        err,
        "Update Datas to CRMProjects err in ProjectsFormPage.tsx component"
      );
    }
  };

  //handle approval process:
  const handleApprovalFunc = () => {
    const currObj = {
      IsApproved: true,
    };
    const reSubmitObj = {
      IsApproved: true,
      ProjectStatus: "Initiated",
    };
    SPServices.SPUpdateItem({
      ID: formData?.ProjectStatus == "Rejected" ? formData?.ID : isApproval?.id,
      Listname: Config.ListNames.CRMProjects,
      RequestJSON:
        formData?.ProjectStatus == "Rejected" ? reSubmitObj : currObj,
    })
      .then(() => {
        props.Notify("success", "Success", "Approval sent successfully");
        setIsApproval({
          boolean: false,
          id: null,
        });
        emptyDatas();
      })
      .catch((err) => {
        console.log(err, "Approval send err in projects.tsx component");
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
  const handleAdd = async (json: any) => {
    try {
      const createItem: any = await SPServices.SPAddItem({
        Listname: Config.ListNames.CRMProjects,
        RequestJSON: json,
      });

      const projectId = createItem?.data?.ID;

      // 1. If files available → wait until uploaded
      if (files?.length > 0) {
        await addAttachmentsInLibrary(projectId, files);
      }

      // 2. Billings add logic
      if (billingsData?.length > 0 && projectId && props?.isAdd) {
        for (const bill of billingsData) {
          const billingJson = {
            ...bill,
            ProjectId: projectId,
          };
          try {
            await SPServices.SPAddItem({
              Listname: Config.ListNames.CRMBillings,
              RequestJSON: billingJson,
            });
            setIsApproval({
              boolean: true,
              id: projectId,
            });
            sessionStorage.removeItem("billingsData");
          } catch (err) {
            console.error("Error adding billing:", err);
          }
        }
      }

      // 3. Success notify
      props.Notify(
        "success",
        "Success",
        billingsData?.length > 0 &&
          PMOusers?.some(
            (user) =>
              user?.email?.toLowerCase() ===
              props?.loginUserEmail?.toLowerCase()
          )
          ? "Details added successfully. Now click Send Approval button"
          : props?.isAdd
          ? "Details added successfully"
          : ""
      );

      // 4. Reset approval + cleanup
      setIsApproval({
        boolean: true,
        id: projectId,
      });
      sessionStorage.removeItem("billingsData");
      setLoader(false);
      PMOusers?.some(
        (user) =>
          user?.email?.toLowerCase() === props?.loginUserEmail?.toLowerCase()
      )
        ? ""
        : emptyDatas();
    } catch (err) {
      console.log(
        err,
        "Add Datas to CRMProjects err in ProjectsFormPage.tsx component"
      );
    }
  };

  //Add attachment to library:
  const addAttachmentsInLibrary = async (
    ProjectID: number,
    uploadFiles: File[]
  ) => {
    try {
      for (const file of uploadFiles) {
        const fileBuffer = await file.arrayBuffer();

        const uploadResult = await sp.web
          .getFolderByServerRelativeUrl(Config.LibraryNames?.ProjectFiles)
          .files.add(file.name, fileBuffer, true);

        const item = await uploadResult.file.listItemAllFields.get();

        await sp.web.lists
          .getByTitle(Config.LibraryNames?.ProjectFiles)
          .items.getById(item.Id)
          .update({
            projectId: ProjectID,
          });
      }
      setFiles([]);
    } catch (error) {
      console.error("Error uploading project files:", error);
    }
  };

  //Project manager status updated funtions :
  const handleStatusUpdate = (status: string) => {
    const approveObj = {
      IsApproved: false,
      ProjectStatus: status,
      IsProjectManager: true,
    };
    const rejectObj = {
      IsApproved: false,
      ProjectStatus: status,
    };
    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CRMProjects,
      ID: formData?.ID,
      RequestJSON: status == "Pending" ? approveObj : rejectObj,
    })
      .then(() => {
        props.Notify("success", "Success", `Project ${status} successfully`);
        emptyDatas();
      })
      .catch((err) => {
        console.error(`Error updating project to ${status}:`, err);
      });
  };

  //DH status updated functions:
  const handleDHUsersStatusUpdate = (status: string) => {
    const CurrentObj = {
      ProjectStatus: status,
      IsProjectManager: false,
    };

    SPServices.SPUpdateItem({
      Listname: Config.ListNames.CRMProjects,
      ID: formData?.ID,
      RequestJSON: CurrentObj,
    })
      .then(() => {
        props.Notify("success", "Success", `Project ${status} successfully`);
        emptyDatas();
      })
      .catch((err) => {
        console.error(`Error updating project to ${status}:`, err);
      });
  };

  //Handle File Selection:
  const handleFileSelection = async (e, files, setFiles, Config) => {
    try {
      const existingSPFiles = await sp.web.lists
        .getByTitle(Config?.LibraryNames?.ProjectFiles)
        .items.select("FileLeafRef")
        .filter(`IsDelete eq false`)
        .get();

      const spFileNames = existingSPFiles.map((file) => file.FileLeafRef);

      const duplicatesInSP = e.files.filter((newFile) =>
        spFileNames.includes(newFile.name)
      );

      const duplicatesInState = e.files.filter((newFile) =>
        files.some((existing) => existing.name === newFile.name)
      );

      const totalDuplicates = [...duplicatesInSP, ...duplicatesInState];

      const newFiles = e.files.filter(
        (newFile) =>
          !spFileNames.includes(newFile.name) &&
          !files.some((existing) => existing.name === newFile.name)
      );

      if (totalDuplicates.length > 0) {
        props.Notify("info", "Info", "Some file names already exist!");
      }

      if (newFiles.length > 0) {
        setFiles([...files, ...newFiles]);
      }
    } catch (error) {
      console.error("Error in file selection:", error);
    }
  };

  //DownLoad File Function:
  const downloadFile = (file: any) => {
    const anchortag = document.createElement("a");
    anchortag.setAttribute("href", file?.ulr ? file?.ulr : file?.objectURL);
    anchortag.setAttribute("target", "_blank");
    anchortag.setAttribute("download", "");
    anchortag.click();
    anchortag.remove();
  };

  // Temporary Remove File (state only):
  const removeFile = (fileName: string) => {
    // Find the file that was removed
    const removedFile = files.find((file) => file.name === fileName);

    if (removedFile) {
      setDeletedFiles((prev) => [...prev, removedFile]); // keep track of removed
    }

    // Remove from current UI state
    const updatedFiles = files.filter((file) => file.name !== fileName);
    setFiles(updatedFiles);
  };

  // Handle Reject Dialog Hide with Reason:
  const handleRejectWithReason = () => {
    if (rejectReason.trim() === "") {
      props.Notify("error", "Error", "Please enter a reason for rejection");
    } else {
      const json = {
        Reason: rejectReason,
        ProjectId: props?.data?.ID,
      };

      SPServices.SPAddItem({
        Listname: Config.ListNames.RejectComments,
        RequestJSON: json,
      })
        .then(() => {
          handleStatusUpdate("Rejected");
          setRejectReason("");
          setShowRejectDialog(false);
        })
        .catch((err) => {
          console.log(err, "Error in adding reject reason");
        });
    }
  };

  //Initial Render:
  React.useEffect(() => {
    getLeads();
    if (!props?.data) {
      setFormData({
        ProjectID: "",
        Lead: "",
        AccountName: "",
        ProjectName: "",
        StartDate: null,
        PlannedEndDate: null,
        ProjectManager: [],
        ProjectStatus: "Initiated",
        BillingModel: "",
        BillingContactName: "",
        BillingContactEmail: "",
        BillingContactMobile: "",
        BillingAddress: "",
        Remarks: "",
      });
    }
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <div style={{ overflow: "auto" }} className={styles.viewFormMain}>
          <div className={styles.viewFormNavBar}>
            <h2>
              {props?.isAdd
                ? "Add Projects"
                : props?.isEdit
                ? "Edit Projects"
                : "View Projects"}
            </h2>
          </div>
          <div
            style={{ height: "auto" }}
            className={selfComponentStyles.formPage}
          >
            <div className={selfComponentStyles.firstPage}>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
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
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
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
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Account name</Label>
                <InputText
                  onChange={(e) =>
                    handleOnChange("AccountName", e.target.value)
                  }
                  value={formData?.AccountName}
                  disabled={props?.isView}
                  style={
                    errorMessage["AccountName"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Project name</Label>
                <InputText
                  onChange={(e) =>
                    handleOnChange("ProjectName", e.target.value)
                  }
                  value={formData?.ProjectName}
                  disabled={props?.isView}
                  style={
                    errorMessage["ProjectName"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Start date</Label>
                <DatePicker
                  value={
                    formData?.StartDate
                      ? new Date(formData.StartDate)
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
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Attachment</Label>
                {!props?.isView ? (
                  <FileUpload
                    className="addFileButton"
                    name="demo[]"
                    mode="basic"
                    onSelect={(e) =>
                      handleFileSelection(e, files, setFiles, Config)
                    }
                    url="/api/upload"
                    auto
                    multiple
                    maxFileSize={1000000}
                    style={{ width: "14%" }}
                    chooseLabel="Browse"
                    chooseOptions={{ icon: "pi pi-upload" }}
                  />
                ) : (
                  ""
                )}
              </div>
              {files.length > 0 && (
                <ul className="fileContainer">
                  {files.map((file: any, index) => (
                    <li className={selfComponentStyles?.fileList} key={index}>
                      <div className={selfComponentStyles.filNameTag}>
                        <div
                          onClick={() => downloadFile(file)}
                          style={{
                            cursor: "pointer",
                          }}
                          title={file?.name}
                        >
                          {file?.name.length > 23
                            ? `${file?.name.slice(0, 23)}...`
                            : file?.name}
                        </div>
                        {!props?.isView ? (
                          <div className={selfComponentStyles.filesIconDiv}>
                            <i
                              className="pi pi-times"
                              onClick={() => removeFile(file?.name)}
                            ></i>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={selfComponentStyles.secondPage}>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>BillingContactName</Label>
                <InputText
                  onChange={(e) =>
                    handleOnChange("BillingContactName", e.target.value)
                  }
                  value={formData?.BillingContactName}
                  disabled={props?.isView}
                  style={
                    errorMessage["BillingContactName"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Planned end date</Label>
                <DatePicker
                  value={
                    formData?.PlannedEndDate
                      ? new Date(formData?.PlannedEndDate)
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
                  onSelectDate={(date) =>
                    handleOnChange("PlannedEndDate", date)
                  }
                  disabled={props?.isView}
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Project manager</Label>
                <div
                  className={`${selfComponentStyles.textField} ${selfComponentStyles.peoplePicker}`}
                >
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
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Project Status</Label>
                <Dropdown
                  options={
                    props?.initialCRMProjectsListDropContainer?.projectStaus
                  }
                  optionLabel="name"
                  value={props?.initialCRMProjectsListDropContainer?.projectStaus.find(
                    (item) => item.name === formData?.ProjectStatus
                  )}
                  onChange={(e) =>
                    handleOnChange("ProjectStatus", e?.value?.name)
                  }
                  disabled
                  style={
                    errorMessage["ProjectStatus"]
                      ? { border: "2px solid #ff0000", borderRadius: "4px" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Billing model</Label>
                <Dropdown
                  options={
                    props?.initialCRMProjectsListDropContainer?.BillingModel
                  }
                  optionLabel="name"
                  value={props?.initialCRMProjectsListDropContainer?.BillingModel.find(
                    (item) => item.name === formData?.BillingModel
                  )}
                  onChange={(e) =>
                    handleOnChange("BillingModel", e?.value?.name)
                  }
                  disabled={props?.isView || formData?.BillingModel}
                  style={
                    errorMessage["BillingModel"]
                      ? { border: "2px solid #ff0000", borderRadius: "4px" }
                      : undefined
                  }
                />
              </div>
            </div>
            <div className={selfComponentStyles.thirdPage}>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>BillingContactEmail</Label>
                <InputText
                  onChange={(e) =>
                    handleOnChange("BillingContactEmail", e.target.value)
                  }
                  value={formData?.BillingContactEmail}
                  disabled={props?.isView}
                  style={
                    errorMessage["BillingContactEmail"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>BillingContactMobile</Label>
                <InputText
                  onChange={(e) =>
                    handleOnChange("BillingContactMobile", e.target.value)
                  }
                  value={formData?.BillingContactMobile}
                  disabled={props?.isView}
                  style={
                    errorMessage["BillingContactMobile"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>BillingAddress</Label>
                <InputTextarea
                  onChange={(e) =>
                    handleOnChange("BillingAddress", e.target.value)
                  }
                  value={formData?.BillingAddress}
                  disabled={props?.isView}
                  maxLength={500}
                  style={
                    errorMessage["BillingAddress"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
              <div className={`${selfComponentStyles.allField} dealFormPage`}>
                <Label>Remarks</Label>
                <InputTextarea
                  onChange={(e) => handleOnChange("Remarks", e.target.value)}
                  value={formData?.Remarks}
                  disabled={props?.isView}
                  maxLength={500}
                  style={
                    errorMessage["Remarks"]
                      ? { border: "2px solid #ff0000" }
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
          {formData.BillingModel && (
            <Billings
              loginUserEmail={props?.loginUserEmail}
              getBillingsAddDetails={getBillingsAddDetails}
              isAdd={props?.isAdd}
              BillingModel={formData?.BillingModel}
              data={props?.data}
              goBack={props?.goBack}
              spfxContext={props.spfxContext}
              Notify={props.Notify}
              setCurrentPage={props?.setCurrentPage}
            />
          )}
          <div className={styles.addUpdateBtns}>
            {(props?.isAdd && isApproval?.boolean == false) ||
            props?.isEdit ||
            props?.isView ? (
              <PrimaryButton
                className={styles.cancelBtn}
                iconProps={{ iconName: "cancel" }}
                onClick={() => {
                  emptyDatas();
                  sessionStorage.removeItem("billingsData");
                }}
              >
                Cancel
              </PrimaryButton>
            ) : (
              ""
            )}

            {props?.isView == false && isApproval?.boolean == false && (
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

            {(PMOusers?.some(
              (user) =>
                user?.email?.toLowerCase() ===
                props?.loginUserEmail?.toLowerCase()
            ) &&
              props?.isAdd) ||
            (PMOusers?.some(
              (user) =>
                user?.email?.toLowerCase() ===
                props?.loginUserEmail?.toLowerCase()
            ) &&
              formData?.ProjectStatus == "Rejected") ? (
              <PrimaryButton
                onClick={() => {
                  if (
                    (isApproval?.boolean && props?.isAdd) ||
                    (formData?.ProjectStatus == "Rejected" && props?.isEdit)
                  ) {
                    handleApprovalFunc();
                  } else {
                    props.Notify(
                      "info",
                      "Info",
                      "Please save the data first, then click again to send approval"
                    );
                  }
                }}
                style={{ borderRadius: "5px" }}
              >
                {formData?.ProjectStatus == "Rejected"
                  ? "Resubmit"
                  : "Send approval"}
              </PrimaryButton>
            ) : (
              ""
            )}
            {props?.isEdit &&
              formData?.IsApproved &&
              formData?.ProjectManager?.some(
                (pm: IPeoplePickerDetails) =>
                  pm?.email?.toLowerCase() ===
                  props?.loginUserEmail?.toLowerCase()
              ) &&
              formData?.ProjectStatus !== "Approved" &&
              formData?.ProjectStatus !== "Rejected" && (
                <>
                  <PrimaryButton
                    onClick={() => handleStatusUpdate("Pending")}
                    style={{ borderRadius: "5px" }}
                  >
                    Approve
                  </PrimaryButton>
                  <PrimaryButton
                    // onClick={() => handleStatusUpdate("Rejected")}
                    onClick={() => setShowRejectDialog(true)}
                    className={styles.cancelBtn}
                  >
                    Reject
                  </PrimaryButton>
                </>
              )}
            {/*...................This buttons only DH Approvers.............................*/}
            {props?.isEdit &&
              DHusers?.some(
                (user) =>
                  user?.email?.toLowerCase() ===
                  props?.loginUserEmail?.toLowerCase()
              ) &&
              formData?.IsProjectManager &&
              formData?.IsApproved == false &&
              formData?.ProjectStatus == "Pending" && (
                <>
                  <PrimaryButton
                    onClick={() => {
                      handleDHUsersStatusUpdate("Approved");
                    }}
                    style={{ borderRadius: "5px" }}
                  >
                    Approve
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={() => handleDHUsersStatusUpdate("Rejected")}
                    className={styles.cancelBtn}
                  >
                    Reject
                  </PrimaryButton>
                </>
              )}
          </div>
        </div>
      )}
      <Dialog
        header="Enter Rejection Reason"
        visible={showRejectDialog}
        style={{ width: "400px" }}
        modal
        onHide={() => setShowRejectDialog(false)}
      >
        <div className="p-fluid">
          <div className="p-field">
            <Label>Reason</Label>
            <InputTextarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              autoResize
            />
          </div>
        </div>

        <div className={selfComponentStyles.reasonButtonContainer}>
          <PrimaryButton
            className={styles.cancelBtn}
            style={{
              backgroundColor: "#aa1f1f",
              color: "#fff",
              borderRadius: "4px",
            }}
            iconProps={{ iconName: "cancel" }}
            onClick={() => setShowRejectDialog(false)}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            style={{
              backgroundColor: "#0d900d",
              color: "#fff",
              borderRadius: "4px",
            }}
            className={styles.updateBtn}
            iconProps={{ iconName: "Save" }}
            onClick={handleRejectWithReason}
          >
            OK
          </PrimaryButton>
        </div>
      </Dialog>
    </>
  );
};
export default ProjectFormPage;
