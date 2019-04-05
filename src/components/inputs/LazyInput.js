import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'

import { Input } from 'antd'
import _ from 'lodash'

import "./style/inputs.scss"


/** Simple wrapper around antd's Input component with debounced onChange event */
class LazyInput extends Component {

    static propTypes = {
        value: PropTypes.any,
        onChange: PropTypes.func.isRequired,
        onPressEnter: PropTypes.func,
        validator: PropTypes.func,
        delay: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            typedValue: props.value,
            lastPropsValue: props.value,
        };
        this._debouncers = {};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.lastPropsValue !== this.props.value)
            this.setState({
                "typedValue": this.props.value,
                "lastPropsValue": this.props.value,
            });
    }

    sendOnChange = (event) => {
        const delay = this.props.delay || 350;
        if (!this._debouncers[delay])
            this._debouncers[delay] = _.debounce(
                (event) => {
                    if (this.props.onChange)
                        this.props.onChange(event);
                },
                delay,
            );
        this._debouncers[delay](event);
    };

    onChangeHandler = (e) => {
        this.setState({typedValue: e.target.value});
        e.persist();
        this.sendOnChange(e);
    };

    isValid = () => {
        return !this.props.validator || this.props.validator(this.state.typedValue);
    };

    removeFromProps = [
        // remove i18next stuff from props for childs
        "t", "tReady", "i18nOptions", "reportNS", "defaultNS",
        // own props
        "validator"
    ];

    render() {
        const childProps = Object.keys(this.props).reduce((props, key) => {
            if (this.removeFromProps.indexOf(key) < 0)
                props[key] = this.props[key];
            return props;
        }, {});

        return (
            <Input
                {...childProps}
                value={this.state.typedValue}
                onChange={this.onChangeHandler}
                className={this.isValid() ? "" : "invalid"}
            />
        );
    }
}


export default withNamespaces()(LazyInput);
