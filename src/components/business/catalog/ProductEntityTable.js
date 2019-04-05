import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import KConTable from 'containers/table/KConTable'
import K3_TABLES from "../../../tablesConfig";


const t = x=>x;
const _translations = [
    t("TABLE.BUSINESS.PRODUCT_MAPPER.uid"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.date_created"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.date_updated"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.title"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.magento_sku"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.magento_ean"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.magento_type"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.amazon_sku"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.weight"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.color_variation"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.color_ebay"),
    t("TABLE.BUSINESS.PRODUCT_MAPPER.size_variation"),
];


class ProductEntityTable extends Component {

    render() {

        const { t } = this.props;

        return (
            <KConTable
                {...this.props}
                tableName={K3_TABLES.BUSINESS.PRODUCT_MAPPER.tableName}
                tableTitle={ t('nav.products') }
                rowKey={'uid'}
                cellRender={{
                    "weight": (text, record) => `${text} g`,
                }}
            />
        )
    }
}

export default withNamespaces('app')(ProductEntityTable)