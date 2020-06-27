import "excalidraw/dist/excalidraw.min.css";

import React from "react";
import { theme, ThemeProvider, CSSReset, useToast } from "@chakra-ui/core";
import { MagiqlProvider, createClient, Devtools } from "magiql";

function App(props: any) {
  return (
    <ThemeProvider theme={theme}>
      <ExcalidrawStudioApp {...props} />
    </ThemeProvider>
  );
}

function ExcalidrawStudioApp({ Component, pageProps }: any) {
  const toast = useToast();
  const client = React.useMemo(
    () =>
      createClient("https://excalidraw.herokuapp.com/v1/graphql", {
        subscriptionUrl: "ws://excalidraw.herokuapp.com/v1/graphql",
        config: {
          mutations: {
            onError: (e: any) => {
              toast({
                title: "Server error",
                description:
                  e?.response?.errors
                    ?.map(
                      // (e) => e
                      (err: any) => err.extensions.code + ": " + err.message
                    )
                    .join("\n") ?? JSON.stringify(e),
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            },
          },
        },
      }),
    []
  );
  return (
    <MagiqlProvider client={client}>
      <CSSReset />
      <Component {...pageProps} />
      <Devtools />
    </MagiqlProvider>
  );
}

export default App;
