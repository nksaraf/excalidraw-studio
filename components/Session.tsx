import { useStudio } from "./StudioContext";
import { createContext } from "create-hook-context";
import React from "react";
import { useMutation, gql } from "magiql";

const UpdateLastEditedMutation = gql`
  mutation updateLastEdited($id: Int!, $collaboration_link: String) {
    update_drawings_by_pk(
      pk_columns: { id: $id }
      _set: { last_edited: "now()", collaboration_link: $collaboration_link }
    ) {
      last_edited
      collaboration_link
    }
  }
`;

export const useUpdateLastEdited = () => {
  const [updateLastEdited] = useMutation(UpdateLastEditedMutation);
  return updateLastEdited;
};

export const [SessionProvider, useSession] = createContext(
  ({}: {}) => {
    const [sessionLink, setSessionLink] = React.useState<string | undefined>(
      undefined
    );

    const updateLastEdited = useUpdateLastEdited();
    const { drawingId, setDrawingId } = useStudio();

    const changeDrawingId = React.useCallback(
      (id) => {
        if (drawingId !== undefined) {
          updateLastEdited({
            id: drawingId,
            collaboration_link: null,
          } as any);
        }
        setDrawingId(id);
        setSessionLink(undefined);
      },
      [drawingId, setDrawingId]
    );

    React.useEffect(() => {
      if (drawingId && sessionLink) {
        updateLastEdited({
          id: drawingId,
          collaboration_link: sessionLink,
        } as any);
        const interval = setInterval(() => {
          updateLastEdited({
            id: drawingId,
            collaboration_link: sessionLink,
          } as any);
        }, 5000);

        return () => {
          clearInterval(interval);
        };
      }
    }, [sessionLink, drawingId]);

    const appStateRef = React.useRef();
    const elementsRef = React.useRef();

    return {
      sessionLink,
      setSessionLink,
      appStateRef,
      elementsRef,
      changeDrawingId,
      updateLastEdited,
    };
  },
  undefined,
  "Session"
);
