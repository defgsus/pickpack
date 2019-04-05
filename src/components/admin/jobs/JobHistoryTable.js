import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Button, Checkbox, Tag } from 'antd'

import Protected from "containers/auth/KProtected"
import { MomentExact, MomentFromNow } from "utils/Moment"

import K3_TABLES from "tablesConfig"
import ConTable from "containers/table/KConTable"
import NoWrap from "components/util/NoWrap"

const t = x=>x;
const _translationKeys = [
    t('TABLE.ADMIN.SYSTEM.JOB_HISTORY.name'),
    t('TABLE.ADMIN.SYSTEM.JOB_HISTORY.date'),
    t('TABLE.ADMIN.SYSTEM.JOB_HISTORY.status'),
    t('TABLE.ADMIN.SYSTEM.JOB_HISTORY.message'),
    t('TABLE.ADMIN.SYSTEM.JOB_HISTORY.error'),
];


class JobHistoryTable extends Component {

    handleRowClick(record) {
        this.console.log(record);
    }

    cellRender = {
        "message": (text, record) => <>{
            Object.keys(record["message"]).map(key => (
                <NoWrap key={key} style={{display: "block"}}>{key}.{record["message"][key].state}</NoWrap>
            ))
        }</>,
    };

    render() {

        const {
            t
        } = this.props;

        return (
            <Protected permission={"service.jobs.read"} verbose>

                <ConTable
                    tableName={K3_TABLES.ADMIN.SYSTEM.JOB_HISTORY.tableName}
                    tableTitle={''}
                    cellRender={this.cellRender}
                />

            </Protected>
        );
    }

}


export default withNamespaces()(JobHistoryTable)