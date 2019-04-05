import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { DatePicker } from 'antd'

import Moment from 'moment'


class ControlledRangeDatePicker extends Component {

    onChange = (value, comparisonColumnSuffix) => this.props.onChange(value, comparisonColumnSuffix);

    getMoment = (filterKey) => (
        this.props.filters[filterKey] ? Moment.fromServer(this.props.filters[filterKey]) : null
    );

    fromMoment = (value) => {
        const m = Moment(value);
        m.set("millisecond", 0);
        return Moment.toServer(m);
    };

    handleStartChange = (value) => (
        this.onChange(this.fromMoment(value), ':gte')
    );

    handleEndChange = (value) => (
        this.onChange(this.fromMoment(value), ':lte')
    );

    handleStartOpenChange = (open) => {
        if (!open && this.props.onPressEnter)
            this.props.onPressEnter(this.props.filters[this.props.columnDataIndex + ':gte'], ":gte");
    };

    handleEndOpenChange = (open) => {
        if (!open && this.props.onPressEnter)
            this.props.onPressEnter(this.props.filters[this.props.columnDataIndex + ':lte'], ":lte");
    };

    render() {

        const { t, columnDataIndex } = this.props;

        return (
            <div>
                <DatePicker
                    showTime
                    placeholder={t('input.date.start')}
                    onChange={this.handleStartChange}
                    value={this.getMoment(columnDataIndex + ':gte')}
                    onOpenChange={this.handleStartOpenChange}
                />
                <DatePicker
                    showTime
                    placeholder={t('input.date.end')}
                    onChange={this.handleEndChange}
                    value={this.getMoment(columnDataIndex + ':lte')}
                    onOpenChange={this.handleEndOpenChange}
                />
            </div>

        );
    }
}

export default withNamespaces()(ControlledRangeDatePicker)