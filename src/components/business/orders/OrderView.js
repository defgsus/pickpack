import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import {
    Button,
    DatePicker,
    Dropdown,
    Icon,
    Input,
    Menu,
    message,
    Pagination,
    Popover,
    Select,
    Table,
    Tooltip,
    Tabs
} from 'antd'

import Protected from "containers/auth/KProtected"

import K3_ROUTES from "Routes"
import { MomentExact } from "utils/Moment"
import JsonTree from "components/data/JsonTree"
import RestError from "components/util/RestError"


class OrderView extends Component {

    componentDidMount() {
        this.props.updateData(this.props.match.params.order_uuid);
    }

    handleBackClick = (e) => {
        e.stopPropagation();
        this.props.setPath(K3_ROUTES.BUSINESS.SALES.ORDERS)
    };

    render() {
        const { t, match, response } = this.props;

        return (<>
            <h2>
                <Icon
                    type={"left"}
                    style={{cursor: "pointer"}}
                    onClick={this.handleBackClick}
                />
                {t("order.orderDetail")} {match.params.order_uuid}
            </h2>
            <Protected permission={"orders.detail.read"}>
                <RestError error={response.error}/>
                <JsonTree
                    data={response.data}
                />
            </Protected>
        </>);
    }
}

export default withNamespaces('app')(OrderView)
