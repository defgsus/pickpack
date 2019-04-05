import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import LazyInput from "components/inputs/LazyInput"
import { isValidDecimal } from "utils/decimal"


class ControlledDecimalRangeInput extends Component {

    decimalValidator = (value) => {
        return !value || isValidDecimal(value);
    };

    render() {

        let { t, filters, filterKey } = this.props;

        return (
            <div>
                <LazyInput
                    allowClear={ true }
                    onChange={(e) => this.props.onChange(e, ':gte')}
                    onPressEnter={(e) => this.props.onPressEnter(e, ':gte')}
                    value={filters[filterKey + ':gte'] || null}
                    placeholder={t('input.startValue')}
                    validator={this.decimalValidator}
                />
                <LazyInput
                    allowClear={ true }
                    onChange={(e) => this.props.onChange(e, ':lte')}
                    onPressEnter={(e) => this.props.onPressEnter(e, ':lte')}
                    value={filters[filterKey + ':lte'] || null}
                    placeholder={t('input.endValue')}
                    validator={this.decimalValidator}
                />
            </div>
        );
    }
}

export default withNamespaces()(ControlledDecimalRangeInput);