import React, {Component} from 'react'
import { Table, Button, Checkbox, Tag } from 'antd'

import Protected from "containers/auth/KProtected"
import { getDateColumn } from "utils/table"
import { MomentExact, MomentFromNow } from "utils/Moment"
import RestError from "components/util/RestError"
import {stringSorter} from "../../../utils/table";


let _request_timeout = null;

const FORMAT_MULTIPLIER = {
    "m": 1,
    "h": 60,
    "d": 60*24,
    "w": 60*24*7,
};

export default class JobRequestsTable extends Component {

    componentDidMount() {
        this.requestData();
    }

    componentWillUnmount() {
        if (_request_timeout)
            clearTimeout(_request_timeout);
    }

    requestData = () => {
        this.props.updateData();

        if (_request_timeout)
            clearTimeout(_request_timeout);
        _request_timeout = setTimeout(this.requestData, 10000);
    };

    activateJob = (jobName, active) => {
        this.props.activateJob(jobName, active);
    };

    handleRowClick(record) {
        this.props.editJob({
            name: record.name,
            date_start: "",
            repeat: record.repeat ? `${record.repeat}${record.repeat_format}` : "",
            message: JSON.stringify(record.message, null, " "),
        })
    }

    render() {

        const {
            data,
            error,
            inProgress,
            updateData,
            deleteResponse,
        } = this.props;

        return (
            <Protected permission={"service.jobs.read"} verbose>

                <div style={{ marginBottom: "1rem" }}>
                    <Button
                        onClick={(e)=>{ e.preventDefault(); updateData(); }}
                        loading={inProgress}
                    >Update</Button>
                </div>

                <RestError error={error}/>
                <RestError error={deleteResponse.error}/>

                {data && data.scheduler && this.renderJobSchedulerInfo(data.scheduler)}

                {data && data.jobs && this.renderJobRequestsTable(data.jobs)}
            </Protected>
        );
    }

    renderJobSchedulerInfo = (data) => (
        <div style={{margin: "1rem"}}>
            <Tag>{"last run"}: <b>{!data.date_last_run ? "-" : MomentExact(data.date_last_run)}</b></Tag>
            <Tag>{"next run in"}: <b>{data.next_interval}s</b></Tag>
            <Tag>{"jobs recently started"}: <b>{!data.jobs_started ? "-": data.jobs_started.join(", ")}</b></Tag>
        </div>
    );

    renderJobRequestsTable = (job_requests) => {
        const dataSource = job_requests.map(
            (request) => ({
                ...request,
                actions: (
                    <Protected permission={"service.jobs.write"}>
                        <a onClick={()=>(this.props.deleteJob(request.name))}>Delete</a>
                    </Protected>
                ),
            })
        );

        const columns = [
            {
                title: "Active",
                dataIndex: "active",
                render: (text, record, index) => (
                    <Checkbox
                        checked={record.active}
                        onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.activateJob(record.name, e.target.checked);
                        }}
                    />
                ),
            },
            {
                title: 'Name',
                dataIndex: 'name',
                sorter: stringSorter("name"),
                render: (text, record, index) => (<b>{text}</b>),
            },
            getDateColumn({title: "Created", dataIndex: "date_created"}),
            getDateColumn({title: "Updated", dataIndex: "date_updated"}),
            getDateColumn({title: "Next run", dataIndex: "date_next_run"}),
            getDateColumn({title: "Last run", dataIndex: "date_last_run"}),
            {
                title: 'Cron',
                dataIndex: 'cron',
                render: text => <pre>{text}</pre>
            },
            getDateColumn({title: "Start at", dataIndex: "date_start"}),
            {
                title: '# Runs',
                dataIndex: 'num_runs',
                render: (text, record, index) => (
                    record.num_runs ? text : 0
                )
            },
            {
                title: 'Repeat',
                dataIndex: 'repeat',
                sorter: (a, b) => (
                    a.repeat * FORMAT_MULTIPLIER[a.repeat_format]
                    - b.repeat * FORMAT_MULTIPLIER[b.repeat_format]
                ),
                render: (text, record, index) => (
                    !record.repeat ? "-" :
                        `${record.repeat}${record.repeat_format}`
                ),
            },
            {
                title: 'Message',
                dataIndex: 'message',
                render: (text, record, index) => (
                    Object.keys(record.message).map((key) => (
                        `${key}.${record.message[key].state}`
                    )).join(", ")
                )
            },
            {
                title: 'Actions',
                dataIndex: 'actions',
            },
        ];

        return (
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={record => record.name}
                onRow={(record, index) => {
                    return {
                        onClick: (e) => {e.preventDefault(); this.handleRowClick(record); },
                    };
                }}
            />
        )
    };

}
