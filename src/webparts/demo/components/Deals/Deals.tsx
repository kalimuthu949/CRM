/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/jsx-key */
/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./Deals.module.scss";
import { PrimaryButton, Icon } from "@fluentui/react";
import { Config } from "../../../../ExternalRef/CommonServices/Config";
import Loading from "../../../../ExternalRef/Loader/Loading";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import { useDispatch, useSelector } from "react-redux";
import {
  IAllChoiceColumn,
  IChoice,
  IConfigState,
  IDealsFormData,
  IDealsFormPageNavigate,
  IDealsPageNavigate,
  IManagerChoices,
  IOpporFormData,
  IOpportunityFormPageNavigate,
} from "../Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "../Redux/ConfigPageDefaultValue";
import {
  setDealData,
  setDealFormData,
  setOpportunityFormData,
} from "../Redux/PageData";
import { setMainAllChoicesData } from "../Redux/ConfigureationData";
import { AddPipeLine, LostChoiceReason, ManagersAnalysis } from "./Modals";

// Interfaces
interface IPipelineScreen {
  Deals: boolean;
  PMPipeline: boolean;
  MyWatchlist: boolean;
}
interface IChoiceListPipeline {
  label: string;
  value: number | any;
}
interface IPipeLineChoiceModal {
  isOpen: boolean;
  pipeLineValue: string;
  Stages: IChoiceListPipeline[];
}
interface IPipelineConfig {
  Pipeline: string;
  Stages: string[];
}
interface IDealsKanbanOrderData {
  [key: string]: {
    [key: string]: {
      ID: number;
      Pipeline: string;
      Stage: string;
      OrderIds: number[];
    };
  };
}
interface ILostOnDropData {
  ItemID: string;
  Stage: string;
  Index: number | null;
}
interface ILostModal {
  isOpen: boolean;
  onDropData: ILostOnDropData;
}
interface IManagersAnalysisOnDropData {
  ItemID: string;
  IfNeeded: boolean;
  Stage: string;
  Index: number | null;
}
interface IManagersAnalysisModal {
  isOpen: boolean;
  onDropData: IManagersAnalysisOnDropData;
}
interface IFilterKeys {
  search: string;
}
interface IChoiceList {
  label: string;
  value: number | string;
}
interface ISelectedValue {
  Lost: any;
  Pipeline: IChoice;
  manager: IManagerChoices;
}
interface IOwnerData {
  EMail: string;
  Name: string;
}
interface IDealsData {
  [x: string]: any;
  ID: number;
  DealOwner: IOwnerData[];
  DealOwnerId: number | null;
  DealName: string;
  Contact: IChoiceList[];
  Amount: string;
  Pipeline: string;
  Stage: string;
  Probability: string;
  ExpectedRevenue: string;
  ClosingDate: string;
  Lost: string;
}
interface IOpportunityData {
  ID: number;
  OpportunityOwner: IOwnerData[];
  OpportunityName: string;
  Contact: IChoiceList[];
  Stage: string;
  EstimatedQuote: number;
  WinProbability: string;
  InterventionNeeded: boolean;
  AdminWatchList: boolean;
  Pipeline: string;
}
interface IStagesData {
  Title: string;
  Pipeline: string;
  Length: number;
  Amount: number | string;
  Data: IDealsData[];
}
interface IOpporStagesData {
  Stage: string;
  Pipeline: string;
  Length: number;
  Amount: number;
  Data: IOpportunityData[];
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
const PlusImage: string = require("../../../../ExternalRef/Images/plus.png");
let DragStartIndex: number | null = null;
let DragStartStage: string = "";
let DragPipeline: string = "";

const Deals = (props: IProps): JSX.Element => {
  // Local Variables
  const dispatch = useDispatch();
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const dealNavigateValue: IDealsPageNavigate = useSelector(
    (state: any) => state.PageData.dealValue
  );

  const _filterKeys: IFilterKeys = {
    search: "",
  };
  let _pipeLineChoiceAdd: IPipeLineChoiceModal = {
    isOpen: false,
    pipeLineValue: "",
    Stages: [
      { label: "", value: "" },
      { label: "", value: "" },
    ],
  };
  const Managers: string = Config.CRMManagersGroup;
  const currentEmail: string =
    ConfigureationData.context._pageContext._user.email;
  const currentDisplayName: string =
    ConfigureationData.context._pageContext._user.displayName;
  const configDefaults = ConfigPageDefaultValue();
  const _opportunityEmptyData: IOpporFormData = {
    ID: null,
    OpportunityName: "",
    OpportunityOwner: [ConfigureationData.currentUserEmail],
    OpportunityOwnerId: ConfigureationData.currentUserId,
    Stage: "(+)ve Conversation",
    Account: configDefaults.choiceEmptyValue,
    Platform: [],
    EstimatedTime: "",
    AdminWatchList: false,
    Contact: [],
    EstimatedQuote: 0,
    InterventionNeeded: false,
    WinProbability: "",
    Description: "",
    Lost: configDefaults.choiceEmptyValue,
    OldData: {
      ID: null,
      OpportunityName: "",
      OpportunityOwner: [ConfigureationData.currentUserEmail],
      OpportunityOwnerId: ConfigureationData.currentUserId,
      Stage: "(+)ve Conversation",
      Account: configDefaults.choiceEmptyValue,
      Platform: [],
      EstimatedTime: "",
      AdminWatchList: false,
      Contact: [],
      EstimatedQuote: 0,
      InterventionNeeded: false,
      WinProbability: "",
      Description: "",
      Lost: configDefaults.choiceEmptyValue,
    },
  };
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

  // States Variables
  const [filterKeys, setFilterKeys] = useState<IFilterKeys>(_filterKeys);
  const [masterData, setMasterData] = useState<IDealsData[]>([]);
  const [masterStages, setMasterStages] = useState<IStagesData[]>([]);
  const [stages, setStages] = useState<IStagesData[]>([]);
  const [masterOpporData, setMasterOpporData] = useState<IOpportunityData[]>(
    []
  );
  const [masterStagesOppor, setMasterStagesOppor] = useState<
    IOpporStagesData[]
  >([]);
  const [stagesOppor, setStagesOppor] = useState<IOpporStagesData[]>([]);
  const [dealsKanbanOrder, setDealsKanbanOrder] =
    useState<IDealsKanbanOrderData>({});
  const [configPipeLineConfig, setConfigPipelineConfig] = useState<
    IPipelineConfig[]
  >([]);
  const [configAllChoices, setConfigAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [allChoices, setAllChoices] = useState<IAllChoiceColumn>(
    configDefaults.emptyAllChoices
  );
  const [selectedValue, setSelectedValue] = useState<ISelectedValue>({
    Lost: null,
    Pipeline: { name: "Default", code: "Default" },
    manager: { name: "All", code: "All", eMail: "" },
  });
  const [isLostModal, setIsLostModal] = useState<ILostModal>({
    isOpen: false,
    onDropData: {
      ItemID: "",
      Stage: "",
      Index: null,
    },
  });
  const [isManagersAnalysisModal, setIsManagersAnalysisModal] =
    useState<IManagersAnalysisModal>({
      isOpen: false,
      onDropData: {
        ItemID: "",
        IfNeeded: false,
        Stage: "",
        Index: null,
      },
    });
  const [pipeLineChoiceAdd, setPipeLineChoiceAdd] =
    useState<IPipeLineChoiceModal>({
      ..._pipeLineChoiceAdd,
    });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(true);
  const [pipelineScreen, setPipelineScreen] = useState<IPipelineScreen>({
    Deals: false,
    MyWatchlist: false,
    PMPipeline: false,
  });
  const [managersChoices, setManagersChoices] = useState<IManagerChoices[]>([]);

  // All Functions
  const GetAllChoices = (
    choiceValueCheck: boolean,
    allChoicesValue: IAllChoiceColumn
  ) => {
    const {
      allChoicesData,
      isAdmin,
      context: {
        _pageContext: {
          _user: { displayName, email },
        },
      },
    } = ConfigureationData;

    // Determine base choices based on flag
    const baseChoices = choiceValueCheck ? allChoicesValue : allChoicesData;

    // Set manager info
    const managerInfo = isAdmin
      ? { name: "All", code: "All", eMail: "" }
      : { name: displayName, code: displayName, eMail: email };
    setSelectedValue((prev) => ({ ...prev, manager: managerInfo }));

    // Set screen types
    setPipelineScreen({
      Deals: isAdmin,
      PMPipeline: !isAdmin,
      MyWatchlist: false,
    });

    // Set config choices
    setConfigAllChoices(baseChoices);

    // Filter pipeline choices to exclude "Managers"
    const filteredChoices: IAllChoiceColumn = {
      ...baseChoices,
      PipeLine: baseChoices.PipeLine.filter((e) => e.name !== Managers),
    };
    setAllChoices(filteredChoices);

    // Load manager options
    ManagersChoiceDataGet();
  };

  const ManagersChoiceDataGet = () => {
    let _managerName: IManagerChoices[] = [];

    if (ConfigureationData.siteManagerUsers?.length) {
      ConfigureationData.siteManagerUsers?.forEach((user, i) => {
        _managerName.push({
          name: user.Title,
          code: user.Title,
          eMail: user.Email,
        });

        if (ConfigureationData.siteManagerUsers.length - 1 == i) {
          setManagersChoices(_managerName);
        }
      });
    }
    DealsKanbanOrderDataGet();
  };

  const DealsKanbanOrderDataGet = () => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.DealsKanbanOrder,
    })
      .then((_kanbanOrderData: any[]) => {
        let _tempKanbanOrderData: IDealsKanbanOrderData = {};

        if (_kanbanOrderData.length) {
          _kanbanOrderData.forEach((item, i) => {
            // Check if the pipeline exists in the temp object
            if (!_tempKanbanOrderData[item.Pipeline]) {
              // Create a new entry for the pipeline if it doesn't exist
              _tempKanbanOrderData[item.Pipeline] = {};
            }

            // Create or update the stage for the current pipeline
            _tempKanbanOrderData[item.Pipeline][item.Title] = {
              ID: item.ID ? item.ID : null,
              Pipeline: item.Pipeline ? item.Pipeline : "",
              Stage: item.Title ? item.Title : "", // Adding the Stage field
              OrderIds: item.IdOrder ? item.IdOrder.split(",").map(Number) : [],
            };

            // If it's the last item, update the state and trigger GetContactsData
            if (_kanbanOrderData.length - 1 === i) {
              setDealsKanbanOrder(_tempKanbanOrderData);
              GetContactsData(_tempKanbanOrderData);
            }
          });
        } else {
          // If there's no kanban order data, trigger GetContactsData with an empty object
          GetContactsData(_tempKanbanOrderData);
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals Kanban Order data get error");
      });
  };

  const GetContactsData = (kanbanOrderData: IDealsKanbanOrderData) => {
    SPServices.SPReadItems({
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
      .then((_contact: any[]) => {
        let _tempContactNameChoice: IChoiceList[] = [];
        if (_contact.length) {
          _contact.forEach((item, i) => {
            let _firstName: string = item.FirstName ? item.FirstName : "";
            let _lastName: string = item.LastName ? item.LastName : "";
            let FullName: string = `${_firstName} ${_lastName}`;

            _tempContactNameChoice.push({
              value: item.Id,
              label: FullName,
            });

            if (_contact.length - 1 == i) {
              PipeLineConfigGetData(kanbanOrderData, _tempContactNameChoice);
            }
          });
        } else PipeLineConfigGetData(kanbanOrderData, _tempContactNameChoice);
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Contacts data error");
      });
  };

  const PipeLineConfigGetData = (
    kanbanOrderData: IDealsKanbanOrderData,
    contactData: IChoiceList[]
  ) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.PipeLineConfig,
      Topcount: 5000,
    })
      .then((_pipeline: any[]) => {
        let _tempPipelineData: IPipelineConfig[] = [];

        if (_pipeline.length) {
          _pipeline.forEach((data, i) => {
            _tempPipelineData.push({
              Pipeline: data.Title ? data.Title : "",
              Stages: data.Stages ? data.Stages.trim().split(",") : "",
            });

            if (_pipeline.length - 1 == i) {
              setConfigPipelineConfig(_tempPipelineData);
              GetAllData(kanbanOrderData, contactData, _tempPipelineData);
            }
          });
        } else GetAllData(kanbanOrderData, contactData, _tempPipelineData);
      })
      .catch((err: any) => {
        ErrorFunction(err, "Pipeline config data get error");
      });
  };

  const GetAllData = (
    kanbanOrderData: IDealsKanbanOrderData,
    contactData: IChoiceList[],
    _tempPipelineData: IPipelineConfig[]
  ) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.CRMDeals,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Select: "*,DealOwner/EMail,DealOwner/Title",
      Expand: "DealOwner",
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then(async (_dealsData: any[]) => {
        let _tempDealsData: IDealsData[] = [];

        if (_dealsData.length) {
          for (let i = 0; i < _dealsData.length; i++) {
            let item = _dealsData[i];
            let _tempContactNameChoice: IChoiceList[] = [];

            //  Contact Lookup
            if (item.ContactsId.length) {
              for (let j = 0; j < item.ContactsId.length; j++) {
                const contact = contactData.find(
                  (_e) => _e.value === item.ContactsId[j]
                );

                if (contact) {
                  _tempContactNameChoice.push({
                    value: contact.value,
                    label: contact.label,
                  });
                }
              }
            }

            _tempDealsData.push({
              ID: item.ID ? item.ID : null,
              Amount: item.Amount ? item.Amount : "",
              DealName: item.DealName ? item.DealName : "",
              DealOwner: item.DealOwner
                ? [{ EMail: item.DealOwner.EMail, Name: item.DealOwner.Title }]
                : [],
              DealOwnerId: item.DealOwnerId ? item.DealOwnerId : null,
              ExpectedRevenue: item.ExpectedRevenue ? item.ExpectedRevenue : "",
              Probability: item.Probability ? item.Probability : "",
              Pipeline: item.PipeLine ? item.PipeLine : "",
              Stage: item.Stage ? item.Stage : "",
              ClosingDate: item.ClosingDate ? item.ClosingDate : "",
              Contact: item.ContactsId ? _tempContactNameChoice : [],
              Lost: item.Lost ? item.Lost : "",
            });

            if (_dealsData.length - 1 == i) {
              setPipelineScreen({
                Deals:
                  ConfigureationData.isAdmin &&
                  dealNavigateValue.pipeLine === "Deals",
                MyWatchlist: dealNavigateValue.pipeLine === "MyWatchlist",
                PMPipeline: dealNavigateValue.pipeLine === "PMPipeline",
              });

              setMasterData([..._tempDealsData]);

              if (
                dealNavigateValue.pipeLine == "PMPipeline" ||
                dealNavigateValue.pipeLine == "MyWatchlist"
              ) {
                setSelectedValue((pre) => ({
                  ...pre,
                  manager: dealNavigateValue.managerName,
                }));
              } else {
                // Need to check
                setSelectedValue({
                  ...selectedValue,
                  Pipeline: dealNavigateValue.pipeLineValue.code
                    ? dealNavigateValue.pipeLineValue
                    : ConfigureationData.isAdmin
                    ? selectedValue.Pipeline
                    : { name: Managers, code: Managers },
                });
              }
            }
          }
        }

        setPipelineScreen({
          Deals:
            ConfigureationData.isAdmin &&
            dealNavigateValue.pipeLine === "Deals",
          MyWatchlist: dealNavigateValue.pipeLine === "MyWatchlist",
          PMPipeline: dealNavigateValue.pipeLine === "PMPipeline",
        });
        GetOpportunityData(
          kanbanOrderData,
          contactData,
          _tempPipelineData,
          _tempDealsData
        );
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Deals data error");
      });
  };

  const GetOpportunityData = (
    kanbanOrderData: IDealsKanbanOrderData,
    contactData: IChoiceList[],
    _tempPipelineData: IPipelineConfig[],
    _tempDealsData: IDealsData[]
  ) => {
    SPServices.SPReadItems({
      Listname: Config.ListNames.PMOpportunity,
      Filter: [
        {
          FilterKey: "IsDeleted",
          Operator: "ne",
          FilterValue: "1",
        },
      ],
      Topcount: 5000,
      Select: "*,OpportunityOwner/EMail,OpportunityOwner/Title",
      Expand: "OpportunityOwner",
      Orderby: "Modified",
      Orderbydecorasc: false,
    })
      .then(async (_opprtunity: any[]) => {
        let _tempOpporData: IOpportunityData[] = [];

        if (_opprtunity.length) {
          for (let i = 0; i < _opprtunity.length; i++) {
            let item = _opprtunity[i];
            let _tempContactNameChoice: IChoiceList[] = [];

            //  Contact Lookup
            if (item.ContactsId.length) {
              for (let j = 0; j < item.ContactsId.length; j++) {
                const contact = contactData.find(
                  (_e) => _e.value === item.ContactsId[j]
                );

                if (contact) {
                  _tempContactNameChoice.push({
                    value: contact.value,
                    label: contact.label,
                  });
                }
              }
            }

            _tempOpporData.push({
              ID: item.ID ? item.ID : null,
              OpportunityName: item.OpportunityName ? item.OpportunityName : "",
              OpportunityOwner: item.OpportunityOwner
                ? [
                    {
                      EMail: item.OpportunityOwner.EMail,
                      Name: item.OpportunityOwner.Title,
                    },
                  ]
                : [],
              EstimatedQuote: item.EstimatedQuote ? item.EstimatedQuote : 0,
              WinProbability: item.WinProbability ? item.WinProbability : "",
              Stage: item.Stage ? item.Stage : "",
              Contact: item.ContactsId ? _tempContactNameChoice : [],
              AdminWatchList: item.AdminWatchList ? item.AdminWatchList : false,
              InterventionNeeded: item.InterventionNeeded
                ? item.InterventionNeeded
                : false,
              Pipeline: Managers,
            });

            if (_opprtunity.length - 1 == i) {
              setMasterOpporData([..._tempOpporData]);
              if (
                dealNavigateValue.pipeLine == "PMPipeline" ||
                dealNavigateValue.pipeLine == "MyWatchlist"
              ) {
                GetOpporSplitData(
                  [..._tempOpporData],
                  _tempPipelineData,
                  kanbanOrderData,
                  dealNavigateValue.managerName.code
                    ? dealNavigateValue.managerName
                    : ConfigureationData.isAdmin
                    ? { code: "All", eMail: "All", name: "All" }
                    : {
                        code: currentDisplayName,
                        eMail: currentEmail,
                        name: currentDisplayName,
                      },
                  dealNavigateValue.pipeLine == "PMPipeline"
                    ? "PMPipeline"
                    : "MyWatchlist"
                );
              } else {
                if (ConfigureationData.isAdmin) {
                  GetSplitData(
                    [..._tempDealsData],
                    kanbanOrderData,
                    _tempPipelineData,
                    dealNavigateValue.pipeLineValue.code
                      ? dealNavigateValue.pipeLineValue
                      : selectedValue.Pipeline.code
                      ? selectedValue.Pipeline
                      : { name: "Default", code: "Default" }
                  );
                } else {
                  GetOpporSplitData(
                    [..._tempOpporData],
                    _tempPipelineData,
                    kanbanOrderData,
                    {
                      name: currentDisplayName,
                      code: currentDisplayName,
                      eMail: "",
                    },
                    "PMPipeline"
                  );
                }
              }
            }
          }
        } else {
          if (
            dealNavigateValue.pipeLine == "PMPipeline" ||
            dealNavigateValue.pipeLine == "MyWatchlist"
          ) {
            GetOpporSplitData(
              [..._tempOpporData],
              _tempPipelineData,
              kanbanOrderData,
              ConfigureationData.isAdmin
                ? { name: "All", code: "All", eMail: "" }
                : {
                    name: currentDisplayName,
                    code: currentDisplayName,
                    eMail: "",
                  },
              dealNavigateValue.pipeLine == "PMPipeline"
                ? "PMPipeline"
                : "MyWatchlist"
            );
          } else {
            if (ConfigureationData.isAdmin) {
              GetSplitData(
                [..._tempDealsData],
                kanbanOrderData,
                _tempPipelineData,
                dealNavigateValue.pipeLineValue.code
                  ? dealNavigateValue.pipeLineValue
                  : selectedValue.Pipeline.code
                  ? selectedValue.Pipeline
                  : { name: "Default", code: "Default" }
              );
            } else {
              GetOpporSplitData(
                [..._tempOpporData],
                _tempPipelineData,
                kanbanOrderData,
                {
                  name: currentDisplayName,
                  code: currentDisplayName,
                  eMail: "",
                },
                "PMPipeline"
              );
            }
          }
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Get Opportunity data get error");
      });
  };

  const GetSplitData = (
    Data: IDealsData[],
    KanbanOrderData: IDealsKanbanOrderData,
    PipeLineConfigData: IPipelineConfig[],
    Pipeline: IChoice
  ) => {
    let _emptyData: IDealsData = {
      Amount: "0",
      ClosingDate: "",
      Contact: [],
      DealName: "",
      DealOwner: [],
      DealOwnerId: null,
      ExpectedRevenue: "",
      ID: 0.1,
      Lost: "",
      Pipeline: "",
      Probability: "",
      Stage: "",
    };

    let _tempPipelines: IStagesData[] = [];
    let _tempStages: IStagesData;

    for (let _pipeline in KanbanOrderData) {
      let _pipelineStages = KanbanOrderData[_pipeline];

      if (Pipeline?.name == _pipeline) {
        for (let _stage in _pipelineStages) {
          const stageData = _pipelineStages[_stage];
          let stageDeals: IDealsData[] = [];

          const dealsInStage = Data.filter(
            (d) => d.Stage === _stage && d.Pipeline === _pipeline
          );

          if (dealsInStage.length) {
            dealsInStage.forEach((deal: IDealsData) => stageDeals.push(deal));

            // Calculate the total amount of ExpectedRevenue
            const totalAmount = stageDeals.reduce(
              (acc, deal) =>
                acc + (deal.ExpectedRevenue ? Number(deal.ExpectedRevenue) : 0),
              0
            );

            _tempStages = {
              Amount: totalAmount,
              Data: stageDeals.map((deal) => ({
                Amount: deal.Amount,
                ClosingDate: deal.ClosingDate,
                Contact: deal.Contact,
                DealName: deal.DealName,
                DealOwner: deal.DealOwner,
                DealOwnerId: deal.DealOwnerId,
                ExpectedRevenue: deal.ExpectedRevenue,
                ID: deal.ID,
                Lost: deal.Lost,
                Pipeline: deal.Pipeline,
                Probability: deal.Probability,
                Stage: deal.Stage,
                AdminWatchList: deal.AdminWatchList,
              })),
              Length: stageDeals.length,
              Title: _stage,
              Pipeline: _pipeline,
            };

            // Empty data push
            _tempStages.Data.push(_emptyData);
            _tempPipelines.push(_tempStages);
          } else if (stageData.Pipeline === Pipeline?.name) {
            _tempStages = {
              Amount: "0",
              Data: [_emptyData],
              Length: 0,
              Title: _stage,
              Pipeline: _pipeline,
            };

            _tempPipelines.push(_tempStages);
          }
        }
      }
    }

    // Find the stages order for the "Default" pipeline
    const defaultPipelineStages = PipeLineConfigData.find(
      (p) => p.Pipeline === Pipeline?.name
    )?.Stages;

    let _sortedPipelines: IStagesData[] = [];

    if (defaultPipelineStages) {
      // Create a new array manually ordered by stage order in defaultPipelineStages
      defaultPipelineStages.forEach((stage) => {
        const foundStage = _tempPipelines.find(
          (pipelineStage) => pipelineStage.Title.trim() === stage.trim()
        );

        if (foundStage) {
          _sortedPipelines.push(foundStage);
        } else {
          // If no data is found, push default empty data for the missing stage
          _sortedPipelines.push({
            Amount: "0",
            Data: [_emptyData],
            Length: 0,
            Title: stage,
            Pipeline: "",
          });
        }
      });
    }

    // Manually reorder deals within each stage according to kanbanOrderData
    _sortedPipelines.forEach((stageData) => {
      let reorderedDeals: IDealsData[] = [];

      // Loop through the OrderIds in the kanbanOrderData for this stage
      KanbanOrderData[Pipeline?.name][stageData.Title]?.OrderIds.forEach(
        (id) => {
          const foundDeal = stageData.Data.find((deal) => deal.ID === id);
          if (foundDeal) {
            reorderedDeals.push(foundDeal);
          }
        }
      );

      // If any deals were not found in OrderIds, append them at the end
      stageData.Data.forEach((deal) => {
        if (!reorderedDeals.includes(deal)) {
          reorderedDeals.push(deal);
        }
      });

      // Replace the old deal order with the reordered one
      stageData.Data = reorderedDeals;
    });

    setStages(_sortedPipelines);
    setMasterStages(_sortedPipelines);
    setMasterData([...Data]);
    setFilterKeys({ search: "" });
    setLoader(false);
  };

  const GetOpporSplitData = (
    OpporData: IOpportunityData[],
    _tempPipelineData: IPipelineConfig[],
    KanbanOrderData: IDealsKanbanOrderData,
    Name: IManagerChoices,
    _pipelineScreen: string
  ) => {
    const _emptyData: IOpportunityData = {
      AdminWatchList: false,
      Contact: [],
      EstimatedQuote: 0,
      ID: 0.1,
      InterventionNeeded: false,
      OpportunityName: "",
      OpportunityOwner: [],
      Stage: "",
      WinProbability: "",
      Pipeline: Managers,
    };

    let allStages = _tempPipelineData.filter((e) => e.Pipeline == Managers)[0]
      .Stages;

    let _tempPipelines: IOpporStagesData[] = [];
    let _tempStages: IOpporStagesData;

    for (let _pipeline in KanbanOrderData) {
      let _pipelineStages = KanbanOrderData[_pipeline];

      if (_pipeline == Managers) {
        for (let _stage in _pipelineStages) {
          const stageData = _pipelineStages[_stage];
          // let stageDeals: IOpportunityData[] = [];

          const dealsInStage = OpporData.filter((d) => {
            if (_pipelineScreen == "MyWatchlist") {
              return (
                d.Stage === _stage &&
                d.Pipeline === _pipeline &&
                d.AdminWatchList
              );
            } else {
              return d.Stage === _stage && d.Pipeline === _pipeline;
            }
          });

          if (dealsInStage.length) {
            // Filter deals for the current stage and selected name
            const stageDeals = dealsInStage.filter((deal) => {
              return (
                Name?.name === "All" ||
                deal.OpportunityOwner[0]?.Name === Name?.name
              );
            });

            // Calculate the total amount of EstimatedQuote
            const totalAmount = stageDeals.reduce(
              (acc, deal) =>
                acc + (deal.EstimatedQuote ? Number(deal.EstimatedQuote) : 0),
              0
            );

            // Build the temp stage object
            const _tempStages = {
              Amount: totalAmount,
              Data: [
                ...stageDeals.map((deal) => ({
                  AdminWatchList: deal.AdminWatchList,
                  Contact: deal.Contact,
                  EstimatedQuote: deal.EstimatedQuote,
                  ID: deal.ID,
                  InterventionNeeded: deal.InterventionNeeded,
                  OpportunityName: deal.OpportunityName,
                  OpportunityOwner: deal.OpportunityOwner,
                  Pipeline: deal.Pipeline,
                  Stage: deal.Stage,
                  WinProbability: deal.WinProbability,
                })),
                _emptyData,
              ],
              Length: stageDeals.length,
              Stage: _stage,
              Pipeline: _pipeline,
            };

            // Push the temp stage into the pipeline list
            _tempPipelines.push(_tempStages);
          } else if (stageData.Pipeline === Managers) {
            _tempStages = {
              Amount: 0,
              Data: [_emptyData],
              Length: 0,
              Stage: _stage,
              Pipeline: _pipeline,
            };

            _tempPipelines.push(_tempStages);
          }
        }
      }
    }

    let _sortedPipelines: IOpporStagesData[] = [];

    // Create a new array manually ordered by stage order in allStages
    allStages.forEach((stage) => {
      const foundStage = _tempPipelines.find(
        (pipelineStage) => pipelineStage.Stage.trim() === stage.trim()
      );

      if (foundStage) {
        _sortedPipelines.push(foundStage);
      } else {
        // If no data is found, push default empty data for the missing stage
        _sortedPipelines.push({
          Amount: 0,
          Data: [_emptyData],
          Length: 0,
          Stage: stage,
          Pipeline: "",
        });
      }
    });

    // Manually reorder deals within each stage according to kanbanOrderData
    _sortedPipelines.forEach((stageData) => {
      let reorderedDeals: IOpportunityData[] = [];

      // Loop through the OrderIds in the kanbanOrderData for this stage
      KanbanOrderData[Managers][stageData.Stage]?.OrderIds.forEach((id) => {
        const foundDeal = stageData.Data.find((deal) => deal.ID === id);
        if (foundDeal) {
          reorderedDeals.push(foundDeal);
        }
      });

      // If any deals were not found in OrderIds, append them at the end
      stageData.Data.forEach((deal) => {
        if (!reorderedDeals.includes(deal)) {
          reorderedDeals.push(deal);
        }
      });

      // Replace the old deal order with the reordered one
      stageData.Data = reorderedDeals;
    });

    if (ConfigureationData.isAdmin) {
      setManagersChoices((prev) => {
        const allOption: IManagerChoices = {
          name: "All",
          code: "All",
          eMail: "",
        };
        return prev.some((choice) => choice.name === "All")
          ? prev
          : [...prev, allOption];
      });
    }

    setMasterOpporData([...OpporData]);
    setMasterStagesOppor(_sortedPipelines);
    setStagesOppor(_sortedPipelines);
    setLoader(false);
  };

  // Dynamic Styles
  const NumberLengthStyles = (length: number) => {
    let _length: number = length.toString().length;
    return _length == 1
      ? "5px 10px"
      : _length == 2
      ? "5px 7px"
      : _length == 3
      ? "5px"
      : "5px 10px";
  };

  // Function to generate a dynamic color based on the stage index
  const generateDynamicColor = (index: number) => {
    const hue = (index * 137) % 360; // Example: 137 degree step for color variation
    return `hsl(${hue}, 70%, 50%)`; // Return a color in HSL format
  };

  const StagesColors = (Stage: string, stageIndex: number) => {
    let _Color: string = "";
    const predefinedColors = [
      "#00589A",
      "#872383",
      "#876B23",
      "#23872D",
      "#D24646",
    ];

    if (stageIndex < predefinedColors.length) {
      _Color = predefinedColors[stageIndex];
    } else {
      // For stages beyond the first 5, dynamically generate colors
      const dynamicColor = generateDynamicColor(stageIndex);
      _Color = dynamicColor;
    }

    return _Color;
  };

  // Format Number
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

  // Search Filter
  const filterOnChangeHandle = (
    key: string,
    value: any,
    stagesData: IStagesData[],
    stageOpporData: IOpporStagesData[]
  ): void => {
    filterFunction(stagesData, stageOpporData, { ...filterKeys, [key]: value });
  };

  const filterFunction = (
    stagesData: IStagesData[],
    stageOpporData: IOpporStagesData[],
    _filterKeys: IFilterKeys
  ) => {
    const searchValue = _filterKeys.search?.trim().toLowerCase() || "";

    if (pipelineScreen.Deals) {
      // Function to filter items based on the search value
      const filterItems = (items: IDealsData[]) => {
        return items.filter((item) => {
          const matchDealName =
            item.DealName?.toLowerCase().includes(searchValue);
          const matchDealOwner = item.DealOwner?.some((owner) =>
            owner.Name?.toLowerCase().includes(searchValue)
          );
          const matchRevenue = item.ExpectedRevenue?.toString()
            .toLowerCase()
            .includes(searchValue);
          const matchContact = item.Contact?.some((contact) =>
            contact.label?.toLowerCase().includes(searchValue)
          );

          return (
            matchDealName || matchDealOwner || matchRevenue || matchContact
          );
        });
      };

      // Function to calculate the total amount from filtered items
      const calculateAmount = (items: IDealsData[]) => {
        return items.reduce(
          (sum, item) =>
            sum + (item.ExpectedRevenue ? Number(item.ExpectedRevenue) : 0),
          0
        );
      };

      // Function to check if an item is an empty deal
      const isEmptyDeal = (deal: IDealsData) => {
        return (
          !deal.DealName &&
          !deal.DealOwner?.length &&
          !deal.ExpectedRevenue &&
          !deal.Probability
        );
      };

      // Function to add an empty item to the stage array
      const addEmptyItemIfNeeded = (arr: IDealsData[]) => {
        if (arr.length === 0 || !isEmptyDeal(arr[arr.length - 1])) {
          arr.push({
            ID: 0.1,
            Amount: "",
            DealName: "",
            DealOwner: [],
            DealOwnerId: null,
            ExpectedRevenue: "",
            Probability: "",
            Stage: "",
            ClosingDate: "",
            Contact: [],
            Lost: "",
            Pipeline: "",
          });
        }
      };

      let updatedStagesData = stagesData.map((stage) => {
        let filteredDeals = filterItems(stage.Data); // Filter deals based on search

        addEmptyItemIfNeeded(filteredDeals); // Add empty item if necessary

        return {
          ...stage,
          Data: filteredDeals,
          Amount: calculateAmount(filteredDeals),
          Length: pipelineScreen.MyWatchlist
            ? filteredDeals.length
            : filteredDeals.length - 1,
        };
      });

      setFilterKeys({ ..._filterKeys });
      setStages(updatedStagesData);
    } else if (pipelineScreen.PMPipeline || pipelineScreen.MyWatchlist) {
      // Function to filter items based on the search value
      const filterItems = (items: IOpportunityData[]) => {
        return items.filter((item) => {
          const matchOpporName =
            item.OpportunityName?.toLowerCase().includes(searchValue);
          const matchOpporOwner = item.OpportunityOwner?.some((owner) =>
            owner.Name?.toLowerCase().includes(searchValue)
          );
          const matchEstimatedQuote = item.EstimatedQuote?.toString()
            .toLowerCase()
            .includes(searchValue);
          const matchContact = item.Contact?.some((contact) =>
            contact.label?.toLowerCase().includes(searchValue)
          );

          return (
            matchOpporName ||
            matchOpporOwner ||
            matchEstimatedQuote ||
            matchContact
          );
        });
      };

      // Function to calculate the total amount from filtered items
      const calculateAmount = (items: IOpportunityData[]) => {
        return items.reduce(
          (sum, item) =>
            sum + (item.EstimatedQuote ? Number(item.EstimatedQuote) : 0),
          0
        );
      };

      // Function to check if an item is an empty deal
      const isEmptyDeal = (deal: IOpportunityData) => {
        return (
          !deal.OpportunityName &&
          !deal.OpportunityOwner?.length &&
          !deal.EstimatedQuote
        );
      };

      // Function to add an empty item to the stage array
      const addEmptyItemIfNeeded = (arr: IOpportunityData[]) => {
        if (arr.length === 0 || !isEmptyDeal(arr[arr.length - 1])) {
          arr.push({
            ID: 0.1,
            AdminWatchList: false,
            Contact: [],
            EstimatedQuote: 0,
            InterventionNeeded: false,
            OpportunityName: "",
            OpportunityOwner: [],
            Pipeline: "",
            Stage: "",
            WinProbability: "",
          });
        }
      };

      let updatedStagesOpporData = stageOpporData.map((stage) => {
        let filteredDeals = filterItems(stage.Data); // Filter deals based on search

        if (pipelineScreen.PMPipeline) {
          addEmptyItemIfNeeded(filteredDeals); // Add empty item if necessary
        }

        return {
          ...stage,
          Data: filteredDeals,
          Amount: calculateAmount(filteredDeals),
          Length: filteredDeals.length ? filteredDeals.length - 1 : 0,
        };
      });

      setFilterKeys({ ..._filterKeys });
      setStagesOppor(updatedStagesOpporData);
    }
  };

  // Drag and Drop Functions
  const onDragStart = (
    evt,
    stage: string,
    index: number,
    _pipeline: string
  ) => {
    let element = evt.currentTarget;
    element.classList.add("dragged");
    evt.dataTransfer.setData("text/plain", evt.currentTarget.id);
    evt.dataTransfer.effectAllowed = "move";
    DragStartStage = stage;
    DragStartIndex = index;
    DragPipeline = _pipeline;
  };

  const onDragEnd = (evt) => {
    evt.currentTarget.classList.remove("dragged");
  };

  const onDragEnter = (evt) => {
    evt.preventDefault();
    let element = evt.currentTarget;
    element.classList.add("dragged-over");
    evt.dataTransfer.dropEffect = "move";
  };

  const onDragLeave = (evt) => {
    let currentTarget = evt.currentTarget;
    let newTarget = evt.relatedTarget;
    if (
      newTarget &&
      (newTarget.parentNode === currentTarget || newTarget === currentTarget)
    )
      return;
    evt.preventDefault();
    let element = evt.currentTarget;
    element.classList.remove("dragged-over");
  };

  const onDragOver = (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };

  const onDrop = (evt, Stage, index, interventionNeeded: boolean) => {
    let draggedItemID = evt || "";
    let draggedItem = pipelineScreen.Deals
      ? masterData.find((_e) => _e.ID.toString() == draggedItemID)
      : pipelineScreen.PMPipeline &&
        masterOpporData.find((_e) => _e.ID.toString() == draggedItemID);

    if (!draggedItem) {
      setLoader(false);
      return;
    }

    if (!draggedItem) {
      setLoader(false);
      return;
    }

    if (DragStartIndex === index && DragStartStage === Stage) {
      setLoader(false);
      return;
    }

    const updatedStage =
      draggedItem.Stage === Stage ? draggedItem.Stage : Stage;

    setFilterKeys(_filterKeys);

    UpdateData(draggedItem, index, updatedStage, interventionNeeded);
  };

  const UpdateData = async (
    draggedItem: IDealsData | IOpportunityData,
    dropIndex: number,
    Stage: string,
    interventionNeeded: boolean
  ) => {
    const startOrderDataIds = dealsKanbanOrder[DragPipeline][DragStartStage]
      ? dealsKanbanOrder[DragPipeline][DragStartStage]
      : null;
    const dropOrderDataIds = dealsKanbanOrder[DragPipeline][Stage]
      ? dealsKanbanOrder[DragPipeline][Stage]
      : null;
    let _dropDealsData: IDealsData[] = [];
    let _dropOpporData: IOpportunityData[] = [];
    let _updateDealsData: IDealsData[] = [];
    let _updateOpporData: IOpportunityData[] = [];
    let _startDealsData: IDealsData[] = [];
    let _startOpporData: IOpportunityData[] = [];

    if (pipelineScreen.Deals) {
      _dropDealsData = masterData.map((_e) => {
        if (_e.ID === draggedItem.ID) {
          return {
            ..._e,
            Stage: Stage,
          };
        }
        return _e;
      });
      _updateDealsData = _dropDealsData;
      _startDealsData = _dropDealsData.filter(
        (_e) => _e.Stage === DragStartStage && _e.Pipeline == DragPipeline
      );
      _dropDealsData = _dropDealsData.filter(
        (_e) => _e.Stage === Stage && _e.Pipeline == DragPipeline
      );
      _startDealsData.sort(
        (a, b) =>
          (startOrderDataIds?.OrderIds?.indexOf(a.ID) ?? -1) -
          (startOrderDataIds?.OrderIds?.indexOf(b.ID) ?? -1)
      );
    } else if (pipelineScreen.PMPipeline) {
      _dropOpporData = masterOpporData.map((_e) => {
        if (_e.ID === draggedItem.ID) {
          return {
            ..._e,
            Stage: Stage,
          };
        }
        return _e;
      });
      _updateOpporData = _dropOpporData;
      _startOpporData = _dropOpporData.filter(
        (_e) => _e.Stage === DragStartStage && _e.Pipeline == DragPipeline
      );
      _dropOpporData = _dropOpporData.filter(
        (_e) => _e.Stage === Stage && _e.Pipeline == DragPipeline
      );
      _startOpporData.sort(
        (a, b) =>
          (startOrderDataIds?.OrderIds?.indexOf(a.ID) ?? -1) -
          (startOrderDataIds?.OrderIds?.indexOf(b.ID) ?? -1)
      );
    }

    if (Stage === DragStartStage) {
      let _sameBucket: number[] = dropOrderDataIds?.OrderIds || [];
      let element: number | null = null;

      if (DragStartIndex) {
        element = _sameBucket.splice(DragStartIndex, 1)[0];
      }

      if (element !== null) {
        _sameBucket.splice(dropIndex, 0, element);
      }

      if (pipelineScreen.Deals) {
        _dropDealsData.sort(
          (a, b) => _sameBucket.indexOf(a.ID) - _sameBucket.indexOf(b.ID)
        );
      } else if (pipelineScreen.PMPipeline) {
        _dropOpporData.sort(
          (a, b) => _sameBucket.indexOf(a.ID) - _sameBucket.indexOf(b.ID)
        );
      }
    } else {
      let _sameBuckets: number[] = dropOrderDataIds?.OrderIds || [];

      _sameBuckets.splice(dropIndex, 0, draggedItem.ID);

      if (pipelineScreen.Deals) {
        _dropDealsData.sort(
          (a, b) => _sameBuckets.indexOf(a.ID) - _sameBuckets.indexOf(b.ID)
        );
      } else if (pipelineScreen.PMPipeline) {
        _dropOpporData.sort(
          (a, b) => _sameBuckets.indexOf(a.ID) - _sameBuckets.indexOf(b.ID)
        );
      }
    }

    // ========================================================================
    let _startDealsDataIds = _startDealsData.length
      ? _startDealsData.map((_e) => _e.ID).toString()
      : _startOpporData.map((_e) => _e.ID).toString();
    let _dropDealsDataIds = _dropDealsData.length
      ? _dropDealsData.map((_e) => _e.ID).toString()
      : _dropOpporData.map((_e) => _e.ID).toString();

    const DealsKanbanOrderUpdateFunc = () => {
      SPServices.SPUpdateItem({
        ID: _startDealsOrderId,
        Listname: Config.ListNames.DealsKanbanOrder,
        RequestJSON: {
          IdOrder: _startDealsDataIds,
        },
      })
        .then(async (_res) => {
          await SPServices.SPUpdateItem({
            ID: _dropDealsOrderId,
            Listname: Config.ListNames.DealsKanbanOrder,
            RequestJSON: {
              IdOrder: _dropDealsDataIds,
            },
          })
            .then(async (_res) => {
              setDealsKanbanOrder(_kanbanOrderData);

              if (pipelineScreen.Deals) {
                GetSplitData(
                  _updateDealsData,
                  _kanbanOrderData,
                  configPipeLineConfig,
                  selectedValue.Pipeline
                );
              } else if (pipelineScreen.PMPipeline) {
                GetOpporSplitData(
                  _updateOpporData,
                  configPipeLineConfig,
                  _kanbanOrderData,
                  ConfigureationData.isAdmin
                    ? {
                        name: selectedValue.manager?.name,
                        code: selectedValue.manager?.name,
                        eMail: "",
                      }
                    : {
                        name: currentDisplayName,
                        code: currentDisplayName,
                        eMail: "",
                      },
                  "PMPipeline"
                );
              }
            })
            .catch((err: any) => {
              ErrorFunction(err, "Drop data update error");
            });
        })
        .catch((err: any) => {
          ErrorFunction(err, "Start data update error");
        });
    };

    // Start Id
    let _startDealsOrderId = dealsKanbanOrder[DragPipeline][DragStartStage].ID;

    // Drop Id
    let _dropDealsOrderId = dealsKanbanOrder[DragPipeline][Stage].ID;

    // Deals Kanban Order Data filter
    let _kanbanOrderData: IDealsKanbanOrderData = {
      ...dealsKanbanOrder, // Spread the existing kanban order data
      [DragPipeline]: {
        ...dealsKanbanOrder[DragPipeline], // Ensure existing stages in DragPipeline are retained
        [DragStartStage]: {
          ID: _startDealsOrderId,
          OrderIds: _startDealsDataIds.split(",").map(Number), // Convert the split string to an array of numbers
          Pipeline:
            dealsKanbanOrder[DragPipeline]?.[DragStartStage]?.Pipeline ||
            DragPipeline, // Use existing pipeline or fallback to DragPipeline
          Stage: DragStartStage, // Use DragStartStage as the stage value
        },
        [Stage]: {
          ID: _dropDealsOrderId,
          OrderIds: _dropDealsDataIds.split(",").map(Number), // Convert the split string to an array of numbers
          Pipeline:
            dealsKanbanOrder[DragPipeline]?.[Stage]?.Pipeline || DragPipeline, // Use existing pipeline or fallback to DragPipeline
          Stage: Stage, // Use Stage as the stage value
        },
      },
    };

    // Update Data in list
    if (pipelineScreen.Deals) {
      if (Stage === "Lost" && Stage !== draggedItem.Stage) {
        await SPServices.SPUpdateItem({
          ID: draggedItem.ID,
          Listname: Config.ListNames.CRMDeals,
          RequestJSON: {
            Lost: selectedValue.Lost?.name.trim(),
            Stage: Stage.trim(),
          },
        })
          .then(async (_res) => {
            setIsLostModal({
              isOpen: false,
              onDropData: {
                Index: null,
                ItemID: "",
                Stage: "",
              },
            });
            setSelectedValue({
              Lost: "",
              Pipeline: { name: "Default", code: "Default" },
              manager: {
                name: currentDisplayName,
                code: currentDisplayName,
                eMail: currentEmail,
              },
            });

            DealsKanbanOrderUpdateFunc();
          })
          .catch((err: any) => {
            ErrorFunction(err, "deals Lost choice add error");
          });
      } else {
        if (Stage === DragStartStage) {
          SPServices.SPUpdateItem({
            ID: _dropDealsOrderId,
            Listname: Config.ListNames.DealsKanbanOrder,
            RequestJSON: {
              IdOrder: _dropDealsDataIds,
            },
          })
            .then(async (_res) => {
              setDealsKanbanOrder(_kanbanOrderData);
              GetSplitData(
                _updateDealsData,
                _kanbanOrderData,
                configPipeLineConfig,
                selectedValue.Pipeline
              );
            })
            .catch((err: any) => {
              ErrorFunction(err, "Drop data update error");
            });
        } else {
          SPServices.SPUpdateItem({
            ID: draggedItem.ID,
            Listname: Config.ListNames.CRMDeals,
            RequestJSON: {
              Stage: Stage.trim(),
              Lost: "",
            },
          })
            .then(async (_res) => {
              DealsKanbanOrderUpdateFunc();
            })
            .catch((err) => {
              ErrorFunction(err, "Deals item update error");
            });
        }
      }
    } else if (pipelineScreen.PMPipeline) {
      if (Stage === "Lost" && Stage !== draggedItem.Stage) {
        await SPServices.SPUpdateItem({
          ID: draggedItem.ID,
          Listname: Config.ListNames.PMOpportunity,
          RequestJSON: {
            Stage: Stage,
            Lost: selectedValue.Lost.name,
          },
        })
          .then(async (_res) => {
            setIsLostModal({
              isOpen: false,
              onDropData: {
                Index: null,
                ItemID: "",
                Stage: "",
              },
            });
            setSelectedValue((pre) => ({
              ...pre,
              Lost: "",
            }));

            DealsKanbanOrderUpdateFunc();
          })
          .catch((err: any) => {
            ErrorFunction(err, "Opportunity Lost choice add error");
          });
      } else if (
        Stage === "Analysis/Figma/Estimation" &&
        Stage !== draggedItem.Stage
      ) {
        await SPServices.SPUpdateItem({
          ID: draggedItem.ID,
          Listname: Config.ListNames.PMOpportunity,
          RequestJSON: {
            Stage: Stage.trim(),
            InterventionNeeded: interventionNeeded,
            Lost: "",
          },
        })
          .then(async (_res) => {
            setIsLostModal({
              isOpen: false,
              onDropData: {
                Index: null,
                ItemID: "",
                Stage: "",
              },
            });
            DealsKanbanOrderUpdateFunc();
          })
          .catch((err: any) => {
            ErrorFunction(
              err,
              "Opportunity Analysis in intervention need true error"
            );
          });
      } else {
        if (Stage === DragStartStage) {
          SPServices.SPUpdateItem({
            ID: _dropDealsOrderId,
            Listname: Config.ListNames.DealsKanbanOrder,
            RequestJSON: {
              IdOrder: _dropDealsDataIds,
            },
          })
            .then(async (_res) => {
              setDealsKanbanOrder(_kanbanOrderData);
              GetOpporSplitData(
                _updateOpporData,
                configPipeLineConfig,
                _kanbanOrderData,
                ConfigureationData.isAdmin
                  ? {
                      name: selectedValue.manager?.name,
                      code: selectedValue.manager?.name,
                      eMail: "",
                    }
                  : {
                      name: currentDisplayName,
                      code: currentDisplayName,
                      eMail: currentEmail,
                    },
                "PMPipeline"
              );
            })
            .catch((err: any) => {
              ErrorFunction(err, "Drop data update error");
            });
        } else {
          SPServices.SPUpdateItem({
            ID: draggedItem.ID,
            Listname: Config.ListNames.PMOpportunity,
            RequestJSON: {
              Stage: Stage.trim(),
              InterventionNeeded: interventionNeeded,
              Lost: "",
            },
          })
            .then(async (_res) => {
              DealsKanbanOrderUpdateFunc();
            })
            .catch((err) => {
              ErrorFunction(err, "Opportunity item update error");
            });
        }
      }
    }
  };

  // Admin Watch List Data
  const AdminWatchListUpdateData = (data: IOpportunityData) => {
    SPServices.SPUpdateItem({
      ID: data.ID,
      Listname: Config.ListNames.PMOpportunity,
      RequestJSON: {
        AdminWatchList: true,
      },
    })
      .then((_update) => {
        setStagesOppor((prevStages) =>
          prevStages.map((stage) => ({
            ...stage,
            Data: stage.Data.map((deal) =>
              deal.ID === data.ID ? { ...deal, AdminWatchList: true } : deal
            ),
          }))
        );
        setMasterStagesOppor((prevStages) =>
          prevStages.map((stage) => ({
            ...stage,
            Data: stage.Data.map((deal) =>
              deal.ID === data.ID ? { ...deal, AdminWatchList: true } : deal
            ),
          }))
        );
        setMasterOpporData((pre) =>
          pre.map((item) =>
            item.ID == data.ID ? { ...item, AdminWatchList: true } : item
          )
        );
      })
      .catch((err: any) => {
        ErrorFunction(err, "Opportunity Admin Watches data update error");
      });
  };

  const AddPipeLineData = async () => {
    setPipeLineChoiceAdd((pre) => ({
      ...pre,
      isOpen: false,
    }));
    setErrorMessage("");

    await SPServices.SPAddItem({
      Listname: Config.ListNames.PipeLineConfig,
      RequestJSON: {
        Title: pipeLineChoiceAdd.pipeLineValue.trim(),
        Stages: pipeLineChoiceAdd.Stages.length
          ? pipeLineChoiceAdd.Stages.map((e) => e.label.trim()).toString()
          : "",
      },
    })
      .then(async (_pipelineAddData) => {
        if (pipeLineChoiceAdd.Stages.length) {
          for (let i = 0; i < pipeLineChoiceAdd.Stages.length; i++) {
            await SPServices.SPAddItem({
              Listname: Config.ListNames.DealsKanbanOrder,
              RequestJSON: {
                Title: pipeLineChoiceAdd.Stages[i].label.trim(),
                Pipeline: pipeLineChoiceAdd.pipeLineValue.trim(),
              },
            })
              .then((_res) => {})
              .catch((err: any) => {
                ErrorFunction(err, "Deals Kanban Order Stages data add error");
              });

            if (pipeLineChoiceAdd.Stages.length - 1 === i) {
              let allChoicesValue: IAllChoiceColumn = {
                ...ConfigureationData.allChoicesData,
                PipeLine: [
                  ...ConfigureationData.allChoicesData.PipeLine,
                  {
                    name: pipeLineChoiceAdd.pipeLineValue.trim(),
                    code: pipeLineChoiceAdd.pipeLineValue.trim(),
                  },
                ],
                Stage: [
                  ...ConfigureationData.allChoicesData.Stage,
                  ...pipeLineChoiceAdd.Stages.map((e) => ({
                    name: e.label,
                    code: e.value,
                  })),
                ],
              };

              dispatch(setMainAllChoicesData(allChoicesValue));
              init(true, allChoicesValue);
            }
          }
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Pipeline Config Add Data error");
      });
  };

  const ErrorFunction = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
  };

  const init = (
    choiceValueCheck: boolean,
    allChoicesValue: IAllChoiceColumn
  ) => {
    setLoader(true);
    GetAllChoices(choiceValueCheck, allChoicesValue);
  };

  useEffect(() => {
    init(false, ConfigureationData.allChoicesData);
  }, []);

  return loader ? (
    <Loading />
  ) : (
    <>
      <div className={styles.lcaBody}>
        <div className={styles.filterBarAndTableBorder}>
          <div className={styles.filterBar}>
            {ConfigureationData.isAdmin ? (
              <>
                <div
                  className={`${styles.dealsBtns} ${styles.dealsBtn}`}
                  style={{
                    backgroundColor: pipelineScreen.Deals ? "#00a99d" : "#fff",
                  }}
                >
                  <h2
                    style={{ color: pipelineScreen.Deals ? "#fff" : "#00a99d" }}
                    onClick={() => {
                      setPipelineScreen({
                        Deals: true,
                        MyWatchlist: false,
                        PMPipeline: false,
                      });
                      setFilterKeys({ search: "" });
                      setSelectedValue((pre) => ({
                        ...pre,
                        Pipeline: { name: "Default", code: "Default" },
                      }));
                      GetSplitData(
                        masterData,
                        dealsKanbanOrder,
                        configPipeLineConfig,
                        { name: "Default", code: "Default" }
                      );
                    }}
                  >
                    External
                  </h2>
                </div>
                <div
                  className={styles.dealsBtns}
                  style={{
                    backgroundColor: pipelineScreen.PMPipeline
                      ? "#00a99d"
                      : "#fff",
                    borderTopRightRadius: !ConfigureationData.isAdmin
                      ? "4px"
                      : "0px",
                    borderBottomRightRadius: !ConfigureationData.isAdmin
                      ? "4px"
                      : "0px",
                    borderLeft: ConfigureationData.isAdmin && "none",
                    borderRight: ConfigureationData.isAdmin && "none",
                  }}
                >
                  <h2
                    style={{
                      color: pipelineScreen.PMPipeline ? "#fff" : "#00a99d",
                    }}
                    onClick={async () => {
                      setSelectedValue((pre) => ({
                        ...pre,
                        Pipeline: { name: Managers, code: Managers },
                        manager: { name: "All", code: "All", eMail: "" },
                      }));
                      setFilterKeys({ search: "" });
                      setPipelineScreen({
                        Deals: false,
                        MyWatchlist: false,
                        PMPipeline: true,
                      });
                      GetOpporSplitData(
                        masterOpporData,
                        configPipeLineConfig,
                        dealsKanbanOrder,
                        ConfigureationData.isAdmin
                          ? { name: "All", code: "All", eMail: "" }
                          : {
                              name: currentDisplayName,
                              code: currentDisplayName,
                              eMail: currentEmail,
                            },
                        "PMPipeline"
                      );
                    }}
                  >
                    Internal
                  </h2>
                </div>
                <div
                  className={`${styles.dealsBtns} ${styles.myWatchBtn}`}
                  style={{
                    backgroundColor: pipelineScreen.MyWatchlist
                      ? "#00a99d"
                      : "#fff",
                  }}
                >
                  <h2
                    style={{
                      color: pipelineScreen.MyWatchlist ? "#fff" : "#00a99d",
                    }}
                    onClick={async () => {
                      setSelectedValue((pre) => ({
                        ...pre,
                        Pipeline: { name: Managers, code: Managers },
                        manager: { name: "All", code: "All", eMail: "" },
                      }));
                      setFilterKeys({ search: "" });
                      setPipelineScreen({
                        Deals: false,
                        MyWatchlist: true,
                        PMPipeline: false,
                      });
                      GetOpporSplitData(
                        masterOpporData,
                        configPipeLineConfig,
                        dealsKanbanOrder,
                        ConfigureationData.isAdmin
                          ? { name: "All", code: "All", eMail: "" }
                          : {
                              name: currentDisplayName,
                              code: currentDisplayName,
                              eMail: currentEmail,
                            },
                        "MyWatchlist"
                      );
                    }}
                  >
                    My Watchlist
                  </h2>
                </div>
              </>
            ) : (
              <h2 className={styles.pmScreen}>Internal</h2>
            )}
          </div>
          <div className={styles.filterBtns}>
            {pipelineScreen.Deals ? (
              <>
                <div className="all_search">
                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText
                      v-model="value1"
                      placeholder="Search"
                      value={filterKeys.search}
                      onChange={(
                        value?: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        filterOnChangeHandle(
                          "search",
                          value?.currentTarget?.value ?? "",
                          masterStages,
                          masterStagesOppor
                        );
                      }}
                    />
                  </IconField>
                </div>
                <div className="drpDown">
                  <Dropdown
                    value={selectedValue.Pipeline}
                    onChange={(e: DropdownChangeEvent) => {
                      setSelectedValue((pre) => ({
                        ...pre,
                        Pipeline: { name: e.value.name, code: e.value.code },
                      }));
                      setFilterKeys({ search: "" });
                      GetSplitData(
                        masterData,
                        dealsKanbanOrder,
                        configPipeLineConfig,
                        { name: e.value.name, code: e.value.code }
                      );
                    }}
                    options={allChoices.PipeLine}
                    optionLabel="name"
                    placeholder="Select a pipeline choice"
                    style={{ width: 130 }}
                  />
                </div>
                <div>
                  <PrimaryButton
                    className={styles.addBtn}
                    iconProps={{ iconName: "Add" }}
                    text="New Pipeline"
                    onClick={() => {
                      setPipeLineChoiceAdd({
                        isOpen: true,
                        pipeLineValue: "",
                        Stages: [
                          { label: "", value: "" },
                          { label: "", value: "" },
                        ],
                      });
                    }}
                  />
                </div>
                <div className={styles.btnAndText}>
                  <div
                    className={styles.btnBackGround}
                    onClick={() => {
                      const { Pipeline, manager } = selectedValue;

                      const stageName: IChoice =
                        Pipeline.code === "Default" ||
                        Pipeline.code === "Managers"
                          ? (configAllChoices.Stage.find(
                              (e) => e.code === Pipeline.code
                            ) as IChoice) ?? { name: "", code: "" }
                          : { name: "", code: "" };

                      const dealValue: IDealsPageNavigate = {
                        pipeLineValue: Pipeline,
                        pipeLine: "Deals",
                        managerName: manager,
                      };

                      const dealFormValue: IDealsFormPageNavigate = {
                        formType: "DealAddForm",
                        pipeLine: Pipeline,
                        dealFormData: _dealEmptyData,
                        id: 0,
                        stage: stageName,
                      };

                      dispatch(setDealFormData(dealFormValue));
                      dispatch(setDealData(dealValue));
                      props.PageNavigation("AddDeal");
                    }}
                  >
                    <img
                      src={PlusImage}
                      alt="Add new deal"
                      width={14}
                      height={14}
                      style={{ marginRight: 4 }}
                    />
                    New Deal
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="all_search">
                  <IconField iconPosition="left">
                    <InputIcon className="pi pi-search"> </InputIcon>
                    <InputText
                      v-model="value1"
                      placeholder="Search"
                      value={filterKeys.search}
                      onChange={(
                        value?: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        filterOnChangeHandle(
                          "search",
                          value?.currentTarget?.value,
                          masterStages,
                          masterStagesOppor
                        );
                      }}
                    />
                  </IconField>
                </div>
                {ConfigureationData.isAdmin && (
                  <div className="drpDown">
                    <Dropdown
                      value={selectedValue.manager}
                      onChange={(e: DropdownChangeEvent) => {
                        setFilterKeys({ search: "" });
                        setSelectedValue((pre) => ({
                          ...pre,
                          manager: {
                            name: e.value.name,
                            code: e.value.code,
                            eMail: e.value.eMail,
                          },
                        }));

                        let _name: string = managersChoices.filter(
                          (_e) => _e.name == e.value.name
                        )[0].name;

                        GetOpporSplitData(
                          masterOpporData,
                          configPipeLineConfig,
                          dealsKanbanOrder,
                          { name: _name, code: _name, eMail: "" },
                          pipelineScreen.PMPipeline
                            ? "PMPipeline"
                            : "MyWatchlist"
                        );
                      }}
                      options={managersChoices}
                      optionLabel="name"
                      placeholder="Select a manager"
                      style={{ width: 130 }}
                    />
                  </div>
                )}
                {pipelineScreen.PMPipeline && (
                  <div className={styles.btnAndText}>
                    <div
                      className={styles.btnBackGround}
                      onClick={() => {
                        const { Pipeline } = selectedValue;

                        const stageName =
                          configAllChoices.Stage.find(
                            (e) => e.code === Pipeline.code
                          )?.name || "";

                        let dealValue: IDealsPageNavigate = {
                          pipeLineValue: selectedValue.Pipeline,
                          pipeLine: "PMPipeline",
                          managerName: selectedValue.manager,
                        };
                        let dealOpportunityValue: IOpportunityFormPageNavigate =
                          {
                            formType: "DealPMAddForm",
                            formShow: configDefaults.formShowEmptyValue,
                            id: 0,
                            opportunityFormData: _opportunityEmptyData,
                            pipeLineValue: configDefaults.choiceEmptyValue,
                            stage: stageName,
                          };

                        dispatch(setOpportunityFormData(dealOpportunityValue));
                        dispatch(setDealData(dealValue));
                        props.PageNavigation("AddOpportunity");
                      }}
                    >
                      <img
                        src={PlusImage}
                        alt="no image"
                        style={{ width: "14px", height: "14px" }}
                      />
                      New Deal
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {pipelineScreen.Deals ? (
          <div className={`${styles.dealContainer} ${styles.borderContainer}`}>
            {stages.length
              ? stages.map((item, i) => {
                  return (
                    <div
                      className={`${styles.bucket} ${styles.smallBox}`}
                      key={i}
                    >
                      <section>
                        <div className={styles.dealSingleContainer}>
                          <div className={styles.dragColumn}>
                            <div className={styles.dragRow}>
                              <div
                                className={styles.dragHead}
                                style={{
                                  borderTopColor: StagesColors(item.Title, i),
                                }}
                              >
                                <div className={styles.dragHeadTitle}>
                                  <h3
                                    className={styles.dragTitle}
                                    title={item.Title}
                                  >
                                    {item.Title}
                                  </h3>
                                  <div
                                    title={item.Length.toString()}
                                    className={styles.dragTotalCount}
                                    style={{
                                      padding: NumberLengthStyles(item.Length),
                                      backgroundColor: StagesColors(
                                        item.Title,
                                        i
                                      ),
                                      border: `1px solid ${StagesColors(
                                        item.Title,
                                        i
                                      )}`,
                                    }}
                                  >
                                    <p
                                      className={`${styles.dragCountPara} ${
                                        item.Length.toString().length > 3 &&
                                        styles.dragTotalCountellipsis
                                      }`}
                                    >
                                      {item.Length}
                                    </p>
                                  </div>
                                </div>
                                <p
                                  className={styles.dragTotalAmount}
                                  title={`₹ ${
                                    item.Amount
                                      ? FormatNumber(item.Amount.toString())
                                      : "0"
                                  }.00`}
                                >
                                  ₹{" "}
                                  {item.Amount
                                    ? FormatNumber(item.Amount.toString())
                                    : "0"}
                                  .00
                                </p>
                              </div>
                              <div className={styles.cardOverflow}>
                                {item?.Data?.map(
                                  (task: IDealsData, index: number) => {
                                    return task.ID != 0.1 ? (
                                      <div
                                        className={styles.card}
                                        key={index}
                                        id={task.ID ? task.ID.toString() : ""}
                                        draggable
                                        onDragStart={(e) =>
                                          onDragStart(
                                            e,
                                            item.Title,
                                            index,
                                            item.Pipeline
                                          )
                                        }
                                        onDragEnd={onDragEnd}
                                        onDragLeave={onDragLeave}
                                        onDragEnter={onDragEnter}
                                        onDragOver={onDragOver}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.remove(
                                            "dragged-over"
                                          );
                                          const draggedItemID =
                                            e.dataTransfer?.getData(
                                              "text/plain"
                                            );

                                          if (
                                            DragStartStage !== "Lost" &&
                                            item.Title == "Lost"
                                          ) {
                                            setIsLostModal({
                                              isOpen: true,
                                              onDropData: {
                                                ItemID: draggedItemID,
                                                Stage: "Lost",
                                                Index: index,
                                              },
                                            });
                                          } else if (
                                            DragPipeline == Managers &&
                                            item.Title.trim() ==
                                              "Analysis/Figma/Estimation" &&
                                            DragStartStage !==
                                              "Analysis/Figma/Estimation"
                                          ) {
                                            setIsManagersAnalysisModal({
                                              isOpen: true,
                                              onDropData: {
                                                IfNeeded: false,
                                                Index: index,
                                                ItemID: draggedItemID,
                                                Stage: item.Title.trim(),
                                              },
                                            });
                                          } else {
                                            onDrop(
                                              draggedItemID,
                                              item.Title.trim(),
                                              index,
                                              false
                                            );
                                          }
                                        }}
                                      >
                                        <div className={styles.cardTop}>
                                          <h3
                                            className={styles.cardTitle}
                                            title={task.DealName}
                                            onClick={() => {
                                              let dealValue: IDealsPageNavigate =
                                                {
                                                  pipeLineValue:
                                                    selectedValue.Pipeline,
                                                  pipeLine: "Deals",
                                                  managerName:
                                                    selectedValue.manager,
                                                };

                                              let dealFormValue: IDealsFormPageNavigate =
                                                {
                                                  id: task.ID,
                                                  formType: "DealEditForm",
                                                  pipeLine:
                                                    selectedValue.Pipeline,
                                                  dealFormData: _dealEmptyData,
                                                  stage:
                                                    configDefaults.choiceEmptyValue,
                                                };

                                              dispatch(setDealData(dealValue));
                                              dispatch(
                                                setDealFormData(dealFormValue)
                                              );
                                              props.PageNavigation("AddDeal");
                                            }}
                                          >
                                            {task.DealName}
                                          </h3>
                                          <p
                                            className={styles.cardDate}
                                            title={task.Contact.map(
                                              (_e) => _e.label
                                            ).toString()}
                                          >
                                            {task.Contact.map(
                                              (_e) => _e.label
                                            ).toString()}
                                          </p>
                                          <p className={styles.cardAmount}>
                                            ₹{" "}
                                            {FormatNumber(task.ExpectedRevenue)}
                                          </p>
                                        </div>
                                        <div className={styles.cardBottom}>
                                          <div className={styles.userImgName}>
                                            <img
                                              src={`/_layouts/15/userphoto.aspx?size=M&accountname=${
                                                task.DealOwner[0]?.EMail
                                                  ? task.DealOwner[0]?.EMail
                                                  : ""
                                              }`}
                                              alt="wait"
                                              style={{
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                objectFit: "fill",
                                              }}
                                            ></img>
                                            <span
                                              className={styles.cardOwnerName}
                                              title={task.DealOwner[0]?.Name}
                                            >
                                              {task.DealOwner[0]?.Name}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        key={index}
                                        className={styles.emptyDropHere}
                                        onDragLeave={onDragLeave}
                                        onDragEnter={onDragEnter}
                                        onDragEnd={onDragEnd}
                                        onDragOver={onDragOver}
                                        onDrop={(e) => {
                                          e.preventDefault();
                                          e.currentTarget.classList.remove(
                                            "dragged-over"
                                          );
                                          const draggedItemID =
                                            e.dataTransfer?.getData(
                                              "text/plain"
                                            );

                                          if (
                                            DragStartStage !== "Lost" &&
                                            item.Title == "Lost"
                                          ) {
                                            setIsLostModal({
                                              isOpen: true,
                                              onDropData: {
                                                ItemID: draggedItemID,
                                                Stage: "Lost",
                                                Index: index,
                                              },
                                            });
                                          } else if (
                                            DragPipeline == Managers &&
                                            item.Title.trim() ==
                                              "Analysis/Figma/Estimation" &&
                                            DragStartStage !==
                                              "Analysis/Figma/Estimation"
                                          ) {
                                            setIsManagersAnalysisModal({
                                              isOpen: true,
                                              onDropData: {
                                                IfNeeded: false,
                                                Index: index,
                                                ItemID: draggedItemID,
                                                Stage: item.Title.trim(),
                                              },
                                            });
                                          } else {
                                            onDrop(
                                              draggedItemID,
                                              item.Title.trim(),
                                              index,
                                              false
                                            );
                                          }
                                        }}
                                      >
                                        Drop Here
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      <div className={styles.stageBtnAdd}>
                        <PrimaryButton
                          onClick={() => {
                            let dealValue: IDealsPageNavigate = {
                              pipeLineValue: selectedValue.Pipeline,
                              pipeLine: "Deals",
                              managerName: selectedValue.manager,
                            };

                            let dealFormValue: IDealsFormPageNavigate = {
                              formType: "DealAddForm",
                              pipeLine: {
                                code: item.Pipeline,
                                name: item.Pipeline,
                              },
                              stage: {
                                name: item.Title,
                                code: item.Title,
                              },
                              id: 0,
                              dealFormData: _dealEmptyData,
                            };

                            dispatch(setDealFormData(dealFormValue));
                            dispatch(setDealData(dealValue));
                            props.PageNavigation("AddDeal");
                          }}
                        >
                          New Deal
                        </PrimaryButton>
                      </div>
                    </div>
                  );
                })
              : ""}
          </div>
        ) : (
          <div className={`${styles.dealContainer} ${styles.borderContainer}`}>
            {stagesOppor?.length
              ? stagesOppor.map((item: IOpporStagesData, i: number) => {
                  return (
                    <div
                      className={`${styles.bucket} ${styles.smallBox}`}
                      key={i}
                    >
                      <section>
                        <div className={styles.dealSingleContainer}>
                          <div className={styles.dragColumn}>
                            <div className={styles.dragRow}>
                              <div
                                className={styles.dragHead}
                                style={{
                                  borderTopColor: StagesColors(item.Stage, i),
                                }}
                              >
                                <div className={styles.dragHeadTitle}>
                                  <h3
                                    className={styles.dragTitle}
                                    title={item.Stage}
                                  >
                                    {item.Stage}
                                  </h3>
                                  <div
                                    title={item.Length.toString()}
                                    className={styles.dragTotalCount}
                                    style={{
                                      padding: NumberLengthStyles(item.Length),
                                      backgroundColor: StagesColors(
                                        item.Stage,
                                        i
                                      ),
                                      border: `1px solid ${StagesColors(
                                        item.Stage,
                                        i
                                      )}`,
                                    }}
                                  >
                                    <p
                                      className={`${styles.dragCountPara} ${
                                        item.Length.toString().length > 3 &&
                                        styles.dragTotalCountellipsis
                                      }`}
                                    >
                                      {item.Length}
                                    </p>
                                  </div>
                                </div>
                                <p
                                  className={styles.dragTotalAmount}
                                  title={`₹ ${
                                    item.Amount
                                      ? FormatNumber(item.Amount.toString())
                                      : "0"
                                  }.00`}
                                >
                                  ₹{" "}
                                  {item.Amount
                                    ? FormatNumber(item.Amount.toString())
                                    : "0"}
                                  .00
                                </p>
                              </div>
                              <div className={styles.cardOverflow}>
                                {item?.Data?.length
                                  ? item?.Data?.map(
                                      (
                                        task: IOpportunityData,
                                        index: number
                                      ) => {
                                        return task.ID != 0.1 ? (
                                          <div
                                            className={styles.card}
                                            style={{
                                              cursor: pipelineScreen?.PMPipeline
                                                ? "move"
                                                : "default",
                                            }}
                                            key={task.ID}
                                            id={
                                              task.ID ? task.ID.toString() : ""
                                            }
                                            draggable
                                            onDragStart={(e) => {
                                              pipelineScreen?.PMPipeline &&
                                                onDragStart(
                                                  e,
                                                  item.Stage,
                                                  index,
                                                  Managers
                                                );
                                            }}
                                            onDragEnd={
                                              pipelineScreen?.PMPipeline
                                                ? onDragEnd
                                                : undefined
                                            }
                                            onDragLeave={
                                              pipelineScreen?.PMPipeline
                                                ? onDragLeave
                                                : undefined
                                            }
                                            onDragEnter={
                                              pipelineScreen?.PMPipeline
                                                ? onDragEnter
                                                : undefined
                                            }
                                            onDragOver={
                                              pipelineScreen?.PMPipeline
                                                ? onDragOver
                                                : undefined
                                            }
                                            onDrop={(e) => {
                                              if (pipelineScreen?.PMPipeline) {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove(
                                                  "dragged-over"
                                                );
                                                const draggedItemID =
                                                  e.dataTransfer?.getData(
                                                    "text/plain"
                                                  );

                                                if (
                                                  DragStartStage !== "Lost" &&
                                                  item.Stage == "Lost"
                                                ) {
                                                  setIsLostModal({
                                                    isOpen: true,
                                                    onDropData: {
                                                      ItemID: draggedItemID,
                                                      Stage: "Lost",
                                                      Index: index,
                                                    },
                                                  });
                                                } else if (
                                                  DragPipeline == Managers &&
                                                  item.Stage.trim() ==
                                                    "Analysis/Figma/Estimation" &&
                                                  DragStartStage !==
                                                    "Analysis/Figma/Estimation"
                                                ) {
                                                  setIsManagersAnalysisModal({
                                                    isOpen: true,
                                                    onDropData: {
                                                      IfNeeded: false,
                                                      Index: index,
                                                      ItemID: draggedItemID,
                                                      Stage: item.Stage.trim(),
                                                    },
                                                  });
                                                } else {
                                                  onDrop(
                                                    draggedItemID,
                                                    item.Stage.trim(),
                                                    index,
                                                    false
                                                  );
                                                }
                                              }
                                            }}
                                          >
                                            <div className={styles.cardTop}>
                                              <h3
                                                className={styles.cardTitle}
                                                title={task.OpportunityName}
                                                onClick={() => {
                                                  let dealValue: IDealsPageNavigate =
                                                    {
                                                      pipeLineValue:
                                                        selectedValue.Pipeline,
                                                      pipeLine:
                                                        pipelineScreen?.PMPipeline
                                                          ? "PMPipeline"
                                                          : pipelineScreen?.MyWatchlist
                                                          ? "MyWatchlist"
                                                          : "",
                                                      managerName:
                                                        selectedValue.manager,
                                                    };

                                                  let opprtunityFormValue: IOpportunityFormPageNavigate =
                                                    {
                                                      id: task.ID,
                                                      formType:
                                                        pipelineScreen?.PMPipeline
                                                          ? "DealPMEditForm"
                                                          : "DealPMViewForm",
                                                      formShow:
                                                        configDefaults.formShowEmptyValue,
                                                      opportunityFormData:
                                                        _opportunityEmptyData,
                                                      pipeLineValue:
                                                        configDefaults.choiceEmptyValue,
                                                      stage: "",
                                                    };

                                                  dispatch(
                                                    setOpportunityFormData(
                                                      opprtunityFormValue
                                                    )
                                                  );
                                                  dispatch(
                                                    setDealData(dealValue)
                                                  );
                                                  props.PageNavigation(
                                                    "AddOpportunity"
                                                  );
                                                }}
                                              >
                                                {task.OpportunityName}
                                              </h3>
                                              <p
                                                className={styles.cardDate}
                                                title={task.Contact.map(
                                                  (_e) => _e.label
                                                ).toString()}
                                              >
                                                {task.Contact.map(
                                                  (_e) => _e.label
                                                ).toString()}
                                              </p>
                                              <p className={styles.cardAmount}>
                                                ₹{" "}
                                                {FormatNumber(
                                                  task.EstimatedQuote.toString()
                                                )}
                                              </p>
                                            </div>
                                            <div
                                              className={styles.cardBottom}
                                              style={{
                                                justifyContent:
                                                  pipelineScreen?.PMPipeline &&
                                                  ConfigureationData.isAdmin
                                                    ? "space-between"
                                                    : "flex-end",
                                              }}
                                            >
                                              {pipelineScreen?.PMPipeline &&
                                                ConfigureationData.isAdmin &&
                                                (task.AdminWatchList ? (
                                                  <p
                                                    className={
                                                      styles.adminAddedText
                                                    }
                                                    title="Added"
                                                  >
                                                    Added
                                                  </p>
                                                ) : (
                                                  <div
                                                    className={styles.watchBtn}
                                                    title="Added to watchlist"
                                                    onClick={() =>
                                                      AdminWatchListUpdateData?.(
                                                        task
                                                      )
                                                    }
                                                  >
                                                    <Icon iconName="Add" />
                                                  </div>
                                                ))}
                                              <div
                                                className={styles.userImgName}
                                              >
                                                <img
                                                  src={`/_layouts/15/userphoto.aspx?size=M&accountname=${
                                                    task.OpportunityOwner[0]
                                                      ?.EMail || ""
                                                  }`}
                                                  alt="wait"
                                                  style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    borderRadius: "50%",
                                                    objectFit: "fill",
                                                  }}
                                                ></img>
                                                <span
                                                  className={
                                                    styles.cardOwnerName
                                                  }
                                                  title={
                                                    task.OpportunityOwner[0]
                                                      ?.Name
                                                  }
                                                >
                                                  {
                                                    task.OpportunityOwner[0]
                                                      ?.Name
                                                  }
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ) : pipelineScreen?.PMPipeline ? (
                                          <div
                                            key={index}
                                            className={styles.emptyDropHere}
                                            onDragLeave={onDragLeave}
                                            onDragEnter={onDragEnter}
                                            onDragEnd={onDragEnd}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => {
                                              e.preventDefault();
                                              e.currentTarget.classList.remove(
                                                "dragged-over"
                                              );
                                              const draggedItemID =
                                                e.dataTransfer?.getData(
                                                  "text/plain"
                                                );

                                              if (
                                                DragStartStage !== "Lost" &&
                                                item.Stage == "Lost"
                                              ) {
                                                setIsLostModal({
                                                  isOpen: true,
                                                  onDropData: {
                                                    ItemID: draggedItemID,
                                                    Stage: "Lost",
                                                    Index: index,
                                                  },
                                                });
                                              } else if (
                                                (DragPipeline || "") ===
                                                  (Managers || "") &&
                                                item?.Stage?.trim() ===
                                                  "Analysis/Figma/Estimation" &&
                                                (DragStartStage || "") !==
                                                  "Analysis/Figma/Estimation"
                                              ) {
                                                setIsManagersAnalysisModal({
                                                  isOpen: true,
                                                  onDropData: {
                                                    IfNeeded: false,
                                                    Index: index,
                                                    ItemID: draggedItemID,
                                                    Stage: item.Stage.trim(),
                                                  },
                                                });
                                              } else {
                                                onDrop(
                                                  draggedItemID,
                                                  item.Stage.trim(),
                                                  index,
                                                  false
                                                );
                                              }
                                            }}
                                          >
                                            Drop Here
                                          </div>
                                        ) : (
                                          ""
                                        );
                                      }
                                    )
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      {pipelineScreen?.PMPipeline && (
                        <div className={styles.stageBtnAdd}>
                          <PrimaryButton
                            onClick={() => {
                              let dealValue: IDealsPageNavigate = {
                                pipeLineValue: selectedValue.Pipeline,
                                pipeLine: "PMPipeline",
                                managerName: selectedValue.manager,
                              };

                              let opportunityValue: IOpportunityFormPageNavigate =
                                {
                                  formType: "DealPMAddForm",
                                  stage: item.Stage,
                                  id: 0,
                                  formShow: configDefaults.formShowEmptyValue,
                                  opportunityFormData: _opportunityEmptyData,
                                  pipeLineValue:
                                    configDefaults.choiceEmptyValue,
                                };

                              dispatch(
                                setOpportunityFormData(opportunityValue)
                              );
                              dispatch(setDealData(dealValue));
                              props.PageNavigation("AddOpportunity");
                            }}
                          >
                            New Deal
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                  );
                })
              : ""}
          </div>
        )}
      </div>

      {/* Lost Modal */}
      <LostChoiceReason
        isLostModal={isLostModal}
        setIsLostModal={setIsLostModal}
        allChoices={allChoices}
        currentDisplayName={currentDisplayName}
        currentEmail={currentEmail}
        setSelectedValue={setSelectedValue}
        selectedValue={selectedValue}
        onDrop={onDrop}
      />

      {/* Managers Analysis Modal */}
      <ManagersAnalysis
        isManagersAnalysisModal={isManagersAnalysisModal}
        setIsManagersAnalysisModal={setIsManagersAnalysisModal}
        onDrop={onDrop}
      />

      {/* Pipe Line & Stages Add Model */}
      <AddPipeLine
        pipeLineChoiceAdd={pipeLineChoiceAdd}
        setPipeLineChoiceAdd={setPipeLineChoiceAdd}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        configAllChoices={configAllChoices}
        setLoader={setLoader}
        AddPipeLineData={AddPipeLineData}
      />
    </>
  );
};

export default Deals;
