import React from "react";
import Excalidraw, { ExcalidrawProps } from "excalidraw";
import { Box } from "@chakra-ui/core";
import { useStudio } from "./StudioContext";
// import { useRouter } from "next/router";
import { useMutation, gql } from "magiql";
// import parse from "url-parse";
import { createContext } from "create-hook-context";

const [CollaborationSessionProvider, useCollaborationSession] = createContext(
  ({}: {}) => {
    const [collaborationLink, setCollaborationLink] = React.useState<
      string | undefined
    >(undefined);

    const [updateLastEdited] = useUpdateLastEdited();
    const { drawingId } = useStudio();

    React.useEffect(() => {
      if (drawingId && collaborationLink) {
        updateLastEdited({
          id: drawingId,
          last_edited: "now()",
          collaboration_link: collaborationLink,
        } as any);
        const interval = setInterval(() => {
          updateLastEdited({
            id: drawingId,
            last_edited: "now()",
            collaboration_link: collaborationLink,
          } as any);
        }, 5000);

        return () => {
          clearInterval(interval);
        };
      }
    }, [collaborationLink, drawingId]);

    const appStateRef = React.useRef();
    const elementsRef = React.useRef();

    return {
      collaborationLink,
      setCollaborationLink,
      appStateRef,
      elementsRef,
    };
  },
  undefined,
  "CollaborationSession"
);

export interface CanvasProps extends Partial<ExcalidrawProps> {
  resolveWidth?: (w: number) => number;
  resolveHeight?: (w: number) => number;
}

const useUpdateLastEdited = () => {
  return useMutation<
    any,
    { id: number; last_edited: string; collaboration_link: string },
    Error
  >(gql`
    mutation updateLastEdited(
      $last_edited: timestamptz
      $id: Int!
      $collaboration_link: String
    ) {
      update_drawings_by_pk(
        pk_columns: { id: $id }
        _set: {
          last_edited: $last_edited
          collaboration_link: $collaboration_link
        }
      ) {
        last_edited
        collaboration_link
      }
    }
  `);
};

const getButtonByClassName = (className: string) => {
  return document.getElementsByClassName(className)[0] as HTMLButtonElement;
};

const startCollaborationSession = async (): Promise<string> => {
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

export default function Canvas(props: CanvasProps) {
  return (
    <CollaborationSessionProvider>
      <ExcalidrawCanvas {...props} />
    </CollaborationSessionProvider>
  );
}

export function ExcalidrawCanvas({
  resolveWidth = (w) => w,
  resolveHeight = (h) => h,
  ...props
}: CanvasProps) {
  const {
    setCollaborationLink,
    appStateRef,
    elementsRef,
  } = useCollaborationSession();

  const onUsernameChange = (username: any) => {
    console.log("current username", username);
  };

  const onChange = (elements: any, state: any) => {
    appStateRef.current = state;
    elementsRef.current = elements;
  };

  React.useLayoutEffect(() => {
    if (!window.location.hash.includes("room")) {
      (async () => {
        try {
          setCollaborationLink(await startCollaborationSession());
        } catch (e) {
          console.error(e);
        }
      })();
    } else {
      setCollaborationLink(window.location.hash);
    }
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
