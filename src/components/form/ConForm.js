import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'

import AsyncValidator from 'async-validator'
AsyncValidator.warning = function(){};

import { withNamespaces } from 'react-i18next'

import { Form, Input, Select, Button } from 'antd'

import { valueFromEvent } from "./domhelper"
import { deepCompare, deepCopy } from "utils/objects"


export const ITEM_STYLES = {
    "inline": {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 18 },
        },
    },
};


export const contextTypes = {
    onChange: PropTypes.any,
    values: PropTypes.object,
    fields: PropTypes.object,
    errors: PropTypes.object,
    itemProps: PropTypes.object,
};


/**
    # Controlled Form Component

    Basic usage example:
        state = {
            value1: "text",
            value2: true,
        };
        ...
        <ConForm
            values: {this.state.values}
            onFieldChange: {(key, value) => this.setState({[key]: value})}
            onSubmit: {values => console.log(values)}
        >
            <ConForm.Field fieldId="value1">
                <input>
            </ConForm.Field>

            <ConForm.Field fieldId="value2" valueName="checked">
                <input type="checkbox">
            </ConForm.Field>

            <ConForm.IfValid>
                <button htmlType="submit">submit</button>
            </ConForm.IfValid>
        </ConForm>

    Attributes:
        values - object with key-value mapping, required
        fields - optional field configuration with values:
            rules - a list of async-validator rules
            label - The label to display for the input
            help - A help text below the input - will not be shown on validation errors
            extra - additional help text below the input - will also be shown on validation errors
            error - optional error text
            disabled - disable the input
            valueName - name of the enclosed input's value attribute
            onChangeName - name of the enclosed input's onChange handler
        itemStyle - optional string to style the contained antd `Form.Item`s.
            (options: "inline")
        itemProps - optional custom props for all contained antd `Form.Item`s.
        onFieldChange - callback `function(key, value)` when a field value should change
            from a user input.
        onValidation - callback to receive result of validation: `function(bool, errors)`
            where errors is an object mapping fieldId to an array of error messages.
        onSubmit - callback `function(object)` with key-value mapping

 */
class ConForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allErrors: props.errors
        };
    }

    static propTypes = {
        values: PropTypes.object.isRequired,
        fields: PropTypes.object,
        itemProps: PropTypes.object,
        itemStyle: PropTypes.string,
        onFieldChange: PropTypes.func.isRequired,
        onValidation: PropTypes.func,
        onSubmit: PropTypes.func,
    };

    static childContextTypes = contextTypes;

    getChildContext() {
        let itemProps = this.props.itemProps;
        if (ITEM_STYLES[this.props.itemStyle]) {
            itemProps = {
                ...itemProps,
                ...ITEM_STYLES[this.props.itemStyle]
            };
        }
        return {
            values: this.props.values,
            fields: this.props.fields,
            itemProps: itemProps,
            errors: this.state.allErrors,
            onChange: this.handleFieldChange,
        };
    }

    componentDidMount() {
        if (this.props.values)
            this.validate(this.props.values);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.values && !deepCompare(prevProps.values, this.props.values))
            this.validate(this.props.values);
    }

    validate = (values) => {
        if (!values || !this.props.fields)
            return;
        const keysWithRules = Object.keys(values).filter(
            key => this.props.fields[key] && !!this.props.fields[key].rules
        );
        if (keysWithRules.length) {
            const descriptor = keysWithRules.reduce((obj, key) => {
                obj[key] = this.patchRules(this.props.fields[key].rules);
                return obj;
            }, {});

            const validator = new AsyncValidator(descriptor);
            validator.validate(
                values,
                (errors, fields) => {
                    let allErrors = this.props.errors
                        ? deepCopy(this.props.errors) : {};
                    for (const i in errors) {
                        const e = errors[i];
                        if (!allErrors[e.field])
                            allErrors[e.field] = [];
                        allErrors[e.field].push(e.message);
                    }
                    this.setState({allErrors});

                    if (this.props.onValidation) {
                        this.props.onValidation(
                            !Object.keys(allErrors).length,
                            allErrors
                        );
                    }
                }
            );
        }
    };

    patchRules = (rules) => {
        return rules.map(this.patchRule);
    };

    patchRule = (rule) => {
        // avoid displaying the fieldId in async-validator's default message
        if (rule.required && !rule.message)
            rule.message = this.props.t("form.thisFieldRequired");
        return rule;
    };

    handleFieldChange = (key, event) => {
        const value = valueFromEvent(event);
        let newValues = deepCopy(this.props.values);
        newValues[key] = value;
        this.validate(newValues);
        if (this.props.onFieldChange)
            this.props.onFieldChange(key, value);
    };

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.props.onSubmit)
            this.props.onSubmit(this.props.values);
    };

    render() {
        return (
            <Form
                onSubmit={this.handleSubmit}
            >
                {this.props.children}
            </Form>
        );
    }
}


class ConnectedField extends Component {
    static contextTypes = contextTypes;

    static propTypes = {
        fieldId: PropTypes.string.isRequired,
        valueName: PropTypes.string,
        onChangeName: PropTypes.string,
        label: PropTypes.string,
        help: PropTypes.string,
        extra: PropTypes.string,
        error: PropTypes.string,
        disabled: PropTypes.bool,
        itemProps: PropTypes.object,
    };

    getFieldDef = (fieldId) => {
        const field = this.context.fields ? this.context.fields[fieldId] : null;
        return field ? field : {};
    };

    getFieldError = (fieldId) => {
        const errors = this.context.errors ? this.context.errors[fieldId] : null;
        if (!errors)
            return null;
        if (typeof errors === "string")
            return errors;
        if (errors.length === 0)
            return null;
        if (errors.length === 1)
            return errors[0];
        return errors.join(". ");
    };

    render() {
        const {
            fieldId,
            valueName,
            onChangeName,
            label, help, extra, error,
            disabled,
            itemProps,
        } = this.props;

        const { values, onChange } = this.context;

        const fieldDef = this.getFieldDef(fieldId);
        const fieldError = this.getFieldError(fieldId);

        let inputProps = {
            [valueName || fieldDef.valueName || "value"]:
                values[fieldId],
            [onChangeName || fieldDef.onChangeName || "onChange"]:
                (e) => onChange(fieldId, e),
            disabled: disabled || fieldDef.disabled,
        };

        const thisItemProps = itemProps || this.context.itemProps || {};

        return (
            <Form.Item
                label={label || fieldDef.label}
                help={error || fieldError || help || fieldDef.help}
                extra={extra || fieldDef.extra}
                validateStatus={error || fieldError ? "error" : "success"}
                disabled={disabled || fieldDef.disabled}
                {...thisItemProps}
            >
                {React.cloneElement(
                    Children.only(this.props.children),
                    inputProps
                )}
            </Form.Item>
        );
    }

}

class IfValid extends Component {
    static contextTypes = contextTypes;

    render() {
        let elemProps = {};

        if (this.context.errors && Object.keys(this.context.errors).length)
            elemProps.disabled = true;

        return (
            <>
                {Children.toArray(this.props.children).map(c => (
                    React.cloneElement(c, elemProps)
                ))}
            </>
        );
    }
}

const ConFormWrapper = withNamespaces()(ConForm);

ConFormWrapper.Field = ConnectedField;
ConFormWrapper.IfValid = IfValid;

export default ConFormWrapper;