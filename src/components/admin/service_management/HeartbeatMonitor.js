import React, { Component } from 'react'

import { Button, Table, Radio, Divider, Tag, Alert } from 'antd'
import Chart from "react-apexcharts"

import Protected from "containers/auth/KProtected"
import { getDateColumn } from "utils/table"
import { MomentExactStr } from "utils/Moment"
import RestError from "components/util/RestError"


let _request_timeout = null;


export default class HeartbeatMonitor extends Component {

    componentDidMount() {
        this.autoRequestData();
        this.props.getSeriesData(this.props.series.params);
    }

    componentWillUnmount() {
        if (_request_timeout)
            clearTimeout(_request_timeout);
    }

    autoRequestData = () => {
        this.props.getLatestData();

        if (_request_timeout)
            clearTimeout(_request_timeout);
        _request_timeout = setTimeout(this.autoRequestData, 3000);
    };

    setSeriesParam(name, value) {
        const params = {
            ...this.props.series.params,
            [name]: value
        };
        if (params.resolution === "m" && params.seconds > 60*60)
            params.resolution = "h";
        if (params.resolution === "h" && params.seconds > 60*60*24*7)
            params.resolution = "d";
        this.props.setSeriesParams(params);
        this.props.getSeriesData(params);
    }

    render() {
        const { latest, series } = this.props;

        return (
            <Protected permission={"service.heartbeat.read"} verbose>
                <Button
                    onClick={(e)=>{
                        e.preventDefault();
                        this.autoRequestData();
                    }}
                >
                    Update
                </Button>

                {latest.data && this.renderLatest(latest.data)}
                {series && this.renderSeries(series)}

                {/*<pre>{JSON.stringify(this.props, null, " ")}</pre>*/}

            </Protected>
        );
    }

    renderLatest = (latest) => {
        const { rows, num_all_heartbeats, error} = latest;

        return (
            <>
                <RestError error={error}/>

                {num_all_heartbeats && <p>{num_all_heartbeats} heartbeats in database</p>}

                {rows && this.renderTable(rows)}
            </>
        );
    };

    renderSeries = (series_obj) => {
        const { response, params } = series_obj;

        return (
            <>
                <hr/>

                <RestError error={response.error}/>

                <Radio.Group
                    value={params.seconds}
                    onChange={(e) => {this.setSeriesParam("seconds", e.target.value)}}
                >
                    <span style={{marginRight: ".5rem"}}>{"range"}</span>
                    <Radio.Button value={60*60}>{"1 hour"}</Radio.Button>
                    <Radio.Button value={60*60*24}>{"24 hours"}</Radio.Button>
                    <Radio.Button value={60*60*48}>{"48 hours"}</Radio.Button>
                    <Radio.Button value={60*60*24*7}>{"1 week"}</Radio.Button>
                    <Radio.Button value={60*60*24*30}>{"1 month"}</Radio.Button>
                </Radio.Group>

                <Divider type={"vertical"}/>

                <Radio.Group
                    value={params.resolution}
                    onChange={(e) => {this.setSeriesParam("resolution", e.target.value)}}
                >
                    <span style={{marginRight: ".5rem"}}>{"resolution"}</span>
                    {params.seconds <= 60*60 && <Radio.Button value={"m"}>{"minutes"}</Radio.Button>}
                    {params.seconds <= 60*60*24*7 && <Radio.Button value={"h"}>{"hours"}</Radio.Button>}
                    <Radio.Button value={"d"}>{"days"}</Radio.Button>
                </Radio.Group>

                {params.node_name && <>
                    <Divider type={"vertical"}/>
                    <Tag
                        closable
                        onClose={(e)=>this.setSeriesParam("node_name", null)}
                    >{params.node_name}</Tag>
                </>}

                {response.data && response.data.series && this.renderChart(response.data.series)}
            </>
        );
    };

    renderChart = (series) => {
        return <>
            <Chart
                height={300}
                type={"bar"}
                options={{
                    //title: {text: "Heartbeats in last 24 hours"},
                    chart: {
                        id: "heartbeat_series",
                        //background: "#f9f9f9",
                    },
                    xaxis: {
                        categories: series.x.map(d=>MomentExactStr(d)),
                    }
                }}
                series={[
                    {
                        name: "heartbeats",
                        data: series.y,
                    }
                ]}
            />
        </>
    };

    renderTable = (rows) => {
        const columns = [
            {
                title: "Node name",
                dataIndex: "node_name",
                sorter: (a, b) => (a.node_name.toLowerCase() < b.node_name.toLowerCase()) ? -1 : 1,
                render: (text, record, index) => (
                    <b>{text}</b>
                ),
            },
            getDateColumn({title: "Started", dataIndex: "date_started"}),
            {
                title: 'Last seen',
                dataIndex: 'last_seen',
                sorter: (a, b) => (b - a),
                render: (text, record) => `${parseInt(record.last_seen)}s ago`,
            },
            {
                title: 'Services',
                dataIndex: 'service_names',
                render: (text, record, index) => (
                    record.service_names.join(", ")
                )
            },
        ];

        return (
            <Table
                dataSource={rows}
                columns={columns}
                rowKey={record => record.node_name}
                pagination={false}
                onRowClick={record=>this.setSeriesParam("node_name", record["node_name"])}
                rowClassName={
                    (record)=>record.node_name === this.props.series.params.node_name
                        ? "ant-table-row-selected" : null
                }
            />
        )
    };
}
