import React, {Component} from 'react'

import {I18nextProvider} from 'react-i18next'

import { LocaleProvider } from 'antd';
import en_US from 'antd/lib/locale-provider/en_US';
import de_DE from 'antd/lib/locale-provider/de_DE';

import i18n from "utils/i18n";


export default class K3LocaleProvider extends Component {

    render() {
        const { children, language } = this.props;
        return (
            <I18nextProvider i18n={i18n}>
                <LocaleProvider locale={language === "de" ? de_DE : en_US}>
                    {children}
                </LocaleProvider>
            </I18nextProvider>
        );
    }
}
