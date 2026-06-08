import "@/styles/globals.css";
import "@/translate/i18n";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";

import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { ThemeProvider } from "styled-components";

import PageWithTransition from "@/components/Layout/_PageWithTransition";
import { FirstStepsFloatingMenu } from "@/components/FirstStepsFloatingMenu";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Notifications } from "@mantine/notifications";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  colors: {
    // Exemplo de escala de cores personalizadas para o Marriplan
    terracota: [
      "#fdf4f2",
      "#fbe8e4",
      "#f7d2ca",
      "#f1b3a5",
      "#ea8e7a",
      "#e0674f",
      "#c74d37",
      "#a43c29",
      "#883324",
      "#712d21", // [6] é o Terracota padrão
    ],
    champanhe: [
      "#faf7f2",
      "#f3edd9",
      "#ebdfbe",
      "#e1cea1",
      "#d5b981",
      "#caa869",
      "#bf9757",
      "#aa8146",
      "#8d6a3a",
      "#755831",
    ],
    beige: [
      "#fbfaf7",
      "#f6f3eb",
      "#ede7d8",
      "#e1d8bf",
      "#d3c5a3",
      "#c6b48a",
      "#baaa80",
      "#a4936b",
      "#897a58",
      "#726649",
    ],
    rose: [
      "#fef5f6",
      "#fcebee",
      "#f9d8dd",
      "#f4b8c1",
      "#ed929e",
      "#e16778",
      "#cb4658",
      "#ab3344",
      "#8e2c39",
      "#762732",
    ],
  },
  primaryColor: "terracota",
});

const MyApp = (props: AppProps) => {
  return (
    <>
      <Head>
        <title>Marriplan</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair%20Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-QQPVGRF1ER"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-QQPVGRF1ER');`,
        }}
      />
      <main>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          <Notifications position="top-right" zIndex={10000} />
          <ThemeProvider theme={{ mode: "light" }}>
            <AuthProvider>
              <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
              >
                <SettingsProvider>
                  <NotificationProvider>
                    <ProtectedRoute>
                      <PageWithTransition {...props} />
                      <FirstStepsFloatingMenu />

                      {/* <props.Component {...props.pageProps} /> */}
                    </ProtectedRoute>
                  </NotificationProvider>
                </SettingsProvider>
              </GoogleOAuthProvider>
            </AuthProvider>
          </ThemeProvider>
        </MantineProvider>
        <SpeedInsights />
      </main>
    </>
  );
};

export default appWithTranslation(MyApp);
