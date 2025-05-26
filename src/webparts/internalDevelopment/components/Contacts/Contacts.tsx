/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import styles from "./Contacts.module.scss";
import { useEffect, useState } from "react";
import { IButtonStyles, IModalStyles, Modal } from "@fluentui/react";
import { PrimaryButton } from "office-ui-fabric-react";
import Loading from "../../../../ExternalRef/Loader/Loading";
import { Config } from "../../../../ExternalRef/CommonServices/Config";
import * as moment from "moment";
import ExcelJS from "exceljs";
import * as FileSaver from "file-saver";
import { InputText } from "primereact/inputtext";
import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import {
  DataTable,
  DataTableExpandedRows,
  DataTableValueArray,
} from "primereact/datatable";
import { Column } from "primereact/column";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import {
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  IContactFormData,
  IContactFormPageNavigate,
} from "../Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { useDispatch, useSelector } from "react-redux";
import { setContactFormData } from "../Redux/PageData";

// Interfaces
interface IFilterKeys {
  search: string;
  contactName: string;
  jobTitle: string;
  email: string;
  account: string;
  leadSource: string;
}
interface IDelModal {
  isOpen: boolean;
  Id: number | null;
}
interface IPagination {
  currentPage: number;
  perPage: number;
}
interface IContactsData {
  ID: number;
  FirstName: string;
  LastName: string;
  Account: string;
  JobTitle: string;
  Email: string;
  LeadSource: string;
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

// Gloabal Variables
const ImportUploadImage: string = require("../../../../ExternalRef/Images/fileupload.png");
const PlusImage: string = require("../../../../ExternalRef/Images/plus.png");
const FilterImage: string = require("../../../../ExternalRef/Images/filter.png");
const FilterNoneImage: string = require("../../../../ExternalRef/Images/filternone.png");
const DeleteImage: string = require("../../../../ExternalRef/Images/trashcan.png");
const MailImage: string = require("../../../../ExternalRef/Images/mail.png");

const Contacts = (props: IProps): JSX.Element => {
  // Local Variables
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const _filterKeys: IFilterKeys = {
    search: "",
    contactName: "",
    jobTitle: "",
    email: "",
    account: "",
    leadSource: "",
  };
  const ScreenWidth: number = window.innerWidth;
  const configDefaults = ConfigPageDefaultValue();
  const _contactEmptyData: IContactFormData = {
    ID: null,
    ContactOwner: [ConfigureationData.currentUserEmail],
    ContactOwnerId: ConfigureationData.currentUserId,
    FirstName: "",
    LastName: "",
    Phone: "",
    JobTitle: "",
    Email: "",
    Account: null,
    LeadSource: "",
    AnnualRevenue: "",
    Country: "",
    DateOfBirth: "",
    State: "",
    Description: "",
    OldData: {
      ID: null,
      ContactOwner: [ConfigureationData.currentUserEmail],
      ContactOwnerId: ConfigureationData.currentUserId,
      FirstName: "",
      LastName: "",
      Phone: "",
      JobTitle: "",
      Email: "",
      Account: null,
      LeadSource: "",
      AnnualRevenue: "0",
      Country: "",
      DateOfBirth: "",
      State: "",
      Description: "",
    },
  };

  // Styles Variables
  const RefreshButton: Partial<IButtonStyles> = {
    root: {
      height: "33.25px",
      i: {
        fontWeight: "600 !important",
      },
    },
  };
  const delModalStyle: Partial<IModalStyles> = {
    main: {
      minHeight: "150px",
      width: "25%",
      padding: "20px",
    },
  };

  // States Variables
  const [masterData, setMasterData] = useState<IContactsData[]>([]);
  const [data, setData] = useState<IContactsData[]>([]);
  const [displayData, setDisplayData] = useState<IContactsData[]>([]);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [_onChangeAllChoices, set_onChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [filterBar, setFilterBar] = useState<boolean>(false);
  const [filterKeys, setFilterKeys] = useState<IFilterKeys>(_filterKeys);
  const [loader, setLoader] = useState<boolean>(true);
  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    perPage: Config.PagenationShow,
  });
  const [isDelModal, setIsDelModal] = useState<IDelModal>({
    isOpen: false,
    Id: null,
  });
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);

  // All Functions
  const GetChoices = async () => {
    let AllChoicesList: IAllChoiceColumn = {
      ...ConfigureationData.allChoicesData,
      LeadSource: ConfigureationData.allChoicesData.LeadSource,
      JobTitle: ConfigureationData.allChoicesData.JobTitle,
    };

    await SPServices.SPReadItems({
      Listname: Config.ListNames.CRMContacts,
      Select: "*,Account/AccountName",
      Expand: "Account",
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
    })
      .then((_account) => {
        if (_account.length) {
          let _tempAccountChoice: IChoice[] = [];

          _account.forEach((item: any, index: number) => {
            if (item.AccountId && item.Account.AccountName) {
              if (
                !_tempAccountChoice.some(
                  (choice) => choice.name === item.Account.AccountName
                )
              ) {
                _tempAccountChoice.push({
                  name: item.Account.AccountName,
                  code: item.Account.AccountName,
                });
              }
            }

            if (_account.length - 1 == index) {
              AllChoicesList.Account = _tempAccountChoice;
            }
          });
        }

        setAllChoices(AllChoicesList);
        set_onChangeAllChoices(AllChoicesList);
        GetAllData();
      })
      .catch((err: any) => {
        ErrorFunction(err, "account data get error");
      });
  };

  const GetAllData = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMContacts,
      Select: "*,Account/AccountName",
      Expand: "Account",
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Orderby: "Modified",
      Orderbydecorasc: false,
      Topcount: 5000,
    })
      .then((_contactData: any[]) => {
        let _tempContactData: IContactsData[] = [];

        if (_contactData.length) {
          _contactData.forEach((item: any, index: number) => {
            _tempContactData.push({
              ID: item.ID ? item.ID : null,
              Email: item.Email ? item.Email : "",
              FirstName: item.FirstName ? item.FirstName : "",
              JobTitle: item.JobTitle ? item.JobTitle : "",
              LastName: item.LastName ? item.LastName : "",
              LeadSource: item.LeadSource ? item.LeadSource : "",
              Account: item.AccountId ? item.Account.AccountName : "",
            });

            if (_contactData.length - 1 == index) {
              setMasterData([..._tempContactData]);
              setData([..._tempContactData]);
              paginationData([..._tempContactData], 1, pagination.perPage);
            }
          });
        } else setLoader(false);
      })
      .catch((err: any) => ErrorFunction(err, "Contact data get error"));
  };

  const paginationData = (
    currData: IContactsData[],
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

  const filterOnChangeHandle = (key: string, value: any): void => {
    filterFunction(masterData, { ...filterKeys, [key]: value });
  };

  const filterFunction = (data: IContactsData[], _filterKeys: IFilterKeys) => {
    if (_filterKeys.search.trim()) {
      let _searchValue = _filterKeys.search.toLowerCase();

      data = data.filter((item) => {
        let FullName = `${item.FirstName} ${item.LastName}`;

        return (
          (item.Email && item.Email.toLowerCase().includes(_searchValue)) ||
          (FullName && FullName.toLowerCase().includes(_searchValue)) ||
          (item.JobTitle &&
            item.JobTitle.toLowerCase().includes(_searchValue)) ||
          (item.Account && item.Account.toLowerCase().includes(_searchValue)) ||
          (item.LeadSource &&
            item.LeadSource.toLowerCase().includes(_searchValue))
        );
      });
    }

    if (_filterKeys.contactName.trim()) {
      let _searchValue = _filterKeys.contactName.toLowerCase();

      data = data.filter((item) => {
        let FullName = `${item.FirstName} ${item.LastName}`;

        return FullName && FullName.toLowerCase().includes(_searchValue);
      });
    }

    if (_filterKeys.jobTitle.trim()) {
      let _searchValue = _filterKeys.jobTitle.toLowerCase();

      data = data.filter((item) => {
        return (
          item.JobTitle && item.JobTitle.toLowerCase().includes(_searchValue)
        );
      });
    }

    if (_filterKeys.email.trim()) {
      let _searchValue = _filterKeys.email.toLowerCase();

      data = data.filter((item) => {
        return item.Email && item.Email.toLowerCase().includes(_searchValue);
      });
    }

    if (_filterKeys.account.trim()) {
      let _searchValue = _filterKeys.account.toLowerCase();

      data = data.filter((item) => {
        return (
          item.Account && item.Account.toLowerCase().includes(_searchValue)
        );
      });
    }

    if (_filterKeys.leadSource.trim()) {
      let _searchValue = _filterKeys.leadSource.toLowerCase();

      data = data.filter((item) => {
        return (
          item.LeadSource &&
          item.LeadSource.toLowerCase().includes(_searchValue)
        );
      });
    }

    setFilterKeys({ ..._filterKeys });
    setData([...data]);
    paginationData([...data], 1, pagination.perPage);
  };

  const searchItems = (event: AutoCompleteCompleteEvent, choice: string) => {
    let query = event.query.trim();
    let orginalChoices = [...allChoices[choice]];
    let _filteredItems: typeof orginalChoices = [];

    for (let i = 0; i < orginalChoices.length; i++) {
      let item = orginalChoices[i];
      if (item.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        _filteredItems.push(item as (typeof orginalChoices)[0]);
      }
    }

    set_onChangeAllChoices((pre) => ({
      ...pre,
      [choice]: [..._filteredItems],
    }));
  };

  const DeleteData = () => {
    SPServices.SPUpdateItem({
      ID: isDelModal.Id ?? 0,
      Listname: Config.ListNames.CRMContacts,
      RequestJSON: {
        IsDeleted: true,
      },
    })
      .then((_deleted) => {
        AccountsContactIdDelete();
      })
      .catch((err: any) => {
        ErrorFunction(err, "Contact Data deleted error");
      });
  };

  const AccountsContactIdDelete = async () => {
    await SPServices.SPReadItems({
      Listname: Config.ListNames.CRMAccounts,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
    })
      .then(async (_account: any[]) => {
        if (_account.length) {
          for (let i = 0; i < _account.length; i++) {
            if (_account[i].ContactId.length) {
              for (let j = 0; j < _account[i].ContactId.length; j++) {
                if (_account[i].ContactId[j] == isDelModal.Id) {
                  let _contactIds: number[] = _account[i].ContactId;
                  let _contactIdRemove: number[] = _contactIds.filter(
                    (_id) => _id !== isDelModal.Id
                  );
                  await SPServices.SPUpdateItem({
                    ID: _account[i].Id,
                    Listname: Config.ListNames.CRMAccounts,
                    RequestJSON: {
                      ContactId: { results: _contactIdRemove },
                    },
                  })
                    .then((_accountRemoveContactId: any) => {})
                    .catch((err: any) => {
                      ErrorFunction(
                        err,
                        "Contact delete the account list error"
                      );
                    });
                }
              }
            }

            if (_account.length - 1 == i) {
              ExternalDealsContactIdDelete();
            }
          }
        } else {
          ExternalDealsContactIdDelete();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Accounts data get error");
      });
  };

  const ExternalDealsContactIdDelete = async () => {
    await SPServices.SPReadItems({
      Listname: Config.ListNames.CRMDeals,
      Topcount: 5000,
    })
      .then(async (_deal: any[]) => {
        if (_deal.length) {
          for (let i = 0; i < _deal.length; i++) {
            if (_deal[i].ContactsId.length) {
              for (let j = 0; j < _deal[i].ContactsId.length; j++) {
                if (_deal[i].ContactsId[j] == isDelModal.Id) {
                  let _contactIds: number[] = _deal[i].ContactsId;
                  let _contactIdRemove: number[] = _contactIds.filter(
                    (_id) => _id !== isDelModal.Id
                  );
                  await SPServices.SPUpdateItem({
                    ID: _deal[i].Id,
                    Listname: Config.ListNames.CRMDeals,
                    RequestJSON: {
                      ContactsId: { results: _contactIdRemove },
                    },
                  })
                    .then((_dealRemoveContactId: any) => {})
                    .catch((err: any) => {
                      ErrorFunction(
                        err,
                        "Deals External Contact delete the deal list error"
                      );
                    });
                }
              }
            }
            if (_deal.length - 1 == i) {
              InternalDealsContactIdDelete();
            }
          }
        } else {
          InternalDealsContactIdDelete();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals External data get error");
      });
  };

  const InternalDealsContactIdDelete = async () => {
    await SPServices.SPReadItems({
      Listname: Config.ListNames.PMOpportunity,
      Topcount: 5000,
    })
      .then(async (_deal: any[]) => {
        if (_deal.length) {
          for (let i = 0; i < _deal.length; i++) {
            if (_deal[i].ContactsId.length) {
              for (let j = 0; j < _deal[i].ContactsId.length; j++) {
                if (_deal[i].ContactsId[j] == isDelModal.Id) {
                  let _contactIds: number[] = _deal[i].ContactsId;
                  let _contactIdRemove: number[] = _contactIds.filter(
                    (_id) => _id !== isDelModal.Id
                  );
                  await SPServices.SPUpdateItem({
                    ID: _deal[i].Id,
                    Listname: Config.ListNames.PMOpportunity,
                    RequestJSON: {
                      ContactsId: { results: _contactIdRemove },
                    },
                  })
                    .then((_dealRemoveContactId: any) => {
                      setIsDelModal({
                        Id: null,
                        isOpen: false,
                      });
                      setFilterKeys(_filterKeys);
                      init();
                    })
                    .catch((err: any) => {
                      ErrorFunction(
                        err,
                        "Deals Internal Contact delete the deal list error"
                      );
                    });
                }
              }
            }
            if (_deal.length - 1 == i) {
              setIsDelModal({
                Id: null,
                isOpen: false,
              });
              setFilterKeys(_filterKeys);
              props.Notify("success", "Success", "Contact deleted sucessfully");
              init();
            }
          }
        } else {
          setIsDelModal({
            Id: null,
            isOpen: false,
          });
          setFilterKeys(_filterKeys);
          props.Notify("success", "Success", "Contact deleted sucessfully");
          init();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals Internal data get error");
      });
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
  };

  // Exports Excel
  const generateExcel = (items: IContactsData[]): void => {
    let _arrExport = [...items];
    const workbook: any = new ExcelJS.Workbook();
    const worksheet: any = workbook.addWorksheet("My Sheet");
    worksheet.columns = [
      { header: "Contact Name", key: "FirstName", width: 30 },
      { header: "Email", key: "Email", width: 45 },
      { header: "JobTitle", key: "JobTitle", width: 30 },
      { header: "Account", key: "Account", width: 30 },
      { header: "LeadSource", key: "LeadSource", width: 30 },
    ];
    _arrExport.forEach((item: IContactsData) => {
      let FullName: string = `${item.FirstName} ${item.LastName}`;

      const row = worksheet.addRow({
        FirstName: FullName ? FullName : "-",
        Email: item.Email ? item.Email : "-",
        JobTitle: item.JobTitle ? item.JobTitle : "-",
        Account: item.Account ? item.Account : "-",
        LeadSource: item.LeadSource ? item.LeadSource : "-",
      });
      row.eachCell((cell: any) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      row.eachCell({ includeEmpty: true }, (cell: any) => {
        cell.alignment = { horizontal: "left" };
      });
    });
    /* Header color change */
    const headerRows: string[] = ["A1", "B1", "C1", "D1", "E1"];
    headerRows.forEach((key: any) => {
      const cell = worksheet.getCell(key);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "00a99d" },
        bold: true,
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };
      cell.alignment = {
        vertical: "middle	",
        horizontal: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    // current time
    let date = new Date();
    let hour: string | number = date.getHours();
    let minute: string | number = date.getMinutes();
    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;
    workbook.xlsx
      .writeBuffer()
      .then((buffer: any) =>
        FileSaver.saveAs(
          new Blob([buffer]),
          `"Contacts data"
          -${hour}${"_"}${minute}-${moment().format("MM_DD_YYYY")}.xlsx`
        )
      )
      .catch((err: any) => {
        ErrorFunction(err, "Contact Data generate exel error");
      });
  };

  const init = () => {
    setLoader(true);
    GetChoices();
  };

  useEffect(() => {
    setFilterKeys({ ..._filterKeys });
    init();
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <div className={styles.lcaBody}>
          <div className={styles.filterBarAndTableBorder}>
            <div className={styles.filterBar}>
              <h2>Contacts</h2>
            </div>
            <div className={styles.filterBtns}>
              <div className="all_search">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search"> </InputIcon>
                  <InputText
                    v-model="value1"
                    placeholder="Search"
                    value={filterKeys.search}
                    onChange={(value?: React.ChangeEvent<HTMLInputElement>) => {
                      filterOnChangeHandle(
                        "search",
                        value?.currentTarget?.value ?? ""
                      );
                    }}
                  />
                </IconField>
              </div>
              <div className={styles.btnAndText}>
                <div
                  className={styles.btnBackGround}
                  style={{ cursor: data.length ? "pointer" : "not-allowed" }}
                  onClick={() => {
                    if (data.length) generateExcel(data);
                  }}
                >
                  <img src={ImportUploadImage} alt="no image" />
                  Export
                </div>
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
                  className={styles.btnBackGround}
                  onClick={() => {
                    props.PageNavigation("AddContact");
                  }}
                >
                  <img
                    src={PlusImage}
                    alt="no image"
                    style={{ width: "15px", height: "15px" }}
                  />
                  New Contact
                </div>
              </div>
            </div>
          </div>
          {filterBar ? (
            <div className={styles.filterFields}>
              <div className={styles.filterField}>
                <label htmlFor="contactName">Contact Name</label>
                <InputText
                  id="contactName"
                  placeholder="Enter here"
                  value={filterKeys.contactName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    filterOnChangeHandle("contactName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="Email">Email</label>
                <InputText
                  id="Email"
                  placeholder="Enter here"
                  value={filterKeys.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    filterOnChangeHandle("email", e.target.value);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="jobTitle">Job Title</label>
                <AutoComplete
                  id="jobTitle"
                  value={filterKeys.jobTitle}
                  suggestions={_onChangeAllChoices.JobTitle}
                  completeMethod={(event) => searchItems(event, "JobTitle")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose"
                  dropdown
                  style={{ width: "100%", height: "32px" }}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    filterOnChangeHandle("jobTitle", selectedValue);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="account">Account</label>
                <AutoComplete
                  id="account"
                  value={filterKeys.account}
                  suggestions={_onChangeAllChoices.Account}
                  completeMethod={(event) => searchItems(event, "Account")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose"
                  dropdown
                  style={{ width: "100%", height: "32px" }}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    filterOnChangeHandle("account", selectedValue);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="leadSource">Lead Source</label>
                <AutoComplete
                  id="leadSource"
                  value={filterKeys.leadSource}
                  suggestions={_onChangeAllChoices.LeadSource}
                  completeMethod={(event) => searchItems(event, "LeadSource")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose"
                  dropdown
                  style={{ width: "100%", height: "32px" }}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValue =
                      e.value && typeof e.value === "object"
                        ? e.value.name
                        : e.value;
                    filterOnChangeHandle("leadSource", selectedValue);
                  }}
                />
              </div>
              <div className={styles.filterField} style={{ width: "3%" }}>
                <PrimaryButton
                  styles={RefreshButton}
                  iconProps={{ iconName: "refresh" }}
                  className={styles.refresh}
                  onClick={() => {
                    setFilterKeys({ ..._filterKeys });
                    paginationData([...masterData], 1, pagination.perPage);
                    init();
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
              value={displayData}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              dataKey="id"
              tableStyle={{ minWidth: "60rem" }}
              className={
                ScreenWidth >= 1536 ? "data_table_1536" : "data_table_1396"
              }
              onRowClick={(e) => {
                let _contactFormData: IContactFormPageNavigate = {
                  id: e.data.ID,
                  formType: "ContactEditForm",
                  contactFormData: _contactEmptyData,
                };

                dispatch(setContactFormData(_contactFormData));
                props.PageNavigation("AddContact");
              }}
              paginator={displayData.length && data.length > 8 ? true : false}
              emptyMessage={<p className={styles.noData}>No data !!!</p>}
            >
              <Column
                field="FirstName"
                header="Contact Name"
                body={(item: IContactsData) => {
                  let FullName: string = `${item.FirstName} ${item.LastName}`;

                  return (
                    <div
                      className={styles.columnName}
                      title={FullName}
                      style={{ fontWeight: 500 }}
                    >
                      {FullName}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Email"
                header="Email"
                body={(item: IContactsData) => {
                  return (
                    <div className={styles.tables} title={item.Email}>
                      {item.Email ? (
                        <>
                          {/* <img src={MailImage} alt="no image" />
                          <p className={styles.columnName}>{item.Email}</p> */}

                          <a
                            href={`mailto:${item.Email}`}
                            data-interception="off"
                            className={styles.email}
                          >
                            <img src={MailImage} alt="no image" />
                            {item.Email}{" "}
                          </a>
                        </>
                      ) : (
                        "-"
                      )}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="JobTitle"
                header="Job Title"
                body={(item: IContactsData) => {
                  return (
                    <div className={styles.columnName} title={item.JobTitle}>
                      {item.JobTitle ? <>{item.JobTitle} </> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Account"
                header="Account"
                body={(item: IContactsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.Account}
                    >
                      {item.Account ? <>{item.Account}</> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="LeadSource"
                header="Lead Source"
                body={(item: IContactsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.LeadSource}
                    >
                      {item.LeadSource ? <>{item.LeadSource}</> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                header="Action"
                body={(item: IContactsData) => {
                  return (
                    <div className={styles.Actions}>
                      <div>
                        <img
                          title="Delete"
                          src={DeleteImage}
                          alt="no image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDelModal({
                              Id: item.ID,
                              isOpen: true,
                            });
                          }}
                        />
                      </div>
                    </div>
                  );
                }}
              />
            </DataTable>
          </div>
        </div>
      )}

      <Modal isOpen={isDelModal.isOpen} styles={delModalStyle}>
        <p className={styles.delmsg}>
          Are you sure, you want to delete this Contact?
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
              setLoader(true);
              setIsDelModal((pre) => ({
                ...pre,
                isOpen: false,
              }));
              DeleteData();
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default Contacts;
