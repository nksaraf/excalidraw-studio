import React from "react";
import Excalidraw, { ExcalidrawProps } from "excalidraw";
import { Box } from "@chakra-ui/core";

export default function Canvas({
  width = 1.0,
  ...props
}: Partial<ExcalidrawProps>) {
  const onChange = (elements: any, state: any) => {
    // console.log("Elements :", elements, "State : ", state);
  };

  const onUsernameChange = (username: any) => {
    console.log("current username", username);
  };

  const [dimensions, setDimensions] = React.useState({
    width: window.innerWidth * width,
    height: window.innerHeight,
  });

  const onResize = () => {
    setDimensions({
      width: window.innerWidth * width,
      height: window.innerHeight,
    });
  };

  const options = {
    zenModeEnabled: false,
    viewBackgroundColor: "#FFFFFF",
  };
  return (
    <Box width={width}>
      <Excalidraw
        {...dimensions}
        onResize={onResize}
        initialData={[]}
        onChange={onChange}
        options={options}
        user={{ name: "Excalidraw User" }}
        onUsernameChange={onUsernameChange}
        {...props}
      />
    </Box>
  );
}
