import { useStudio } from "./StudioContext";
import { createContext } from "create-hook-context";
import React from "react";
import { useMutation, gql } from "magiql";

const UpdateLastEditedMutation = gql`
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
`;

export const [SessionProvider, useSession] = createContext(
  ({}: {}) => {
    const [sessionLink, setSessionLink] = React.useState<string | undefined>(
      undefined
    );

    const [updateLastEdited] = useMutation(UpdateLastEditedMutation);
    const { drawingId } = useStudio();

    React.useEffect(() => {
      if (drawingId && sessionLink) {
        updateLastEdited({
          id: drawingId,
          last_edited: "now()",
          collaboration_link: sessionLink,
        } as any);
        const interval = setInterval(() => {
          updateLastEdited({
            id: drawingId,
            last_edited: "now()",
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
      updateLastEdited,
    };
  },
  undefined,
  "Session"
);
