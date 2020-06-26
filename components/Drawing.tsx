import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/core";
import { CanvasProps } from "components/Canvas";
import { useStudio } from "components/StudioContext";

const Canvas = dynamic(() => import("components/Canvas"), {
  ssr: false,
});

export const Drawing = (props: CanvasProps) => {
  const { status, drawingData, drawingId } = useStudio();
  return status === "success" ? (
    <Canvas
      initialData={drawingData.elements}
      key={drawingId}
      resolveHeight={(h) => h - 48}
      {...props}
    />
  ) : (
    <Box>loading</Box>
  );
};
