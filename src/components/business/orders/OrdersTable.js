import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import K3_ROUTES from "Routes"
import KConTable from 'containers/table/KConTable'
import NoWrap from "components/util/NoWrap"
import K3_TABLES from "../../../tablesConfig";


const t = x=>x;
const _translationKeys = [
    t('TABLE.BUSINESS.ORDERS.channel'),
    t('TABLE.BUSINESS.ORDERS.channel_id'),
    t('TABLE.BUSINESS.ORDERS.date_channel_created'),
    t('TABLE.BUSINESS.ORDERS.date_channel_updated'),
    t('TABLE.BUSINESS.ORDERS.date_created'),
    t('TABLE.BUSINESS.ORDERS.date_updated'),
    t('TABLE.BUSINESS.ORDERS.uuid'),
    t('TABLE.BUSINESS.ORDERS.order_id'),
    t('TABLE.BUSINESS.ORDERS.channel_order_id'),
    t('TABLE.BUSINESS.ORDERS.state'),
    t('TABLE.BUSINESS.ORDERS.channel_fulfillment_status'),
    t('TABLE.BUSINESS.ORDERS.channel_payment_status'),
    t('TABLE.BUSINESS.ORDERS.fulfillment_status'),
    t('TABLE.BUSINESS.ORDERS.payment_status'),
    t('TABLE.BUSINESS.ORDERS.tax_rate'),
    t('TABLE.BUSINESS.ORDERS.tax_rate_country'),
    t('TABLE.BUSINESS.ORDERS.fulfillment_type'),
    t('TABLE.BUSINESS.ORDERS.customer.email'),
    t('TABLE.BUSINESS.ORDERS.customer.id'),
    t('TABLE.BUSINESS.ORDERS.customer.name'),
    t('TABLE.BUSINESS.ORDERS.total_item_count'),
    t('TABLE.BUSINESS.ORDERS.total_price'),
    t('TABLE.BUSINESS.ORDERS.total_net_price'),
    t('TABLE.BUSINESS.ORDERS.total_tax'),
    t('TABLE.BUSINESS.ORDERS.total_discount'),
    t('TABLE.BUSINESS.ORDERS.total_line_price'),
    t('TABLE.BUSINESS.ORDERS.total_shipping_price'),
    t('TABLE.BUSINESS.ORDERS.shipping_address_lines'),
    t('TABLE.BUSINESS.ORDERS.billing_address_lines'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.name'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.gender'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.company_name'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.street'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.extra1'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.extra2'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.extra3'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.postcode'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.city'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.country'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.county'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.province'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.phone'),
    t('TABLE.BUSINESS.ORDERS.shipping_address.email'),
    t('TABLE.BUSINESS.ORDERS.billing_address.name'),
    t('TABLE.BUSINESS.ORDERS.billing_address.gender'),
    t('TABLE.BUSINESS.ORDERS.billing_address.company_name'),
    t('TABLE.BUSINESS.ORDERS.billing_address.street'),
    t('TABLE.BUSINESS.ORDERS.billing_address.extra1'),
    t('TABLE.BUSINESS.ORDERS.billing_address.extra2'),
    t('TABLE.BUSINESS.ORDERS.billing_address.extra3'),
    t('TABLE.BUSINESS.ORDERS.billing_address.postcode'),
    t('TABLE.BUSINESS.ORDERS.billing_address.city'),
    t('TABLE.BUSINESS.ORDERS.billing_address.country'),
    t('TABLE.BUSINESS.ORDERS.billing_address.county'),
    t('TABLE.BUSINESS.ORDERS.billing_address.province'),
    t('TABLE.BUSINESS.ORDERS.billing_address.phone'),
    t('TABLE.BUSINESS.ORDERS.billing_address.email'),
    t('TABLE.BUSINESS.ORDERS.item_skus'),
];


class OrdersTable extends Component {

    handleDetailClick = (record) => {
        this.props.setPath(K3_ROUTES.BUSINESS.SALES.ORDER_DETAIL + "/" + record.uuid);
    };

    splitNewline = (text, record) => (
        text.split("\n").map((item, i) => (
            <NoWrap key={i} style={{display: "block"}}>{item}</NoWrap>
        ))
    );

    cellRender = {
        "item_skus": this.splitNewline,
        "shipping_address_lines": this.splitNewline,
        "billing_address_lines": this.splitNewline,
    };

    render() {

        const { t } = this.props;

        const dropdownButtonActions = [
            {
                key: 'action_1',
                title: 'action 1',
                iconType: 'user'
            },
            {
                key: 'action_2',
                title: 'action 2',
                iconType: 'lock'
            },
            {
                key: 'action_3',
                title: 'action 3',
                iconType: 'printer'
            }
        ];

        return (
            <KConTable
                dropdownButtonActions = { dropdownButtonActions }
                {...this.props}
                tableName={K3_TABLES.BUSINESS.ORDERS.tableName}
                tableTitle={ t('nav.orders') }
                onDetailClick={this.handleDetailClick}
                cellRender={this.cellRender}
            />
        )
    }
}

export default withNamespaces('app')(OrdersTable)