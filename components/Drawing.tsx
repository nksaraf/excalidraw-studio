import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@chakra-ui/core";
import { CanvasProps } from "components/Excalidraw";
import { useStudio } from "components/StudioContext";

const Canvas = dynamic(() => import("components/Excalidraw"), {
  ssr: false,
});

export const Drawing = (props: CanvasProps) => {
  const { status, drawing, drawingId } = useStudio();
  return status === "success" ? (
    <Canvas
      initialData={drawing.elements}
      key={drawingId}
      resolveHeight={(h) => h - 48}
      {...props}
    />
  ) : (
    <Box>loading</Box>
  );
};
