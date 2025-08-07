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
import { Config } from "../../../../ExternalRef/CommonServices/Config";
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
} from "../../../../ExternalRef/CommonServices/CommonTemplate";
import {
  IDelModal,
  IPeoplePickerDetails,
  IProjectData,
} from "../../../../ExternalRef/CommonServices/interface";
import ProjectFormPage from "./ProjectsFormPage";
import { Modal, PrimaryButton } from "@fluentui/react";
import Billings from "../Billings/Billings";
interface IProps {
  Notify: (
    type: "info" | "success" | "warn" | "error" | "secondary" | "contrast",
    summary: string,
    msg: string
  ) => void;
  spfxContext: any;
  pageName: string;
  PageNavigation: (pageName: string, data?: IProjectData) => void;
}
//Global Image Variables:
const PlusImage: string = require("../../../../ExternalRef/Images/plus.png");
const DeleteImage: string = require("../../../../ExternalRef/Images/trashcan.png");
const EditImage: string = require("../../../../ExternalRef/Images/Edit.png");
const BillingImage: string = require("../../../../ExternalRef/Images/bill.png");

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
            StartDate: moment(items?.StartDate).format("DD/MM/YYYY"),
            PlannedEndDate: moment(items?.PlannedEndDate).format("DD/MM/YYYY"),
            ProjectManager: _ProjectManager ? _ProjectManager : [],
            ProjectStatus: items?.ProjectStatus,
            BillingModel: items?.BillingModel,
          });
        });
        setProjectDetails([...projectDetails]);
        setMasterProjectDetails([...projectDetails]);
      })
      .catch((err) => {
        console.log(err, "getProjectDetails Error in Projects.tsx component");
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

  //Global Search functionalities:
  const searchProjectDetails = (val: string) => {
    setSearchVal(val);
    if (!val) {
      setProjectDetails([...masterProjectDetails]);
      return;
    }

    const filtered = masterProjectDetails.filter((item) => {
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

  //Initial Render:
  React.useEffect(() => {
    getProjectDetails();
  }, []);

  return (
    <>
      {currentPage === "list" && (
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
                  onClick={() => {
                    setSelectedData(null);
                    setFormMode("add");
                    setCurrentPage("form");
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
              <Column sortable field="StartDate" header="Start date"></Column>
              <Column
                sortable
                field="PlannedEndDate"
                header="End date"
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
                          setSelectedData(rowData);
                          setCurrentPage("BillingList");
                        }}
                      >
                        <img
                          title="Billings"
                          src={BillingImage}
                          alt="no image"
                        ></img>
                      </div>
                    </div>
                  );
                }}
              ></Column>
            </DataTable>
          </div>
        </div>
      )}
      {currentPage === "form" && (
        <ProjectFormPage
          data={selectedData}
          isAdd={formMode === "add"}
          isEdit={formMode === "edit"}
          isView={formMode === "view"}
          goBack={() => setCurrentPage("list")}
          spfxContext={props.spfxContext}
          Notify={props.Notify}
          refresh={getProjectDetails}
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
    </>
  );
};

export default Projects;
