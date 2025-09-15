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
import styles from "./Projects.module.scss";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import {
  Config,
  RefreshButton,
} from "../../../../ExternalRef/CommonServices/Config";
import "../../../../ExternalRef/CSS/Style.css";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  multiPeoplePickerTemplate,
  peoplePickerTemplate,
  textTemplate,
} from "../../../../ExternalRef/CommonServices/CommonTemplate";
import {
  IBasicDropDown,
  ICRMProjectsListDrop,
  IDelModal,
  IPeoplePickerDetails,
  IProjectData,
} from "../../../../ExternalRef/CommonServices/interface";
import ProjectFormPage from "./ProjectsFormPage";
import { Modal, PrimaryButton } from "@fluentui/react";
import Billings from "../Billings/Billings";
import { Dropdown } from "primereact/dropdown";
import Loading from "../../../../ExternalRef/Loader/Loading";
import ChangeLog from "../ChangeLog/ChangeLog";
import { Dialog } from "primereact/dialog";
interface IProps {
  Notify: (
    type: "info" | "success" | "warn" | "error" | "secondary" | "contrast",
    summary: string,
    msg: string
  ) => void;
  spfxContext: any;
  pageName: string;
  loginUserEmail: string;
  PageNavigation: (pageName: string, data?: IProjectData) => void;
}
//Global Image Variables:
const PlusImage: string = require("../../../../ExternalRef/Images/plus.png");
const commentsImage: string = require("../../../../ExternalRef/Images/comment.png");
const DeleteImage: string = require("../../../../ExternalRef/Images/trashcan.png");
const EditImage: string = require("../../../../ExternalRef/Images/Edit.png");
const BillingImage: string = require("../../../../ExternalRef/Images/bill.png");
console.log(BillingImage);
const VersionHistoryImage: string = require("../../../../ExternalRef/Images/versionHistory.png");
const FilterImage: string = require("../../../../ExternalRef/Images/filter.png");
const FilterNoneImage: string = require("../../../../ExternalRef/Images/filternone.png");

const Projects = (props: IProps): JSX.Element => {
  //Local variables:
  const ScreenWidth: number = window.innerWidth;

  //Local States:
  const [projectDetails, setProjectDetails] = React.useState<IProjectData[]>(
    []
  );
  const [masterProjectDetails, setMasterProjectDetails] = React.useState<
    IProjectData[]
  >([]);
  const [currentPage, setCurrentPage] = React.useState<
    "list" | "form" | "BillingList"
  >("list");
  const [selectedData, setSelectedData] = React.useState<IProjectData | null>(
    null
  );
  const [formMode, setFormMode] = React.useState<"add" | "edit" | "view">(
    "add"
  );
  const [isDelModal, setIsDelModal] = React.useState<IDelModal>({
    isOpen: false,
    Id: null,
  });
  const [searchVal, setSearchVal] = React.useState<string>("");
  const [filterBar, setFilterBar] = React.useState<boolean>(false);
  const [filterValues, setFilterValues] = React.useState({
    ProjectID: "",
    Lead: "",
    AccountName: "",
    ProjectStatus: "",
    BillingModel: "",
  });
  const [
    initialCRMProjectsListDropContainer,
    setinitialCRMProjectsListDropContainer,
  ] = React.useState<ICRMProjectsListDrop>({
    ...Config.CRMProjectsDropDown,
  });
  const [loader, setLoader] = React.useState<boolean>(false);
  const [isChangeLogOpen, setIsChangeLogOpen] = React.useState<boolean>(false);
  const [eventID, setEventID] = React.useState<any>(null);
  const [rejectComments, setRejectComments] = React.useState<any[]>([]);
  const [isCommentsModal, setIsCommentsModal] = React.useState<IDelModal>({
    ...Config.initialModal,
  });
  console.log(rejectComments, "rejectComments");
  const [isCmtsLoader, setIsCmtsLoader] = React.useState(false);
  console.log(isCmtsLoader, "isCmtsLoader");

  //Get Project Details:
  const getProjectDetails = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMProjects,
      Select:
        "*,ProjectManager/Id,ProjectManager/EMail,ProjectManager/Title,Lead/Id,Lead/FirstName",
      Expand: "ProjectManager,Lead",
      Orderby: "Modified",
      Orderbydecorasc: true,
      Filter: [
        {
          FilterKey: "IsDelete",
          Operator: "eq",
          FilterValue: "false",
        },
      ],
    })
      .then((res: any) => {
        let projectDetails: IProjectData[] = [];
        res?.forEach((items: any) => {
          let _ProjectManager: IPeoplePickerDetails[] = [];
          if (items?.ProjectManager) {
            items?.ProjectManager.forEach((user: any) => {
              _ProjectManager.push({
                id: user?.Id,
                name: user?.Title,
                email: user?.EMail,
              });
            });
          }
          projectDetails.push({
            ID: items?.ID,
            ProjectID: items?.ProjectID,
            Lead: items?.Lead?.FirstName,
            LeadId: items?.LeadId,
            AccountName: items?.AccountName,
            ProjectName: items?.ProjectName,
            StartDate: items?.StartDate,
            PlannedEndDate: items?.PlannedEndDate,
            ProjectManager: _ProjectManager ? _ProjectManager : [],
            ProjectStatus: items?.ProjectStatus,
            BillingModel: items?.BillingModel,
            IsApproved: items?.IsApproved,
            IsProjectManager: items?.IsProjectManager,
            BillingContactName: items?.BillingContactName,
            BillingContactEmail: items?.BillingContactEmail,
            BillingContactMobile: items?.BillingContactMobile,
            BillingAddress: items?.BillingAddress,
            Remarks: items?.Remarks,
          });
        });
        setProjectDetails([...projectDetails]);
        setMasterProjectDetails([...projectDetails]);
        getAllChoices();
      })
      .catch((err) => {
        console.log(err, "getProjectDetails Error in Projects.tsx component");
      });
  };

  //Get All Choices in CRMProjects list:
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
            setLoader(false);
          })
          .catch((err) => {
            console.log(err, "Get choice error from CRMProjects list");
          });
      })
      .catch((err) => {
        console.log(err, "Get choice error from CRMProjects list");
      });
  };

  //Get RejectComments Details:
  const getAllRejectComments = (ID: number) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames?.RejectComments,
      Select: "*,Project/ID,Author/Title,Author/EMail,Author/ID",
      Expand: "Project,Author",
      Filter: [
        {
          FilterKey: "ProjectId",
          Operator: "eq",
          FilterValue: ID.toString(),
        },
      ],
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then((res) => {
        let tempRejectComments: any[] = [];
        if (res?.length) {
          res?.forEach((val: any) => {
            tempRejectComments.push({
              reason: val?.Reason,
              reasonUser: {
                name: val?.Author?.Title,
                email: val?.Author?.EMail,
                id: val?.Author?.ID,
              },
              created: val?.Created ? new Date(val?.Created) : null,
            });
          });
        }
        setRejectComments([...tempRejectComments]);
        setIsCmtsLoader(false);
      })
      .catch((err) => {
        setIsCmtsLoader(false);
        console.log("get ActionRegister Details", err);
      });
  };

  //Render Manager Column function:
  const renderManagersColumn = (rowData: IProjectData) => {
    const projectManagers: IPeoplePickerDetails[] = rowData?.ProjectManager;
    return (
      <div>
        {rowData?.ProjectManager?.length > 1
          ? multiPeoplePickerTemplate(projectManagers)
          : peoplePickerTemplate(projectManagers[0])}
      </div>
    );
  };

  //handle all filters:
  const handleFilterChange = (field: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //Delete Particular Item:
  const TrashItem = () => {
    const currObj = {
      IsDelete: true,
    };
    SPServices.SPUpdateItem({
      ID: isDelModal.Id ?? 0,
      Listname: Config.ListNames.CRMProjects,
      RequestJSON: currObj,
    })
      .then(() => {
        props.Notify("success", "Success", "Project Deleted successfully");
        getProjectDetails();
      })
      .catch((err) => {
        console.log(err, "rowData deleted err in projects.tsx component");
      });
  };

  //apply filters in purticular columns:
  const applyFilters = () => {
    const filtered = masterProjectDetails.filter((item) => {
      const matchProjectID = item?.ProjectID?.toLowerCase().includes(
        filterValues.ProjectID.toLowerCase()
      );
      const matchLead = item?.Lead?.toLowerCase().includes(
        filterValues.Lead.toLowerCase()
      );
      const matchAccount = item?.AccountName?.toLowerCase().includes(
        filterValues.AccountName.toLowerCase()
      );
      const matchStatus = filterValues.ProjectStatus
        ? item?.ProjectStatus === filterValues.ProjectStatus
        : true;
      const matchBilling = filterValues.BillingModel
        ? item?.BillingModel === filterValues.BillingModel
        : true;

      return (
        matchProjectID &&
        matchLead &&
        matchAccount &&
        matchStatus &&
        matchBilling
      );
    });

    setProjectDetails(filtered);
  };

  //Global Search functionalities:
  const searchProjectDetails = (val: string) => {
    setSearchVal(val);
    if (!val) {
      applyFilters();
      return;
    }

    const filtered = projectDetails.filter((item) => {
      const managerNames =
        item?.ProjectManager?.map((pm) => pm.name?.toLowerCase()).join(" ") ||
        "";
      return (
        item.ProjectID?.toLowerCase().includes(val.toLowerCase()) ||
        item.Lead?.toLowerCase().includes(val.toLowerCase()) ||
        item.AccountName?.toLowerCase().includes(val.toLowerCase()) ||
        item.ProjectName?.toLowerCase().includes(val.toLowerCase()) ||
        item.ProjectStatus?.toLowerCase().includes(val.toLowerCase()) ||
        item.BillingModel?.toLowerCase().includes(val.toLowerCase()) ||
        managerNames.includes(val.toLowerCase())
      );
    });
    setProjectDetails(filtered);
  };

  //ChangeLog Details:
  let changeLogDetails: any = {
    id: eventID,
    listName: Config.ListNames?.CRMProjects,
    columns: [
      {
        key: "ProjectID",
        type: "Text",
        name: "Project ID",
      },
      {
        key: "Lead",
        type: "Lookup",
        name: "Lead",
      },
      {
        key: "AccountName",
        type: "Text",
        name: "Account Name",
      },
      {
        key: "ProjectName",
        type: "Text",
        name: "Project Name",
      },
      {
        key: "StartDate",
        type: "Date",
        name: "Start Date",
      },
      {
        key: "PlannedEndDate",
        type: "Date",
        name: "Planned End Date",
      },
      {
        key: "ProjectManager",
        type: "PeoplePickerMultiple",
        name: "Project Manager",
      },
      {
        key: "ProjectStatus",
        type: "Text",
        name: "Project Status",
      },
      {
        key: "BillingModel",
        type: "Text",
        name: "Billing Model",
      },
      {
        key: "BillingContactName",
        type: "Text",
        name: "Billing Contact Name",
      },
      {
        key: "BillingContactEmail",
        type: "Text",
        name: "Billing Contact Email",
      },
      {
        key: "BillingContactMobile",
        type: "Text",
        name: "Billing Contact Mobile",
      },
      {
        key: "BillingAddress",
        type: "Text",
        name: "Billing Address",
      },
      {
        key: "Remarks",
        type: "Text",
        name: "Remarks",
      },
    ],
  };

  //Render Reject Reason Created Date function:
  const rejectReasonCreatedDate = (date: Date) => {
    return (
      <>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
          className="displayText"
        >
          {date ? moment(date).format("DD-MM-YYYY") : ""}
        </div>
      </>
    );
  };

  //ChangeLog Cancel function:
  const handleClose = () => {
    setIsChangeLogOpen(false);
  };

  //Initial Render:
  React.useEffect(() => {
    setLoader(true);
    getProjectDetails();
  }, []);

  //Filter changes render:
  React.useEffect(() => {
    applyFilters();
  }, [filterValues]);

  return (
    <>
      {loader ? (
        <Loading />
      ) : currentPage === "list" ? (
        <div className={styles.lcaBody}>
          <div
            className={`${styles.filterBarAndTableBorder} 
          ${ScreenWidth >= 1536 ? styles.filterBar_1536 : styles.filterBar_1396}
          `}
          >
            <div className={styles.filterBar}>
              <h2>Projects</h2>
            </div>
            <div className={styles.filterBtns}>
              <div className="all_search">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"> </InputIcon>
                  <InputText
                    value={searchVal}
                    onChange={(e) => searchProjectDetails(e.target.value)}
                    v-model="value1"
                    placeholder="Search"
                  />
                </IconField>
              </div>
              <div className={styles.btnAndText}>
                <div
                  className={styles.btnBackGround}
                  onClick={() => setFilterBar(!filterBar)}
                >
                  <img
                    src={filterBar ? FilterNoneImage : FilterImage}
                    alt="no image"
                  />
                  Filter
                </div>
              </div>
              <div className={styles.btnAndText}>
                <div
                  onClick={() => {
                    setSelectedData(null);
                    setFormMode("add");
                    setCurrentPage("form");
                    sessionStorage.removeItem("billingsData");
                  }}
                  className={styles.btnBackGround}
                >
                  <img
                    src={PlusImage}
                    alt="no image"
                    style={{ width: "15px", height: "15px" }}
                  />
                  New Project
                </div>
              </div>
            </div>
          </div>
          {filterBar ? (
            <div className={styles.filterFields}>
              <div className={styles.filterField}>
                <label>Project Id</label>
                <InputText
                  value={filterValues?.ProjectID}
                  onChange={(e) =>
                    handleFilterChange("ProjectID", e.target.value)
                  }
                  placeholder="Enter here"
                />
              </div>
              <div className={styles.filterField}>
                <label>Lead</label>
                <InputText
                  value={filterValues?.Lead}
                  onChange={(e) => handleFilterChange("Lead", e.target.value)}
                  placeholder="Enter here"
                />
              </div>
              <div className={styles.filterField}>
                <label>Account name</label>
                <InputText
                  value={filterValues?.AccountName}
                  onChange={(e) =>
                    handleFilterChange("AccountName", e.target.value)
                  }
                  placeholder="Enter here"
                />
              </div>
              <div className={`${styles.filterField} dropdown`}>
                <label>Project status</label>
                <Dropdown
                  options={initialCRMProjectsListDropContainer?.projectStaus}
                  optionLabel="name"
                  placeholder="Select a status"
                  value={initialCRMProjectsListDropContainer?.projectStaus.find(
                    (item) => item.name === filterValues?.ProjectStatus
                  )}
                  onChange={(e) =>
                    handleFilterChange("ProjectStatus", e.value?.name)
                  }
                />
              </div>
              <div className={`${styles.filterField} dropdown`}>
                <label>Billing model</label>
                <Dropdown
                  options={initialCRMProjectsListDropContainer?.BillingModel}
                  optionLabel="name"
                  placeholder="Select a billing model"
                  value={initialCRMProjectsListDropContainer?.BillingModel.find(
                    (item) => item.name === filterValues?.BillingModel
                  )}
                  onChange={(e) =>
                    handleFilterChange("BillingModel", e.value?.name)
                  }
                />
              </div>
              <div className={styles.filterField} style={{ width: "3%" }}>
                <PrimaryButton
                  styles={RefreshButton}
                  iconProps={{ iconName: "refresh" }}
                  className={styles.refresh}
                  onClick={() => {
                    setSearchVal("");
                    setFilterValues({
                      ProjectID: "",
                      Lead: "",
                      AccountName: "",
                      ProjectStatus: "",
                      BillingModel: "",
                    });
                  }}
                />
              </div>
            </div>
          ) : (
            ""
          )}
          <div
            className={`${styles.tableData} tableData
              ${ScreenWidth >= 1536 ? "data_table_1536" : "data_table_1396"}`}
          >
            <DataTable
              value={projectDetails}
              paginator={projectDetails && projectDetails?.length > 8}
              rows={8}
              onRowClick={(e: any) => {
                setSelectedData(e.data);
                setFormMode("view");
                setCurrentPage("form");
              }}
              emptyMessage={<p className={styles.noData}>No data !!!</p>}
            >
              <Column sortable field="ProjectID" header="Project id" />
              <Column sortable field="Lead" header="Lead"></Column>
              <Column
                sortable
                field="AccountName"
                header="Account name"
              ></Column>
              <Column
                sortable
                field="ProjectName"
                header="Project name"
              ></Column>
              <Column
                sortable
                field="StartDate"
                header="Start date"
                body={(rowData) => {
                  return (
                    <div>{moment(rowData?.StartDate).format("DD/MM/YYYY")}</div>
                  );
                }}
              ></Column>
              <Column
                sortable
                field="PlannedEndDate"
                header="End date"
                body={(rowData) => {
                  return (
                    <div>
                      {moment(rowData?.PlannedEndDate).format("DD/MM/YYYY")}
                    </div>
                  );
                }}
              ></Column>
              <Column
                sortable
                field="ProjectManager"
                header="Project manager"
                body={renderManagersColumn}
              ></Column>
              <Column
                sortable
                field="ProjectStatus"
                header="Project status"
              ></Column>
              <Column
                sortable
                field="BillingModel"
                header="Billing model"
              ></Column>
              <Column
                field="Action"
                header="Actions"
                body={(rowData: IProjectData) => {
                  return (
                    <div className={styles.Actions}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedData(rowData);
                          setFormMode("edit");
                          setCurrentPage("form");
                        }}
                      >
                        <img title="Edit" src={EditImage} alt="no image"></img>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDelModal({
                            Id: rowData?.ID,
                            isOpen: true,
                          });
                        }}
                      >
                        <img
                          title="Delete"
                          src={DeleteImage}
                          alt="no image"
                        ></img>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventID(rowData?.ID);
                          setIsChangeLogOpen(true);
                        }}
                      >
                        <img
                          title="Audit Logs"
                          src={VersionHistoryImage}
                          alt="no image"
                        ></img>
                      </div>
                      {rowData?.ProjectStatus === "Rejected" && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCmtsLoader(true);
                            setIsCommentsModal({
                              isOpen: true,
                              Id: rowData?.ID,
                            });
                            getAllRejectComments(rowData?.ID);
                          }}
                        >
                          <img
                            title="Reject Comments"
                            src={commentsImage}
                            alt="no image"
                          ></img>
                        </div>
                      )}
                    </div>
                  );
                }}
              ></Column>
            </DataTable>
          </div>
        </div>
      ) : (
        ""
      )}

      {currentPage === "form" && (
        <ProjectFormPage
          loginUserEmail={props?.loginUserEmail}
          initialCRMProjectsListDropContainer={
            initialCRMProjectsListDropContainer
          }
          data={selectedData}
          isAdd={formMode === "add"}
          isEdit={formMode === "edit"}
          isView={formMode === "view"}
          goBack={() => setCurrentPage("list")}
          spfxContext={props.spfxContext}
          Notify={props.Notify}
          refresh={getProjectDetails}
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "BillingList" && (
        <Billings
          data={selectedData}
          goBack={() => setCurrentPage("list")}
          spfxContext={props.spfxContext}
          Notify={props.Notify}
        />
      )}
      <Modal isOpen={isDelModal.isOpen} styles={Config.delModalStyle}>
        <p className={styles.delmsg}>
          Are you sure, you want to delete this Project?
        </p>
        <div className={styles.modalBtnSec}>
          <PrimaryButton
            text="No"
            className={styles.cancelBtn}
            onClick={() => {
              setIsDelModal({ isOpen: false, Id: null });
            }}
          />
          <PrimaryButton
            text="Yes"
            className={styles.addBtn}
            onClick={() => {
              setIsDelModal((pre) => ({
                ...pre,
                isOpen: false,
              }));
              TrashItem();
            }}
          />
        </div>
      </Modal>
      <ChangeLog
        context={props.spfxContext}
        handleClose={handleClose}
        isOpen={isChangeLogOpen}
        details={changeLogDetails}
      />

      <Dialog
        className="modal-template"
        header={
          <div className="modal-header">
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Rejected Reasons</h3>
          </div>
        }
        draggable={false}
        blockScroll={false}
        resizable={false}
        visible={isCommentsModal.isOpen}
        style={{ width: "50%" }}
        onHide={() => {
          setIsCommentsModal({ isOpen: false, Id: null });
        }}
      >
        {isCmtsLoader ? (
          <div
            style={{
              width: "100%",
              height: "60vh",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Loading />
          </div>
        ) : (
          <div className={`template-table-content`}>
            <div
              className={`template-table-data`}
              style={{ padding: "0px 10px" }}
            >
              <DataTable
                value={rejectComments}
                tableStyle={{ width: "100%" }}
                stripedRows
                paginator
                rows={5}
                emptyMessage={
                  <>
                    <p style={{ textAlign: "center" }}>No Comments Found</p>
                  </>
                }
              >
                <Column
                  field="reason"
                  header="Reason"
                  style={{ width: "33.3%" }}
                  body={(row: any) => textTemplate(row?.reason)}
                ></Column>
                <Column
                  field="Reason"
                  header="Created By"
                  style={{ width: "33.3%" }}
                  body={(row: any) => peoplePickerTemplate(row?.reasonUser)}
                ></Column>
                <Column
                  field="Reason"
                  header="Date"
                  body={(row: any) => rejectReasonCreatedDate(row?.created)}
                  style={{ width: "33.3%" }}
                ></Column>
              </DataTable>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default Projects;
