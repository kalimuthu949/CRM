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
import styles from "./Leads.module.scss";
import { useEffect, useState } from "react";
import {
  Callout,
  IButtonStyles,
  IModalStyles,
  Modal,
  mergeStyleSets,
} from "@fluentui/react";
import { PrimaryButton } from "office-ui-fabric-react";
import Loading from "../../../../ExternalRef/Loader/Loading";
import { useId } from "@fluentui/react-hooks";
import Pagination from "office-ui-fabric-react-pagination";
import { Config } from "../../../../ExternalRef/CommonServices/Config";
import * as moment from "moment";
import * as Excel from "exceljs/dist/exceljs.min.js";
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
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import {
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  ILeadFormPageNavigate,
  ISiteUsers,
} from "../Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import { useDispatch, useSelector } from "react-redux";
import { setLeadFormData } from "../Redux/PageData";

// Interfaces
interface ISelectedValue {
  Pipeline: IChoice;
}
interface IFilterKeys {
  search: string;
  leadName: string;
  jobTitle: string;
  email: string;
  companyName: string;
  phone: string;
  leadStatus: string;
}
interface IDelModal {
  isOpen: boolean;
  Id: number | null;
}
interface IPagination {
  currentPage: number;
  perPage: number;
}
interface ILeadsData {
  ID?: number;
  LeadOwner?: string[];
  LeadOwnerId: number | null;
  FirstName: string;
  LastName: string;
  Phone: string;
  JobTitle: string;
  Email: string;
  Company: string;
  NumberOfEmployees: string;
  AnnualRevenue: string;
  WebSite: string;
  LeadStatus: string;
  LeadSource: string;
  Industry: string;
  State: string;
  Country: string;
  Description: string;
  LeadToDealMove?: boolean;
}
interface IMoveModal {
  isOpen: boolean;
  leadData: ILeadsData | null;
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
const ExportDownloadImage: string = require("../../../../ExternalRef/Images/filedownload.png");
const ImportUploadImage: string = require("../../../../ExternalRef/Images/fileupload.png");
const PlusImage: string = require("../../../../ExternalRef/Images/plus.png");
const FilterImage: string = require("../../../../ExternalRef/Images/filter.png");
const FilterNoneImage: string = require("../../../../ExternalRef/Images/filternone.png");
const MoveArrowImage: string = require("../../../../ExternalRef/Images/arrowright.png");
const DeleteImage: string = require("../../../../ExternalRef/Images/trashcan.png");
const PhoneImage: string = require("../../../../ExternalRef/Images/telephone.png");
const MailImage: string = require("../../../../ExternalRef/Images/mail.png");
const UploadImage: string = require("../../../../ExternalRef/Images/upload.png");
const ExcelImage: string = require("../../../../ExternalRef/Images/excel.png");

const Leads = (props: IProps) => {
  // Styles Variables
  const RefreshButton: Partial<IButtonStyles> = {
    root: {
      height: "33.25px",
      i: {
        fontWeight: "600 !important",
      },
    },
  };
  const collOutStyles = mergeStyleSets({
    callout: {
      width: 320,
      maxWidth: "90%",
      padding: "20px 24px",
    },
    importBorder: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
    },
    uploadFile: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
    },
    uploadFileBorder: {
      color: "#ebebeb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
      width: "68%",
      border: "1px solid #00a99d",
      borderRadius: "6px",
      padding: "5px 8px",
    },
    h3: {
      width: "32%",
      color: "#000",
      fontWeight: "500",
      margin: 0,
    },
    img: {
      width: "20px",
      height: "20px",
    },
    uploadImg: {
      cursor: "pointer",
    },
    fileNameBox: {
      color: "#ADADAD",
    },
    fileNamePlaceHolder: {
      color: "#000",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
    sampleTemplate: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "10px",
    },
    sampleLink: {
      color: "#0000ff",
    },
    submitBox: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
    },
    submitBtn: {
      color: "#fff",
      borderRadius: "4px",
      backgroundColor: "#0d900d !important",
      border: "1px solid #0d900d !important",
    },
  });
  const delModalStyle: Partial<IModalStyles> = {
    main: {
      minHeight: "130px",
      width: "25%",
      padding: "20px",
    },
  };

  // Local Variables
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const buttonId = useId("callout-button");
  const labelId = useId("callout-label");
  const descriptionId = useId("callout-description");
  const _filterKeys: IFilterKeys = {
    search: "",
    leadName: "",
    jobTitle: "",
    email: "",
    companyName: "",
    phone: "",
    leadStatus: "",
  };
  const ScreenWidth: number = window.innerWidth;
  let Managers: string = "";
  const _selectValue: ISelectedValue = {
    Pipeline: { name: "Default", code: "Default" },
  };
  const configDefaults = ConfigPageDefaultValue();

  // States Variables
  const [masterData, setMasterData] = useState<ILeadsData[]>([]);
  const [data, setData] = useState<ILeadsData[]>([]);
  const [displayData, setDisplayData] = useState<ILeadsData[]>([]);
  const [siteUsers, setSiteUsers] = useState<ISiteUsers[]>([]);
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [_onChangeAllChoices, set_onChangeAllChoices] =
    useState<IAllChoiceColumn>(configDefaults.emptyAllChoices);
  const [filterBar, setFilterBar] = useState<boolean>(false);
  const [filterKeys, setFilterKeys] = useState<IFilterKeys>(_filterKeys);
  const [loader, setLoader] = useState<boolean>(true);
  const [calloutVisible, setCalloutVisible] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [sampleTemplate, setSampleTemplate] = useState<string>("");
  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    perPage: Config.PagenationShow,
  });
  const [isDelModal, setIsDelModal] = useState<IDelModal>({
    isOpen: false,
    Id: null,
  });
  const [isMoveModal, setIsMoveModal] = useState<IMoveModal>({
    isOpen: false,
    leadData: null,
  });
  const [expandedRows, setExpandedRows] = useState<
    DataTableExpandedRows | DataTableValueArray | undefined
  >(undefined);
  const [selectedValue, setSelectedValue] = useState<ISelectedValue>({
    Pipeline: { name: "Default", code: "Default" },
  });

  // All Functions
  const SampleTemplateExcel = () => {
    SPServices.SPReadItems({
      Listname: "Documents",
      Expand: "File",
      Topcount: 5000,
    })
      .then((_file: any[]) => {
        if (_file.length) {
          setSampleTemplate(_file[0].File.ServerRelativeUrl);
        }
        GetChoices();
      })
      .catch((err: any) => {
        ErrorFunction(err, "Sample template get in document error");
      });
  };

  const GetChoices = async () => {
    let AllChoicesList: IAllChoiceColumn = {
      ...ConfigureationData.allChoicesData,
      LeadStatus: ConfigureationData.allChoicesData.LeadStatus,
      JobTitle: ConfigureationData.allChoicesData.JobTitle,
      LeadSource: ConfigureationData.allChoicesData.LeadSource,
      PipeLine: ConfigureationData.allChoicesData.PipeLine.filter(
        (e) => e.name !== Managers
      ),
      Stage: ConfigureationData.allChoicesData.Stage,
    };

    setAllChoices(AllChoicesList);
    set_onChangeAllChoices(AllChoicesList);
    GetAllData();
  };

  const GetAllData = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMLeads,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Select: "*,LeadOwner/EMail",
      Expand: "LeadOwner",
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then((_leadsData: any[]) => {
        let _tempLeadsData: ILeadsData[] = [];

        if (_leadsData.length) {
          _leadsData.forEach((item: any, index: number) => {
            _tempLeadsData.push({
              ID: item.ID ? item.ID : null,
              Description: item.Description ? item.Description : "",
              Email: item.Email ? item.Email : "",
              FirstName: item.FirstName ? item.FirstName : "",
              Industry: item.Industry ? item.Industry : "",
              JobTitle: item.JobTitle ? item.JobTitle : "",
              LastName: item.LastName ? item.LastName : "",
              LeadOwner: item.LeadOwner ? [item.LeadOwner.EMail] : [],
              LeadOwnerId: item.LeadOwnerId ? item.LeadOwnerId : null,
              LeadSource: item.LeadSource ? item.LeadSource : "",
              LeadStatus: item.LeadStatus ? item.LeadStatus : "",
              Phone: item.PhoneNumber ? item.PhoneNumber : "",
              WebSite: item.WebSite ? item.WebSite : "",
              AnnualRevenue: item.AnnualRevenue ? item.AnnualRevenue : "",
              Company: item.Company ? item.Company : "",
              NumberOfEmployees: item.NumberOfEmployees
                ? item.NumberOfEmployees
                : "",
              Country: item.Country ? item.Country : "",
              State: item.State ? item.State : "",
              LeadToDealMove: item.LeadToDealMove ? item.LeadToDealMove : false,
            });

            if (_leadsData.length - 1 == index) {
              setMasterData([..._tempLeadsData]);
              setData([..._tempLeadsData]);
              paginationData([..._tempLeadsData], 1, pagination.perPage);
            }
          });
        } else setLoader(false);
      })
      .catch((err: any) => ErrorFunction(err, "Leads data get error"));
  };

  const paginationData = (
    currData: ILeadsData[],
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

  const filterFunction = (data: ILeadsData[], _filterKeys: IFilterKeys) => {
    if (_filterKeys.search.trim()) {
      let _searchValue = _filterKeys.search.toLowerCase();

      data = data.filter((item) => {
        let FullName = `${item.FirstName} ${item.LastName}`;

        return (
          (item.Email && item.Email.toLowerCase().includes(_searchValue)) ||
          (item.Company && item.Company.toLowerCase().includes(_searchValue)) ||
          (FullName && FullName.toLowerCase().includes(_searchValue)) ||
          (item.JobTitle &&
            item.JobTitle.toLowerCase().includes(_searchValue)) ||
          (item.Phone && item.Phone.includes(_searchValue)) ||
          (item.LeadStatus &&
            item.LeadStatus.toLowerCase().includes(_searchValue))
        );
      });
    }

    if (_filterKeys.leadName.trim()) {
      let _searchValue = _filterKeys.leadName.toLowerCase();

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

    if (_filterKeys.companyName.trim()) {
      let _searchValue = _filterKeys.companyName.toLowerCase();

      data = data.filter((item) => {
        return (
          item.Company && item.Company.toLowerCase().includes(_searchValue)
        );
      });
    }

    if (_filterKeys.phone.trim()) {
      let _searchValue = _filterKeys.phone.toLowerCase();

      data = data.filter((item) => {
        return item.Phone && item.Phone.toLowerCase().includes(_searchValue);
      });
    }

    if (_filterKeys.leadStatus.trim()) {
      let _searchValue = _filterKeys.leadStatus.toLowerCase();

      data = data.filter((item) => {
        return (
          item.LeadStatus &&
          item.LeadStatus.toLowerCase().includes(_searchValue)
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

  const BulkExcelDataAdded = () => {
    setLoader(true);
    const wb = new Excel.Workbook();
    const reader = new FileReader();
    if (importFile) {
      reader.readAsArrayBuffer(importFile);
    } else {
      ErrorFunction(null, "No file selected for import.");
    }

    reader.onload = () => {
      const buffer = reader.result;
      let selectedSheet: any = [];
      let _excelData: ILeadsData[] = [];

      wb.xlsx.load(buffer).then((workbook) => {
        selectedSheet = workbook._worksheets.filter(
          (row) => row !== undefined
        )[0];
        const _rowData = selectedSheet._rows;

        // Check for header validation
        if (_rowData.length && isHeaderValid(_rowData[0])) {
          // Process rows starting from the second row
          for (let i = 1; i < _rowData.length; i++) {
            const row = _rowData[i];
            const email =
              getValue(row._cells[0], "text") ||
              getValue(row._cells[0], "value");
            const leadOwnerId = email ? getLeadOwnerId(email) : null;

            _excelData.push({
              LeadOwnerId: leadOwnerId,
              FirstName: getValue(row._cells[1], "value") || "",
              LastName: getValue(row._cells[2], "value") || "",
              Phone: getValue(row._cells[3], "value") || "",
              JobTitle: getValue(row._cells[4], "value") || "",
              Email: getValue(row._cells[5], "text") || "",
              WebSite: getValue(row._cells[6], "text") || "",
              LeadStatus: getValue(row._cells[7], "value") || "",
              LeadSource: getValue(row._cells[8], "value") || "",
              Industry: getValue(row._cells[9], "value") || "",
              Description: getValue(row._cells[10], "value") || "",
              Company: getValue(row._cells[11], "value") || "",
              NumberOfEmployees: getValue(row._cells[12], "value") || null,
              AnnualRevenue: getValue(row._cells[13], "value") || "",
              State: getValue(row._cells[14], "value") || "",
              Country: getValue(row._cells[15], "value") || "",
            });
          }

          if (_excelData.length) {
            addExcelDataToList(_excelData);
          } else {
            showFormatError();
          }
        } else {
          showFormatError();
        }

        setLoader(false);
      });
    };

    setCalloutVisible(!calloutVisible);
    setImportFile(null);
  };

  // Helper functions
  const isHeaderValid = (headerRow: any): boolean => {
    const headerValidation = [
      "LeadOwner",
      "FirstName",
      "LastName",
      "PhoneNumber",
      "JobTitle",
      "Email",
      "WebSite",
      "LeadStatus",
      "LeadSource",
      "Industry",
      "Description",
      "Company",
      "NumberOfEmployees",
      "AnnualRevenue",
      "State",
      "Country",
    ];
    return headerValidation.every((title, index) => {
      const cellValue = headerRow?._cells[index]?._value?.model;
      return (
        cellValue?.value === title ||
        cellValue?.value?.richText?.[0]?.text === title
      );
    });
  };

  const getValue = (cell: any, key: string) => cell?._value?.model?.[key];

  const getLeadOwnerId = (email: string) => {
    const user = siteUsers.find((user) => user.Email === email);
    return user ? user.Id : null;
  };

  const addExcelDataToList = (_excelData: ILeadsData[]) => {
    _excelData.forEach((data, index) => {
      const json = formatDataToJson(data);
      SPServices.SPAddItem({
        Listname: Config.ListNames.CRMLeads,
        RequestJSON: json,
      })
        .then(() => {
          if (index === _excelData.length - 1) {
            init();
          }
        })
        .catch((err) => {
          ErrorFunction(err, "Excel Data added in Leads error");
        });
    });
  };

  const formatDataToJson = (data: ILeadsData) => ({
    LeadOwnerId: data.LeadOwnerId || null,
    FirstName: data.FirstName || "",
    LastName: data.LastName || "",
    PhoneNumber: data.Phone ? data.Phone.toString() : "",
    JobTitle: data.JobTitle || "",
    Email: data.Email || "",
    WebSite: data.WebSite || "",
    LeadStatus: data.LeadStatus || "",
    LeadSource: data.LeadSource || "",
    Industry: data.Industry || "",
    Description: data.Description || "",
    Company: data.Company || "",
    NumberOfEmployees: data.NumberOfEmployees || null,
    AnnualRevenue: data.AnnualRevenue ? data.AnnualRevenue.toString() : "",
    State: data.State || "",
    Country: data.Country || "",
  });

  const showFormatError = () => {
    alert(
      "Uploaded file format is incorrect. Please use the provided template"
    );
    setLoader(false);
  };

  const LeadStatusColors = (status: string) => {
    let color = "";
    let backgroundColor = "";

    switch (status) {
      case "Attempted to Contact":
        color = "#0E6F8A";
        backgroundColor = "#D7F4FC";
        break;
      case "Contacted":
        color = "#FFB547";
        backgroundColor = "#FBF2E4";
        break;
      case "Junk Lead":
        color = "#FF475D";
        backgroundColor = "#FDE6E8";
        break;
      case "Lost Lead":
        color = "#FF475D";
        backgroundColor = "#FDE6E8";
        break;
      case "Not Contacted":
        color = "#FF475D";
        backgroundColor = "#FDE6E8";
        break;
      case "Pre-Qualified":
        color = "#9747FF";
        backgroundColor = "#E9E6FF";
        break;
      case "Not Qualified":
        color = "#FF475D";
        backgroundColor = "#FDE6E8";
        break;

      default:
        color = "#000000";
        backgroundColor = "#f0f0f0"; // Grey for default
        break;
    }

    return {
      color: color,
      backgroundColor: backgroundColor,
    };
  };

  const DeleteData = () => {
    SPServices.SPUpdateItem({
      ID: isDelModal.Id ?? 0,
      Listname: Config.ListNames.CRMLeads,
      RequestJSON: {
        IsDeleted: true,
      },
    })
      .then((_deleted) => {
        props.Notify("success", "Success", "Lead deleted successfully");
        setIsDelModal({
          Id: null,
          isOpen: false,
        });
        setFilterKeys(_filterKeys);
        init();
      })
      .catch((err: any) => {
        ErrorFunction(err, "Lead deleted error");
      });
  };

  const MoveToDealsValidation = async () => {
    if (!isMoveModal.leadData) {
      ErrorFunction(null, "Lead data is not available.");
      return;
    }

    const _leadData: ILeadsData = isMoveModal.leadData;
    const _firstName = _leadData.FirstName || "";
    const _lastName = _leadData.LastName || "";
    const _fullName = `${_firstName} ${_lastName}`;

    setIsMoveModal({ isOpen: false, leadData: null });

    if (
      !(
        _leadData.LeadOwnerId &&
        _leadData.FirstName &&
        _leadData.Phone &&
        _leadData.Email &&
        _leadData.Company
      )
    ) {
      props.Notify(
        "warn",
        "Warning",
        "Please fill the mandatory field in Leads"
      );
      setSelectedValue({ Pipeline: _selectValue.Pipeline });
      return;
    }

    try {
      setLoader(true);

      await SPServices.SPUpdateItem({
        ID: _leadData.ID ?? 0,
        Listname: Config.ListNames.CRMLeads,
        RequestJSON: { LeadToDealMove: true },
      });

      const _contactAdded = await SPServices.SPAddItem({
        Listname: Config.ListNames.CRMContacts,
        RequestJSON: {
          ContactOwnerId: _leadData.LeadOwnerId,
          FirstName: _leadData.FirstName,
          LastName: _leadData.LastName,
          JobTitle: _leadData.JobTitle,
          Email: _leadData.Email,
          PhoneNumber: _leadData.Phone,
          LeadSource: _leadData.LeadSource,
          AnnualRevenue: _leadData.AnnualRevenue,
          Country: _leadData.Country,
          State: _leadData.State,
          Description: _leadData.Description,
        },
      });

      const _accountAdded = await SPServices.SPAddItem({
        Listname: Config.ListNames.CRMAccounts,
        RequestJSON: {
          AccountOwnerId: _leadData.LeadOwnerId,
          AccountName: _fullName,
          ContactId: { results: [_contactAdded.data.ID] },
          Industry: _leadData.Industry,
          AnnualRevenue: _leadData.AnnualRevenue,
          Country: _leadData.Country,
          State: _leadData.State,
          AccountType: "",
          Rating: "",
          WebSite: _leadData.WebSite,
          NumberOfEmployees: _leadData.NumberOfEmployees
            ? Number(_leadData.NumberOfEmployees)
            : null,
          Description: _leadData.Description,
        },
      });

      await SPServices.SPUpdateItem({
        ID: _contactAdded.data.ID,
        Listname: Config.ListNames.CRMContacts,
        RequestJSON: { AccountId: _accountAdded.data.ID },
      });

      const _location = [_leadData.State, _leadData.Country]
        .filter(Boolean)
        .join(",\n");

      const _dealsAdded = await SPServices.SPAddItem({
        Listname: Config.ListNames.CRMDeals,
        RequestJSON: {
          DealOwnerId: _leadData.LeadOwnerId,
          DealName: _accountAdded.data.AccountName,
          AccountId: _accountAdded.data.ID,
          ContactsId: { results: [_contactAdded.data.ID] },
          LeadSource: _leadData.LeadSource,
          Industry: _leadData.Industry,
          Location: _location,
          Country: _leadData.Country,
          PipeLine: selectedValue.Pipeline.name,
          Stage:
            allChoices.Stage.find((e) => e.code === selectedValue.Pipeline.code)
              ?.name || "",
          AccountType: "",
          Amount: _leadData.AnnualRevenue ? Number(_leadData.AnnualRevenue) : 0,
          CampaignSource: "",
          Description: _leadData.Description,
          LeadToDealMove: true,
          Week: moment().week(),
          Year: moment().year(),
        },
      });

      await handleDealKanbanOrderUpdate(
        _dealsAdded.data.Id,
        _dealsAdded.data.Stage
      );

      setSelectedValue({ Pipeline: _selectValue.Pipeline });
      props.Notify("success", "Success", "Move to deals successfully");
      init();
    } catch (err: any) {
      ErrorFunction(err, "Error during lead to deal move process");
    }
  };

  // Helper function for Kanban Order update
  const handleDealKanbanOrderUpdate = async (
    dealId: number,
    dealStage: string
  ) => {
    try {
      const existingOrders: any = await SPServices.SPReadItems({
        Listname: Config.ListNames.DealsKanbanOrder,
        Filter: [
          {
            FilterKey: "Pipeline",
            Operator: "eq",
            FilterValue: selectedValue.Pipeline.name,
          },
        ],
      });

      if (existingOrders.length) {
        const stageData = existingOrders.find((e) => e.Title === dealStage);
        if (stageData) {
          const _ID = stageData.ID;
          const _OrderIds: number[] = stageData.IdOrder
            ? stageData.IdOrder.split(",").map(Number)
            : [];
          _OrderIds.unshift(dealId);

          await SPServices.SPUpdateItem({
            ID: _ID,
            Listname: Config.ListNames.DealsKanbanOrder,
            RequestJSON: { IdOrder: _OrderIds.toString() },
          });
        }
      } else {
        await SPServices.SPAddItem({
          Listname: Config.ListNames.DealsKanbanOrder,
          RequestJSON: { IdOrder: [dealId].toString() },
        });
      }
    } catch (err: any) {
      ErrorFunction(err, "Error updating/adding Deals Kanban Order");
    }
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setSelectedValue({ Pipeline: _selectValue.Pipeline });
    setLoader(false);
  };

  // Exports Excel
  const generateExcel = (items: ILeadsData[]): void => {
    let _arrExport = [...items];
    const workbook: any = new Excel.Workbook();
    const worksheet: any = workbook.addWorksheet("My Sheet");
    worksheet.columns = [
      { header: "Lead Name", key: "FirstName", width: 30 },
      { header: "JobTitle", key: "JobTitle", width: 30 },
      { header: "Email", key: "Email", width: 45 },
      { header: "Phone", key: "PhoneNumber", width: 20 },
      { header: "LeadStatus", key: "LeadStatus", width: 30 },
    ];
    _arrExport.forEach((item: ILeadsData) => {
      let FullName: string = `${item.FirstName} ${item.LastName}`;

      const row = worksheet.addRow({
        FirstName: FullName ? FullName : "-",
        JobTitle: item.JobTitle ? item.JobTitle : "-",
        Email: item.Email ? item.Email : "-",
        PhoneNumber: item.Phone ? item.Phone : "-",
        LeadStatus: item.LeadStatus ? item.LeadStatus : "-",
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
          `"Leads data"
          -${hour}${"_"}${minute}-${moment().format("MM_DD_YYYY")}.xlsx`
        )
      )
      .catch((err: any) => {
        ErrorFunction(err, "Leads Data generate exel error");
      });
  };

  const init = () => {
    setLoader(true);
    setSiteUsers([...ConfigureationData.siteUsers]);
    SampleTemplateExcel();
  };

  useEffect(() => {
    Managers = Config.CRMManagersGroup;
    setFilterKeys({ ..._filterKeys });
    init();
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <div className={styles.lcaBody}>
          <div
            className={`${styles.filterBarAndTableBorder} 
          ${ScreenWidth >= 1536 ? styles.filterBar_1536 : styles.filterBar_1396}
          `}
          >
            <div className={styles.filterBar}>
              <h2>Leads</h2>
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
                        value?.currentTarget.value
                      );
                    }}
                  />
                </IconField>
              </div>
              <div>
                <div
                  className={styles.btnAndText}
                  id={buttonId}
                  onClick={() => setCalloutVisible(!calloutVisible)}
                >
                  <div className={styles.btnBackGround}>
                    <img src={ExportDownloadImage} alt="no image" />
                    Import
                  </div>
                </div>
                {calloutVisible && (
                  <Callout
                    className={`${collOutStyles.callout} import_collOut`}
                    ariaLabelledBy={labelId}
                    ariaDescribedBy={descriptionId}
                    role="dialog"
                    gapSpace={0}
                    target={`#${buttonId}`}
                    onDismiss={() => {
                      setCalloutVisible(!calloutVisible);
                      setImportFile(null);
                    }}
                    setInitialFocus
                  >
                    <div className={collOutStyles.importBorder}>
                      <div className={collOutStyles.uploadFile}>
                        <h3 className={collOutStyles.h3}>Upload</h3>
                        <div className={collOutStyles.uploadFileBorder}>
                          <div
                            className={`${
                              importFile
                                ? collOutStyles.fileNamePlaceHolder
                                : collOutStyles.fileNameBox
                            }`}
                            title={
                              importFile ? importFile.name.split(".")[0] : ""
                            }
                          >
                            {importFile
                              ? importFile.name.split(".")[0]
                              : "Upload file"}
                          </div>
                          <label htmlFor="filePicker">
                            <img
                              src={UploadImage}
                              alt="no image"
                              className={`${collOutStyles.img} ${collOutStyles.uploadImg}`}
                            />
                          </label>
                          <input
                            type="file"
                            id="filePicker"
                            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              if (e.target.files) {
                                setImportFile(e.target.files[0]);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className={collOutStyles.sampleTemplate}>
                        <h3 className={collOutStyles.h3}>Template :</h3>
                        <img
                          src={ExcelImage}
                          alt="no image"
                          className={collOutStyles.img}
                        />
                        <a
                          href={sampleTemplate}
                          target="_blank"
                          className={collOutStyles.sampleLink}
                        >
                          Sample template.xlsx
                        </a>
                      </div>
                      {importFile ? (
                        <div className={collOutStyles.submitBox}>
                          <PrimaryButton
                            className={collOutStyles.submitBtn}
                            onClick={() => {
                              BulkExcelDataAdded();
                            }}
                          >
                            Submit
                          </PrimaryButton>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </Callout>
                )}
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
                    let _leadFormData: ILeadFormPageNavigate = {
                      id: 0,
                      value: "",
                    };
                    dispatch(setLeadFormData(_leadFormData));
                    props.PageNavigation("AddLead");
                  }}
                >
                  <img
                    src={PlusImage}
                    alt="no image"
                    style={{ width: "15px", height: "15px" }}
                  />
                  New Lead
                </div>
              </div>
            </div>
          </div>
          {filterBar ? (
            <div className={styles.filterFields}>
              <div className={styles.filterField}>
                <label htmlFor="LeadName">Lead Name</label>
                <InputText
                  id="leadName"
                  placeholder="Enter here"
                  value={filterKeys.leadName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    filterOnChangeHandle("leadName", e.target.value);
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
                <label htmlFor="CompanyName">Company Name</label>
                <InputText
                  id="CompanyName"
                  placeholder="Enter here"
                  value={filterKeys.companyName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    filterOnChangeHandle("companyName", e.target.value);
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="phone">Phone</label>
                <InputText
                  id="phone"
                  placeholder="Enter here"
                  value={filterKeys.phone}
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const inputValue = e.target.value;
                    if (!isNaN(Number(inputValue.replace(/,/g, "")))) {
                      filterOnChangeHandle("phone", inputValue);
                    }
                  }}
                />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="LeadStatus">Lead Status</label>
                <AutoComplete
                  id="LeadStatus"
                  value={filterKeys.leadStatus}
                  suggestions={_onChangeAllChoices.LeadStatus}
                  completeMethod={(event) => searchItems(event, "LeadStatus")}
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
                    filterOnChangeHandle("leadStatus", selectedValue);
                  }}
                />
              </div>
              <div className={styles.filterField} style={{ width: "3%" }}>
                <PrimaryButton
                  styles={RefreshButton}
                  iconProps={{ iconName: "refresh" }}
                  className={styles.refresh}
                  onClick={() => {
                    setImportFile(null);
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
                let _leadFormData: ILeadFormPageNavigate = {
                  id: e.data.ID,
                  value: "LeadEditForm",
                };
                dispatch(setLeadFormData(_leadFormData));
                props.PageNavigation("AddLead");
              }}
              emptyMessage={<p className={styles.noData}>No data !!!</p>}
            >
              <Column
                field="FirstName"
                header="Lead Name"
                body={(item: ILeadsData) => {
                  let FullName: string = `${item.FirstName} ${item.LastName}`;

                  return (
                    <>
                      <div
                        style={{ fontWeight: 500 }}
                        className={`${styles.columnName} fullName`}
                        title={FullName}
                      >
                        {FullName}
                      </div>
                    </>
                  );
                }}
                sortable
              />
              <Column
                field="JobTitle"
                header="Job Title"
                body={(item: ILeadsData) => {
                  return (
                    <div className={styles.columnName} title={item.JobTitle}>
                      {item.JobTitle ? item.JobTitle : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Email"
                header="Email"
                body={(item: ILeadsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.Email}
                    >
                      {item.Email ? (
                        <a
                          href={`mailto:${item.Email}`}
                          data-interception="off"
                          className={styles.email}
                        >
                          <img src={MailImage} alt="no image" />
                          {item.Email}{" "}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Company"
                header="Company Name"
                body={(item: ILeadsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.Company}
                    >
                      {item.Company ? <>{item.Company}</> : "-"}
                    </div>
                  );
                }}
                sortable
              />
              <Column
                field="Phone"
                header="Phone"
                body={(item: ILeadsData) => {
                  return (
                    <div
                      className={`${styles.tables} ${styles.columnName}`}
                      title={item.Phone}
                    >
                      {item.Phone ? (
                        <>
                          <img
                            src={PhoneImage}
                            alt="no image"
                            style={{ width: "16px", height: "16px" }}
                          />
                          {item.Phone}
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
                field="LeadStatus"
                header="Lead Status"
                body={(item: ILeadsData) => {
                  let colors = LeadStatusColors(item.LeadStatus);

                  return item.LeadStatus ? (
                    <div
                      title={item.LeadStatus}
                      className={styles.leadStatus}
                      style={{
                        color: colors.color,
                        backgroundColor: colors.backgroundColor,
                      }}
                    >
                      {item.LeadStatus}
                    </div>
                  ) : (
                    <div>-</div>
                  );
                }}
                sortable
              />
              <Column
                header="Action"
                body={(item: ILeadsData) => {
                  return (
                    <div className={styles.Actions}>
                      <div>
                        <img
                          title={
                            item.LeadToDealMove
                              ? "already move to deals"
                              : "move to deals"
                          }
                          style={{
                            cursor: item.LeadToDealMove ? "auto" : "pointer",
                            filter: item.LeadToDealMove
                              ? "opacity(0.5)"
                              : "opacity(1)",
                          }}
                          src={MoveArrowImage}
                          alt="no image"
                          onClick={(e) => {
                            if (!item.LeadToDealMove) {
                              e.stopPropagation();
                              setIsMoveModal({
                                leadData: item,
                                isOpen: true,
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <img
                          title="Delete"
                          src={DeleteImage}
                          alt="no image"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDelModal({
                              Id: item.ID ?? null,
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

      {/* Delete Modal */}
      <Modal isOpen={isDelModal.isOpen} styles={delModalStyle}>
        <p className={styles.delmsg}>
          Are you sure, you want to delete this Lead?
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

      {/* Deal Move Modal*/}
      <Dialog
        header="Are you sure, you want to move this Deal?"
        visible={isMoveModal.isOpen}
        style={{ width: "28%" }}
        onHide={() => {
          if (!isMoveModal.isOpen) return;
          setSelectedValue({ Pipeline: _selectValue.Pipeline });
          setIsMoveModal({ isOpen: false, leadData: null });
        }}
        draggable={false}
      >
        <div className="drpDown">
          <Dropdown
            value={selectedValue.Pipeline}
            onChange={(e: DropdownChangeEvent) => {
              setSelectedValue({ Pipeline: e.value });
            }}
            options={allChoices.PipeLine}
            optionLabel="name"
            placeholder="Select a pipeline choice"
            style={{ width: 200 }}
          />
        </div>
        <div className={styles.modalBtnSec}>
          <PrimaryButton
            text="No"
            className={styles.cancelBtn}
            onClick={() => {
              setSelectedValue({ Pipeline: _selectValue.Pipeline });
              setIsMoveModal({ isOpen: false, leadData: null });
            }}
          />
          <PrimaryButton
            text="Yes"
            className={styles.addBtn}
            onClick={() => {
              MoveToDealsValidation();
            }}
          />
        </div>
      </Dialog>
    </>
  );
};
export default Leads;
