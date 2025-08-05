import * as React from "react";
import styles from "./Projects.module.scss";
import { useEffect, useState } from "react";
import { PrimaryButton } from "office-ui-fabric-react";
import Loading from "../../../../ExternalRef/Loader/Loading";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Pagination from "office-ui-fabric-react-pagination";

interface IProjectData {
  ID: number;
  ProjectID: string;
  LeadID: string;
  AccountName: string;
  ProjectName: string;
  StartDate: string;
  PlannedEndDate: string;
  ProjectManager: string;
  ProjectStatus: string;
  BillingModel: string;
  BillingContactName: string;
  BillingContactEmail: string;
  BillingContactMobile: string;
  BillingAddress: string;
  Remarks: string;
}

interface IPagination {
  currentPage: number;
  perPage: number;
}

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

const dummyProjects: IProjectData[] = [
  {
    ID: 1,
    ProjectID: "PRJ-2025-001",
    LeadID: "LD-001",
    AccountName: "Acme Corp",
    ProjectName: "CRM Implementation",
    StartDate: "2025-07-01",
    PlannedEndDate: "2025-12-31",
    ProjectManager: "John Doe",
    ProjectStatus: "Initiated",
    BillingModel: "Milestone",
    BillingContactName: "Jane Smith",
    BillingContactEmail: "jane@acme.com",
    BillingContactMobile: "1234567890",
    BillingAddress: "123 Main St, City",
    Remarks: "Initial phase",
  },
  {
    ID: 2,
    ProjectID: "PRJ-2025-002",
    LeadID: "LD-002",
    AccountName: "Beta Ltd",
    ProjectName: "Portal Upgrade",
    StartDate: "2025-08-01",
    PlannedEndDate: "2026-01-15",
    ProjectManager: "Alice Lee",
    ProjectStatus: "Initiated",
    BillingModel: "Fixed Monthly",
    BillingContactName: "Bob Brown",
    BillingContactEmail: "bob@beta.com",
    BillingContactMobile: "9876543210",
    BillingAddress: "456 Side St, Town",
    Remarks: "",
  },
];

const Projects = (props: IProps): JSX.Element => {
  const [loader, setLoader] = useState<boolean>(true);
  const [data, setData] = useState<IProjectData[]>([]);
  const [displayData, setDisplayData] = useState<IProjectData[]>([]);
  const [search, setSearch] = useState<string>("");
  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    perPage: 10,
  });
  


  const paginationData = (
    currData: IProjectData[],
    currentPage: number,
    perPage: number
  ): void => {
    let startIndex = (currentPage - 1) * perPage;
    let endIndex = startIndex + perPage;
    let items = [...currData].slice(startIndex, endIndex);
    setDisplayData([...items]);
    setPagination({ currentPage, perPage });
    setLoader(false);
  };

  const filterFunction = (value: string) => {
    let _searchValue = value.toLowerCase();
    let filtered = data.filter((item) => {
      return (
        item.ProjectID.toLowerCase().includes(_searchValue) ||
        item.ProjectName.toLowerCase().includes(_searchValue) ||
        item.AccountName.toLowerCase().includes(_searchValue) ||
        item.ProjectManager.toLowerCase().includes(_searchValue)
      );
    });
    paginationData(filtered, 1, pagination.perPage);
  };

    useEffect(() => {
    setLoader(true);
    // TODO: Replace with SharePoint API call
    setTimeout(() => {
      setData(dummyProjects);
      paginationData(dummyProjects, 1, pagination.perPage);
      setLoader(false);
    }, 500);
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <div className={styles.lcaBody}>
          <div className={styles.filterBarAndTableBorder}>
            <div className={styles.filterBar}>
              <h2>Projects</h2>
            </div>
            <div className={styles.filterBtns}>
              <div>
                <InputText
                  placeholder="Search"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                    filterFunction(e.target.value);
                  }}
                />
              </div>
              <div className={styles.btnAndText}>
                <div
                  className={styles.btnBackGround}
                  onClick={() => props.PageNavigation("AddProject")}
                >
                  + New Project
                </div>
              </div>
            </div>
          </div>
          <div className={styles.tableData}>
            <DataTable
              value={displayData}
              dataKey="ID"
              emptyMessage={<p className={styles.noData}>No data !!!</p>}
              onRowClick={(e:any) => {
                props.PageNavigation("EditProject", e.data);
              }}
            >
              <Column field="ProjectID" header="Project ID" sortable />
              <Column field="ProjectName" header="Project Name" sortable />
              <Column field="AccountName" header="Account Name" sortable />
              <Column field="ProjectManager" header="Project Manager" sortable />
              <Column field="ProjectStatus" header="Status" sortable />
              <Column field="BillingModel" header="Billing Model" sortable />
              <Column field="StartDate" header="Start Date" sortable />
              <Column field="PlannedEndDate" header="Planned End Date" sortable />
              <Column
                header="Action"
                body={(item: IProjectData) => (
                  <div className={styles.Actions}>
                    <PrimaryButton
                      text="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.PageNavigation("EditProject", item);
                      }}
                    />
                  </div>
                )}
              />
            </DataTable>
          </div>
          <div className={styles.PageNation}>
            {displayData.length && data.length > 10 ? (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={Math.ceil(data.length / pagination.perPage)}
                onChange={(page: number) => {
                  paginationData([...data], page, pagination.perPage);
                }}
              />
            ) : (
              ""
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;