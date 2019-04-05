import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import KConTable from 'containers/table/KConTable'
import K3_TABLES from "../../../tablesConfig";

class TaxConfigTable extends Component {

    rowKey = (record, i) => i;

    render() {

        const { t } = this.props;

        return (
            <KConTable
                dropdownButtonActions = {null}
                {...this.props}
                tableName={K3_TABLES.BUSINESS.CONFIG.TAX.tableName}
                tableTitle={ t('nav.businessConfigTax') }
                rowKey={this.rowKey}
            />
        )
    }
}

export default withNamespaces()(TaxConfigTable)