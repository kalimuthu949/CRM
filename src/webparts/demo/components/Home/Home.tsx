/* eslint-disable react/self-closing-comp */
/* eslint-disable guard-for-in */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from "./Home.module.scss";
import { useEffect, useState } from "react";
import { sp } from "@pnp/pnpjs";
import { Config } from "../../../../ExternalRef/CommonServices/Config";
import Loading from "../../../../ExternalRef/Loader/Loading";
import * as moment from "moment";
import { Chart } from "react-google-charts";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import "react-funnel-pipeline/dist/index.css";
import CanvasJSReact from "@canvasjs/react-charts";
import { useSelector } from "react-redux";
import { IChoice, IConfigState } from "../Redux/ConfigPageInterfaces";

// Interfaces
type ICountryChart = [string, string | number][];
type IWonLostChart = [string, string | number, string | number][];
type IIndustryChart = [string, any][];
type ILeadSourceChart = [string, any][];
interface IFunnelMonth {
  label: string;
  value: string;
  checked: boolean;
}
interface DataPoint {
  y: number;
  label: string;
  color: string;
}
interface ChartOptions {
  title: {
    text: string;
    fontColor: string;
  };
  data: {
    type: string;
    toolTipContent: string;
    indexLabelPlacement: string;
    indexLabel: string;
    indexLabelFontColor: string;
    dataPoints: DataPoint[];
  }[];
}
interface IDealCount {
  Below5K: number;
  Above5K: number;
  Above10K: number;
}
interface ISelectedYear {
  monthWiseMonth: string;
  monthWiseYear: number;
  wonLostYear: number;
}
interface IDealsData {
  ID: number;
  Stage: string;
  ExpectedRevenue: string;
  Modified: string;
  Industry: string;
  LeadSource: string;
}
interface IDealTotalKeys {
  Amount: number;
  Data: IDealsData[];
}
interface IDealSplitData {
  Converstion: IDealTotalKeys;
  Analysis: IDealTotalKeys;
  Quote: IDealTotalKeys;
  Won: IDealTotalKeys;
  Lost: IDealTotalKeys;
}

// Global Variables
const TotalCommittiees: string = require("../../../../ExternalRef/Images/peoplearrowsleftright.png");
const ActiveCommittiees: string = require("../../../../ExternalRef/Images/checkusers.png");
const InactiveCommittiees: string = require("../../../../ExternalRef/Images/activeuser.png");
const ActiveMembers: string = require("../../../../ExternalRef/Images/checkuser.png");
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Home = () => {
  // Variables
  const funnelMonth: IFunnelMonth[] = [
    {
      label: "Jan",
      value: "Jan",
      checked: moment().month() == 0,
    },
    {
      label: "Feb",
      value: "Feb",
      checked: moment().month() == 1,
    },
    {
      label: "Mar",
      value: "Mar",
      checked: moment().month() == 2,
    },
    {
      label: "Apr",
      value: "Apr",
      checked: moment().month() == 3,
    },
    {
      label: "May",
      value: "May",
      checked: moment().month() == 4,
    },
    {
      label: "Jun",
      value: "Jun",
      checked: moment().month() == 5,
    },
    {
      label: "Jul",
      value: "Jul",
      checked: moment().month() == 6,
    },
    {
      label: "Aug",
      value: "Aug",
      checked: moment().month() == 7,
    },
    {
      label: "Sep",
      value: "Sep",
      checked: moment().month() == 8,
    },
    {
      label: "Oct",
      value: "Oct",
      checked: moment().month() == 9,
    },
    {
      label: "Nov",
      value: "Nov",
      checked: moment().month() == 10,
    },
    {
      label: "Dec",
      value: "Dec",
      checked: moment().month() == 11,
    },
  ];
  const ConfigureationData: IConfigState = useSelector(
    (state: any) => state.ConfigureationData
  );

  // States Variables
  const [masterData, setMaterData] = useState<IDealsData[]>([]);
  const [masterSplitData, setMasterSplitData] = useState<IDealSplitData>({
    Analysis: {
      Amount: 0,
      Data: [],
    },
    Converstion: {
      Amount: 0,
      Data: [],
    },
    Lost: {
      Amount: 0,
      Data: [],
    },
    Quote: {
      Amount: 0,
      Data: [],
    },
    Won: {
      Amount: 0,
      Data: [],
    },
  });
  const [monthWiseYear, setMonthWiseYear] = useState<number[]>([
    moment().year(),
  ]);
  const [funnelChart, setFunnelChart] = useState<ChartOptions>({
    title: {
      text: "Deal Stages",
      fontColor: "transparent",
    },
    data: [
      {
        type: "funnel",
        toolTipContent: "",
        indexLabelPlacement: "inside",
        indexLabel: "{label}",
        indexLabelFontColor: "#fff",
        dataPoints: [
          {
            label: "(+)ve Conversation  0",
            y: 10,
            color: "#4e97a8",
          },
          {
            label: "Analysis  0",
            y: 10,
            color: "#1d7b63",
          },
          {
            label: "Quote  0",
            y: 10,
            color: "#68bc00",
          },
        ],
      },
    ],
  });
  const [selectedValue, setSelectedValue] = useState<ISelectedYear>({
    monthWiseMonth: funnelMonth.filter((_e) => _e.checked === true)[0].value,
    monthWiseYear: moment().year(),
    wonLostYear: moment().year(),
  });
  const [countryChart, setCountryChart] = useState<ICountryChart>([
    ["Country", "Deal Count"],
  ]);
  const [industryChart, setIndustryChart] = useState<IIndustryChart>([
    ["Industry", "Count"],
  ]);
  const [leadSourceChart, setLeadSourceChart] = useState<ILeadSourceChart>([
    ["LeadSource", "Count"],
  ]);
  const [wonLostChart, setWonLostChart] = useState<IWonLostChart>([
    ["Month", "Won", "Lost"],
  ]);
  const [wonLostYear, setWonLostYear] = useState<number[]>([moment().year()]);
  const [dealCount, setDealCount] = useState<IDealCount>({
    Below5K: 0,
    Above5K: 0,
    Above10K: 0,
  });
  const [loader, setLoader] = useState<boolean>(true);

  // All Functions
  const DealsData = () => {
    sp.web.lists
      .getByTitle(Config.ListNames.CRMDeals)
      .items.select("*,DealOwner/EMail,DealOwner/Title")
      .expand("DealOwner")
      .filter("IsDeleted ne 1")
      .orderBy("Modified", false)
      .top(999)
      .get()
      .then((_dealsData) => {
        if (_dealsData.length) {
          let _tempDealsData: IDealsData[] = [];
          let _countryChart: ICountryChart = [["Country", "Deal Count"]];
          let countryCountMap: { [key: string]: number } = {};

          _dealsData.forEach((item: any, index: number) => {
            _tempDealsData.push({
              ID: item.ID ? item.ID : null,
              ExpectedRevenue: item.ExpectedRevenue ? item.ExpectedRevenue : "",
              Stage: item.Stage ? item.Stage : "",
              Modified: item.Modified ? item.Modified : "",
              Industry: item.Industry ? item.Industry : "",
              LeadSource: item.LeadSource ? item.LeadSource : "",
            });

            // Count deals by country
            const country = item.Country ? item.Country : "Unknown";
            if (countryCountMap[country]) {
              countryCountMap[country] += 1;
            } else {
              countryCountMap[country] = 1;
            }

            if (_dealsData.length - 1 == index) {
              for (let countryName in countryCountMap) {
                _countryChart.push([
                  countryName.toUpperCase(),
                  countryCountMap[countryName],
                ]);
              }

              setCountryChart([..._countryChart]);
              setMaterData([..._tempDealsData]);
              GetSplitData(
                [..._tempDealsData],
                selectedValue.monthWiseYear,
                selectedValue.monthWiseMonth,
                selectedValue.wonLostYear
              );
            }
          });
        } else setLoader(false);
      })
      .catch((err: any) => {
        ErrFunctions(err, "Get Deals data error");
      });
  };

  const SplitData = (check: string, Data: IDealsData[]) => {
    let _tempTotalAmount: number = 0;
    let _tempData: IDealsData[] = [];

    for (let i = 0; i < Data.length; i++) {
      _tempTotalAmount +=
        Data[i].Stage == check ? Number(Data[i].ExpectedRevenue) : 0;
      if (Data[i].Stage == check) {
        _tempData.push(Data[i]);
      }
    }

    return {
      Amount: _tempTotalAmount,
      Data: _tempData,
    };
  };

  const GetSplitData = (
    Data: IDealsData[],
    selectedMonthWiseYear: number,
    selectedMonthWiseMonth: string,
    selectedWonLostYear: number
  ) => {
    let _tempSplitDataStore: IDealSplitData = {
      Analysis: SplitData("Analysis/Figma/Estimation", Data),
      Converstion: SplitData("(+)ve Conversation", Data),
      Lost: SplitData("Lost", Data),
      Quote: SplitData("Quote Submitted", Data),
      Won: SplitData("Won", Data),
    };

    AllChartGetData(
      _tempSplitDataStore,
      Data,
      selectedMonthWiseYear,
      selectedMonthWiseMonth,
      selectedWonLostYear
    );
  };

  const AllChartGetData = (
    _tempSplitDataStore: IDealSplitData,
    Data: IDealsData[],
    selectedMonthWiseYear: number,
    selectedMonthWiseMonth: string,
    selectedWonLostYear: number
  ) => {
    // Month wise Chart
    const monthNames: string[] = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let _uniqueMonthWiseYears: number[] = Data.length
      ? Data.reduce((acc: number[], _e) => {
          const year = moment(_e.Modified).year();
          if (!acc.includes(year)) {
            acc.push(year);
          }
          return acc;
        }, [])
      : [moment().year()];

    const conversionCount = _tempSplitDataStore.Converstion.Data.filter(
      (_e) =>
        moment(_e.Modified).year() === selectedMonthWiseYear &&
        moment(_e.Modified).month() ===
          monthNames.indexOf(selectedMonthWiseMonth)
    ).length;
    const analysisCount = _tempSplitDataStore.Analysis.Data.filter(
      (_e) =>
        moment(_e.Modified).year() === selectedMonthWiseYear &&
        moment(_e.Modified).month() ===
          monthNames.indexOf(selectedMonthWiseMonth)
    ).length;
    const quoteCount = _tempSplitDataStore.Quote.Data.filter(
      (_e) =>
        moment(_e.Modified).year() === selectedMonthWiseYear &&
        moment(_e.Modified).month() ===
          monthNames.indexOf(selectedMonthWiseMonth)
    ).length;
    const monthlyData: ChartOptions = {
      title: {
        text: "Deal Stages",
        fontColor: "transparent",
      },
      data: [
        {
          type: "funnel",
          toolTipContent: "",
          indexLabelPlacement: "inside",
          indexLabel: "{label}",
          indexLabelFontColor: "#fff",
          dataPoints: [
            {
              label: `(+)ve Conversation  ${conversionCount}`,
              y: 10,
              color: "#4e97a8",
            },
            {
              label: `Analysis  ${analysisCount}`,
              y: 10,
              color: "#1d7b63",
            },
            {
              label: `Quote  ${quoteCount}`,
              y: 10,
              color: "#68bc00",
            },
          ],
        },
      ],
    };

    // Choice Chart
    let IndustryChoice: IChoice[] = ConfigureationData.allChoicesData.Industry;
    let LeadSourceChoice: IChoice[] =
      ConfigureationData.allChoicesData.LeadSource;
    let industryCountMap: { [key: string]: number } = {};
    let leadSourceCountMap: { [key: string]: number } = {};

    IndustryChoice.forEach((choice: { name: string }) => {
      const count: number = Data.filter(
        (_e) => _e.Industry === choice.name
      ).length;
      if (count > 0) {
        industryCountMap[choice.name] = count;
      }
    });

    LeadSourceChoice.forEach((choice: { name: string }) => {
      const count: number = Data.filter(
        (_e) => _e.LeadSource === choice.name
      ).length;
      if (count > 0) {
        leadSourceCountMap[choice.name] = count;
      }
    });

    let _tempIndustryChart: IIndustryChart = [["Industry", "Count"]];
    let _tempLeadSourceChart: ILeadSourceChart = [["LeadSource", "Count"]];

    for (let industry in industryCountMap) {
      _tempIndustryChart.push([industry, industryCountMap[industry]]);
    }
    _tempIndustryChart = _tempIndustryChart.sort((a, b) => b[1] - a[1]);

    for (let leadSource in leadSourceCountMap) {
      _tempLeadSourceChart.push([leadSource, leadSourceCountMap[leadSource]]);
    }
    _tempLeadSourceChart = _tempLeadSourceChart.sort((a, b) => b[1] - a[1]); // Sort by count

    // Won Lost Chart
    let _wonLostChart: IWonLostChart = [["Month", "Won", "Lost"]];
    let _uniqueWonLostYears: number[] = Data.length
      ? Data.reduce((acc: number[], _e) => {
          const year = moment(_e.Modified).year();
          if (!acc.includes(year)) {
            acc.push(year);
          }
          return acc;
        }, [])
      : [moment().year()];

    for (let i = 0; i < 12; i++) {
      const wonCount: number = _tempSplitDataStore.Won.Data.filter(
        (_e) =>
          moment(_e.Modified).year() === selectedWonLostYear &&
          moment(_e.Modified).month() === i
      ).length;

      const lostCount: number = _tempSplitDataStore.Lost.Data.filter(
        (_e) =>
          moment(_e.Modified).year() === selectedWonLostYear &&
          moment(_e.Modified).month() === i
      ).length;

      _wonLostChart.push([monthNames[i], wonCount, lostCount]);
    }

    let totalBelow5K: number = Data.filter((_e) => {
      if (_e.ExpectedRevenue) {
        return (
          Number(_e.ExpectedRevenue) > 0 && Number(_e.ExpectedRevenue) <= 400000
        );
      }
      return false;
    }).length;

    let totalAbove5K: number = Data.filter((_e) => {
      if (_e.ExpectedRevenue) {
        return (
          Number(_e.ExpectedRevenue) > 400000 &&
          Number(_e.ExpectedRevenue) <= 1000000
        );
      }
      return false;
    }).length;

    let totalAbove10K: number = Data.filter((_e) => {
      if (_e.ExpectedRevenue) {
        return Number(_e.ExpectedRevenue) > 1000000;
      }
      return false;
    }).length;

    setDealCount({
      Above10K: totalAbove10K,
      Above5K: totalAbove5K,
      Below5K: totalBelow5K,
    });
    setWonLostYear(_uniqueWonLostYears);
    setWonLostChart(_wonLostChart);
    setLeadSourceChart(_tempLeadSourceChart);
    setIndustryChart(_tempIndustryChart);
    setMonthWiseYear(_uniqueMonthWiseYears);
    setFunnelChart(monthlyData);
    setMasterSplitData({ ..._tempSplitDataStore });
    setLoader(false);
  };

  const formatNumberWithCommas = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const ErrFunctions = (error: any, text: string) => {
    console.log(error, text);
    setLoader(false);
  };

  // Charts Functions
  const wonLostOption = {
    chart: {
      title: " ",
    },
    colors: ["#34b734", "#cd2121"],
  };

  const IndustryOption = {
    title: "Industry",
  };

  const LeadSourceOption = {
    title: "Lead Source",
  };

  const init = () => {
    setLoader(true);
    DealsData();
  };

  useEffect(() => {
    init();
  }, []);

  return loader ? (
    <Loading />
  ) : (
    <>
      <div className={styles.homePageMain}>
        <div className={styles.homeDashBoard}>
          <div className={styles.dashBoard}>
            <h2>Dashboard</h2>
          </div>
          <div className={styles.allActivites}>
            <div className={styles.committees}>
              <div className={styles.committeesAndIcon}>
                <div
                  className={styles.dashImg}
                  style={{ backgroundColor: "#b16029" }}
                >
                  <img src={TotalCommittiees} alt="no image" />
                </div>
                <h3 title="(+)ve Conversation">{`(+)ve Conversation`}</h3>
              </div>
              <div className={styles.committeesCount}>
                <h3 style={{ color: "#b16029", fontSize: "22px" }}>
                  {masterSplitData?.Converstion?.Data?.length}
                </h3>
                <h3
                  style={{ color: "#b16029" }}
                  className={styles.totalAmount}
                  title={`₹ ${
                    masterSplitData?.Converstion?.Amount
                      ? formatNumberWithCommas(
                          masterSplitData?.Converstion?.Amount
                        )
                      : "00"
                  }`}
                >
                  ₹{" "}
                  {masterSplitData?.Converstion?.Amount
                    ? formatNumberWithCommas(
                        masterSplitData?.Converstion?.Amount
                      )
                    : "00"}
                </h3>
              </div>
            </div>
            <div className={styles.committees}>
              <div className={styles.committeesAndIcon}>
                <div
                  className={styles.dashImg}
                  style={{ backgroundColor: "#3d8941" }}
                >
                  <img src={ActiveCommittiees} alt="no image" />
                </div>
                <h3 title="Analysis">Analysis</h3>
              </div>
              <div className={styles.committeesCount}>
                <h3 style={{ color: "#3d8941", fontSize: "22px" }}>
                  {masterSplitData?.Analysis?.Data?.length}
                </h3>
                <h3
                  style={{ color: "#3d8941" }}
                  className={styles.totalAmount}
                  title={`₹ ${
                    masterSplitData?.Analysis?.Amount
                      ? formatNumberWithCommas(
                          masterSplitData?.Analysis?.Amount
                        )
                      : "00"
                  }`}
                >
                  ₹{" "}
                  {masterSplitData?.Analysis?.Amount
                    ? formatNumberWithCommas(masterSplitData?.Analysis?.Amount)
                    : "00"}
                </h3>
              </div>
            </div>
            <div className={styles.committees}>
              <div className={styles.committeesAndIcon}>
                <div
                  className={styles.dashImg}
                  style={{ backgroundColor: "#bc3636" }}
                >
                  <img src={InactiveCommittiees} alt="no image" />
                </div>
                <h3 title="Quote Submitted">Quote Submitted</h3>
              </div>
              <div className={styles.committeesCount}>
                <h3 style={{ color: "#bc3636", fontSize: "22px" }}>
                  {masterSplitData?.Quote?.Data?.length}
                </h3>
                <h3
                  style={{ color: "#bc3636" }}
                  className={styles.totalAmount}
                  title={`₹ ${
                    masterSplitData?.Quote?.Amount
                      ? formatNumberWithCommas(masterSplitData?.Quote?.Amount)
                      : "00"
                  }`}
                >
                  ₹{" "}
                  {masterSplitData?.Quote?.Amount
                    ? formatNumberWithCommas(masterSplitData?.Quote?.Amount)
                    : "00"}
                </h3>
              </div>
            </div>
            <div
              className={styles.committees}
              style={{ width: "auto", gap: "18px" }}
            >
              <div className={styles.committeesAndIcon}>
                <div
                  className={styles.dashImg}
                  style={{ backgroundColor: "#338c8c" }}
                >
                  <img src={ActiveMembers} alt="no image" />
                </div>
                <h3 title="Won">Deal Counts</h3>
              </div>
              <div className={styles.committeesCount}>
                <div className={styles.dealCount}>
                  <div className={` ${styles.dealCountData}`}>
                    <h2>
                      Below <span>₹4L</span>
                    </h2>
                    <Button>
                      {dealCount.Below5K.toString().length == 1
                        ? `0${dealCount.Below5K}`
                        : dealCount.Below5K}
                    </Button>
                  </div>
                  <div className={styles.dealCountBorder}></div>
                  <div
                    className={`${styles.dealCountAbove5K} ${styles.dealCountData}`}
                  >
                    <h2>
                      Above <span>₹4L</span>
                    </h2>
                    <Button>
                      {dealCount.Above5K.toString().length == 1
                        ? `0${dealCount.Above5K}`
                        : dealCount.Above5K}
                    </Button>
                  </div>
                  <div className={styles.dealCountBorder}></div>
                  <div
                    className={`${styles.dealCountAbove10K} ${styles.dealCountData}`}
                  >
                    <h2>
                      Above <span>₹10L</span>
                    </h2>
                    <Button>
                      {dealCount.Above10K.toString().length == 1
                        ? `0${dealCount.Above10K}`
                        : dealCount.Above10K}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {/* Month wise Graph Chart */}
        <div className={styles.Charts}>
          <div className={styles.monthWiseCountry}>
            <div className={styles.monthWiseChart}>
              {/* Month wise Stage Chart */}
              <div className={styles.monthWiseChartYearDropDown}>
                <Dropdown
                  value={selectedValue.monthWiseYear}
                  placeholder="select a year"
                  onChange={(e: DropdownChangeEvent) => {
                    setSelectedValue((pre) => ({
                      ...pre,
                      monthWiseYear: e.value,
                    }));
                    GetSplitData(
                      masterData,
                      e.value,
                      selectedValue.monthWiseMonth,
                      selectedValue.wonLostYear
                    );
                  }}
                  options={monthWiseYear}
                  className="w-full md:w-14rem"
                />
              </div>
              <div className={styles.monthWiseChartMonthDropDown}>
                <Dropdown
                  value={selectedValue.monthWiseMonth}
                  placeholder="select a month"
                  onChange={(e: DropdownChangeEvent) => {
                    setSelectedValue((pre) => ({
                      ...pre,
                      monthWiseMonth: e.value,
                    }));
                    GetSplitData(
                      masterData,
                      selectedValue.monthWiseYear,
                      e.value,
                      selectedValue.wonLostYear
                    );
                  }}
                  options={funnelMonth}
                  className="w-full md:w-14rem"
                />
              </div>
              <div>
                <CanvasJSChart options={funnelChart} />
              </div>
              <h2 className={styles.chartHead}>Deal Stages</h2>
            </div>

            {/* Country Chart */}
            <div className={styles.countryChart}>
              <div className={styles.countryBackground}>
                <Chart
                  chartEvents={[
                    {
                      eventName: "select",
                      callback: ({ chartWrapper }) => {
                        const chart = chartWrapper.getChart();
                        const selection = chart.getSelection();
                        if (selection.length === 0) return;
                      },
                    },
                  ]}
                  chartType="GeoChart"
                  width="100%"
                  height="380px"
                  data={countryChart}
                />
                <h2 className={styles.chartHead}>Deal Location</h2>
              </div>
            </div>
          </div>

          <div className={styles.choiceWonLostChart}>
            <div className={styles.choiceChart}>
              {/* Industry Chart */}
              <div className={styles.choiceIndustry}>
                <Chart
                  chartType="PieChart"
                  data={industryChart}
                  options={IndustryOption}
                  width={"100%"}
                  height={"400px"}
                />
              </div>
              {/* Lead Source Chart */}
              <div className={styles.choiceLeadSource}>
                <Chart
                  chartType="PieChart"
                  data={leadSourceChart}
                  options={LeadSourceOption}
                  width={"100%"}
                  height={"400px"}
                />
              </div>
              <h2 className={styles.chartHead}>
                Deal based on Industry & Lead Source
              </h2>
            </div>
            {/* won & lost chart */}
            <div className={styles.wonLost}>
              <div className={styles.wonLostBackground}>
                <Chart
                  chartType="Bar"
                  width="100%"
                  height="400px"
                  data={wonLostChart}
                  options={wonLostOption}
                />
              </div>
              <div className={styles.wonLostChartYearDropDown}>
                <Dropdown
                  value={selectedValue.wonLostYear}
                  onChange={(e: DropdownChangeEvent) => {
                    setSelectedValue((pre) => ({
                      ...pre,
                      wonLostYear: e.value,
                    }));
                    GetSplitData(
                      masterData,
                      selectedValue.monthWiseYear,
                      selectedValue.monthWiseMonth,
                      e.value
                    );
                  }}
                  options={wonLostYear}
                  optionLabel="name"
                  placeholder="Select a year"
                  className="w-full md:w-14rem"
                />
              </div>
              <h2 className={styles.chartHead}>Won and Lost</h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
