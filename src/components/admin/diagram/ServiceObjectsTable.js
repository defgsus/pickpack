import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'
import { Table } from 'antd'
import {numberSorter, stringSorter} from "../../../utils/table";
import NoWrap from "../../util/NoWrap";


class ServiceObjectsTable extends Component {

    render() {

        const { t, description, disabledObjects } = this.props;

        let dataSource = description ? description.getServiceObjects() : [];

        let countStr = `${dataSource.length}`;
        if (disabledObjects) {
            const filteredDataSource = dataSource.filter(record => !disabledObjects.has(record.object));
            if (filteredDataSource.length !== dataSource.length)
                countStr = `${filteredDataSource.length}/${dataSource.length}`;
            dataSource = filteredDataSource;
        }

        return !description ? null : (
            <div>
                <h3>{t("admin.diagram.serviceObjects")} ({countStr})</h3>
                <Table
                    dataSource={dataSource}
                    columns={this.getTableColumns()}
                    rowKey={(record, i) => i}
                    size={"small"}
                />
            </div>
        );
    }

    getTableColumns = () => {
        const { t, description } = this.props;
        return [
            {
                title: t("admin.diagram.object"),
                dataIndex: "object",
                sorter: stringSorter("object"),
            },
            {
                title: t("admin.diagram.state"),
                dataIndex: "state",
                sorter: stringSorter("state"),
            },
            {
                title: <NoWrap>{t("admin.diagram.numIn")}</NoWrap>,
                dataIndex: "numIn",
                sorter: numberSorter("numIn"),
            },
            {
                title: <NoWrap>{t("admin.diagram.numOut")}</NoWrap>,
                dataIndex: "numOut",
                sorter: numberSorter("numOut"),
            }
        ]
    }
}


export default withNamespaces()(ServiceObjectsTable);
