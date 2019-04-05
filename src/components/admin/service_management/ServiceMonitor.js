import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Button, Table, Tabs, Row, Col, Alert } from 'antd'

import Protected from "containers/auth/KProtected"
import { getAutoColumns, getDateColumn } from "utils/table"
import { bytesToString } from "utils/string"
import JsonTree from "components/data/JsonTree"
import RestError from "components/util/RestError"


let _request_timeout = null;


class ServiceMonitor extends Component {

    state = {
        selected_queue: null
    };

    componentDidMount() {
        this.requestData();
    }

    componentWillUnmount() {
        if (_request_timeout)
            clearTimeout(_request_timeout);
    }

    requestData = () => {
        this.props.getData();

        if (_request_timeout)
            clearTimeout(_request_timeout);
        _request_timeout = setTimeout(this.requestData, 3000);
    };

    onQueueRowClick = (record, index) => {
        this.setState({
            selected_queue: record["name"]
        });
    };

    render() {
        const { data, error, inProgress, deleteResponse } = this.props;

        return (
            <Protected permission={"service.management.read"} verbose>

                <Button
                    onClick={(e)=>{
                        e.preventDefault();
                        this.requestData();
                    }}
                    loading={inProgress}
                >
                    Update
                </Button>

                <RestError error={error}/>

                {data && data.overview && this.renderOverview(data.overview)}

                    <Tabs>
                        <Tabs.TabPane key={1} tab={"Queues"}>
                        {data && data.queues
                         && this.renderTable(data.queues, this.onQueueRowClick, this.renderQueueAction)}
                        {this.state.selected_queue && this.renderQueue(this.state.selected_queue)}
                    </Tabs.TabPane>

                    <Tabs.TabPane key={2} tab={"Bindings"}>
                        {data && data.bindings && this.renderTable(data.bindings)}
                    </Tabs.TabPane>

                    <Tabs.TabPane key={3} tab={"Consumers"}>
                        {data && data.consumers && this.renderTable(data.consumers)}
                    </Tabs.TabPane>
                </Tabs>

                {/*<pre>{JSON.stringify(this.props, null, " ")}</pre>*/}

            </Protected>
        );
    }

    renderQueueAction = (text, record) => {
        return (
            <>
                <Protected permission={"service.queue.delete"}>
                    <a
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.props.deleteQueue(record.name);
                        }}
                    >{this.props.t("admin.service.delete")}</a>
                </Protected>
            </>
        );
    };

    renderTable = (dataSource, onRowClick, action) => {
        let columns = getAutoColumns(dataSource, {
            "name": {
                render: (text) => <b>{text}</b>,
            },
            "rate": {
                render: (text) => `${text}/s`,
            },
            "ackrate": {
                render: (text) => `${text}/s`,
            },
            "idle_since": {
                type: "date-since",
            },
            "memory": {
                render: (text, record) => bytesToString(record.memory),
            }
        });

        if (action)
            columns = [
                {
                    title: "Action",
                    key: "__action",
                    render: action,
                }
            ].concat(columns);

        return (
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={(record, i) => i}
                pagination={false}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: (event) => {event.preventDefault(); if (onRowClick) onRowClick(record, rowIndex); },
                    };
                }}
            />
        )
    };

    renderOverview = (overview) => {
        const _detail = (data, key) => {
            return `${data[key]} (${data[key+"_details"].rate}/s)`;
        };
        const data = [
            [
                [<b>{"version"}</b>],
                ["rabbit-mq", overview.rabbitmq_version],
                ["erlang", overview.erlang_version],
            ],
            [
                [<b>{"objects"}</b>],
                ["channels", overview.object_totals.channels],
                ["connections", overview.object_totals.connections],
                ["consumers", overview.object_totals.consumers],
                ["exchanges", overview.object_totals.exchanges],
                ["queues", overview.object_totals.queues],
            ],
            [
                [<b>messages in queues</b>],
                ["total", _detail(overview.queue_totals, "messages")],
                ["ready", _detail(overview.queue_totals, "messages_ready")],
                ["unacked", _detail(overview.queue_totals, "messages_unacknowledged")],
            ],
            [
                [<b>all-time message stats</b>],
                ["publish", _detail(overview.message_stats, "publish")],
                ["get", _detail(overview.message_stats, "ack")],
                ["get_no_ack", _detail(overview.message_stats, "get_no_ack")],
                ["ack", _detail(overview.message_stats, "ack")],
                ["confirm", _detail(overview.message_stats, "confirm")],

            ],
            [
                [],
                ["deliver", _detail(overview.message_stats, "deliver")],
                ["deliver_get", _detail(overview.message_stats, "deliver_get")],
                ["deliver_no_ack", _detail(overview.message_stats, "deliver_no_ack")],
                ["redeliver", _detail(overview.message_stats, "redeliver")],
                ["unroutable", _detail(overview.message_stats, "return_unroutable")],
            ],
        ];
        return (
            <div>
                {[0,1,2,3,5,6].map(y => (
                    <Row key={y}>
                        {[0,1,2,3,4].map(x => (
                            <Col span={4} key={x}>
                                {x < data.length && y < data[x].length
                                    ? (
                                        data[x][y].length === 2
                                            ? <span>{data[x][y][0]}: <b>{data[x][y][1]}</b></span>
                                            : data[x][y].length === 1 ? data[x][y][0] : null
                                    )
                                    : null
                                }
                            </Col>
                        ))}
                    </Row>
                ))}
            </div>
        );
    };

    renderQueue = (name) => {
        const { queues_raw } = this.props.data;
        if (!queues_raw)
            return null;
        const matching_queues = queues_raw.filter((q) => q.name === name);
        if (matching_queues.length < 1)
            return null;
        const queue = matching_queues[0];

        return <JsonTree data={queue}/>;
    };
}

export default withNamespaces()(ServiceMonitor)
