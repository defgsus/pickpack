import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Button, Input, Select, Switch } from 'antd'

import Protected from "containers/auth/KProtected"
import RestError from 'components/util/RestError'
import JsonTree from "../data/JsonTree";
import ConForm from "../form/ConForm";
import {K3_BASE_HOSTNAME} from "../../config";


class EndpointQuery extends Component {

    getFieldDef = () => {
        const { t } = this.props;
        return {
            "url": {
                label: t("endpoint_query.url"),
                rules: [
                    {required: true},
                    {validator: this.urlValidator},
                ]
            },
            "params_text": {
                label: t("endpoint_query.parameters"),
                help: t("endpoint_query.params_as_json"),
                rules: [
                    {required: true},
                    {validator: this.paramsValidator},
                ]
            },
            "urlencode": {
                label: t("endpoint_query.url_encode"),
                help: t("endpoint_query.url_encode_help"),

            },
            "django": {
                label: t("endpoint_query.django"),
                help: t("endpoint_query.django_help"),

            },
        };
    };

    urlValidator = (rule, value, callback) => {
        if (!value.startsWith(K3_BASE_HOSTNAME))
            callback(`Must start with ${K3_BASE_HOSTNAME}`);
        else
            callback();
    };

    paramsValidator = (rule, value, callback) => {
        try {
            JSON.parse(value);
            callback();
        }
        catch (e) {
            callback(`${e}`);
        }
    };

    handleSubmit = (values) => {
        this.props.performRequest({
            url: values.url,
            method: values.method,
            params: JSON.parse(values.params_text),
            urlencode: values.urlencode,
            django: values.django,
        })
    };

    render() {

        const { t, edit, response, setValues, performRequest } = this.props;

        const isQueryParamMethod = /(GET)(HEAD)/.test(edit.method);

        return (
            <Protected permission={"admin.endpoints.write"} verbose>

                <ConForm
                    values={edit}
                    fields={this.getFieldDef()}
                    itemStyle={"inline"}
                    onSubmit={this.handleSubmit}
                    onFieldChange={(key, value) => setValues({[key]: value})}
                >
                    <ConForm.Field
                        fieldId={"url"}
                    >
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"params_text"}
                    >
                        <Input.TextArea
                            rows={4}
                            style={{fontFamily: "monospace"}}
                        />
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"urlencode"}
                        valueName={"checked"}
                        disabled={isQueryParamMethod}
                    >
                        <Switch/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"django"}
                        valueName={"checked"}
                    >
                        <Switch/>
                    </ConForm.Field>

                    <ConForm.Field
                        fieldId={"method"}
                        label={t("endpoint_query.method")}
                    >
                        <Select>
                            {["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS", "HEAD"].map(method => (
                                <Select.Option value={method} key={method}>{method}</Select.Option>
                            ))}
                        </Select>
                    </ConForm.Field>

                    <ConForm.IfValid>
                        <Button
                            htmlType={"submit"}
                            type={"primary"}
                            loading={response.inProgress}
                        >
                            {edit.method}
                        </Button>
                    </ConForm.IfValid>

                </ConForm>

                <RestError error={response.error}/>

                {response.data && <JsonTree data={response.data}/>}

            </Protected>
        );
    }
}

export default withNamespaces()(EndpointQuery)
