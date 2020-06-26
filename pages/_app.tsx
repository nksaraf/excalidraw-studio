import "excalidraw/dist/excalidraw.min.css";

import React from "react";
import { theme, ThemeProvider, CSSReset } from "@chakra-ui/core";
import { MagiqlProvider, createClient } from "magiql";

const client = createClient("https://excalidraw.herokuapp.com/v1/graphql", {
  subscriptionUrl: "ws://excalidraw.herokuapp.com/v1/graphql",
});

function App(props: any) {
  const { Component, pageProps } = props;
  return (
    <MagiqlProvider client={client}>
      <ThemeProvider theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
      </ThemeProvider>
    </MagiqlProvider>
  );
}

export default App;
