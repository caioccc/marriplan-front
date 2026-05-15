import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import {initReactI18next} from 'react-i18next';

import {messages} from './languages';

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        debug: false,
        defaultNS: ['translations'],
        lng: 'pt',
        fallbackLng: 'pt',
        supportedLngs: ['pt', 'en', 'es'],
        nonExplicitSupportedLngs: true,
        ns: ['translations'],
        resources: messages,
    });

export {i18n};
