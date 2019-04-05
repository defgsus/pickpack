import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Input } from 'antd'

import LazyInput from "components/inputs/LazyInput"


class ControlledRangeIntegerPicker extends Component {

    integerValidator = (value) => {
        return !value || value.match(/^\-?[0-9]*$/);
    };

    render() {

        let { filters, filterKey, t } = this.props;

        return (
            <div>
                <LazyInput
                    allowClear={ true }
                    onChange={(e) => this.props.onChange(e, ':gte')}
                    onPressEnter={(e) => this.props.onPressEnter(e, ':gte')}
                    value={filters[filterKey + ':gte']}
                    placeholder={t('input.startValue')}
                    validator={this.integerValidator}
                />
                <LazyInput
                    allowClear={ true }
                    onChange={(e) => this.props.onChange(e, ':lte')}
                    onPressEnter={(e) => this.props.onPressEnter(e, ':lte')}
                    value={filters[filterKey + ':lte']}
                    placeholder={t('input.endValue')}
                    validator={this.integerValidator}
                />
            </div>
        );
    }
}

export default withNamespaces()(ControlledRangeIntegerPicker)