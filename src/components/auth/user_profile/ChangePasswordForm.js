import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'
import { Alert, Button, Divider, Icon, Input, notification, Select } from 'antd'

import i18n from 'utils/i18n'

import ConForm from 'components/form/ConForm'

import RestError from "components/util/RestError"
import Protected from "containers/auth/KProtected"


class ChangePasswordForm extends Component {

    validateNewPasswords = (password, passwordRepeat, callback) => {
        if (!this.props.form.oldPassword)
            callback();
        else if (passwordRepeat && password !== passwordRepeat)
            callback(this.props.t('settings.passwordsMustBeEqualError'));
        else
            callback();
    };

    getFieldsDef = () => {
        const { t, form } = this.props;
        return {
            "oldPassword": {
                label: t("settings.oldPassword"),
                rules: [
                    {required: !!this.props.form.newPassword}
                ]
            },
            "newPassword": {
                label: t("settings.newPassword"),
                rules: [
                    {required: !!form.oldPassword},
                    {validator: (rule, value, callback) => {
                        this.validateNewPasswords(
                            value,
                            form.newPasswordRepeat,
                            callback,
                        )
                    }},
                ]
            },
            "newPasswordRepeat": {
                label: t("settings.repeatNewPassword"),
                rules: [
                    { required: !!form.oldPassword },
                    {validator: (rule, value, callback) => {
                        this.validateNewPasswords(
                            form.newPassword,
                            value,
                            callback,
                        )
                    }},
                ]
            }
        };
    };

    render() {
        const { t, form, changeFormValues, changeOwnPassword } = this.props;

        return (
            <div>
                <h2>{t("settings.changePassword")}</h2>

                <ConForm
                    fields={this.getFieldsDef()}
                    values={form}
                    onFieldChange={(key, value) => changeFormValues({[key]: value})}
                    onSubmit={() => changeOwnPassword(form.oldPassword, form.newPassword)}
                >
                    <ConForm.Field
                        fieldId={ "oldPassword" }
                    >
                        <Input.Password
                            prefix={
                                <Icon
                                    type="lock"
                                />}
                            placeholder={ t("settings.oldPassword") }
                        />
                    </ConForm.Field>
                    <ConForm.Field
                        fieldId={ "newPassword" }
                    >
                        <Input.Password
                            prefix={
                                <Icon
                                    type="lock"
                                /> }
                            placeholder={ t("settings.newPassword") }
                        />
                    </ConForm.Field>
                    <ConForm.Field
                        fieldId={ "newPasswordRepeat" }
                    >
                        <Input.Password
                            prefix={
                                <Icon
                                    type="lock"
                                /> }
                            placeholder={ t("settings.repeatNewPassword") }
                        />
                    </ConForm.Field>

                    <ConForm.IfValid>
                        <Button
                            type={ 'primary' }
                            htmlType={ 'submit' }
                            disabled={!form.newPassword}
                        >
                            { t("form.save") }
                        </Button>
                    </ConForm.IfValid>

                </ConForm>
            </div>
        );
    }
}

export default withNamespaces()(ChangePasswordForm)
