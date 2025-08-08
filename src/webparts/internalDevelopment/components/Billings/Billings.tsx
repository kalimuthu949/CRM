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
import {
  IBillingsDetails,
  IDelModal,
} from "../../../../ExternalRef/CommonServices/interface";
import styles from "../Projects/Projects.module.scss";
import "../../../../ExternalRef/CSS/Style.css";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import BillingsForm from "./BillingsForm";
import { Modal, PrimaryButton } from "@fluentui/react";
import Loading from "../../../../ExternalRef/Loader/Loading";

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
  const [isDelModal, setIsDelModal] = React.useState<IDelModal>({
    isOpen: false,
    Id: null,
  });
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [loader, setLoader] = React.useState<boolean>(false);

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
            DueDate: items?.DueDate,
            Amount: items?.Amount,
            Status: items?.Status,
            ReminderDaysBeforeDue: items?.ReminderDaysBeforeDue
              ? items?.ReminderDaysBeforeDue
              : 7,
            Notes: items?.Notes,
            Currency: items?.Currency,
            MonthlyAmount: items?.MonthlyAmount,
            StartMonth: items?.StartMonth,
            EndMonth: items?.EndMonth,
            BillingFrequency: items?.BillingFrequency,
            ResourceType: items?.ResourceType,
            Rate: items?.Rate,
            ProjectId: items?.ProjectId,
          });
        });
        setMasterBillingDetails([...BillingDetails]);
        setBillingDetails([...BillingDetails]);
        setLoader(false);
      })
      .catch((err) => {
        console.log(
          err,
          "Get CRMBillings details error in Billings.tsx component"
        );
      });
  };

  //Delete Particular Item:
  const TrashItem = () => {
    const currObj = {
      IsDelete: true,
    };
    SPServices.SPUpdateItem({
      ID: isDelModal.Id ?? 0,
      Listname: Config.ListNames.CRMBillings,
      RequestJSON: currObj,
    })
      .then(() => {
        props.Notify("success", "Success", "Bill Deleted successfully");
        getBillingsListDetails();
      })
      .catch((err) => {
        console.log(err, "rowData deleted err in Billings.tsx component");
      });
  };

  //handle search Functionalities:
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      setBillingDetails(masterBillingsDetails);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = masterBillingsDetails.filter((item) =>
        Object.values(item).some((field) =>
          typeof field === "string"
            ? field.toLowerCase().includes(lowerValue)
            : typeof field === "number"
            ? field.toString().includes(lowerValue)
            : false
        )
      );
      setBillingDetails(filtered);
    }
  };

  //Initial Render:
  React.useEffect(() => {
    setLoader(true);
    getBillingsListDetails();
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : page == "list" ? (
        <div className={styles.lcaBody}>
          <div
            className={`${styles.filterBarAndTableBorder} 
          ${ScreenWidth >= 1536 ? styles.filterBar_1536 : styles.filterBar_1396}
          `}
          >
            <div className={styles.filterBar}>
              <h2>Milestones ({props?.data?.BillingModel} based)</h2>
            </div>
            <div className={styles.filterBtns}>
              <div className="all_search">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"> </InputIcon>
                  <InputText
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search"
                    v-model="value1"
                  />
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
                  New Milestone
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
              <Column
                sortable
                field="DueDate"
                header="Due date"
                body={(rowData) => {
                  return (
                    <div>{moment(rowData?.DueDate).format("DD/MM/YYYY")}</div>
                  );
                }}
              ></Column>
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
                  body={(rowData) => {
                    return (
                      <div>{moment(rowData?.StartMonth).format("MM/YYYY")}</div>
                    );
                  }}
                ></Column>
              )}
              {BillingModel == "FixedMonthly" && (
                <Column
                  sortable
                  field="EndMonth"
                  header="End month"
                  body={(rowData) => {
                    return (
                      <div>{moment(rowData?.EndMonth).format("MM/YYYY")}</div>
                    );
                  }}
                ></Column>
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

      {page === "form" && (
        <BillingsForm
          selectedProjectsData={props?.data}
          selectedCRMBillingsRowData={selectedCRMBillingsRowData}
          BillingModel={BillingModel}
          isAdd={formBooleansMode === "add"}
          isEdit={formBooleansMode === "edit"}
          isView={formBooleansMode === "view"}
          goBackBiilingsDashboard={() => setPage("list")}
          Notify={props.Notify}
          refresh={getBillingsListDetails}
        />
      )}
      <Modal isOpen={isDelModal.isOpen} styles={Config.delModalStyle}>
        <p className={styles.delmsg}>
          Are you sure, you want to delete this project bill?
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

export default Billings;
