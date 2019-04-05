import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'
import { Button, Icon, Select, Input, Divider } from 'antd'

import Moment from "utils/Moment"
import ConForm from 'components/form/ConForm'

import "./styles/UserSettings.scss"


class UserSettings extends Component {

    constructor(props) {
        super(props);
        this.timezoneChoices = Moment.tz.names().map(n => [n, n]);
    }

    getFormsDef = () => {
        const { t } = this.props;
        return [
            {
                label: t("settings.localization"),
                fields: {
                    "language": {
                        label: t("settings.language"),
                        rules: [
                            { required: true },
                        ],
                        component: this.renderSelect([
                            ["de", t("nav.german")],
                            ["en", t("nav.english")]
                        ]),
                    },
                    "timezone": {
                        label: t("settings.timezone"),
                        rules: [
                            { required: true },
                        ],
                        component: this.renderSelect(this.timezoneChoices),
                    }
                },
            },
        ];
    };

    render() {

        const formsDef = this.getFormsDef()
        const { t, login } = this.props

        return (
            <div>
                <div className="user-settings-profile">
                    <img className="avatar-image" src={ login.claims.profile + "?s=180" }/>
                    <div className="user-info">
                        <h2>{ login.user }</h2>
                        <a className="natural" href={ `mailto:${ login.claims.email }` }><Icon
                            type="mail"/>{ login.claims.email }</a>
                    </div>
                </div>

                <div className={"grid-x align-center"}>
                    <div className="cell small-12 medium-6 large-4">
                        <h1>
                        { t('settings.userSettings') }
                    </h1>
                    </div>
                </div>

                { formsDef.map((formDef, i) => (
                    <div key={ i }>{ this.renderForm(formDef) }</div>
                )) }

            </div>
        )
    }

    renderSelect = (choices) => (
        <Select>
            { choices.map(option => (
                <Select.Option
                    value={ option[0] }
                    key={ option[0] }
                >
                    { option[1] }
                </Select.Option>
            )) }
        </Select>
    )

    renderForm = (formDef) => {
        const {
            t,
            form,
            settings,
            changeFormValues,
            storeUserSettings,
        } = this.props

        const valueSet = Object.keys(formDef.fields).reduce((obj, fieldId) => {
            obj[fieldId] = form[fieldId]
            return obj
        }, {})

        const hasChanges = !!Object.keys(formDef.fields).find(
            fieldId => (form[fieldId] !== settings.data[fieldId])
        )

        const resetValues = () => (
            changeFormValues(
                Object.keys(formDef.fields).reduce((obj, fieldId) => {
                    obj[fieldId] = settings.data[fieldId]
                    return obj
                }, {})
            ))

        return (
            <div className={"grid-x align-center"}>
                <div className="cell small-12 medium-6 large-4">
                <h2>
                    {formDef.label}
                </h2>

                <ConForm
                    fields={formDef.fields}
                    values={valueSet}
                    onFieldChange={
                        (key, value) => changeFormValues({[key]: value})}
                    onSubmit={values => storeUserSettings(values, formDef.label)}
                >
                    {Object.keys(formDef.fields).map(fieldId => (
                        <ConForm.Field fieldId={fieldId} key={fieldId}>
                            {formDef.fields[fieldId].component}
                        </ConForm.Field>
                    ))}

                    <div>
                        <Button
                            onClick={resetValues}
                            disabled={!hasChanges}
                        >
                            {t("form.reset")}
                        </Button>

                        <ConForm.IfValid>
                            <Button
                                type={"primary"}
                                htmlType={"submit"}
                                loading={settings.inProgress}
                                disabled={!hasChanges}
                            >
                                {t("form.save")}
                            </Button>
                        </ConForm.IfValid>
                    </div>
                </ConForm>

            </div>
            <Divider />
            </div>
        )
    }
}

export default withNamespaces()(UserSettings)
