import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Button, Table, Tabs, Row, Col, Alert } from 'antd'

import Protected from "containers/auth/KProtected"
import RestError from "components/util/RestError"
import JsonTree from "components/data/JsonTree"
import { getAutoColumns, getDateColumn } from "utils/table"
import { bytesToString } from "utils/string"
import {dateSorter, stringSorter} from "../../../utils/table";
import {MomentExact} from "../../../utils/Moment";


let _request_timeout = null;


class ServiceErrors extends Component {

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
        _request_timeout = setTimeout(this.requestData, 10000);
    };

    render() {
        const { t, data, error } = this.props;

        return (
            <Protected permission={"service.error.read"} verbose>

                <h2>{t("service.serviceErrors")}</h2>

                <Button
                    onClick={(e)=>{
                        e.preventDefault();
                        this.requestData();
                    }}
                >
                    Update
                </Button>

                <RestError error={error}/>

                {this.renderTable(data && data.rows)}

                {/*data && <JsonTree data={data}/>*/}

            </Protected>
        );
    }

    renderTable = (rows) => {
        const { t } = this.props;
        const columns = [
            {
                title: t("service.error.dateSeen"),
                dataIndex: "date_seen",
                sorter: dateSorter("date_seen"),
                render: text => MomentExact(text),
            },
            {
                title: t("service.error.message"),
                dataIndex: "message",
                sorter: stringSorter("message"),
            },
            {
                title: t("service.error.exception"),
                dataIndex: "exception",
                render: (text, record) => record.exception && this.renderException(record.exception),
            },
        ];
        return (
            <Table
                columns={columns}
                dataSource={rows}
                rowKey={(record, i) => i}
            />
        );
    };

    renderException = (exc) => {
        return (
            <div>
                <p>{exc.type}: <b>{exc.value}</b></p>
                <ul>
                    {exc.stack.map(e => (
                        <li>
                            <b>{e.code}</b> in {e.scope}
                            <br/>{e.file}:{e.line}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
}


export default withNamespaces()(ServiceErrors)