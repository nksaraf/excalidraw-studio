import React from "react";
import dynamic from "next/dynamic";
import { Flex, useTheme, Button, CircularProgress } from "@chakra-ui/core";
import { CanvasProps } from "components/Canvas";
import { useStudio, useCreateNewDrawing } from "components/StudioContext";
import {
  SlDesignDrawingBoard,
  SlDesignToolPens,
  SlPencil1,
} from "react-icons/sl";

const Canvas = dynamic(() => import("components/Canvas"), {
  ssr: false,
});

export const Drawing = (props: CanvasProps) => {
  const {
    drawingData,
    drawingId,
    drawing,
    isLoading,
    drawerState: { onOpen },
  } = useStudio();
  const theme = useTheme();
  const createDrawing = useCreateNewDrawing();
  return drawing ? (
    <Canvas
      initialData={drawingData.elements}
      key={drawingId}
      resolveHeight={(h) => h - 48}
      {...props}
    />
  ) : (
    <Flex
      bg="gray.50"
      flex={1}
      justify="center"
      pt={32}
      // align="center"
      width="100%"
    >
      {isLoading ? (
        <CircularProgress isIndeterminate capIsRound color="gray" />
      ) : (
        <Flex direction="column" align="center">
          <SlDesignDrawingBoard color={theme.colors.gray[100]} size={128} />
          <Button
            mt={6}
            color="gray.400"
            fontSize={["sm", "sm", "md", "md"]}
            onClick={onOpen}
          >
            <SlPencil1 style={{ marginRight: 8 }} />
            Edit Drawing
          </Button>
          <Button
            mt={[2, 2, 3, 4]}
            color="gray.400"
            fontSize={["sm", "sm", "md", "md"]}
            onClick={createDrawing}
          >
            <SlDesignToolPens style={{ marginRight: 8 }} />
            Create New Drawing
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
