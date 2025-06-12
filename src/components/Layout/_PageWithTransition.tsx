import { useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import cn from "classnames";
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

    router.events.on("routeChangeStart", handlerStart)
    router.events.on("routeChangeComplete", handlerComplete);
    return () => {
      router.events.off("routeChangeStart", handlerStart);
      router.events.off("routeChangeComplete", handlerComplete);
    };
  }, [Component, router.events]);

  const Screen = Component;

  return (
    <div
    >
      <Screen {...pageProps} />
      <Toaster />
    </div>
  );
};
export default PageWithTransition;
