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
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import { Config } from "../../../../ExternalRef/CommonServices/Config";
import moment from "moment";
import { IBillingsDetails } from "../../../../ExternalRef/CommonServices/interface";
import styles from "../Projects/Projects.module.scss";
import "../../../../ExternalRef/CSS/Style.css";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import BillingsForm from "./BillingsForm";

const Billings = (props: any) => {
  //Local variables:
  const ScreenWidth: number = window.innerWidth;
  const BillingModel: string = props?.data?.BillingModel;
  const PlusImage: string = require("../../../../ExternalRef/Images/plus.png");
  const DeleteImage: string = require("../../../../ExternalRef/Images/trashcan.png");
  const EditImage: string = require("../../../../ExternalRef/Images/Edit.png");
  const BackImage: string = require("../../../../ExternalRef/Images/back.png");

  //Local States:
  const [billingsDetails, setBillingDetails] = React.useState<
    IBillingsDetails[]
  >([]);
  const [masterBillingsDetails, setMasterBillingDetails] = React.useState<
    IBillingsDetails[]
  >([]);
  console.log(masterBillingsDetails);
  const [page, setPage] = React.useState<"list" | "form">("list");
  const [formBooleansMode, setFormBooleansMode] = React.useState<
    "add" | "edit" | "view"
  >("add");
  const [selectedCRMBillingsRowData, setSelectedCRMBillingsRowData] =
    React.useState<IBillingsDetails | null>(null);

  //Get BillingsListDetails:
  const getBillingsListDetails = () => {
    SPServices.SPReadItems({
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
        {
          FilterKey: "ProjectId",
          Operator: "eq",
          FilterValue: `${props?.data?.ID}`,
        },
      ],
    })
      .then((res) => {
        let BillingDetails: IBillingsDetails[] = [];
        res.forEach((items: any) => {
          BillingDetails.push({
            ID: items?.ID,
            MileStoneName: items?.MileStoneName,
            MileStoneDescription: items?.MileStoneDescription,
            DueDate: moment(items?.DueDate).format("DD/MM/YYYY"),
            Amount: items?.Amount,
            Status: items?.Status,
            ReminderDaysBeforeDue: items?.ReminderDaysBeforeDue
              ? items?.ReminderDaysBeforeDue
              : 7,
            Notes: items?.Notes,
            Currency: items?.Currency,
            MonthlyAmount: items?.MonthlyAmount,
            StartMonth: moment(items?.StartMonth).format("MM/YYYY"),
            EndMonth: moment(items?.EndMonth).format("MM/YYYY"),
            BillingFrequency: items?.BillingFrequency,
            ResourceType: items?.ResourceType,
            Rate: items?.Rate,
            ProjectId: items?.ProjectId,
          });
        });
        setMasterBillingDetails([...BillingDetails]);
        setBillingDetails([...BillingDetails]);
      })
      .catch((err) => {
        console.log(
          err,
          "Get CRMBillings details error in Billings.tsx component"
        );
      });
  };

  //Initial Render:
  React.useEffect(() => {
    getBillingsListDetails();
  }, []);

  return (
    <>
      {page === "list" && (
        <div className={styles.lcaBody}>
          <div
            className={`${styles.filterBarAndTableBorder} 
          ${ScreenWidth >= 1536 ? styles.filterBar_1536 : styles.filterBar_1396}
          `}
          >
            <div className={styles.filterBar}>
              <h2>Billings</h2>
            </div>
            <div className={styles.filterBtns}>
              <div className="all_search">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"> </InputIcon>
                  <InputText v-model="value1" placeholder="Search" />
                </IconField>
              </div>
              <div className={styles.btnAndText}>
                <div
                  onClick={() => {
                    setSelectedCRMBillingsRowData(null);
                    setFormBooleansMode("add");
                    setPage("form");
                  }}
                  className={styles.btnBackGround}
                >
                  <img
                    src={PlusImage}
                    alt="no image"
                    style={{ width: "15px", height: "15px" }}
                  />
                  New Bill
                </div>
              </div>
              <div className={styles.btnAndText}>
                <div
                  onClick={() => {
                    props?.goBack();
                  }}
                  className={styles.btnBackGround}
                  style={{ gap: "10px" }}
                >
                  <img
                    src={BackImage}
                    alt="no image"
                    style={{ width: "17px", height: "17px" }}
                  />
                  Back
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${styles.tableData} tableData
                    ${
                      ScreenWidth >= 1536
                        ? "data_table_1536"
                        : "data_table_1396"
                    }`}
          >
            <DataTable
              value={billingsDetails}
              paginator={billingsDetails && billingsDetails?.length > 8}
              rows={8}
              onRowClick={(e: any) => {
                setSelectedCRMBillingsRowData(e?.data);
                setFormBooleansMode("view");
                setPage("form");
              }}
              emptyMessage={<p className={styles.noData}>No data !!!</p>}
            >
              <Column sortable field="DueDate" header="Due date"></Column>
              <Column sortable field="Status" header="Status"></Column>
              <Column
                sortable
                field="ReminderDaysBeforeDue"
                header="Reminder days before due"
              ></Column>
              <Column sortable field="Notes" header="Notes"></Column>
              <Column sortable field="Currency" header=" Currency"></Column>
              {BillingModel == "Milestone" && (
                <Column
                  sortable
                  field="MileStoneName"
                  header="MileStone name"
                />
              )}
              {BillingModel == "Milestone" && (
                <Column
                  sortable
                  field="MileStoneDescription"
                  header="MileStone description"
                ></Column>
              )}
              {BillingModel == "Milestone" && (
                <Column sortable field="Amount" header="Amount"></Column>
              )}
              {BillingModel == "T&M" && (
                <Column
                  sortable
                  field="BillingFrequency"
                  header="Billing frequency"
                ></Column>
              )}
              {BillingModel == "T&M" && (
                <Column
                  sortable
                  field="ResourceType"
                  header="Resource type"
                ></Column>
              )}
              {BillingModel == "T&M" && (
                <Column sortable field="Rate" header="Rate"></Column>
              )}
              {BillingModel == "FixedMonthly" && (
                <Column
                  sortable
                  field="MonthlyAmount"
                  header="Monthly amount"
                ></Column>
              )}
              {BillingModel == "FixedMonthly" && (
                <Column
                  sortable
                  field="StartMonth"
                  header="Start month"
                ></Column>
              )}
              {BillingModel == "FixedMonthly" && (
                <Column sortable field="End Month" header="End month"></Column>
              )}
              <Column
                field="Action"
                header="Actions"
                body={(rowData: IBillingsDetails) => {
                  return (
                    <div className={styles.Actions}>
                      <div
                        onClick={(e) => {
                          setSelectedCRMBillingsRowData(rowData);
                          e.stopPropagation();
                          setFormBooleansMode("edit");
                          setPage("form");
                        }}
                      >
                        <img title="Edit" src={EditImage} alt="no image"></img>
                      </div>
                      <div
                        onClick={(e) => {
                          setSelectedCRMBillingsRowData(rowData);
                          e.stopPropagation();
                        }}
                      >
                        <img
                          title="Delete"
                          src={DeleteImage}
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
      {page === "form" && (
        <BillingsForm
          selectedCRMBillingsRowData={selectedCRMBillingsRowData}
          BiilingModel={BillingModel}
          isAdd={formBooleansMode === "add"}
          isEdit={formBooleansMode === "edit"}
          isView={formBooleansMode === "view"}
          goBackBiilingsDashboard={() => setPage("list")}
          Notify={props.Notify}
          refresh={getBillingsListDetails}
        />
      )}
    </>
  );
};

export default Billings;
