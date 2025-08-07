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
import { useState } from "react";
import styles from "../Deals/DealsFormPage.module.scss";
import "../../../../ExternalRef/CSS/Style.css";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import {
  Config,
  DatePickerStyles,
} from "../../../../ExternalRef/CommonServices/Config";
import {
  IBasicDropDown,
  ICRMBillingsListDrop,
} from "../../../../ExternalRef/CommonServices/interface";
import { InputText } from "primereact/inputtext";
import { DatePicker, Label, PrimaryButton } from "@fluentui/react";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

const BillingsForm = (props: any) => {
  console.log(props, "Billingsprops");
  //Local States:
  const [
    initialCRMBillingsListDropContainer,
    setinitialCRMBillingsListDropContainer,
  ] = useState<ICRMBillingsListDrop>({
    ...Config.CRMBillingsDropDown,
  });
  console.log(
    initialCRMBillingsListDropContainer,
    "intialCRMBillingsListDropDownContainer"
  );

  //Get All choices from Project List:
  const getAllChoiceFromCRMBillingsList = () => {
    SPServices.SPGetChoices({
      Listname: Config.ListNames.CRMBillings,
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
            SPServices.SPGetChoices({
              Listname: Config.ListNames.CRMBillings,
              FieldName: "BillingFrequency",
            })
              .then((res: any) => {
                let tempBillingFrequency: IBasicDropDown[] = [];
                if (res?.Choices?.length) {
                  res?.Choices?.forEach((val: any) => {
                    tempBillingFrequency.push({
                      name: val,
                    });
                  });
                }
                setinitialCRMBillingsListDropContainer(
                  (prev: ICRMBillingsListDrop) => ({
                    ...prev,
                    BillingFrequency: tempBillingFrequency,
                  })
                );
              })
              .catch((err) => {
                console.log(
                  err,
                  "Get BillingFrequency choice error from CRMBillings list"
                );
              });
          })
          .catch((err) => {
            console.log(err, "Get Currency choice error from CRMBillings list");
          });
      })
      .catch((err) => {
        console.log(err, "Get Status choice error from CRMBillings list");
      });
  };

  //Data refresh and goBack mainPage function:
  const emptyDatas = () => {
    props?.refresh();
    props?.goBackBiilingsDashboard();
  };

  //Initial Render:
  React.useEffect(() => {
    getAllChoiceFromCRMBillingsList();
  }, []);
  return (
    <div className={styles.viewFormMain}>
      <div className={styles.viewFormNavBar}>
        <h2>
          {props?.isAdd
            ? "Add Bills"
            : props?.isEdit
            ? "Edit Bills"
            : "View Bills"}
        </h2>
      </div>
      <div className={styles.formPage}>
        <div className={styles.firstPage}>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Amount</Label>
            <InputText placeholder="Enter amount" />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Billing frequency</Label>
            <Dropdown
              options={initialCRMBillingsListDropContainer?.BillingFrequency}
              optionLabel="name"
              placeholder="Select a BillingFrequency"
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Currency</Label>
            <Dropdown
              options={initialCRMBillingsListDropContainer?.Currency}
              optionLabel="name"
              placeholder="Select a currency"
            />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Due date</Label>
            <DatePicker styles={DatePickerStyles} />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>End date</Label>
            <DatePicker styles={DatePickerStyles} />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Milestone description</Label>
            <InputTextarea />
          </div>
        </div>
        <div className={styles.secondPage}>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Milestone Name</Label>
            <InputText placeholder="Enter Milestone name" />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Monthly amount</Label>
            <InputText placeholder="Enter Monthly amount" />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Notes</Label>
            <InputText placeholder="Enter notes" />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Rate</Label>
            <InputText placeholder="Enter Rate" />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Reminder days before due</Label>
            <InputText placeholder="Enter Reminder days before due" />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label>Resource type</Label>
            <InputText placeholder="Enter Resource type" />
          </div>
        </div>
        <div className={styles.thirdPage}>
          <div className={`${styles.allField} dealFormPage`}>
            <Label> Start month</Label>
            <DatePicker styles={DatePickerStyles} />
          </div>
          <div className={`${styles.allField} dealFormPage`}>
            <Label> Status</Label>
            <Dropdown
              options={initialCRMBillingsListDropContainer?.Status}
              optionLabel="name"
              placeholder="Select a start month"
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
          >
            {props?.isEdit ? "Update" : "Save"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

export default BillingsForm;
