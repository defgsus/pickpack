import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Input, Spin, Button, Tabs, Checkbox } from 'antd'

import Protected from "containers/auth/KProtected"
import RestError from "components/util/RestError"
import ConForm from "components/form/ConForm"


class ProductMapperConfig extends Component {

    componentDidMount() {
        this.props.getConfig(this.props.category);
        this.props.getActivation();
    }

    render() {

        const { t, category, changeCategory, getResponse } = this.props;

        const tabs = [
            ["celostats", "Celostats REST (magento DB)"],
            ["magento", "Magento XML API"]
        ];

        return (
            <Protected permission={"product_mapper.config.read"} verbose>

                <h2>{t("admin.config.product_mapper.editActivation")}</h2>

                {this.renderActivation()}

                <hr/>
                <h2>{t("admin.config.product_mapper.editCredentials")}</h2>

                <Tabs
                    activeKey={category}
                    onChange={val => changeCategory(val)}
                >
                    {tabs.map(key_name => (
                        <Tabs.TabPane key={key_name[0]} tab={key_name[1]}>
                            {getResponse.error
                                ? <RestError error={getResponse.error}/>
                                : (
                                    <>
                                        {getResponse.inProgress
                                            ? <Spin size={"large"} className={"center"}/>
                                            : this.renderForm(key_name[0])
                                        }
                                    </>
                                )
                            }
                        </Tabs.TabPane>
                    ))}
                </Tabs>

            </Protected>
        );
    }

    renderActivation = () => {
        const {
            t,
            activation,
            setActivation,
        } = this.props;
        const state = activation.getResponse && activation.getResponse.data;

        return (
            <div>
                <RestError error={activation.getResponse.error}/>
                <RestError error={activation.setResponse.error}/>
                {state && Object.keys(state).map(key => (
                    <Checkbox
                        key={key}
                        checked={state[key]}
                        onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActivation(key, e.target.checked);
                        }}
                    >
                        {key}
                    </Checkbox>
                ))}
            </div>
        )
    };

    renderForm = (configId) => {
        const {
            t,
            form, getResponse, setResponse,
            setConfig, editForm,
        } = this.props;

        const fieldsDef = {
            "host": {
                label: t("admin.config.hostUrl"),
                help: t("admin.config.hostUrlHelp"),
                rules: [
                    {required: true},
                ]
            },
            "http_auth_user": {
                label: t("admin.config.httpAuthUser"),
            },
            "http_auth_password": {
                label: t("admin.config.httpAuthPassword"),
                rules: [
                    {required: !!form.http_auth_user},
                ]
            },
            "username": {
                label: t("admin.config.username"),
                rules: [
                    {required: true},
                ]
            },
            "password": {
                label: t("admin.config.password"),
                rules: [
                    {required: true},
                ]
            },
        };

        return (
            <div>
                <ConForm
                    fields={fieldsDef}
                    values={form}
                    onFieldChange={(key, value) => editForm({[key]: value})}
                    onSubmit={values => setConfig(configId, values)}
                >
                    <ConForm.Field fieldId={"host"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"http_auth_user"}>
                        <Input/>
                    </ConForm.Field>

                    <Protected permission={"product_mapper.config.write"}>
                        <ConForm.Field fieldId={"http_auth_password"}>
                            <Input.Password/>
                        </ConForm.Field>
                    </Protected>

                    <ConForm.Field fieldId={"username"}>
                        <Input/>
                    </ConForm.Field>

                    <Protected permission={"product_mapper.config.write"}>
                        <ConForm.Field fieldId={"password"}>
                            <Input.Password/>
                        </ConForm.Field>

                        <ConForm.IfValid>
                            <Button
                                type={"primary"}
                                htmlType={"submit"}
                            >
                                {t("admin.config.editCredentialsSubmit")}
                            </Button>
                        </ConForm.IfValid>
                    </Protected>
                </ConForm>

                <RestError error={setResponse.error}/>

            </div>
        )
    };
}

export default withNamespaces()(ProductMapperConfig);