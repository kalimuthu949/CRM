/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable dot-notation */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */

import moment from "moment";
import {
  IAllChoiceColumn,
  IChoice,
  IDealsFormData,
  IDealsFormPageNavigate,
  IFormShow,
} from "../Redux/ConfigPageInterfaces";
import { setMainAllChoicesData } from "../Redux/ConfigureationData";
import SPServices from "../../../../ExternalRef/CommonServices/SPServices";
import { Config } from "../../../../ExternalRef/CommonServices/Config";

// Interfaces
interface IResponse {
  DealOwnerId: number | null;
  DealName: string;
  AccountId: number | null;
  AccountType: string;
  LeadSource: string;
  Industry: string;
  Location: string;
  Amount: number;
  ClosingDate: any;
  Stage: string;
  Probability: string;
  ExpectedRevenue: number;
  CampaignSource: string;
  Description: string;
  PipeLine: string;
  Country: string;
  Week: number;
  Year: number;
  Lost: string;
  Platform: {
    results: string[];
  };
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

export const DataStore = async (
  savePage: string,
  selectedData: IDealsFormData,
  configAllChoices: IAllChoiceColumn,
  dispatch: any,
  formShow: IFormShow,
  ErrorFunction: (err: any, message: string) => void,
  setLoader: (value: boolean) => void,
  // allChoices: IAllChoiceColumn,
  setAllChoices: (value: IAllChoiceColumn) => void,
  props: IProps,
  setSelectedData: (value: IDealsFormData) => void,
  dealFormNavigateValue: IDealsFormPageNavigate,
  _dealEmptyData: IDealsFormData
) => {
  const json: IResponse = {
    DealOwnerId: selectedData.DealOwnerId,
    AccountId: selectedData.Account ? selectedData.Account.code : null,
    DealName: selectedData.DealName,
    Industry: selectedData.Industry.trim(),
    AccountType: selectedData.AccountType.trim(),
    Amount: selectedData.Amount
      ? typeof selectedData.Amount === "number"
        ? selectedData.Amount
        : Number(selectedData.Amount.replace(/,/g, ""))
      : 0,
    CampaignSource: selectedData.CampaignSource.trim(),
    ClosingDate: selectedData.ClosingDate
      ? moment(selectedData.ClosingDate).format("MM/DD/YYYY")
      : null,
    ExpectedRevenue: selectedData.ExpectedRevenue
      ? Number(selectedData.ExpectedRevenue)
      : 0,
    LeadSource: selectedData.LeadSource.trim(),
    Location: selectedData.Location,
    PipeLine: configAllChoices.PipeLine.filter(
      (pipeline) => pipeline.name.trim() == selectedData.PipeLine.trim()
    ).length
      ? configAllChoices.PipeLine.filter(
          (pipeline) => pipeline.name.trim() == selectedData.PipeLine.trim()
        )[0].name.trim()
      : "",
    Probability: selectedData.Probability.replace("%", ""),
    Stage: configAllChoices.Stage.filter(
      (stage) => stage.name.trim() == selectedData.Stage?.name.trim()
    ).length
      ? configAllChoices.Stage.filter(
          (stage) => stage.name.trim() == selectedData.Stage?.name.trim()
        )[0].name.trim()
      : "",
    Description: selectedData.Description,
    Country: selectedData.Country.trim(),
    Week: moment().week(),
    Year: moment().year(),
    Lost: selectedData.Lost?.name
      ? selectedData.OldData.Stage?.name === "Lost" &&
        selectedData.Stage?.name !== "Lost"
        ? ""
        : selectedData.Lost?.name
      : "",
    Platform: {
      results: selectedData.Platform.map((e) => e.name),
    },
  };

  // dispatch(setMainAllChoicesData(configAllChoices));

  if (selectedData.Contact.length) {
    json["ContactsId"] = {
      results: selectedData.Contact.map((e: IChoice) => e.code),
    };
  } else {
    json["ContactsId"] = {
      results: [],
    };
  }

  const MovePagenation = async () => {
    setLoader(true);

    // Add unique choice based on 'code' field
    const addUniqueChoice = (choices: any[], selectedChoice: any) => {
      return selectedChoice?.code &&
        !choices.some((choice) => choice.code === selectedChoice.code)
        ? [...choices, selectedChoice]
        : choices;
    };

    // Account
    const _tempAccount = selectedData.Account
      ? addUniqueChoice(configAllChoices.Account, {
          name: selectedData.Account.name,
          code: selectedData.Account.code,
        })
      : configAllChoices.Account;

    // AccountType
    const _tempAccountType = selectedData.AccountType
      ? addUniqueChoice(configAllChoices.AccountType, {
          name: selectedData.AccountType,
          code: selectedData.AccountType,
        })
      : configAllChoices.AccountType;

    // LeadSource
    const _tempLeadSource = selectedData.LeadSource
      ? addUniqueChoice(configAllChoices.LeadSource, {
          name: selectedData.LeadSource,
          code: selectedData.LeadSource,
        })
      : configAllChoices.LeadSource;

    // Platform (handle array of objects)
    let _tempPlatform = [...configAllChoices.Platform];
    (selectedData.Platform || []).forEach((platform) => {
      if (
        platform?.code &&
        !_tempPlatform.some((choice) => choice.code === platform.code)
      ) {
        _tempPlatform.push({
          name: platform.name,
          code: platform.code,
        });
      }
    });

    // Industry
    const _tempIndustry = selectedData.Industry
      ? addUniqueChoice(configAllChoices.Industry, {
          name: selectedData.Industry,
          code: selectedData.Industry,
        })
      : configAllChoices.Industry;

    // CampaignSource
    const _tempCampaignSource = selectedData.CampaignSource
      ? addUniqueChoice(configAllChoices.CampaignSource, {
          name: selectedData.CampaignSource,
          code: selectedData.CampaignSource,
        })
      : configAllChoices.CampaignSource;

    // Compose final choices
    const allChoice: IAllChoiceColumn = {
      ...configAllChoices,
      Account: _tempAccount,
      AccountType: _tempAccountType,
      LeadSource: _tempLeadSource,
      Platform: _tempPlatform,
      Industry: _tempIndustry,
      CampaignSource: _tempCampaignSource,
      Stage: configAllChoices.Stage.filter((e) => e.code === "Default"),
    };

    setAllChoices(allChoice);

    dispatch(setMainAllChoicesData(allChoice));

    setSelectedData({
      ..._dealEmptyData,
      PipeLine: dealFormNavigateValue.pipeLine.name,
      Stage: dealFormNavigateValue.stage
        ? dealFormNavigateValue.stage
        : selectedData?.Stage,
    });

    setLoader(false);
    if (
      _tempAccount.length &&
      _tempAccountType.length &&
      _tempLeadSource.length &&
      _tempIndustry.length &&
      _tempCampaignSource.length
    ) {
      props.PageNavigation(savePage === "Save" ? "Deals" : "AddDeal");
    }
  };

  if (formShow.add) {
    const DealsKanbanOrderUpdateFunc = async (
      addID: number,
      pipeline: string,
      stage: string
    ) => {
      await SPServices.SPReadItems({
        Listname: Config.ListNames.DealsKanbanOrder,
        Filter: [
          {
            FilterKey: "Pipeline",
            Operator: "eq",
            FilterValue: pipeline,
          },
          {
            FilterKey: "Title",
            Operator: "eq",
            FilterValue: stage,
          },
        ],
      })
        .then(async (_res: any[]) => {
          let _ID: number = _res[0].ID;
          let _OrderIds: number[] = _res[0].IdOrder
            ? _res[0].IdOrder.split(",").map(Number)
            : [];

          _OrderIds.unshift(addID);

          await SPServices.SPUpdateItem({
            ID: _ID,
            Listname: Config.ListNames.DealsKanbanOrder,
            RequestJSON: {
              IdOrder: _OrderIds.map((_id) => _id).toString(),
            },
          })
            .then((_updateDealsOrder: any) => {})
            .catch((err: any) => {
              ErrorFunction(err, "Deals Kanban Order Ids update error");
            });
        })
        .catch((err: any) => {
          ErrorFunction(err, "Deals Kanban Order data get error");
        });
    };

    await SPServices.SPAddItem({
      Listname: Config.ListNames.CRMDeals,
      RequestJSON: json,
    })
      .then(async (_addedDeal: any) => {
        let _addDealID: number = _addedDeal.data.Id;
        let _addItemPipeline: string = _addedDeal.data.PipeLine;
        let _addItemStage: string = _addedDeal.data.Stage;

        if (selectedData.Contact.length) {
          for (let i = 0; i < selectedData.Contact.length; i++) {
            await SPServices.SPUpdateItem({
              ID: selectedData.Contact[i].code,
              Listname: Config.ListNames.CRMContacts,
              RequestJSON: {
                AccountId: _addDealID,
              },
            })
              .then((_contact) => {})
              .catch((err: any) => {
                ErrorFunction(err, "Deal item add in contact ID update error");
              });
          }

          props.Notify("success", "Success", "Deals added successfully");
          await DealsKanbanOrderUpdateFunc(
            _addDealID,
            _addItemPipeline,
            _addItemStage
          );
          await MovePagenation();
        } else {
          props.Notify("success", "Success", "Deals added successfully");
          await DealsKanbanOrderUpdateFunc(
            _addDealID,
            _addItemPipeline,
            _addItemStage
          );
          await MovePagenation();
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals item add error");
      });
  } else if (formShow.edit) {
    await SPServices.SPUpdateItem({
      ID: selectedData.ID ?? 0,
      Listname: Config.ListNames.CRMDeals,
      RequestJSON: json,
    })
      .then(async (updated: any) => {
        let _newLength = selectedData.Contact.length;
        let _oldLength = selectedData.OldData.Contact.length;
        let _loopLength = _newLength < _oldLength ? _oldLength : _newLength;

        if (_newLength || _oldLength) {
          for (let i = 0; i < _loopLength; i++) {
            await SPServices.SPUpdateItem({
              ID:
                _newLength < _oldLength
                  ? selectedData.OldData.Contact[i].code
                  : selectedData.Contact[i].code,
              Listname: Config.ListNames.CRMContacts,
              RequestJSON: {
                AccountId: selectedData.ID,
              },
            })
              .then((_contact) => {})
              .catch((err: any) => {
                ErrorFunction(
                  err,
                  "Deal item updated in contact ID update error"
                );
              });
          }

          props.Notify("success", "Success", "Deal updated successfully");
          if (dealFormNavigateValue.formType == "Acc-DF-Acc") {
            props.PageNavigation("Accounts");
          } else {
            await MovePagenation();
          }
        } else {
          props.Notify("success", "Success", "Deals updated successfully");
          if (dealFormNavigateValue.formType == "Acc-DF-Acc") {
            props.PageNavigation("Accounts");
          } else {
            await MovePagenation();
          }
        }
      })
      .catch((err: any) => {
        ErrorFunction(err, "Deals update error");
      });
  }
};
