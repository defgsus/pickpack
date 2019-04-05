import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Select } from 'antd'

class ConSelect extends Component {

    onColumnFilter(valueArray) {
        const value = valueArray.join()
        this.props.onColumnFilter(value)
    }



    render() {

        const { selectChildrenArray, t } = this.props

        const selectChildren = selectChildrenArray.map(selectChild => (
            <Select.Option key={ selectChild }>
                { selectChild }
           </Select.Option>
        ))

        return (
            <Select
                defaultValue={ selectChildrenArray[0] }
                value={ this.props.value ? this.props.value.split(',') : [] }
                onChange={(value) => this.onColumnFilter(value) }
                mode={'multiple'}
                style={{'width': '100%', 'minWidth': '20 rem'}}
                dropdownMatchSelectWidth={false}
                showArrow={true}
                allowClear={true}
                placeholder={t('input.select')}
            >
                { selectChildren }
            </Select>
        )
    }
}

export default withNamespaces()(ConSelect)