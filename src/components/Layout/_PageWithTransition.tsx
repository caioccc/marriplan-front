import { useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { LoadingOverlay, Box } from "@mantine/core";
import { Toaster } from "../ui/toaster";

const PageWithTransition = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const prevScreen = useRef(Component);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const handlerStart = () => {
      setTransitioning(true);
    };

    const handlerComplete = () => {
      setTimeout(() => {
        prevScreen.current = Component;
        setTransitioning(false);
      }, 100);
    };

    const handlerError = () => {
      setTransitioning(false);
    };

    router.events.on("routeChangeStart", handlerStart);
    router.events.on("routeChangeComplete", handlerComplete);
    router.events.on("routeChangeError", handlerError);
    return () => {
      router.events.off("routeChangeStart", handlerStart);
      router.events.off("routeChangeComplete", handlerComplete);
      router.events.off("routeChangeError", handlerError);
    };
  }, [Component, router.events]);

  const Screen = Component;

  return (
    <Box pos="relative" w="100%" h="100%">
      <LoadingOverlay
        visible={transitioning}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Screen {...pageProps} />
      <Toaster />
    </Box>
  );
};
export default PageWithTransition;
