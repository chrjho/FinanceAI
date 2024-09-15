import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import Button from "react-bootstrap/Button"
import axios, { AxiosHeaders } from "axios"
import Plot from "react-plotly.js"
import { useDebounce } from 'use-debounce';
import Cookies from "universal-cookie"

const Explore = () => {

    const [tickerInput, setTickerSymbol] = useState('');
    const [timePeriod, setTimePeriod] = useState('1d');
    const [timeInterval, setTimeInterval] = useState('1m');
    const [tickerSymbol] = useDebounce(tickerInput, 1000);

    const [chartDates, setChartDates] = useState([]);
    const [chartOpen, setChartOpen] = useState([]);
    const [chartHigh, setChartHigh] = useState([]);
    const [chartLow, setChartLow] = useState([]);
    const [chartClose, setChartClose] = useState([]);

    const cookies = new Cookies();

    const handleRequest = () => {
        if (tickerSymbol != '') {
            const data = ("data:", { tickerSymbol, timePeriod, timeInterval });
            axios.post("https://127.0.0.1:8000/stocks/", data)
                .then(response => {
                    // Axios automatically parses json data can easily access it
                    setChartDates(response.data.dates)
                    setChartOpen(response.data.open)
                    setChartHigh(response.data.high)
                    setChartLow(response.data.low)
                    setChartClose(response.data.close)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    };

    const getData = (event) => {
        const { name, value } = event.target;
        if (name === 'tickerInput') {
            setTickerSymbol(value.toUpperCase());
        } else if (name === 'timePeriod') {
            setTimePeriod(value);
            setTimeInterval(getIntervalOptions(value)[0]);
        } else if (name === 'timeInterval') {
            setTimeInterval(value);
        }
    };

    // useEffect to handle form submission whenever either state changes
    useEffect(() => {
        handleRequest();
    }, [tickerSymbol, timePeriod, timeInterval]);

    const getIntervalOptions = (timePeriod) => {
        switch (timePeriod) {
            case '1d':
            case '5d':
                return ['1m', '5m', '15m', '30m', '1h'];
            case '1mo':
                return ["5m", "15m", "30m", "60m", "90m", "1d"];
            case '3mo':
                return ["1h", "1d", "5d", "1wk", "1mo"];
            case '6mo':
            case '1y':
            case '2y':
                return ["1h", "1d", "5d", "1wk", "1mo", "3mo"];
            case '5y':
            case '10y':
            case 'ytd':
            case 'max':
                return ["1d", "5d", "1wk", "1mo", "3mo"];
            default:
                return [];
        }
    };

    const saveToDashboard = (chartType) => {
        if (tickerSymbol != '') {
            const data = ("data:", { chartType, tickerSymbol, timePeriod, timeInterval });
            console.log("Saving to dashboard: ");
            console.log(data);
            axios.post("https://127.0.0.1:8000/dashboard/save", data, {headers: {Authorization: cookies.get("access")}}, { withCredentials: true})
                .then(response => {
                    console.log("Successfully added chart to dashboard");

                }).catch(error => {
                    console.log("Unable to save to dashboard");
                });
        }
    }

    return (
        <>
            <Form>
                <Row>
                    <Col xs="auto">
                        <Form.Label>Ticker Symbol</Form.Label>
                        <Form.Control onChange={getData} type="text" placeholder="Enter ticker symbol" name="tickerInput" value={tickerInput} />
                    </Col>
                    <Col xs="auto">
                        <Form.Label>Time Period</Form.Label>
                        <Form.Select onChange={getData} name="timePeriod" value={timePeriod}>
                            <option value="1d">1 day</option>
                            <option value="5d">5 days</option>
                            <option value="1mo">1 month</option>
                            <option value="3mo">3 month</option>
                            <option value="6mo">6 month</option>
                            <option value="1y">1 year</option>
                            <option value="2y">2 years</option>
                            <option value="5y">5 years</option>
                            <option value="10y">10 years</option>
                            <option value="ytd">Year-to-date</option>
                            <option value="max">Maximum</option>
                        </Form.Select>
                    </Col>
                    <Col xs="auto">
                        <Form.Label>Time Interval</Form.Label>
                        <Form.Select onChange={getData} name="timeInterval" value={timeInterval}>
                            {getIntervalOptions(timePeriod).map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
            </Form>

            <h1>Stock Data for: {tickerSymbol}</h1>

            <Row>
                <Col xs="auto">
                    <Plot
                        data={[
                            {
                                x: chartDates,
                                y: chartClose,
                                type: 'line',
                                mode: 'lines',
                                marker: { color: 'blue' },
                            },
                        ]}
                        layout={{ width: 800, height: 500 }}
                    />
                    <Button className="mt-4" onClick={() => saveToDashboard("line")}>Save to Dashboard</Button>
                </Col>
                <Col xs="auto">
                    <Plot
                        data={[
                            {
                                x: chartDates,
                                close: chartClose,
                                decreasing: { line: { color: 'red' } },
                                high: chartHigh,
                                increasing: { line: { color: 'green' } },
                                line: { color: 'rgba(31,119,180,1)' },
                                low: chartLow,
                                open: chartOpen,
                                type: 'candlestick',
                                xaxis: 'x',
                                yaxis: 'y'
                            }

                        ]}
                        layout={
                            {
                                width: 800, height: 500,
                                dragmode: 'zoom',
                                margin: {
                                    r: 10,
                                    t: 25,
                                    b: 40,
                                    l: 60
                                },
                                showlegend: false,
                                xaxis: {
                                    autorange: true,
                                    domain: [0, 1],
                                    range: [chartDates[0], chartDates[-1]],
                                    rangeslider: { range: [chartDates[0], chartDates[-1]] },
                                    type: 'date'
                                },
                                yaxis: {
                                    autorange: true,
                                    domain: [0, 1],
                                    type: 'linear'
                                }
                            }
                        }
                    />
                    <Button className="mt-4" onClick={() => saveToDashboard("candle")}>Save to Dashboard</Button>
                </Col>
            </Row>
        </>
    );
};

export default Explore;