import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthProvider';
import React from "react";
import 'reactjs-popup/dist/index.css';
import axios from "axios";
import Cookies from "universal-cookie";
import Button from "react-bootstrap/Button";
import Popup from "reactjs-popup"
import Form from "react-bootstrap/Form"
import Plot from "react-plotly.js";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(RGL);

const Dashboard = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [listOfDatas, setListOfDatas] = useState([]);
    const [chartType, setChartType] = useState([]);
    const [chartTitles, setChartTitles] = useState([]);
    const [layout, setLayout] = useState(() => {
        const savedLayout = localStorage.getItem('dashboardLayout');
        return savedLayout ? JSON.parse(savedLayout) : [];
    });
    const [currentLayout, setCurrentLayout] = useState(() => {
        const savedLayout = localStorage.getItem('dashboardLayout');
        return savedLayout ? JSON.parse(savedLayout) : [];
    });
    const [isLoading, setIsLoading] = useState(true);
    const cookies = new Cookies();
    const navigate = useNavigate();

    const [rawConfigs, setRawConfigs] = useState([]);
    const [removeOptions, setRemoveOptions] = useState([]);
    const [selectedRemoveTicker, setSelectedRemoveTicker] = useState("");
    const [selectedRemoveOption, setSelectedRemoveOption] = useState("");

    const chartTypeLocal = [];
    const timePeriodMap = new Map([
        ["1d","1 day"],
        ["5d","5 days"],
        ["1mo","1 month"],
        ["3mo","3 month"],
        ["6mo","6 month"],
        ["1y","1 year"],
        ["2y","2 years"],
        ["5y","5 years"],
        ["10y","10 years"],
        ["ytd","Year-to-date"],
        ["max","Maximum"]
    ])

    const timeIntervalMap = new Map([
        ['1m', '1 minute'],
        ['5m', '5 minutes'],
        ['15m', '15 minutes'],
        ['30m', '30 minutes'],
        ['60m', '1 hour'],
        ['1h', '1 hour'],
        ['90m', '1.5 hours'],
        ['1d', '1 day'],
        ['5d', '5 days'],
        ['1wk', '1 week'],
        ['1mo', '1 month'],
        ['3mo', '3 months'],
        ['1y', '1 year'],
        ['2y', '2 years'],
        ['5y', '5 years'],
        ['10y', '10 years'],
        ['ytd', 'Year-to-date'],
        ['max', 'Maximum']
    ]);


    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (isAuthenticated === undefined) {
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await axios.get("https://127.0.0.1:8000/dashboard", {
                    headers: { Authorization: cookies.get("access") }
                });

                const listOfConfigs = response.data.split(";").filter(item => item !== "");
                setRawConfigs(listOfConfigs);
                const tickerSymbols = [];
                const timePeriods = [];
                const timeIntervals = [];
                const chartTitles = [];
                console.log("CONFIGS", listOfConfigs);

                listOfConfigs.forEach(config => {
                    const json = JSON.parse(config);
                    chartTypeLocal.push(json["chartType"]);
                    tickerSymbols.push(json["tickerSymbol"].toUpperCase());
                    timePeriods.push(json["timePeriod"]);
                    timeIntervals.push(json["timeInterval"]);
                    
                    chartTitles.push(
                        `${timePeriodMap.get(json["timePeriod"])} stock data for ${json["tickerSymbol"].toUpperCase()} in ${timeIntervalMap.get(json["timeInterval"])} increments`
                    );
                });

                setChartTitles(chartTitles);

                const requests = chartTypeLocal.map((_, i) => {
                    const data = {
                        tickerSymbol: tickerSymbols[i],
                        timePeriod: timePeriods[i],
                        timeInterval: timeIntervals[i]
                    };
                    return axios.post("https://127.0.0.1:8000/stocks/", data);
                });

                const responses = await Promise.all(requests);
                const fetchedData = responses.map(res => res.data);

                setListOfDatas(fetchedData);
                setChartType(chartTypeLocal);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        if (isLoading) {
            fetchDashboardData();
        }
    }, [navigate, layout, currentLayout]);

    const onDragStop = (newLayout) => {
        setLayout(newLayout);
    }

    const saveLayout = () => {
        console.log("...", layout);
        setCurrentLayout(layout);
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
        navigate(0);
    };

    const removePanel = (event) => {
        event.preventDefault();
        console.log("Removing panel for: ", selectedRemoveTicker, selectedRemoveOption);
        axios.post("https://127.0.0.1:8000/dashboard/remove", 
            { "chartType": selectedRemoveOption.split(":")[0], 
                "tickerSymbol": selectedRemoveTicker, 
                "timePeriod": selectedRemoveOption.split(": ")[1].split(" period")[0], 
                "timeInterval": selectedRemoveOption.split(", ")[1].split(" intervals")[0] }
            , { headers: { Authorization: cookies.get("access") } })
        .then(response => {
            if(response.data.message == "Panel removed"){
              console.log("Panel remove: success");
            }
            else{
              console.log("Panel remove: failure");
            }
          })
          .catch(error => {
            console.error('Error removing panel, please try again.', error);
          });
        localStorage.removeItem("dashboardLayout");
        navigate(0);
    };

    const getConfigsForTicker = (event) => {
        const { value } = event.target;
        setSelectedRemoveTicker(value.toUpperCase());
        const options = [];
        rawConfigs.forEach(config => {
            const json = JSON.parse(config);
            const ticker = json["tickerSymbol"];
            if (ticker === value.toUpperCase()) {
                options.push(json["chartType"] + ": " + json["timePeriod"] + " period, " + json["timeInterval"] + " intervals");
            }
        });
        setRemoveOptions(options);
    }

    if (isLoading) {
        return <h1>Loading Dashboard...</h1>;
    }

    return (
        <>
            <h1>Dashboard</h1>
            <Button className="m-1" onClick={saveLayout}>Save Layout</Button>
            <Popup trigger=
                {<Button className="m-1">Remove Panel</Button>}
                position="right center">
                <Form onSubmit={removePanel}>
                    <Form.Label>Ticker Symbol</Form.Label>
                    <Form.Control required onChange={getConfigsForTicker} type="text"/>
                    <Form.Label>Time Period, Time Interval</Form.Label>
                    <Form.Select required onChange={e => setSelectedRemoveOption(e.target.value)}>
                        <option value="" disabled selected>Select an option</option>
                        {removeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Form.Select>
                    <Button className="mt-3" type="submit">Remove</Button>
                </Form>
            </Popup>
            <ReactGridLayout 
                className="layout" 
                cols={3} 
                rowHeight={400} 
                width={2000}
                layout={currentLayout}
                isResizable={false}
                onDragStop={onDragStop}
            >
                {listOfDatas.map((data, index) => (
                    <div key={index}>
                        {chartType[index] === "line" ? (
                            <Plot
                                data={[
                                    {
                                        x: data.dates,
                                        y: data.close,
                                        type: 'line',
                                        mode: 'lines',
                                        marker: { color: 'blue' },
                                    },
                                ]}
                                layout={{ width: 650, height: 400, title: chartTitles[index] }}
                            />
                        ) : chartType[index] === "candle" ? (
                            <Plot
                                data={[
                                    {
                                        x: data.dates,
                                        close: data.close,
                                        decreasing: { line: { color: 'red' } },
                                        high: data.high,
                                        increasing: { line: { color: 'green' } },
                                        low: data.low,
                                        open: data.open,
                                        type: 'candlestick',
                                    },
                                ]}
                                layout={{
                                    width: 650, height: 400,
                                    dragmode: 'zoom',
                                    margin: { r: 10, t: 25, b: 40, l: 60 },
                                    showlegend: false,
                                    title: chartTitles[index],
                                    xaxis: { autorange: true, type: 'date' },
                                    yaxis: { autorange: true, type: 'linear' },
                                }}
                            />
                        ) : null}
                    </div>
                ))}
            </ReactGridLayout>
        </>
    );
};

export default Dashboard;
