import React from "react";
import { Flex } from "@chakra-ui/core";
import { Devtools } from "magiql";
import { StudioProvider } from "components/StudioContext";
import { DrawingsMenu } from "components/SideBar";
import { Drawing } from "components/Drawing";
import Head from "next/head";

export const Studio = () => {
  return (
    <StudioProvider initialDrawingId={2}>
      <Head>
        <title>Studio - Excalidraw</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📋</text></svg>"
        />
      </Head>
      <Flex height="100vh" direction="column" width="100vw" overflow="hidden">
        <DrawingsMenu />
        <Drawing />
        <Devtools />
      </Flex>
    </StudioProvider>
  );
};
