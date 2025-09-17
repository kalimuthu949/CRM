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
import "../../../ExternalRef/CSS/Style.css";
import SPServices from "../../../ExternalRef/CommonServices/SPServices";
import {
  Config,
  RefreshButton,
} from "../../../ExternalRef/CommonServices/Config";
import {
  IBasicDropDown,
  ICRMBillingsListDrop,
  IPeoplePickerDetails,
  IProjectData,
} from "../../../ExternalRef/CommonServices/interface";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import moment from "moment";
import {
  multiPeoplePickerTemplate,
  peoplePickerTemplate,
} from "../../../ExternalRef/CommonServices/CommonTemplate";
import styles from "./MainComponent.module.scss";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { PrimaryButton } from "@fluentui/react";
import { Dropdown } from "primereact/dropdown";

const MainComponent = (props: any) => {
  //Local variables:
  const ScreenWidth: number = window.innerWidth;
  const FilterImage: string = require("../../../ExternalRef/Images/filter.png");
  const FilterNoneImage: string = require("../../../ExternalRef/Images/filternone.png");

  //Local states:
  const [
    initialCRMBillingsListDropContainer,
    setinitialCRMBillingsListDropContainer,
  ] = React.useState<ICRMBillingsListDrop>({
    ...Config.CRMBillingsDropDown,
  });
  const [searchVal, setSearchVal] = React.useState<string>("");
  const [filterBar, setFilterBar] = React.useState<boolean>(false);
  console.log(
    initialCRMBillingsListDropContainer,
    "initialCRMBillingsListDropContainer"
  );
  const [reportData, setReportData] = React.useState<any[]>([]);
  const [masterReportData, setMasterReportData] = React.useState<any[]>([]);
  const [filterValues, setFilterValues] = React.useState({
    ProjectID: "",
    Lead: "",
    AccountName: "",
    Status: "",
    Currency: "",
    ProjectName: "",
    ProjectManager: "",
  });

  //Function to fetch Project and Billing data and combine them for report:
  const getProjectAndBillingData = async () => {
    try {
      const projectRes: any = await SPServices.SPReadItems({
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
      });

      const billingRes: any = await SPServices.SPReadItems({
        Listname: Config.ListNames.CRMBillings,
        Select: "*,Project/Id",
        Expand: "Project",
        Orderby: "Modified",
        Orderbydecorasc: true,
        Filter: [
          {
            FilterKey: "IsDelete",
            Operator: "eq",
            FilterValue: "false",
          },
        ],
      });

      // Build combined report data
      let combinedData: any[] = [];
      projectRes.forEach((project: any) => {
        let _ProjectManager: IPeoplePickerDetails[] = [];
        if (project?.ProjectManager) {
          project?.ProjectManager.forEach((user: any) => {
            _ProjectManager.push({
              id: user?.Id,
              name: user?.Title,
              email: user?.EMail,
            });
          });
        }

        const relatedBillings = billingRes.filter(
          (bill: any) => bill.ProjectId == project.ID
        );

        if (relatedBillings.length > 0) {
          relatedBillings.forEach((billing: any) => {
            combinedData.push({
              ProjectID: project.ProjectID,
              ProjectName: project.ProjectName,
              AccountName: project.AccountName,
              Lead: project.Lead?.FirstName,
              ProjectManager: _ProjectManager,
              StartDate: project.StartDate,
              PlannedEndDate: project.PlannedEndDate,
              BillingMileStone: billing.MileStoneName || "",
              DueDate: billing.DueDate,
              Amount: billing.Amount,
              Status: billing.Status,
              Currency: billing.Currency,
              ReminderDaysBeforeDue: billing.ReminderDaysBeforeDue || 7,
            });
          });
        } else {
          // Project without any billings
          combinedData.push({
            ProjectID: project.ProjectID,
            ProjectName: project.ProjectName,
            AccountName: project.AccountName,
            Lead: project.Lead?.FirstName,
            ProjectManager: _ProjectManager,
            StartDate: project.StartDate,
            PlannedEndDate: project.PlannedEndDate,
            BillingMileStone: "",
            DueDate: "",
            Amount: "",
            Status: "",
            Currency: "",
            ReminderDaysBeforeDue: "",
          });
        }
      });
      setReportData([...combinedData]);
      setMasterReportData([...combinedData]);
      getAllChoices();
    } catch (error) {
      console.error(
        "Error fetching data in reports webpart main component.tsx page:",
        error
      );
    }
  };

  //Get All Choices in CRMBillings list:
  const getAllChoices = () => {
    SPServices.SPGetChoices({
      Listname: Config.ListNames?.CRMBillings,
      FieldName: "Status",
    })
      .then((res: any) => {
        let tempStatus: IBasicDropDown[] = [];
        if (res?.Choices?.length) {
          res?.Choices?.forEach((val: any) => {
            tempStatus.push({
              name: val,
            });
          });
        }
        setinitialCRMBillingsListDropContainer(
          (prev: ICRMBillingsListDrop) => ({
            ...prev,
            Status: tempStatus,
          })
        );
        SPServices.SPGetChoices({
          Listname: Config.ListNames.CRMBillings,
          FieldName: "Currency",
        })
          .then((res: any) => {
            let tempCurrency: IBasicDropDown[] = [];
            if (res?.Choices?.length) {
              res?.Choices?.forEach((val: any) => {
                tempCurrency.push({
                  name: val,
                });
              });
            }
            setinitialCRMBillingsListDropContainer(
              (prev: ICRMBillingsListDrop) => ({
                ...prev,
                Currency: tempCurrency,
              })
            );
          })
          .catch((err) => {
            console.log(err, "Get choice error from CRMProjects list");
          });
      })
      .catch((err) => {
        console.log(err, "Get choice error from CRMProjects list");
      });
  };

  //Render ProjectManager Column function:
  const renderProjectManagersColumn = (rowData: IProjectData) => {
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

  //Global Search functionalities:
  const searchProjectAndBillingsDetails = (val: string) => {
    setSearchVal(val);
    if (!val) {
      applyFilters();
      return;
    }

    const filtered = masterReportData.filter((item) => {
      const managerNames =
        item?.ProjectManager?.map((pm: IPeoplePickerDetails) =>
          pm.name?.toLowerCase()
        ).join(" ") || "";
      return (
        item.ProjectID?.toLowerCase().includes(val.toLowerCase()) ||
        item.Lead?.toLowerCase().includes(val.toLowerCase()) ||
        item.AccountName?.toLowerCase().includes(val.toLowerCase()) ||
        item.ProjectName?.toLowerCase().includes(val.toLowerCase()) ||
        item.Status?.toLowerCase().includes(val.toLowerCase()) ||
        item.Currency?.toLowerCase().includes(val.toLowerCase()) ||
        managerNames.includes(val.toLowerCase())
      );
    });
    setReportData(filtered);
  };

  //apply filters in purticular columns:
  const applyFilters = () => {
    const filtered = masterReportData.filter((item: any) => {
      const matchProjectID = item?.ProjectID?.toLowerCase().includes(
        filterValues.ProjectID.toLowerCase()
      );
      const matchLead = item?.Lead?.toLowerCase().includes(
        filterValues.Lead.toLowerCase()
      );
      const matchAccount = item?.AccountName?.toLowerCase().includes(
        filterValues.AccountName.toLowerCase()
      );
      const matchProjectName = item?.ProjectName?.toLowerCase().includes(
        filterValues.ProjectName.toLowerCase()
      );
      const matchStatus = filterValues.Status
        ? item?.Status === filterValues.Status
        : true;
      const matchCurrency = filterValues.Currency
        ? item?.Currency === filterValues.Currency
        : true;
      const managerNames =
        item?.ProjectManager?.map((pm: IPeoplePickerDetails) =>
          pm.name?.toLowerCase()
        ).join(" ") || "";

      const matchProjectManager = filterValues.ProjectManager
        ? managerNames.includes(filterValues.ProjectManager.toLowerCase())
        : true;

      return (
        matchProjectID &&
        matchLead &&
        matchAccount &&
        matchStatus &&
        matchCurrency &&
        matchProjectName &&
        matchProjectManager
      );
    });

    setReportData(filtered);
  };
  //Apply filters when filter values change:
  React.useEffect(() => {
    applyFilters();
  }, [filterValues]);

  //Initial data fetch:
  React.useEffect(() => {
    getProjectAndBillingData();
  }, []);

  return (
    <div className={styles.lcaBody}>
      <div
        className={`${styles.filterBarAndTableBorder} 
                ${
                  ScreenWidth >= 1536
                    ? styles.filterBar_1536
                    : styles.filterBar_1396
                }
                `}
      >
        <div className={styles.filterBar}>
          <h2>Project & Billing Reports</h2>
        </div>
        <div className={styles.filterBtns}>
          <div className="all_search">
            <IconField iconPosition="left">
              <InputIcon className="pi pi-search"> </InputIcon>
              <InputText
                value={searchVal}
                onChange={(e) =>
                  searchProjectAndBillingsDetails(e.target.value)
                }
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
        </div>
      </div>
      {filterBar ? (
        <div className={styles.filterFields}>
          <div className={styles.filterField}>
            <label>Project Id</label>
            <InputText
              value={filterValues?.ProjectID}
              onChange={(e) => handleFilterChange("ProjectID", e.target.value)}
              placeholder="Enter here"
            />
          </div>
          <div className={styles.filterField}>
            <label>Project Name</label>
            <InputText
              value={filterValues?.ProjectName}
              onChange={(e) =>
                handleFilterChange("ProjectName", e.target.value)
              }
              placeholder="Enter here"
            />
          </div>
          <div className={styles.filterField}>
            <label>Project Manager</label>
            <InputText
              value={filterValues?.ProjectManager}
              onChange={(e) =>
                handleFilterChange("ProjectManager", e.target.value)
              }
              placeholder="Enter project manager name"
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
            <label>Status</label>
            <Dropdown
              options={initialCRMBillingsListDropContainer?.Status}
              optionLabel="name"
              placeholder="Select a status"
              value={initialCRMBillingsListDropContainer?.Status.find(
                (item) => item.name === filterValues?.Status
              )}
              onChange={(e) => handleFilterChange("Status", e.value?.name)}
            />
          </div>
          <div className={`${styles.filterField} dropdown`}>
            <label>Currency</label>
            <Dropdown
              options={initialCRMBillingsListDropContainer?.Currency}
              optionLabel="name"
              placeholder="Select a billing model"
              value={initialCRMBillingsListDropContainer?.Currency.find(
                (item) => item.name === filterValues?.Currency
              )}
              onChange={(e) => handleFilterChange("Currency", e.value?.name)}
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
                  Status: "",
                  Currency: "",
                  ProjectName: "",
                  ProjectManager: "",
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
                    ${
                      ScreenWidth >= 1536
                        ? "data_table_1536"
                        : "data_table_1396"
                    }`}
      >
        <DataTable
          value={reportData}
          paginator
          rows={10}
          tableStyle={{ minWidth: "100rem" }}
        >
          <Column sortable field="ProjectID" header="Project ID"></Column>
          <Column sortable field="ProjectName" header="Project Name"></Column>
          <Column sortable field="AccountName" header="Account Name"></Column>
          <Column sortable field="Lead" header="Lead"></Column>
          <Column
            sortable
            field="ProjectManager"
            header="Project Manager"
            body={renderProjectManagersColumn}
          ></Column>
          <Column
            sortable
            field="StartDate"
            header="Start Date"
            body={(rowData) => {
              return (
                <div>{moment(rowData?.StartDate).format("DD/MM/YYYY")}</div>
              );
            }}
          ></Column>
          <Column
            sortable
            field="PlannedEndDate"
            header="Planned End Date"
            body={(rowData) => {
              return (
                <div>
                  {moment(rowData?.PlannedEndDate).format("DD/MM/YYYY")}
                </div>
              );
            }}
          ></Column>
          <Column sortable field="BillingMileStone" header="Milestone"></Column>
          <Column
            sortable
            field="DueDate"
            header="Due Date"
            body={(rowData) => {
              return <div>{moment(rowData?.DueDate).format("DD/MM/YYYY")}</div>;
            }}
          ></Column>
          <Column sortable field="Currency" header="Currency"></Column>
          <Column sortable field="Amount" header="Amount"></Column>
          <Column sortable field="Status" header="Status"></Column>
          <Column
            sortable
            field="ReminderDaysBeforeDue"
            header="Reminder (days)"
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default MainComponent;
