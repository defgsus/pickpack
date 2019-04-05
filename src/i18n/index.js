import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import moment from 'moment';

let resBundle = require('i18next-resource-store-loader!./');



i18n
    //.use(XHR)
    .use(LanguageDetector)
    .init({
            fallbackLng: 'en',
            defaultNS: 'pickpack',
            // ns: ['app', 'header'],

            debug: true,
            resources: resBundle,
            returnObjects:true,

            interpolation: {
                escapeValue: false, // not needed for react!!
            },

            // react i18next special options (optional)
            react: {
                wait: false, // set to true if you like to wait for loaded in every translated hoc
                nsMode: 'default', // set it to fallback to let passed namespaces to translated hoc act as fallbacks
            },
        }
    );


export default i18n


export function setLanguage(code) {
    if (code === "de" || code === "en") {
        i18n.changeLanguage(code);
        moment.locale(code);
    }
}
