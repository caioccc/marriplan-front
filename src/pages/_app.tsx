import '@/styles/globals.css'
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';
import '@/translate/i18n';

import {appWithTranslation} from 'next-i18next'
import type {AppProps} from 'next/app'
import Head from 'next/head'
import {ThemeProvider} from 'styled-components'

import {AuthProvider, ProtectedRoute} from '@/contexts/AuthContext'
import PageWithTransition from '@/components/Layout/_PageWithTransition'
import {MantineProvider} from "@mantine/core";
import {SettingsProvider} from '@/contexts/SettingsContext';
import {NotificationProvider} from "@/contexts/NotificationContext";
import {GoogleOAuthProvider} from '@react-oauth/google';


const MyApp = (props: AppProps) => {

    return (
        <>
            <Head>
                <title>Marriplan</title>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com"/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair%20Display:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
                      integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
                      crossOrigin="anonymous" referrerPolicy="no-referrer"/>
            </Head>
            <main>
                <MantineProvider withGlobalStyles withNormalizeCSS>
                    <ThemeProvider theme={{mode: 'light'}}>
                        <AuthProvider>
                            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                                <SettingsProvider>
                                    <NotificationProvider>
                                        <ProtectedRoute>
                                            <PageWithTransition {...props} />

                                            {/* <props.Component {...props.pageProps} /> */}
                                        </ProtectedRoute>
                                    </NotificationProvider>
                                </SettingsProvider>
                            </GoogleOAuthProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </MantineProvider>
            </main>
        </>
    )
}

export default appWithTranslation(MyApp)
