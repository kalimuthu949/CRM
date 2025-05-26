/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigPageDefaultValue } from "./Redux/ConfigPageDefaultValue";
import { sp } from "@pnp/pnpjs";
import { IAllChoiceColumn, ISiteUsers } from "./Redux/ConfigPageInterfaces";
import { Config } from "../../../ExternalRef/CommonServices/Config";

// Interfaces
interface IProps {
  spfxContext: any;
}

let empty: IAllChoiceColumn = {
  Contact: [],
  AccountType: [],
  Account: [],
  ParentAccount: [],
  Industry: [],
  LeadSource: [],
  PipeLine: [],
  Stage: [],
  CampaignSource: [],
  Lost: [],
  Platform: [],
  JobTitle: [],
  OwnerShip: [],
  Rating: [],
  WinProbability: [],
  LeadStatus: [],
};

const configDefaults = ConfigPageDefaultValue();

export const ConfigData = async (props: IProps) => {
  const currentUserEmail = props.spfxContext._pageContext._user.email;
  let currentUserId = 0;
  let isAdmin = false;

  let siteUsers: ISiteUsers[] = [];
  let siteManagerUsers: ISiteUsers[] = [];
  let siteAdminUsers: ISiteUsers[] = [];
  const AllChoicesList: IAllChoiceColumn = empty;

  const normalizeUser = async (email: string): Promise<ISiteUsers | null> => {
    try {
      const user = await sp.web.siteUsers.getByEmail(email).get();
      return {
        Id: user.Id,
        Email: user.Email,
        LoginName: user.LoginName,
        UserPrincipalName: user.UserPrincipalName,
        Title: user.Title,
      };
    } catch {
      return null;
    }
  };

  // Fetch and normalize all site users
  try {
    const users = await sp.web.siteUsers.top(999).get();
    const uniqueEmails = [
      ...new Set(users.map((u) => u.Email).filter(Boolean)),
    ];

    const normalizedUsers = await Promise.all(
      uniqueEmails.map((email) => normalizeUser(email))
    );

    siteUsers = normalizedUsers.filter(Boolean) as ISiteUsers[];

    const matchedUser = siteUsers.find(
      (user) => user.Email === currentUserEmail
    );
    currentUserId = matchedUser?.Id ?? 0;
  } catch (err) {
    console.log("Site users get error", err);
  }

  // Fetch and normalize managers
  const loadGroupUsers = async (groupName: string): Promise<ISiteUsers[]> => {
    try {
      const groupUsers = await sp.web.siteGroups
        .getByName(groupName)
        .users.get();
      const uniqueEmails = [
        ...new Set(groupUsers.map((u) => u.Email).filter(Boolean)),
      ];

      const normalized = await Promise.all(
        uniqueEmails.map((email) => normalizeUser(email))
      );

      return normalized.filter(Boolean) as ISiteUsers[];
    } catch (err) {
      console.log(`Site group "${groupName}" get error`, err);
      return [];
    }
  };

  // Unique Values
  const uniqueJobTitleLead = new Set<string>();
  const uniqueLeadStatusLead = new Set<string>();
  const uniqueLeadSourceLead = new Set<string>();
  const uniqueIndustryLead = new Set<string>();
  const uniqueJobTitleContact = new Set<string>();
  const uniqueLeadSourceContact = new Set<string>();
  const uniqueIndustryAccount = new Set<string>();
  const uniqueAccountTypeAccount = new Set<string>();
  const uniqueRatingAccount = new Set<string>();
  const uniqueOwnershipAccount = new Set<string>();
  const uniqueLeadSourceDeal = new Set<string>();
  const uniqueIndustryDeal = new Set<string>();
  const uniqueAccountTypeDeal = new Set<string>();
  const uniquePlatFormDeal = new Set<string>();
  const uniqueCampaignSourcesDeal = new Set<string>();
  const uniqueWinProbabilityOppor = new Set<string>();
  const uniquePlatFormOppor = new Set<string>();
  const uniqueIndustryOppor = new Set<string>();

  // Leads List
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMLeads)
    .items.top(5000)
    .get()
    .then(async (_leadChoices: any) => {
      if (_leadChoices.length) {
        _leadChoices.forEach((item: any) => {
          const jobTitle = item.JobTitle ? item.JobTitle : "";
          const leadStatus = item.LeadStatus ? item.LeadStatus : "";
          const leadSource = item.LeadSource ? item.LeadSource : "";
          const industry = item.Industry ? item.Industry : "";

          if (jobTitle && !uniqueJobTitleLead.has(jobTitle)) {
            uniqueJobTitleLead.add(jobTitle);
            if (
              !AllChoicesList.JobTitle.some((choice) => choice.name == jobTitle)
            ) {
              AllChoicesList.JobTitle.push({
                name: jobTitle,
                code: jobTitle,
              });
            }
          }

          if (leadStatus && !uniqueLeadStatusLead.has(leadStatus)) {
            uniqueLeadStatusLead.add(leadStatus);
            if (
              !AllChoicesList.LeadStatus.some(
                (choice) => choice.name == leadStatus
              )
            ) {
              AllChoicesList.LeadStatus.push({
                name: leadStatus,
                code: leadStatus,
              });
            }
          }

          if (leadSource && !uniqueLeadSourceLead.has(leadSource)) {
            uniqueLeadSourceLead.add(leadSource);
            if (
              !AllChoicesList.LeadSource.some(
                (choice) => choice.name == leadSource
              )
            ) {
              AllChoicesList.LeadSource.push({
                name: leadSource,
                code: leadSource,
              });
            }
          }

          if (industry && !uniqueIndustryLead.has(industry)) {
            uniqueIndustryLead.add(industry);
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == industry)
            ) {
              AllChoicesList.Industry.push({
                name: industry,
                code: industry,
              });
            }
          }
        });
      }
    })
    .catch((err: any) => {
      console.log(err, "Lead All choices get error");
    });

  // Contacts List
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMContacts)
    .items.top(5000)
    .get()
    .then(async (_contactChoices: any) => {
      if (_contactChoices.length) {
        _contactChoices.forEach((item: any) => {
          const jobTitle = item.JobTitle ? item.JobTitle : "";
          const leadSource = item.LeadSource ? item.LeadSource : "";

          if (jobTitle && !uniqueJobTitleContact.has(jobTitle)) {
            uniqueJobTitleContact.add(jobTitle);
            if (
              !AllChoicesList.JobTitle.some((choice) => choice.name == jobTitle)
            ) {
              AllChoicesList.JobTitle.push({
                name: jobTitle,
                code: jobTitle,
              });
            }
          }

          if (leadSource && !uniqueLeadSourceContact.has(leadSource)) {
            uniqueLeadSourceContact.add(leadSource);
            if (
              !AllChoicesList.LeadSource.some(
                (choice) => choice.name == leadSource
              )
            ) {
              AllChoicesList.LeadSource.push({
                name: leadSource,
                code: leadSource,
              });
            }
          }
        });
      }
    })
    .catch((err: any) => {
      console.log(err, "Contacts All choices get error");
    });

  // Accounts List
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMAccounts)
    .items.top(5000)
    .get()
    .then(async (_accountChoices: any) => {
      if (_accountChoices.length) {
        _accountChoices.forEach((item: any) => {
          const industry = item.Industry ? item.Industry : "";
          const accountType = item.AccountType ? item.AccountType : "";
          const rating = item.Rating ? item.Rating : "";
          const ownership = item.Ownership ? item.Ownership : "";

          if (industry && !uniqueIndustryAccount.has(industry)) {
            uniqueIndustryAccount.add(industry);
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == industry)
            ) {
              AllChoicesList.Industry.push({
                name: industry,
                code: industry,
              });
            }
          }

          if (accountType && !uniqueAccountTypeAccount.has(accountType)) {
            uniqueAccountTypeAccount.add(accountType);
            if (
              !AllChoicesList.AccountType.some(
                (choice) => choice.name == accountType
              )
            ) {
              AllChoicesList.AccountType.push({
                name: accountType,
                code: accountType,
              });
            }
          }

          if (rating && !uniqueRatingAccount.has(rating)) {
            uniqueRatingAccount.add(rating);
            if (
              !AllChoicesList.Rating.some((choice) => choice.name == rating)
            ) {
              AllChoicesList.Rating.push({
                name: rating,
                code: rating,
              });
            }
          }

          if (ownership && !uniqueOwnershipAccount.has(ownership)) {
            uniqueOwnershipAccount.add(ownership);
            if (
              !AllChoicesList.OwnerShip.some(
                (choice) => choice.name == ownership
              )
            ) {
              AllChoicesList.OwnerShip.push({
                name: ownership,
                code: ownership,
              });
            }
          }
        });
      }
    })
    .catch((err: any) => {
      console.log(err, "Accounts All choices get error");
    });

  // Deals List
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMDeals)
    .items.top(5000)
    .get()
    .then(async (_dealChoices: any) => {
      if (_dealChoices.length) {
        _dealChoices.forEach((item: any) => {
          const leadSource = item.LeadSource ? item.LeadSource : "";
          const industry = item.Industry ? item.Industry : "";
          const accountType = item.AccountType ? item.AccountType : "";
          const Platform = item.Platform ? item.Platform : "";
          const campaignSource = item.CampaignSource ? item.CampaignSource : "";

          if (leadSource && !uniqueLeadSourceDeal.has(leadSource)) {
            uniqueLeadSourceDeal.add(leadSource);
            if (
              !AllChoicesList.LeadSource.some(
                (choice) => choice.name == leadSource
              )
            ) {
              AllChoicesList.LeadSource.push({
                name: leadSource,
                code: leadSource,
              });
            }
          }

          if (industry && !uniqueIndustryDeal.has(industry)) {
            uniqueIndustryDeal.add(industry);
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == industry)
            ) {
              AllChoicesList.Industry.push({
                name: industry,
                code: industry,
              });
            }
          }

          if (accountType && !uniqueAccountTypeDeal.has(accountType)) {
            uniqueAccountTypeDeal.add(accountType);
            if (
              !AllChoicesList.AccountType.some(
                (choice) => choice.name == accountType
              )
            ) {
              AllChoicesList.AccountType.push({
                name: accountType,
                code: accountType,
              });
            }
          }

          if (Platform.length) {
            Platform.forEach((platform) => {
              if (platform && !uniquePlatFormDeal.has(platform)) {
                uniquePlatFormDeal.add(platform);
                if (
                  !AllChoicesList.Platform.some(
                    (choice) => choice.name === platform
                  )
                ) {
                  AllChoicesList.Platform.push({
                    name: platform,
                    code: platform,
                  });
                }
              }
            });
          }

          if (
            campaignSource &&
            !uniqueCampaignSourcesDeal.has(campaignSource)
          ) {
            uniqueCampaignSourcesDeal.add(campaignSource);
            if (
              !AllChoicesList.CampaignSource.some(
                (choice) => choice.name == campaignSource
              )
            ) {
              AllChoicesList.CampaignSource.push({
                name: campaignSource,
                code: campaignSource,
              });
            }
          }
        });
      }
    })
    .catch((err: any) => {
      console.log(err, "Deals All choices get error");
    });

  // Opportunity List
  await sp.web.lists
    .getByTitle(Config.ListNames.PMOpportunity)
    .items.top(5000)
    .get()
    .then((_opportunityChoices: any[]) => {
      if (_opportunityChoices.length) {
        _opportunityChoices.forEach((item: any) => {
          const WinProbability = item.WinProbability ? item.WinProbability : "";
          const Platform = item.Platform ? item.Platform : "";
          const Industry = item.Industry ? item.Industry : "";

          if (
            WinProbability &&
            !uniqueWinProbabilityOppor.has(WinProbability)
          ) {
            uniqueWinProbabilityOppor.add(WinProbability);
            if (
              !AllChoicesList.WinProbability.some(
                (choice) => choice.name == WinProbability
              )
            ) {
              AllChoicesList.WinProbability.push({
                name: WinProbability,
                code: WinProbability,
              });
            }
          }

          if (Array.isArray(Platform)) {
            Platform.forEach((e) => {
              if (e && !uniquePlatFormOppor.has(e)) {
                uniquePlatFormOppor.add(e);

                if (
                  !AllChoicesList.Platform.some((choice) => choice.name === e)
                ) {
                  AllChoicesList.Platform.push({
                    name: e,
                    code: e,
                  });
                }
              }
            });
          }

          if (Industry && !uniqueIndustryOppor.has(Industry)) {
            uniqueIndustryOppor.add(Industry);
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == Industry)
            ) {
              AllChoicesList.Industry.push({
                name: Industry,
                code: Industry,
              });
            }
          }
        });
      }
    })
    .catch((err: any) => {
      console.log(err, "Opportunity All choices get error");
    });

  // Pipe Line Config Choice
  await sp.web.lists
    .getByTitle(Config.ListNames.PipeLineConfig)
    .items.top(5000)
    .get()
    .then((_pipeLineChoices: any[]) => {
      if (_pipeLineChoices.length) {
        _pipeLineChoices.forEach((e) => {
          AllChoicesList.PipeLine.push({
            name: e.Title ? e.Title : "",
            code: e.Title ? e.Title : "",
          });

          if (e.Stages?.split(",").length) {
            e.Stages.split(",").forEach((stage: string) => {
              AllChoicesList.Stage.push({
                name: stage,
                code: e.Title ? e.Title : "",
              });
            });
          }
        });
      }
    })
    .catch((err: any) => {
      console.log(err, "Pipeline Config Choices get error");
    });

  // Lead Choices
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMLeads)
    .fields.get()
    .then((leadsChoices) => {
      if (leadsChoices.length) {
        let _jobTitleChoices: any[] = leadsChoices.filter(
          (_e) => _e.StaticName === "JobTitle"
        );
        let _leadStatusChoices: any[] = leadsChoices.filter(
          (_e) => _e.StaticName === "LeadStatus"
        );
        let _leadSourceChoices: any[] = leadsChoices.filter(
          (_e) => _e.StaticName === "LeadSource"
        );
        let _industryChoices: any[] = leadsChoices.filter(
          (_e) => _e.StaticName === "Industry"
        );

        if (_jobTitleChoices.length) {
          _jobTitleChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.JobTitle.some((choice) => choice.name == item)
            ) {
              AllChoicesList.JobTitle.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_leadStatusChoices.length) {
          _leadStatusChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.LeadStatus.some((choice) => choice.name == item)
            ) {
              AllChoicesList.LeadStatus.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_leadSourceChoices.length) {
          _leadSourceChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.LeadSource.some((choice) => choice.name == item)
            ) {
              AllChoicesList.LeadSource.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_industryChoices.length) {
          _industryChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == item)
            ) {
              AllChoicesList.Industry.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }
      }
    })
    .catch((err: any) => {
      console.log(err, "Leads All choices get error");
    });

  // Contatcts Choices
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMContacts)
    .fields.get()
    .then((contactChoices) => {
      if (contactChoices.length) {
        let _jobTitleChoices: any[] = contactChoices.filter(
          (_e) => _e.StaticName === "JobTitle"
        );
        let _leadSourceChoices: any[] = contactChoices.filter(
          (_e) => _e.StaticName === "LeadSource"
        );

        if (_jobTitleChoices.length) {
          _jobTitleChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.JobTitle.some((choice) => choice.name == item)
            ) {
              AllChoicesList.JobTitle.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_leadSourceChoices.length) {
          _leadSourceChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.LeadSource.some((choice) => choice.name == item)
            ) {
              AllChoicesList.LeadSource.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }
      }
    })
    .catch((err: any) => {
      console.log(err, "Contacts All choices get error");
    });

  // Accounts Choices
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMAccounts)
    .fields.get()
    .then((accountChoices) => {
      if (accountChoices.length) {
        let _industryChoices: any[] = accountChoices.filter(
          (_e) => _e.StaticName === "Industry"
        );
        let _accountTypeChoices: any[] = accountChoices.filter(
          (_e) => _e.StaticName === "AccountType"
        );
        let _ratingChoices: any[] = accountChoices.filter(
          (_e) => _e.StaticName === "Rating"
        );
        let _ownershipChoices: any[] = accountChoices.filter(
          (_e) => _e.StaticName === "Ownership"
        );

        if (_industryChoices.length) {
          _industryChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == item)
            ) {
              AllChoicesList.Industry.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_accountTypeChoices.length) {
          _accountTypeChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.AccountType.some((choice) => choice.name == item)
            ) {
              AllChoicesList.AccountType.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_ratingChoices.length) {
          _ratingChoices[0].Choices.forEach((item: string) => {
            if (!AllChoicesList.Rating.some((choice) => choice.name == item)) {
              AllChoicesList.Rating.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_ownershipChoices.length) {
          _ownershipChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.OwnerShip.some((choice) => choice.name == item)
            ) {
              AllChoicesList.OwnerShip.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }
      }
    })
    .catch((err: any) => {
      console.log(err, "Accounts All choices get error");
    });

  // Deals Choices
  await sp.web.lists
    .getByTitle(Config.ListNames.CRMDeals)
    .fields.get()
    .then((_dealsChoices) => {
      if (_dealsChoices.length) {
        let _leadSourceChoices: any[] = _dealsChoices.filter(
          (_e) => _e.StaticName === "LeadSource"
        );
        let _industryChoices: any[] = _dealsChoices.filter(
          (_e) => _e.StaticName === "Industry"
        );
        let _accountTypeChoices: any[] = _dealsChoices.filter(
          (_e) => _e.StaticName === "AccountType"
        );
        let _lostChoices: any[] = _dealsChoices.filter(
          (_e) => _e.StaticName === "Lost"
        );
        let _platformChoices: any[] = _dealsChoices.filter(
          (_e) => _e.StaticName === "Platform"
        );

        if (_leadSourceChoices.length) {
          _leadSourceChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.LeadSource.some((choice) => choice.name == item)
            ) {
              AllChoicesList.LeadSource.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_industryChoices.length) {
          _industryChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == item)
            ) {
              AllChoicesList.Industry.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_accountTypeChoices.length) {
          _accountTypeChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.AccountType.some((choice) => choice.name == item)
            ) {
              AllChoicesList.AccountType.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_lostChoices.length) {
          _lostChoices[0].Choices.forEach((item: string) => {
            if (!AllChoicesList.Lost.some((choice) => choice.name == item)) {
              AllChoicesList.Lost.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_platformChoices.length) {
          _platformChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.Platform.some((choice) => choice.name == item)
            ) {
              AllChoicesList.Platform.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }
      }
    })
    .catch((err: any) => {
      console.log(err, "Deals All choices get error");
    });

  let _allChoicesData: IAllChoiceColumn = AllChoicesList;

  // Opportunity Choices
  await sp.web.lists
    .getByTitle(Config.ListNames.PMOpportunity)
    .fields.get()
    .then((_opportunityChoices) => {
      if (_opportunityChoices.length) {
        let _winProbabilityChoices: any[] = _opportunityChoices.filter(
          (_e) => _e.StaticName === "WinProbability"
        );
        let _platformChoices: any[] = _opportunityChoices.filter(
          (_e) => _e.StaticName === "Platform"
        );
        let _industryChoices: any[] = _opportunityChoices.filter(
          (_e) => _e.StaticName === "Industry"
        );

        if (_winProbabilityChoices.length) {
          _winProbabilityChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.WinProbability.some(
                (choice) => choice.name == item
              )
            ) {
              AllChoicesList.WinProbability.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_platformChoices.length) {
          _platformChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.Platform.some((choice) => choice.name == item)
            ) {
              AllChoicesList.Platform.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        if (_industryChoices.length) {
          _industryChoices[0].Choices.forEach((item: string) => {
            if (
              !AllChoicesList.Industry.some((choice) => choice.name == item)
            ) {
              AllChoicesList.Industry.push({
                name: item ? item : "",
                code: item ? item : "",
              });
            }
          });
        }

        // Order by
        const sortByOrder = (list: any[], order: string[]) =>
          [...list].sort((item1, item2) => {
            const index1 = order.indexOf(item1.name);
            const index2 = order.indexOf(item2.name);
            return index1 === -1 ? 1 : index2 === -1 ? -1 : index1 - index2;
          });

        const sortedLeadStatus = sortByOrder(
          AllChoicesList.LeadStatus,
          configDefaults.LeadsStatusOrder
        );
        const sortedLeadSource = sortByOrder(
          AllChoicesList.LeadSource,
          configDefaults.LeadsSourceOrder
        );
        const sortedStage = sortByOrder(
          AllChoicesList.Stage,
          configDefaults.StageOrder
        );
        const sortedPipeLine = sortByOrder(
          AllChoicesList.PipeLine,
          configDefaults.PipeLineOrder
        );
        const sortedWinProbabilty = sortByOrder(
          AllChoicesList.WinProbability,
          configDefaults.WinProbabilityOrder
        );

        _allChoicesData = {
          ...AllChoicesList,
          LeadStatus: sortedLeadStatus,
          LeadSource: sortedLeadSource,
          PipeLine: sortedPipeLine,
          Stage: sortedStage,
          WinProbability: sortedWinProbabilty,
        };
      }
    })
    .catch((err: any) => {
      console.log(err, "Opportunity All choices get error");
    });

  siteManagerUsers = await loadGroupUsers(Config.CRMManagersGroup);
  siteAdminUsers = await loadGroupUsers(Config.CRMOwners);

  isAdmin = siteAdminUsers.some((user) => user.Email === currentUserEmail);

  return {
    context: props.spfxContext,
    allChoices: _allChoicesData,
    siteUsers,
    siteManagerUsers,
    siteAdminUsers,
    isAdmin,
    currentUserEmail,
    currentUserId,
  };
};
