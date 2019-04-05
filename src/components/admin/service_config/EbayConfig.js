import React, {Component} from 'react'
import { withNamespaces } from 'react-i18next'

import { Alert, Input, Icon, Button, Steps, Checkbox, DatePicker } from 'antd'

import Moment from 'utils/Moment'

import Protected from "containers/auth/KProtected"
import RestError from "components/util/RestError"
import ConForm from "components/form/ConForm"
import { deepCompare } from "utils/objects"
import { MomentExact } from "utils/Moment"
import { K3_BASE_HOSTNAME } from "config"
import K3_ROUTES from "Routes"


export const EBAY_OAUTH_SCOPES = {
    "https://api.ebay.com/oauth/api_scope":	"View public data from eBay",
    "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly":	"View your eBay marketing activities, such as ad campaigns and listing promotions",
    "https://api.ebay.com/oauth/api_scope/sell.marketing": "View and manage your eBay marketing activities, such as ad campaigns and listing promotions",
    "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly": "View your inventory and offers",
    "https://api.ebay.com/oauth/api_scope/sell.inventory": "View and manage your inventory and offers",
    "https://api.ebay.com/oauth/api_scope/sell.account.readonly": "View your account settings",
    "https://api.ebay.com/oauth/api_scope/sell.account": "View and manage your account settings",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly": "View your order fulfillments",
    "https://api.ebay.com/oauth/api_scope/sell.fulfillment": "View and manage your order fulfillments",
    "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly": "View your selling analytics data, such as performance reports",
};



class EbayConfig extends Component {

    state = {
        currentStep: 0,
        maxStep: 1,
    };

    componentDidMount() {
        this.props.getActivation();
        this.props.getAuth();
        this.props.getAuthStatus();
    }

    setCurrentStep = (currentStep) => {
        this.setState({currentStep});
        this.props.getAuthStatus();
    };

    componentDidUpdate = () => {
        let maxStep = 1;

        if (this.props.statusResponse.data) {
            const status = this.props.statusResponse.data;
            if (status.has_authorization_config) {
                maxStep = 2;
                if (status.has_authorization) {
                    maxStep = 3;
                }
            }
        }

        if (maxStep !== this.state.maxStep)
            this.setState({maxStep: maxStep});
    };

    getStepStatus = (step) => {
        const { t } = this.props;
        if (step === 0)
            return {
                "ready": true,
            };
        if (!this.props.statusResponse.data)
            return {
                "ready": false,
                "message": t("admin.config.ebay.statusNotReady"),
            };
        const status = this.props.statusResponse.data;

        if (step === 1) {
            if (status.has_authorization_config)
                return {"ready": true};
            return {
                "ready": false,
                "message": t("admin.config.ebay.provideAuthConfig"),
            }
        }
        if (step === 2) {
            if (!status.has_authorization)
                return {
                    "ready": false,
                    "message": t("admin.config.ebay.needAuthConsent"),
                };
            if (!status.api_is_responding)
                return {
                    "ready": false,
                    "message": t("admin.config.ebay.apiNotWorking") + " " + status.api_error,
                };
        }
        if (step === 3) {
            return {
                "ready": true,
            };
        }
        return {
            "ready": true,
        };
    };

    render() {

        const { t } = this.props;

        const steps = [
            {
                key: "configureApp",
                title: t("admin.config.ebay.configureApp"),
                help: t("admin.config.ebay.configureAppHelp"),
                component: () => this.renderConfigureApp(),
            },
            {
                key: "editAppCredentials",
                title: t("admin.config.ebay.editAppCredentials"),
                help: t("admin.config.ebay.editAppCredentialsHelp"),
                component: () => this.renderAppCredentialsForm(),
            },
            {
                key: "authorizeApp",
                title: t("admin.config.ebay.authorizeApp"),
                help: t("admin.config.ebay.authorizeAppHelp"),
                component: () => this.renderAuthorization(),
            },
            {
                key: "activateService",
                title: t("admin.config.ebay.activateService"),
                help: t("admin.config.ebay.activateServiceHelp"),
                component: () => this.renderActivation(),
            },
        ];
        const { currentStep, maxStep } = this.state;
        const stepStatus = this.getStepStatus(currentStep);

        return (
            <Protected permission={"ebay.config.read"} verbose>

                <hr/>

                <Steps
                    current={currentStep}
                    status={stepStatus.ready ? "finished" : "error"}
                >
                    {steps.map((step, i) => {
                        const canGoThere = i <= maxStep;
                        return <Steps.Step
                            key={step.key}
                            title={step.title}
                            onClick={canGoThere ? () => this.setCurrentStep(i) : null}
                            style={canGoThere ? {cursor: "pointer"} : null}
                        />
                    })}
                </Steps>

                <hr/>

                <div>
                    <div className={"grid-x"}>
                        <div className={"cell small-12 medium-8"}>
                            <h2>{steps[currentStep].title}</h2>
                        </div>
                        <div className={"cell small-12 medium-4"}>
                            <Button
                                type={"primary"}
                                disabled={currentStep+1 > maxStep}
                                onClick={() => this.setCurrentStep(currentStep+1)}
                            >
                                {t("admin.config.ebay.nextStep")} <Icon type={"arrow-right"}/>
                            </Button>
                        </div>

                    </div>

                    {!stepStatus.ready && <Alert
                        type={"error"}
                        message={stepStatus.message}
                        style={{marginBottom: "1rem"}}
                    />}
                    {steps[currentStep].help && <p>{steps[currentStep].help}</p>}

                    {steps[currentStep].component()}
                </div>

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

    renderConfigureApp = () => {
        const { t } = this.props;

        const hostName = K3_BASE_HOSTNAME.startsWith("http")
            ? K3_BASE_HOSTNAME
            : `https:${K3_BASE_HOSTNAME}`;

        const urls = {
            [t("admin.config.ebay.urlPrivacyPolicy")]: `${hostName}`,
            [t("admin.config.ebay.urlAuthAccept")]: `${hostName}${K3_ROUTES.ADMIN.SERVICE_CONFIG.EBAY_OAUTH_CALLBACK}`,
            [t("admin.config.ebay.urlAuthDecline")]: `${hostName}${K3_ROUTES.ADMIN.SERVICE_CONFIG.EBAY}`,
        };

        return (
            <>
                <h3>{t("admin.config.ebay.redirectUrls")}</h3>
                {Object.keys(urls).map(key => (
                    <p key={key}>{key}: <b>{urls[key]}</b></p>
                ))}
            </>
        );
    };

    renderAppCredentialsForm = () => {
        const {
            t,
            setAuth, editAuthForm,
        } = this.props;
        const { form, getResponse, setResponse } = this.props.auth;

        if (getResponse.error)
            return <RestError error={getResponse.error}/>;

        const noChange = deepCompare(getResponse.data, form);

        const fieldsDef = {
            "authorize_url": {
                label: t("admin.config.ebay.authorizeUrl"),
                rules: [
                    {required: true},
                ]
            },
            "token_url": {
                label: t("admin.config.ebay.tokenUrl"),
                rules: [
                    {required: true},
                ]
            },
            "app_id": {
                label: t("admin.config.ebay.appId"),
                rules: [
                    {required: true},
                ]
            },
            "client_id": {
                label: t("admin.config.ebay.clientId"),
                rules: [
                    {required: true},
                ]
            },
            "dev_id": {
                label: t("admin.config.ebay.devId"),
                rules: [
                    {required: true},
                ]
            },
            "cert_id": {
                label: t("admin.config.ebay.certId"),
                rules: [
                    {required: true},
                ]
            },
            "ru_name": {
                label: t("admin.config.ebay.ruName"),
                help: t("admin.config.ebay.ruNameHelp"),
                rules: [
                    {required: true},
                ]
            },
            "oauth_scopes": {
                label: t("admin.config.ebay.oauthScopes"),
                help: t("admin.config.ebay.oauthScopesHelp"),
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
                    onFieldChange={(key, value) => editAuthForm({[key]: value})}
                    onSubmit={values => setAuth(values)}
                >
                    <ConForm.Field fieldId={"authorize_url"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"token_url"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"app_id"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"client_id"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"dev_id"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"cert_id"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"ru_name"}>
                        <Input/>
                    </ConForm.Field>

                    <ConForm.Field fieldId={"oauth_scopes"}>
                        <Input.TextArea/>
                    </ConForm.Field>

                    <Protected permission={"ebay.config.write"}>
                        <ConForm.IfValid>
                            <Button
                                type={"primary"}
                                htmlType={"submit"}
                                disabled={noChange}
                            >
                                {t("admin.config.editCredentialsSubmit")}
                            </Button>
                        </ConForm.IfValid>
                    </Protected>
                </ConForm>

                <RestError error={setResponse.error}/>

            </div>
        );
    };

    renderAuthorization = () => {
        const { t } = this.props;
        const { form, getResponse } = this.props.auth;
        const status = this.props.statusResponse.data;
        const auth = getResponse.data || {};

        return (
            <div>
                <div>
                    {auth.refresh_token && (<>
                        <h3>
                            <Icon type={"check-circle"} style={{color: "green"}}/> {t("admin.config.ebay.refreshToken")}
                        </h3>
                        <p>{auth.refresh_token}</p>
                        {auth.refresh_token_expires && <p>{t("admin.config.ebay.validUntil")}: {MomentExact(auth.refresh_token_expires)}</p>}
                    </>)}
                </div>

                <div>
                    {auth.access_token && (<>
                        <h3>
                            <Icon type={"check-circle"} style={{color: "green"}}/> {t("admin.config.ebay.accessToken")}
                        </h3>
                        <p>{auth.access_token}</p>
                        {auth.access_token_expires && <p>{t("admin.config.ebay.validUntil")}: {MomentExact(auth.access_token_expires)}</p>}
                    </>)}
                </div>

                <Protected permission={"ebay.config.write"}>
                    <Button
                        type={"primary"}
                        disabled={!status || !status.has_authorization_config}
                        onClick={this.requestAuthorization}
                    >
                        {status && status.has_authorization
                            ? t("admin.config.ebay.requestAuthorizationAgain")
                            : t("admin.config.ebay.requestAuthorization")
                        }
                    </Button>
                </Protected>

                {status && status.api_response && <pre>{JSON.stringify(status.api_response, null, 2)}</pre>}
            </div>
        );
    };

    requestAuthorization = () => {
        const { getResponse } = this.props.auth;
        if (!getResponse.data)
            return;
        const data = getResponse.data;

        const url =
            `${data.authorize_url}` +
            `?client_id=${encodeURIComponent(data.client_id)}` +
            `&redirect_uri=${encodeURIComponent(data.ru_name)}` +
            `&response_type=code` +
            `&state=${encodeURIComponent(data.state)}` +
            `&scope=${encodeURIComponent(data.oauth_scopes.split("\n").join(" "))}` +
            `&prompt=login`;

        window.location = url;
    };
}

export default withNamespaces()(EbayConfig);