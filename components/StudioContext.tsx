import { createContext } from "create-hook-context";
import React, { useRef } from "react";
import { useQuery, gql, Drawings } from "magiql";
import { useDisclosure } from "@chakra-ui/core";

const useDrawingById = ({ id }: { id: number | undefined }) => {
  const { data, ...query } = useQuery<
    { drawings_by_pk: Drawings },
    { id: number | undefined }
  >(
    gql`
      query drawingById($id: Int!) {
        drawings_by_pk(id: $id) {
          id
          file {
            contents
            id
            created_at
            updated_at
          }
          name
          updated_at
          created_at
        }
      }
    `,
    {
      variables: {
        id: id,
      },
      enabled: id !== undefined,
      refetchOnWindowFocus: false,
    }
  );

  const initialData = React.useMemo(
    () =>
      JSON.parse(
        (data?.drawings_by_pk?.file?.contents as any) || '{ "elements": [] }'
      ),
    [data]
  );

  return {
    ...query,
    data,
    drawing: data?.drawings_by_pk,
    drawingData: initialData,
  };
};

export const [StudioProvider, useStudio] = createContext(
  ({ initialDrawingId }: { initialDrawingId?: number }) => {
    const [drawingId, setDrawingId] = React.useState<number | undefined>(
      initialDrawingId
    );

    const query = useDrawingById({ id: drawingId });
    const drawerState = useDisclosure(true);
    const drawerButtonRef = useRef(true);

    React.useEffect(() => {
      if (drawingId !== undefined) drawerState.onClose();
    }, [drawingId]);

    const collaboration = useQuery(
      gql`
        query drawingByCollaboration($collaboration_link: String) {
          drawings(
            where: { collaboration_link: { _eq: $collaboration_link } }
          ) {
            is_live
            collaboration_link
            id
            last_edited
            name
            updated_at
            created_at
          }
        }
      `,
      {
        variables: {
          collaboration_link:
            typeof window !== "undefined" ? location.hash : undefined,
        },
        enabled: typeof window !== "undefined",
        refetchOnWindowFocus: false,
        onSuccess: (data: any) => {
          if (data.drawings.length > 0) {
            setDrawingId(data.drawings[0].id);
          }
        },
      }
    );

    return { drawingId, setDrawingId, ...query, drawerState, drawerButtonRef };
  },
  undefined,
  "Studio"
);
