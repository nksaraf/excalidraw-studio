import React from "react";
import Excalidraw, { ExcalidrawProps } from "excalidraw";
import { Box } from "@chakra-ui/core";
import { useSession } from "./Session";
import { useStudio } from "./StudioContext";

const getButtonByClassName = (className: string) => {
  return document.getElementsByClassName(className)[0] as HTMLButtonElement;
};

const startSession = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const collaborationButton = getButtonByClassName("RoomDialog-modalButton");
    if (collaborationButton) {
      collaborationButton.click();
      setTimeout(() => {
        const startSessionButton = getButtonByClassName(
          "RoomDialog-startSession"
        );
        if (startSessionButton) {
          startSessionButton.click();
          const closeButton = getButtonByClassName("Modal__close");
          if (closeButton) {
            closeButton.click();
            setTimeout(() => {
              resolve(window.location.hash);
            }, 100);
          } else {
            reject(new Error("Close button not found"));
          }
        } else {
          reject(new Error("Start Session button not found"));
        }
      }, 100);
    } else {
      reject(new Error("Collaboration button not found"));
    }
  });
};

export interface CanvasProps extends Partial<ExcalidrawProps> {
  resolveWidth?: (w: number) => number;
  resolveHeight?: (w: number) => number;
}

export default function Canvas({
  resolveWidth = (w) => w,
  resolveHeight = (h) => h,
  ...props
}: CanvasProps) {
  const {
    setSessionLink,
    sessionLink,
    appStateRef,
    elementsRef,
    updateLastEdited,
  } = useSession();

  const { drawingId } = useStudio();

  const onUsernameChange = (username: any) => {};

  const onChange = (elements: any, state: any) => {
    appStateRef.current = state;
    elementsRef.current = elements;
  };

  React.useLayoutEffect(() => {
    if (!window.location.hash.includes("room")) {
      (async () => {
        try {
          const collabSessionLink = await startSession();
          setSessionLink(collabSessionLink);
        } catch (e) {
          console.error(e);
        }
      })();
    } else {
      setSessionLink(window.location.hash);
    }
  }, [sessionLink]);

  React.useLayoutEffect(() => {
    const beforeUnloadhandler = (event: any) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = "";
    };

    const unloadHander = (event: any) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      updateLastEdited({
        id: drawingId,
        collaboration_link: null,
      } as any);
    };

    window.addEventListener("beforeunload", beforeUnloadhandler);
    window.addEventListener("unload", unloadHander);

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadhandler);
      window.removeEventListener("unload", unloadHander);
    };
  }, []);

  const [dimensions, setDimensions] = React.useState({
    width: resolveWidth(window.innerWidth),
    height: resolveHeight(window.innerHeight),
  });

  const onResize = () => {
    setDimensions({
      width: resolveWidth(window.innerWidth),
      height: resolveHeight(window.innerHeight),
    });
  };

  const options = {
    zenModeEnabled: false,
    viewBackgroundColor: "#FFFFFF",
  };

  return (
    <Box width={resolveWidth(window.innerWidth)}>
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
