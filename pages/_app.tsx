import "excalidraw/dist/excalidraw.min.css";
import React from "react";
import { theme, ThemeProvider, CSSReset, useToast } from "@chakra-ui/core";
import { MagiqlProvider, createClient, Devtools } from "magiql";
import {
  HASURA_ADMIN_SECRET_KEY,
  getCookieToken,
} from "../components/getCookieToken";

function App(props: any) {
  return (
    <ThemeProvider theme={theme}>
      <ExcalidrawStudioApp {...props} />
    </ThemeProvider>
  );
}

// export const authMiddleware = (
//   getToken: () => string | null
// ): Middleware<any, any> => (fetch) => {
//   return (url, operation, vars, options = {} as any) => {
//     const token = getToken();
//     console.log(token);
//     if (token) {
//       options.headers = {
//         ...options.headers,
//         "x-hasura-admin-secret": token,
//       };
//     }
//     const result = fetch(url, operation, vars, options);
//     return result;
//   };
// };

function ExcalidrawStudioApp({ Component, pageProps }: any) {
  const toast = useToast();
  const client = React.useMemo(
    () =>
      createClient({
        endpoint: "https://excalidraw.herokuapp.com/v1/graphql",
        fetchOptions: () => {
          return {
            headers: {
              "x-hasura-admin-secret": getCookieToken() as string,
            },
          };
        },
        subscriptions: {
          endpoint: "wss://excalidraw.herokuapp.com/v1/graphql",
        },
        reactQueryConfig: {
          mutations: {
            onError: (e: any) => {
              toast({
                title: "Server error",
                description:
                  e?.response?.errors
                    ?.map(
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
