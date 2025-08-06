/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Deals from "./Deals/Deals";
import { useEffect, useState, useRef } from "react";
import Loading from "../../../ExternalRef/Loader/Loading";
import Home from "./Home/Home";
import OpportunityFormPage from "./Deals/OpportunityFormPage";
import DealsFormPage from "./Deals/DealsFormPage";
import AccountsFormPage from "./Accounts/AccountsFormPage";
import ContactsFormPage from "./Contacts/ContactsFormPage";
import LeadsFormPage from "./Leads/LeadsFormPage";
import Accounts from "./Accounts/Accounts";
import Contacts from "./Contacts/Contacts";
import Projects from "./Projects/Projects";
import ProjectFormPage from "./Projects/ProjectsFormPage";
import Leads from "./Leads/Leads";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentUserEmail,
  setCurrentUserId,
  setMainAllChoicesData,
  setMainIsAdmin,
  setMainSiteAdminUsers,
  setMainSiteManagerUsers,
  setMainSiteUsers,
  setMainSPContext,
} from "./Redux/ConfigureationData";
import { ConfigData } from "./ConfigData";
import { PrimaryButton } from "@fluentui/react";
import styles from "./App.module.scss";
import { IConfigState, IDealsPageNavigate } from "./Redux/ConfigPageInterfaces";
import { ConfigPageDefaultValue } from "./Redux/ConfigPageDefaultValue";
import { setDealData } from "./Redux/PageData";
import { Toast } from "primereact/toast";

// Interfaces
interface IProps {
  spfxContext: any;
}

// Variables
const CompanyLogo: string = require("../../../ExternalRef/Images/technorucslogoBLACK.png");

const App = (props: IProps): JSX.Element => {
  // Varaibles
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );
  const configDefaults = ConfigPageDefaultValue();

  // States Variables
  const [pageName, setPageName] = useState<string>("Home");
  const [loader, setLoader] = useState<boolean>(true);
  const toast = useRef<Toast>(null);
  const dispatch = useDispatch();

  // All Functions
  const PageNavigation = (pageName: string) => {
    setPageName(pageName);
    setLoader(false);
  };

  const Notify = (
    type: "info" | "success" | "warn" | "error" | "secondary" | "contrast",
    summary: string,
    msg: string
  ) => {
    toast.current?.show({
      severity: type,
      summary: summary,
      detail: msg,
      life: 3000,
    });
  };

  const init = async () => {
    setLoader(true);
    let _configData = await ConfigData(props);

    if (_configData?.context) {
      dispatch(setMainSPContext(props.spfxContext));
      dispatch(setMainAllChoicesData(_configData.allChoices));
      dispatch(setMainSiteUsers(_configData.siteUsers));
      dispatch(setMainSiteManagerUsers(_configData.siteManagerUsers));
      dispatch(setMainSiteAdminUsers(_configData.siteAdminUsers));
      dispatch(setMainIsAdmin(_configData.isAdmin));
      dispatch(setCurrentUserEmail(_configData.currentUserEmail));
      dispatch(setCurrentUserId(_configData.currentUserId));

      if (!_configData.isAdmin) {
        let dealValue: IDealsPageNavigate = {
          managerName: configDefaults.dealManagerNameEmptyValue,
          pipeLine: "PMPipeline",
          pipeLineValue: configDefaults.choiceEmptyValue,
        };

        dispatch(setDealData(dealValue));
      }

      PageNavigation(_configData.isAdmin ? "Home" : "Deals");
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {loader ? (
        <Loading />
      ) : (
        <>
          <Toast ref={toast} />
          <div className={styles.mainBody}>
            <div className={styles.mainBox}>
              <div className={styles.navBar}>
                <div className={styles.logo}>
                  <img src={CompanyLogo} alt="no image" />
                </div>
                <div className={styles.navContentBorder}>
                  <div className={styles.navContent}>
                    <>
                      {ConfigureationData.isAdmin ? (
                        <PrimaryButton
                          className={pageName === "Home" ? styles.active : ""}
                          onClick={() => setPageName("Home")}
                        >
                          Home
                        </PrimaryButton>
                      ) : (
                        ""
                      )}
                      <PrimaryButton
                        className={
                          pageName === "Projects" || pageName === "AddProject"
                            ? styles.active
                            : ""
                        }
                        onClick={() => setPageName("Projects")}
                      >
                        Projects
                      </PrimaryButton>
                      <PrimaryButton
                        className={
                          pageName === "Deals" ||
                          pageName === "AddDeal" ||
                          pageName === "AddOpportunity"
                            ? styles.active
                            : ""
                        }
                        onClick={() => {
                          let dealValue: IDealsPageNavigate = {
                            managerName:
                              configDefaults.dealManagerNameEmptyValue,
                            pipeLine: ConfigureationData.isAdmin
                              ? "Deals"
                              : "PMPipeline",
                            pipeLineValue: configDefaults.choiceEmptyValue,
                          };

                          dispatch(setDealData(dealValue));
                          setPageName("Deals");
                        }}
                      >
                        Deals
                      </PrimaryButton>
                      <PrimaryButton
                        className={
                          pageName === "Leads" || pageName === "AddLead"
                            ? styles.active
                            : ""
                        }
                        onClick={() => setPageName("Leads")}
                      >
                        Leads
                      </PrimaryButton>
                      <PrimaryButton
                        className={
                          pageName === "Accounts" || pageName === "AddAccount"
                            ? styles.active
                            : ""
                        }
                        onClick={() => setPageName("Accounts")}
                      >
                        Accounts
                      </PrimaryButton>
                      <PrimaryButton
                        className={
                          pageName === "Contacts" || pageName === "AddContact"
                            ? styles.active
                            : ""
                        }
                        onClick={() => setPageName("Contacts")}
                      >
                        Contacts
                      </PrimaryButton>
                    </>
                  </div>
                </div>
              </div>
              <div>
                {pageName === "Home" ? (
                  <Home />
                ) : pageName === "Leads" ? (
                  <Leads
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "Contacts" ? (
                  <Contacts
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "Accounts" ? (
                  <Accounts
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "Deals" ? (
                  <Deals
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "AddLead" ? (
                  <LeadsFormPage
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "AddContact" ? (
                  <ContactsFormPage
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "AddAccount" ? (
                  <AccountsFormPage
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "AddDeal" ? (
                  <DealsFormPage
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "AddOpportunity" ? (
                  <OpportunityFormPage
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName === "AddProject" ? (
                  <ProjectFormPage
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : pageName == "Projects" ? (
                  <Projects
                    spfxContext={props.spfxContext}
                    pageName={pageName}
                    PageNavigation={PageNavigation}
                    Notify={Notify}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className={styles.version}>V 1.2</div>
          </div>
        </>
      )}
    </>
  );
};

export default App;
