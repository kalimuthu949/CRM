/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-namespace */
export namespace Config {
  export const ListNames: IList = {
    CRMAccounts: "CRMAccounts",
    CRMContacts: "CRMContacts",
    CRMDeals: "CRMDeals",
    CRMLeads: "CRMLeads",
    DealsKanbanOrder: "DealsKanbanOrder",
    PipeLineConfig: "PipeLineConfig",
    PMOpportunity: "PMOpportunity",
  };

  export const CRMOwners: string = "Admins";
  export const CRMManagersGroup: string = "Managers";

  export const PagenationShow: number = 8;
}
