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
import styles from "./Accounts.module.scss";
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
import { sp } from "@pnp/pnpjs";
import {
  IAccountFormPageNavigate,
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  IDealsFormData,
  IDealsFormPageNavigate,
} from "../Redux/ConfigPageInterfaces";
import { useDispatch, useSelector } from "react-redux";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { setAccountFormData, setDealFormData } from "../Redux/PageData";
import Pagination from "office-ui-fabric-react-pagination";

// Interfaces
interface IFilterKeys {
  search: string;
  accountName: string;
  accountType: string;
  industry: string;
  contact: string;
  rating: string;
  deals: string;
}
interface IPagination {
  currentPage: number;
  perPage: number;
}
interface IDealsData {
  ID: number | null;
  DealName: string;
  Contact: IChoice[];
  AccountId: number;
  ClosingDate: string;
  Stage: string;
  ExpectedRevenue: number;
}
interface IAccountsData {
  ID: number | null;
  AccountName: string;
  AccountType: string;
  Industry: string;
  Rating: string;
  Contact: IChoice[];
  DealsLinkAccount: IDealsData[];
  ParentAccount: IChoice | null;
}
interface IDelModal {
  isOpen: boolean;
  item: IAccountsData | null;
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

const Accounts = (props: IProps): JSX.Element => {
  // Local Variables
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  let _accountData: IAccountsData = {
    AccountName: "",
    AccountType: "",
    Contact: [],
    DealsLinkAccount: [],
    ID: null,
    Industry: "",
    ParentAccount: null,
    Rating: "",
  };
  let _filterKeys: IFilterKeys = {
    search: "",
    accountName: "",
    accountType: "",
    industry: "",
    contact: "",
    rating: "",
    deals: "",
  };
  const ScreenWidth: number = window.innerWidth;
  const configDefaults = ConfigPageDefaultValue();
  const _dealEmptyData: IDealsFormData = {
    ID: null,
    DealOwner: [ConfigureationData.currentUserEmail],
    DealOwnerId: ConfigureationData.currentUserId,
    DealName: "",
    Account: { name: "", code: 0 },
    AccountType: "",
    LeadSource: "",
    Contact: [],
    Industry: "",
    Location: "",
    Amount: "",
    ClosingDate: "",
    Stage: { name: "(+)ve Conversation", code: "Default" },
    Probability: "",
    ExpectedRevenue: "",
    CampaignSource: "",
    Country: "",
    PipeLine: "",
    Description: "",
    Lost: { name: "", code: 0 },
    Platform: [],
    OldData: {
      ID: null,
      DealOwner: [ConfigureationData.currentUserEmail],
      DealOwnerId: ConfigureationData.currentUserId,
      DealName: "",
      Account: { name: "", code: 0 },
      AccountType: "",
      LeadSource: "",
      Contact: [],
      Industry: "",
      Location: "",
      Amount: "",
      ClosingDate: "",
      Stage: { name: "(+)ve Conversation", code: "Default" },
      Probability: "",
      ExpectedRevenue: "",
      CampaignSource: "",
      Country: "",
      PipeLine: "",
      Description: "",
      Lost: { name: "", code: 0 },
      Platform: [],
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
  const [masterData, setMasterData] = useState<IAccountsData[]>([]);
  const [data, setData] = useState<IAccountsData[]>([]);
  const [displayData, setDisplayData] = useState<IAccountsData[]>([]);
  const [filterBar, setFilterBar] = useState<boolean>(false);
  const [filterKeys, setFilterKeys] = useState<IFilterKeys>(_filterKeys);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [_onChangeAllChoices, set_onChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [loader, setLoader] = useState<boolean>(true);
  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    perPage: Config.PagenationShow,
  });
  // const [childPagination, setChildPagination] = useState<IPagination>({
  //   currentPage: 1,
  //   perPage: 4,
  // });
  const [isDelModal, setIsDelModal] = useState<IDelModal>({
    isOpen: false,
    item: _accountData,
  });
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);

  // All Functions
  const GetChoices = async () => {
    let AllChoicesList: IAllChoiceColumn = {
      ...ConfigureationData.allChoicesData,
      Contact: [],
    };

    await SPServices.SPReadItems({
      Listname: Config.ListNames.CRMAccounts,
      Topcount: 5000,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
    })
      .then(async (_contactChoice: any) => {
        if (_contactChoice.length) {
          let _tempContactChoice: IChoice[] = [];

          for (let j = 0; j < _contactChoice.length; j++) {
            let item = _contactChoice[j];

            if (item.ContactId.length) {
              for (let i = 0; i < item.ContactId.length; i++) {
                let contactId: number = item.ContactId[i];

                const contactData: any = await SPServices.SPReadItemUsingId({
                  Listname: Config.ListNames.CRMContacts,
                  SelectedId: contactId,
                });

                if (contactData) {
                  let _fullName: string = `${contactData.FirstName} ${contactData?.LastName}`;
                  if (
                    !_tempContactChoice.some(
                      (choice) => choice.code == contactId
                    )
                  ) {
                    _tempContactChoice.push({
                      code: contactData.Id,
                      name: _fullName,
                    });

                    if (item.ContactId.length - 1 == i) {
                      AllChoicesList.Contact = _tempContactChoice;
                    }
                  }
                }
              }
            }
          }
        }

        setAllChoices(AllChoicesList);
        set_onChangeAllChoices(AllChoicesList);
        AccountDealData();
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get contact name error");
      });
  };

  const AccountDealData = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMDeals,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
    })
      .then(async (_dealData: any[]) => {
        let _tempDealData: IDealsData[] = [];

        if (_dealData.length) {
          for (let k = 0; k < _dealData.length; k++) {
            let dealData = _dealData[k];
            let _dealContactData: IChoice[] = [];

            if (dealData.ContactsId.length) {
              for (let l = 0; l < dealData.ContactsId.length; l++) {
                let contactId: number = dealData.ContactsId[l];

                const contactData: any = await SPServices.SPReadItemUsingId({
                  Listname: Config.ListNames.CRMContacts,
                  SelectedId: contactId,
                });

                if (contactData) {
                  let _fullName: string = `${contactData.FirstName} ${contactData?.LastName}`;
                  if (
                    !_dealContactData.some((choice) => choice.code == contactId)
                  ) {
                    _dealContactData.push({
                      code: contactData.Id,
                      name: _fullName,
                    });
                  }
                }
              }
            }

            _tempDealData.push({
              ID: dealData.ID ? dealData.ID : null,
              ClosingDate: dealData.ClosingDate ? dealData.ClosingDate : "",
              Contact: _dealContactData.length ? _dealContactData : [],
              AccountId: dealData.AccountId ? dealData.AccountId : null,
              DealName: dealData.DealName ? dealData.DealName : "",
              ExpectedRevenue: dealData.ExpectedRevenue
                ? dealData.ExpectedRevenue
                : null,
              Stage: dealData.Stage ? dealData.Stage : "",
            });

            if (_dealData.length - 1 == k) {
              GetAllData(_tempDealData);
            }
          }
        } else GetAllData(_tempDealData);
      })
      .catch((err: any) => {
        ErrorFunction(err, "Account linked in Deal data get error");
      });
  };

  const GetAllData = (dealData: IDealsData[]) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMAccounts,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then(async (_accountData: any[]) => {
        let _tempAccountData: IAccountsData[] = [];

        if (_accountData.length) {
          for (let i = 0; i < _accountData.length; i++) {
            let item = _accountData[i];
            let _tempContactName: IChoice[] = [];

            if (item.ContactId.length) {
              for (let j = 0; j < item.ContactId.length; j++) {
                let contactId: number = item.ContactId[j];

                const contactData: any = await SPServices.SPReadItemUsingId({
                  Listname: Config.ListNames.CRMContacts,
                  SelectedId: contactId,
                });

                if (contactData) {
                  let _fullName: string = `${contactData.FirstName} ${
                    contactData?.LastName ? contactData?.LastName : ""
                  }`;
                  if (
                    !_tempContactName.some((choice) => choice.code == contactId)
                  ) {
                    _tempContactName.push({
                      code: contactData.Id,
                      name: _fullName,
                    });
                  }
                }
              }
            }

            const _dealsData = dealData.filter((_e) => _e.AccountId == item.ID);

            _tempAccountData.push({
              ID: item.ID ? item.ID : null,
              AccountName: item.AccountName ? item.AccountName : "",
              AccountType: item.AccountType ? item.AccountType : "",
              Industry: item.Industry ? item.Industry : "",
              Contact: _tempContactName,
              Rating: item.Rating ? item.Rating : "",
              DealsLinkAccount: _dealsData,
              ParentAccount: item,
            });

            if (_accountData.length - 1 == i) {
              setMasterData([..._tempAccountData]);
              setData([..._tempAccountData]);
              paginationData([..._tempAccountData], 1, pagination.perPage);
              // childPaginationData(1, childPagination.perPage);
            }
          }
        } else {
          setLoader(false);
        }
      })
      .catch((err: any) => ErrorFunction(err, "Account data get error"));
  };

  const paginationData = (
    currData: IAccountsData[],
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

  // const childPaginationData = (
  //   currentPage: number,
  //   perPage: number
  // ): void => {
  //   setChildPagination({ currentPage, perPage });
  //   setLoader(false);
  // };

  const filterOnChangeHandle = (key: string, value: any): void => {
    filterFunction(masterData, { ...filterKeys, [key]: value });
  };

  const filterFunction = (data: IAccountsData[], _filterKeys: IFilterKeys) => {
    if (_filterKeys.search.trim()) {
      let _searchValue = _filterKeys.search.toLowerCase();

      data = data.filter((item) => {
        return (
          item.AccountName?.toLowerCase().includes(_searchValue) ||
          item.Contact?.some((contact) =>
            contact.name.toLowerCase().includes(_searchValue)
          ) ||
          item.DealsLinkAccount?.some((deal) => {
            return (
              deal.ClosingDate?.toLowerCase().includes(_searchValue) ||
              deal.DealName?.toLowerCase().includes(_searchValue) ||
              deal.ExpectedRevenue?.toString().includes(_searchValue) ||
              deal.Stage?.toLowerCase().includes(_searchValue) ||
              deal.Contact?.some((contact) =>
                contact.name.toLowerCase().includes(_searchValue)
              )
            );
          })
        );
      });
    }

    if (_filterKeys.accountName.trim()) {
      let _searchValue = _filterKeys.accountName.toLowerCase();

      data = data.filter((item) => {
        return item.AccountName?.toLowerCase().includes(_searchValue);
      });
    }

    if (_filterKeys.accountType.trim()) {
      let _searchValue = _filterKeys.accountType.toLowerCase();

      data = data.filter((item) => {
        return item.AccountType?.toLowerCase().includes(_searchValue);
      });
    }

    if (_filterKeys.industry.trim()) {
      let _searchValue = _filterKeys.industry.toLowerCase();

      data = data.filter((item) => {
        return item.Industry?.toLowerCase().includes(_searchValue);
      });
    }

    if (_filterKeys.contact) {
      let _searchValue = _filterKeys.contact;

      data = data.filter((item) => {
        return item.Contact?.some((contact) =>
          contact.name.toLowerCase().includes(_searchValue.toLowerCase())
        );
      });
    }

    if (_filterKeys.rating.trim()) {
      let _searchValue = _filterKeys.rating.toLowerCase();

      data = data.filter((item) => {
        return item.Rating?.toLowerCase().includes(_searchValue);
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
      ID:
        isDelModal.item && isDelModal.item.ID !== null ? isDelModal.item.ID : 0,
      Listname: Config.ListNames.CRMAccounts,
      RequestJSON: {
        IsDeleted: true,
      },
    })
      .then((_deleted) => {
        AccountsParentAccountIdDelete();
      })
      .catch((err: any) => {
        ErrorFunction(err, "Account deleted error");
      });
  };

  const AccountsParentAccountIdDelete = async () => {
    await sp.web.lists
      .getByTitle(Config.ListNames.CRMAccounts)
      .items.get()
      .then(async (_account: any[]) => {
        if (_account.length) {
          for (let i = 0; i < _account.length; i++) {
            if (
              isDelModal.item &&
              isDelModal.item.ID == _account[i].ParentAccountId
            ) {
              await SPServices.SPUpdateItem({
                ID: _account[i].Id,
                Listname: Config.ListNames.CRMAccounts,
                RequestJSON: {
                  ParentAccountId: null,
                },
              })
                .then((_accountUpdate) => {})
                .catch((err: any) => {
                  ErrorFunction(err, "Parent Account Id delete error");
                });
            }

            if (_account.length - 1 == i) {
              ContactsAccountIdDelete();
            }
          }
        } else {
          ContactsAccountIdDelete();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Accounts Read data error");
      });
  };

  const ContactsAccountIdDelete = async () => {
    await SPServices.SPReadItems({
      Listname: Config.ListNames.CRMContacts,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
    })
      .then(async (_contact: any[]) => {
        if (_contact.length) {
          for (let i = 0; i < _contact.length; i++) {
            if (
              isDelModal.item &&
              isDelModal.item.ID == _contact[i].AccountId
            ) {
              await SPServices.SPUpdateItem({
                ID: _contact[i].Id,
                Listname: Config.ListNames.CRMContacts,
                RequestJSON: {
                  AccountId: null,
                },
              })
                .then((_contactAccountIdRemove: any) => {})
                .catch((err: any) => {
                  ErrorFunction(err, "Contact's account Id delete error");
                });
            }

            if (_contact.length - 1 == i) {
              ExternalDealsAccountIdDelete();
            }
          }
        } else {
          ExternalDealsAccountIdDelete();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Contact's Account get error");
      });
  };

  const ExternalDealsAccountIdDelete = async () => {
    await SPServices.SPReadItems({
      Listname: Config.ListNames.CRMDeals,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
    })
      .then(async (_deal: any[]) => {
        if (_deal.length) {
          for (let i = 0; i < _deal.length; i++) {
            if (_deal[i].AccountId) {
              if (isDelModal.item && _deal[i].AccountId == isDelModal.item.ID) {
                await SPServices.SPUpdateItem({
                  ID: _deal[i].Id,
                  Listname: Config.ListNames.CRMDeals,
                  RequestJSON: {
                    AccountId: null,
                  },
                })
                  .then((_dealAccountIdRemove: any) => {})
                  .catch((err: any) => {
                    ErrorFunction(
                      err,
                      "Deals External account Id delete error"
                    );
                  });
              }
            }

            if (_deal.length - 1 == i) {
              InternalDealsAccountIdDelete();
            }
          }
        } else {
          InternalDealsAccountIdDelete();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals External Account get error");
      });
  };

  const InternalDealsAccountIdDelete = async () => {
    await SPServices.SPReadItems({
      Listname: Config.ListNames.PMOpportunity,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
    })
      .then(async (_deal: any[]) => {
        if (_deal.length) {
          for (let i = 0; i < _deal.length; i++) {
            if (_deal[i].AccountId) {
              if (isDelModal.item && _deal[i].AccountId == isDelModal.item.ID) {
                await SPServices.SPUpdateItem({
                  ID: _deal[i].Id,
                  Listname: Config.ListNames.PMOpportunity,
                  RequestJSON: {
                    AccountId: null,
                  },
                })
                  .then((_dealAccountIdRemove: any) => {})
                  .catch((err: any) => {
                    ErrorFunction(
                      err,
                      "Deals Internal account Id delete error"
                    );
                  });
              }
            }

            if (_deal.length - 1 == i) {
              setIsDelModal({
                item: null,
                isOpen: false,
              });
              setFilterKeys(_filterKeys);
              props.Notify(
                "success",
                "Success",
                "Account deleted successfully"
              );
              init();
            }
          }
        } else {
          setIsDelModal({
            item: null,
            isOpen: false,
          });
          setFilterKeys(_filterKeys);
          props.Notify("success", "Success", "Account deleted successfully");
          init();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals Internal Account get error");
      });
  };

  // Data Table Functions
  const FormatNumber = (revenue: string) => {
    let number = parseInt(revenue, 10).toString();
    let lastThree = number.slice(-3);
    let otherNumbers = number.slice(0, -3);

    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }

    return otherNumbers
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree
      : 0;
  };

  const rowExpansionTemplate = (data: IAccountsData) => {
    // const startChildIndex =
    //   (childPagination.currentPage - 1) * childPagination.perPage;
    // const endChildIndex = startChildIndex + childPagination.perPage;
    // const paginatedDeals = data.DealsLinkAccount.slice(
    //   startChildIndex,
    //   endChildIndex
    // );

    return (
      <div className="p-3">
        <div className={`${styles.accountChildTable} accountChildTable`}>
          <DataTable
            value={data.DealsLinkAccount}
            dataKey="ID"
            tableStyle={{ minWidth: "60rem" }}
            onRowClick={(e) => {
              let dealFormValue: IDealsFormPageNavigate = {
                dealFormData: _dealEmptyData,
                formType: "Acc-DF-Acc",
                id: e.data.ID,
                pipeLine: configDefaults.choiceEmptyValue,
                stage: configDefaults.choiceEmptyValue,
              };

              dispatch(setDealFormData(dealFormValue));
              props.PageNavigation("AddDeal");
            }}
            emptyMessage={
              <>
                <p style={{ textAlign: "center" }}>No data found</p>
              </>
            }
          >
            <Column
              field="DealName"
              header="Deal Name"
              body={(rowData: IDealsData) => {
                return (
                  <div
                    title={rowData.DealName}
                    className={styles.columnName}
                    style={{ fontWeight: 500 }}
                  >
                    {rowData.DealName ? rowData.DealName : "-"}
                  </div>
                );
              }}
              sortable
            />
            <Column
              field="Contact"
              header="Contact"
              body={(rowData: IDealsData) => {
                const contacts = rowData.Contact.map((_e) => _e.name).join(
                  ", "
                );

                return (
                  <div
                    title={contacts}
                    className={`${styles.tables} ${styles.columnName}`}
                  >
                    {contacts ? contacts : "-"}
                  </div>
                );
              }}
              sortable
            />
            <Column
              field="ClosingDate"
              header="Closing Date"
              body={(rowData: IDealsData) => {
                const closingDate = rowData.ClosingDate
                  ? moment(rowData.ClosingDate).format("DD/MM/YYYY")
                  : "";

                return (
                  <div title={closingDate} className={styles.columnName}>
                    {closingDate ? closingDate : "-"}
                  </div>
                );
              }}
              sortable
            />
            <Column
              field="Stage"
              header="Stage"
              body={(rowData: IDealsData) => {
                return (
                  <div title={rowData.Stage} className={styles.columnName}>
                    {rowData.Stage ? rowData.Stage : "-"}
                  </div>
                );
              }}
              sortable
            />
            <Column
              field="ExpectedRevenue"
              header="Expected Revenue"
              body={(rowData: IDealsData) => {
                let revenueAmount = rowData.ExpectedRevenue
                  ? FormatNumber(rowData.ExpectedRevenue.toString())
                  : "";

                return (
                  <div
                    title={revenueAmount.toString()}
                    className={styles.columnName}
                  >
                    {revenueAmount ? revenueAmount : "-"}
                  </div>
                );
              }}
              sortable
            />
          </DataTable>
        </div>
        {/* <div className={styles.PageNation}>
          {data.DealsLinkAccount.length ? (
            <Pagination
              currentPage={childPagination.currentPage}
              totalPages={Math.ceil(
                data.DealsLinkAccount.length / childPagination.perPage
              )}
              onChange={(page: number) => {
                childPaginationData(
                  [...data.DealsLinkAccount],
                  page,
                  childPagination.perPage
                );
              }}
            />
          ) : (
            ""
          )}
        </div> */}
      </div>
    );
  };

  const generateExcel = (items: IAccountsData[]): void => {
    const ExportUpdateData = (data: any) => {
      return data.map((item: any) => {
        const updatedData = item.DealsLinkAccount.map((dealItem: any) => ({
          ...dealItem,
          AccountID: item.ID,
          AccountName: item.AccountName,
        }));

        return {
          ...item,
          DealsLinkAccount: updatedData,
        };
      });
    };

    let firstIndex: number = 2;
    let lastIndex: number = 2;
    let _arrExport = ExportUpdateData(items);
    const workbook: any = new ExcelJS.Workbook();
    const worksheet: any = workbook.addWorksheet("My Sheet");
    const worksheetAccountDealSheet: any =
      workbook.addWorksheet("Account Deal Sheet");

    worksheet.columns = [
      { header: "Account Name", key: "AccountName", width: 30 },
      { header: "Account Type", key: "AccountType", width: 30 },
      { header: "Industry", key: "Industry", width: 45 },
      { header: "Contact", key: "Contact", width: 45 },
    ];
    worksheetAccountDealSheet.columns = [
      { header: "Account Name", key: "AccountName", width: 30 },
      { header: "Deal Name", key: "DealName", width: 30 },
      { header: "Contact", key: "Contact", width: 45 },
      { header: "Closing Date", key: "ClosingDate", width: 45 },
      { header: "Stage", key: "Stage", width: 45 },
      { header: "Expected Revenue", key: "ExpectedRevenue", width: 45 },
    ];

    _arrExport.forEach((item: any) => {
      const row = worksheet.addRow({
        AccountName: item.AccountName ? item.AccountName : "-",
        AccountType: item.AccountType ? item.AccountType : "-",
        Industry: item.Industry ? item.Industry : "-",
        Contact: item.Contact.length
          ? item.Contact.map((_e: any) => _e.name).join(", ")
          : "-",
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

      // Account deal Sheet data
      if (item.DealsLinkAccount.length) {
        for (let j = 0; j < item.DealsLinkAccount.length; j++) {
          let _item = item.DealsLinkAccount[j];

          const accountRow = worksheetAccountDealSheet.addRow({
            AccountName: item.AccountName ? item.AccountName : "-",
            DealName: _item.DealName ? _item.DealName : "-",
            Contact: _item.Contact.length
              ? _item.Contact.map((_e: any) => _e.name).join(", ")
              : "-",
            ClosingDate: _item.ClosingDate
              ? moment(_item.ClosingDate).format("DD/MM/YYYY")
              : "-",
            Stage: _item.Stage ? _item.Stage : "-",
            ExpectedRevenue: _item.ExpectedRevenue
              ? _item.ExpectedRevenue
              : "-",
          });

          accountRow.eachCell((cell: any) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });

          accountRow.eachCell({ includeEmpty: true }, (cell: any) => {
            cell.alignment = { horizontal: "left" };
          });

          lastIndex++;
        }

        lastIndex--;

        worksheetAccountDealSheet.mergeCells(`A${firstIndex}:A${lastIndex}`);
        worksheetAccountDealSheet.getCell(`A${firstIndex}`).alignment = {
          vertical: "middle",
          horizondal: "center",
        };

        lastIndex++;
        firstIndex = lastIndex;
      }
    });

    /* Header color change */
    const headerRows: string[] = ["A1", "B1", "C1", "D1"];
    const accountDealHeaderRows: string[] = [
      "A1",
      "B1",
      "C1",
      "D1",
      "E1",
      "F1",
    ];

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
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    accountDealHeaderRows.forEach((key: any, index: number) => {
      const cell = worksheetAccountDealSheet.getCell(key);

      if (index === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0070C0" },
        };
      } else {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00a99d" },
        };
      }

      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Save workbook
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
          `Accounts_data_${hour}_${minute}-${moment().format(
            "MM_DD_YYYY"
          )}.xlsx`
        )
      )
      .catch((err: any) => {
        ErrorFunction(err, "Accounts Data generate excel error");
      });
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
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
              <h2>Accounts</h2>
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
                    // data.length
                    //   ? generateExcel(data)
                    //   : props.Notify("warning", "No data !!!");
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
              {ConfigureationData.isAdmin && (
                <div className={styles.btnAndText}>
                  <div
                    className={styles.btnBackGround}
                    onClick={() => {
                      let _accountFormData: IAccountFormPageNavigate = {
                        id: 0,
                        formType: "AccountAddForm",
                      };
                      dispatch(setAccountFormData(_accountFormData));
                      props.PageNavigation("AddAccount");
                    }}
                  >
                    <img
                      src={PlusImage}
                      alt="no image"
                      style={{ width: "15px", height: "15px" }}
                    />
                    New Account
                  </div>
                </div>
              )}
            </div>
          </div>
          {filterBar ? (
            <div className={styles.filterFields}>
              <div className={styles.filterField}>
                <label htmlFor="accountName">Account Name</label>
                <InputText
                  id="accountName"
                  placeholder="Enter here"
                  value={filterKeys.accountName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    filterOnChangeHandle("accountName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="accountType">Account Type</label>
                <AutoComplete
                  id="accountType"
                  value={filterKeys.accountType}
                  suggestions={_onChangeAllChoices.AccountType}
                  completeMethod={(event) => searchItems(event, "AccountType")}
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
                    filterOnChangeHandle("accountType", selectedValue);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="industry">Industry</label>
                <AutoComplete
                  id="industry"
                  value={filterKeys.industry}
                  suggestions={_onChangeAllChoices.Industry}
                  completeMethod={(event) => searchItems(event, "Industry")}
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
                    filterOnChangeHandle("industry", selectedValue);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="contact">Contact</label>
                <AutoComplete
                  id="contact"
                  value={filterKeys.contact}
                  suggestions={_onChangeAllChoices.Contact}
                  completeMethod={(event) => searchItems(event, "Contact")}
                  virtualScrollerOptions={{ itemSize: 38 }}
                  field="name"
                  placeholder="Enter or choose"
                  dropdown
                  style={{ width: "100%", height: "32px" }}
                  onChange={(e: AutoCompleteChangeEvent) => {
                    const selectedValues =
                      typeof e.value === "object" ? e.value.name : e.value;

                    filterOnChangeHandle("contact", selectedValues);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="rating">Rating</label>
                <AutoComplete
                  id="rating"
                  value={filterKeys.rating}
                  suggestions={_onChangeAllChoices.Rating}
                  completeMethod={(event) => searchItems(event, "Rating")}
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
                    filterOnChangeHandle("rating", selectedValue);
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
              dataKey="ID"
              tableStyle={{ minWidth: "60rem" }}
              rowExpansionTemplate={rowExpansionTemplate}
              className={
                ScreenWidth >= 1536 ? "data_table_1536" : "data_table_1396"
              }
              onRowClick={(e) => {
                let _accountFormData: IAccountFormPageNavigate = {
                  id: e.data.ID,
                  formType: "AccountEditForm",
                };

                dispatch(setAccountFormData(_accountFormData));
                props.PageNavigation("AddAccount");
              }}
              emptyMessage={<p className={styles.noData}>No data !!!</p>}
            >
              <Column expander style={{ width: "5rem" }} />
              <Column
                field="AccountName"
                header="Account Name"
                body={(item: IAccountsData) => {
                  return (
                    <div
                      className={styles.columnName}
                      title={item.AccountName}
                      style={{ fontWeight: 500 }}
                    >
                      {item.AccountName}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="AccountType"
                header="Account Type"
                body={(item: IAccountsData) => {
                  return (
                    <div className={styles.columnName} title={item.AccountType}>
                      {item.AccountType ? item.AccountType : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Industry"
                header="Industry"
                body={(item: IAccountsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.Industry}
                    >
                      {item.Industry ? <>{item.Industry} </> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Contact"
                header="Contact"
                body={(item: IAccountsData) => {
                  let _contact = item.Contact.length
                    ? item.Contact.map((_e) => _e.name).join(", ")
                    : "-";

                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={_contact}
                    >
                      {_contact ? <>{_contact}</> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Rating"
                header="Rating"
                body={(item: IAccountsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.Rating}
                    >
                      {item.Rating ? <>{item.Rating}</> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                header="Action"
                body={(item: IAccountsData) => {
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
                              item: item,
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
          <div className={styles.PageNation}>
            {displayData.length && data.length > 8 ? (
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

      <Modal isOpen={isDelModal.isOpen} styles={delModalStyle}>
        <p className={styles.delmsg}>
          Are you sure, you want to delete this Account?
        </p>
        <div className={styles.modalBtnSec}>
          <PrimaryButton
            text="No"
            className={styles.cancelBtn}
            onClick={() => {
              setIsDelModal({ isOpen: false, item: null });
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

export default Accounts;
