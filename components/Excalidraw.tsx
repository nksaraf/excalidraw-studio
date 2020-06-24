import React from "react";
import Excalidraw, { ExcalidrawProps } from "excalidraw";
import * as x from "excalidraw";
import { Box } from "@chakra-ui/core";
import { useStudio } from "./StudioContext";
import { useRouter } from "next/router";
import { useMutation, gql } from "magiql";

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

const useCollaborationSession = () => {
  const [updateLastEdited] = useUpdateLastEdited();
  const { drawingId } = useStudio();
  const [isLiveEditing, setIsLiveEditing] = React.useState(false);
  const router = useRouter();

  React.useLayoutEffect(() => {
    if (!router.asPath.includes("room")) {
      const button: HTMLButtonElement = document.getElementsByClassName(
        "RoomDialog-modalButton"
      )[0] as any;
      button.click();
      const timeout = setTimeout(() => {
        const startSessionButton: HTMLButtonElement = document.getElementsByClassName(
          "RoomDialog-startSession"
        )[0] as any;
        if (startSessionButton) {
          startSessionButton.click();
          const closeButton: HTMLButtonElement = document.getElementsByClassName(
            "Modal__close"
          )[0] as any;

          closeButton.click();
          setIsLiveEditing(true);
        }
      }, 100);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);

  React.useEffect(() => {
    if (isLiveEditing) {
      updateLastEdited({
        id: drawingId,
        last_edited: "now()",
        collaborationLink: router.asPath.substr(1),
      } as any);
      const interval = setInterval(() => {
        updateLastEdited({
          id: drawingId,
          last_edited: "now()",
          collaborationLink: router.asPath.substr(1),
        } as any);
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isLiveEditing]);
};

export default function Canvas({
  resolveWidth = (w) => w,
  resolveHeight = (h) => h,
  ...props
}: CanvasProps) {
  const onUsernameChange = (username: any) => {
    console.log("current username", username);
  };

  const onChange = () => {
    // console.log("current username", username);
  };

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
