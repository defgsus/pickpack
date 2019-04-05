import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'

import { Select, Button, Form, Icon } from 'antd'
import { setLanguage } from "utils/i18n"


class LanguageForm extends Component {

    handleSetLanguage = (value) => {
        setLanguage(value);
    }

    render() {

        const { t } = this.props;

        return (

            <Form layout="vertical">
                <Form.Item>
                    <Icon className="login-language-label" type="global" />
                    <Select
                        onChange={this.handleSetLanguage}
                        defaultValue={navigator.language.split('-')[0]}
                        size={"small"}
                    >
                        <Select.Option
                            value={'de'}
                        >
                            {t("nav.german")}
                        </Select.Option>
                        <Select.Option
                            value={'en'}
                        >
                            {t("nav.english")}
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        )}
}

export default withNamespaces('app')(Form.create()(LanguageForm))