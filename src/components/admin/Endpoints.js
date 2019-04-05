import React, {Component} from 'react';
import { withNamespaces } from 'react-i18next'

import { Table, Divider, Button, Input, Icon, Switch } from 'antd';

import Protected from "containers/auth/KProtected";
import EndpointQuery from "containers/admin/KEndpointQuery"
import { getAutoColumns } from "utils/table"
import { stringSorter } from "utils/table"
import { replaceAll } from "utils/string"
import RestError from "components/util/RestError"

import {K3_BASE_HOSTNAME} from "config"


class Endpoints extends Component {

    componentDidMount() {
        this.props.updateData();
    }

    handleRowClick = (record) => {
        console.log(record);
        const url = `${K3_BASE_HOSTNAME}/api/${replaceAll(record.node, "_", "-")}${record.url}`;
        this.props.setQueryValues({url, method: record.method});
    };

    render() {

        const {
            t,
            filter,
            response: { data, error, inProgress },
            updateData, changeFilter,
        } = this.props;

        return (
            <Protected permission={"admin.endpoints.read"} verbose>

                <div className={"grid-x grid-margin-x"}>
                    <div className={"cell shrink"}>
                        <Button
                            onClick={(e)=>{ e.preventDefault(); updateData(); }}
                            loading={inProgress}
                        >{t("admin.endpoints.updateData")}</Button>
                    </div>
                    <div className={"cell small-12 medium-auto large-4"}>
                        <Input
                            prefix={<Icon type={"filter"}/>}
                            value={filter.string}
                            allowClear={true}
                            onChange={(e) => {
                                e.preventDefault();
                                changeFilter({string: e.target.value});
                            }}
                        />
                    </div>
                    <div className={"cell shrink"}>
                        <div>
                            <Switch
                                checked={filter.showDoc}
                                onChange={checked => changeFilter({showDoc: checked})}
                            />
                            &nbsp;{t("admin.endpoints.showDocumentation")}
                        </div>
                    </div>
                    <div className={"cell auto"}>
                        <div style={{float: "right"}}>
                            {this.renderStatus()}
                        </div>
                    </div>
                </div>

                <RestError error={error}/>

                {data && data.endpoints && this.renderEndpoints(data.endpoints, filter)}

                <Divider/>

                <EndpointQuery/>

                {/*<pre>{endpoints && JSON.stringify(endpoints, null, " ")}</pre>*/}

            </Protected>
        );
    }

    renderStatus = () => {

        const {
            t, response: {data, error, inProgress},
        } = this.props;

        const errors = data && data.endpoints && Object.keys(data.endpoints).filter(
            key => !!data.endpoints[key].error
        );
        const ready = !(errors && errors.length);

        return (
            <>
                <Icon type={ready ? "check-circle" : "warning"} style={{color: ready ? "green" : "crimson"}}/>
                {errors && errors.length ? <div>
                    {t("admin.endpoints.offline")}: <b>{errors.join(", ")}</b>
                </div> : null}
            </>
        );
    };

    renderEndpoints = (endpoints, filter) => {
        const { t } = this.props;

        let dataSource = [];
        for (const pod_name in endpoints) {

            let checkFilter = false;
            if (filter.string && pod_name.indexOf(filter.string) < 0)
                checkFilter = true;

            const data = endpoints[pod_name];
            if (!data.urls) {
                if (!checkFilter)
                    dataSource.push({
                        "node": pod_name,
                        "error": data.error,
                    });
            }
            else
            {
                dataSource = dataSource.concat(
                    data.urls
                    .filter(url => (
                        url.name !== "internal_index"
                        && (!checkFilter || url.url.indexOf(filter.string) >= 0)
                    ))
                    .map(url => {
                        return {
                            "node": pod_name,
                            "method": url.method,
                            "url": url.url,
                            "name": url.name,
                            "doc": url.doc,
                            "permissions": url.auth && url.auth.permissions,
                        }
                    })
                );
            }
        }
        const columns = [
            {
                title: t("admin.endpoints.nodeName"),
                dataIndex: "node",
                sorter: stringSorter("node"),
                render: (text) => <b>{text}</b>,
            },
            {
                title: t("admin.endpoints.method"),
                dataIndex: "method",
                sorter: stringSorter("method"),
            },
            {
                title: t("admin.endpoints.url"),
                dataIndex: "url",
                sorter: stringSorter("url"),
                render: (text) => <b>{text}</b>,
            },
            {
                title: t("admin.endpoints.permissions"),
                dataIndex: "permissions",
                render: (text, record) => record.permissions
                    ? <ul>{record.permissions.map((p) => <li key={p}><b>{p}</b></li>)}</ul>
                    : "-"
            },
            /*{
                title: t("admin.endpoints.name"),
                dataIndex: "name",
                sorter: stringSorter("name"),
            },*/
            filter.showDoc && {
                title: t("admin.endpoints.doc"),
                dataIndex: "doc",
                sorter: stringSorter("doc"),
                render: this.renderDocString,
            },
            {
                title: t("admin.endpoints.error"),
                dataIndex: "error",
                sorter: stringSorter("error"),
                render: text => <span style={{"color": "crimson"}}>{text}</span>
            },
        ].filter(c => !!c);

        return (
            <Table
                size={"small"}
                dataSource={dataSource}
                columns={columns}
                rowKey={(record, i) => i}
                pagination={false}
                onRow={(record, rowIndex) => {
                    return {
                        onClick: (event) => {event.preventDefault(); this.handleRowClick(record); },
                    };
                }}
            />
        )
    };

    renderDocString = (text) => {
        if (!text)
            return null;
        return <pre>{text}</pre>;
    };
}

export default withNamespaces()(Endpoints)