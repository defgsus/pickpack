import React, {Component} from 'react'
import Konsum3000Logo from 'static/k3000-logo.svg'
import { withNamespaces } from 'react-i18next'
import {
    Form, Icon, Input, Button, Alert} from 'antd'

import { setLanguage } from "../../i18n"

import LanguageForm from "components/auth/LanguageForm"

import 'scss/grid.scss'
import './styles/Login.scss'


let _request_timeout = null;


function cookieExists(name)
{
    return document.cookie.indexOf(name) !== -1;
}


class LoginForm extends Component {

    constructor(props) {
        super(props);
        this.state = { currentLanguage: navigator.language.split('-')[0] }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const username = values.username;
            const password = values.password;
            this.props.dispatchLogin(username, password);
        })
    };

    componentDidMount() {
        setLanguage(this.state.currentLanguage)
    }

    componentWillUnmount() {
        if (_request_timeout)
            clearTimeout(_request_timeout);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        if (this.props.error) {

            // network error?
            if (this.props.error.status !== 401) {
                if (_request_timeout)
                    clearTimeout(_request_timeout);
                _request_timeout = setTimeout(this.props.tryRestoreSession, 4000);
            }
            // access denied? - don't try again
            else if (_request_timeout)
                clearTimeout(_request_timeout);
        }

        // recovered from network error?
        if (!this.props.error && prevState.error && prevState.error.status !== 401)
            if (this.props.session || cookieExists("sessionid"))
                this.props.tryRestoreSession();
    }


    render() {

        return (
            <div>
                <div className="grid-x grid-padding-x align-right login-language-switcher">
                    <div className="cell shrink">
                        <LanguageForm/>
                    </div>
                </div>
                {this.renderLoginForm()}
            </div>
        )
    }

    renderLoginForm = () => {
        const { t, error, in_progress, silentError, form: { getFieldDecorator } } = this.props;

        let error_message = null;
        let showInputs = true;
        if (error) {
            if (error.status === 401) {
                error_message = t("login.unauthorized");
            }
            else {
                error_message = t("login.network_error");
                showInputs = false;
            }
        }

        return (
            <Form
                onSubmit={this.handleSubmit}
                className="login-form"
            >
                <Konsum3000Logo style={{
                    margin: "0 auto 2rem",
                    display: "block",
                    maxWidth: "50%",
                    fill: "crimson",
                }}/>

                {!showInputs && <Icon type={"loading"} style={{
                    fontSize: "5rem",
                    margin: "1rem auto",
                    color: "#ffe6e4",
                    display: "block",
                }}/>}

                <div hidden={!showInputs}>

                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: t('login.enter_username') }],
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder={t("login.username")}
                            />
                        )}
                    </Form.Item>

                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: t('login.enter_password') }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password" placeholder={t("login.password")}
                            />
                        )}
                    </Form.Item>

                    <div className="grid-x grid-margin-x align-right">
                        <div className="cell shrink">
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="login-form-button"
                                    loading={in_progress}
                                    disabled={in_progress}
                                >
                                    {t("login.login")}
                                </Button>
                            </Form.Item>
                        </div>
                    </div>

                </div>

                {error_message && !silentError
                    ? (
                        <Alert
                            type={"error"} message={error_message}
                        />
                    )
                    : null
                }
            </Form>
        );
    }
}


export default withNamespaces('app')(Form.create()(LoginForm))
