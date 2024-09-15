import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthProvider';
import axios from "axios";
import Cookies from "universal-cookie";
import Button from "react-bootstrap/Button";
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
                    headers: { Authorization: cookies.get("access") },
                    withCredentials: true
                });

                const listOfConfigs = response.data.split(";");
                const tickerSymbols = [];
                const timePeriods = [];
                const timeIntervals = [];
                const chartTitles = [];

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
        setLayout(newLayout)
    }

    const saveLayout = () => {
        console.log("...", layout)
        setCurrentLayout(layout);
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
        navigate(0)
    };

    if (isLoading) {
        return <h1>Loading Dashboard...</h1>;
    }

    return (
        <>
            <h1>Dashboard</h1>
            <Button onClick={saveLayout}>Save Layout</Button>
            <ReactGridLayout 
                className="layout" 
                cols={3} 
                rowHeight={400} 
                width={2000}
                layout={currentLayout}
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
