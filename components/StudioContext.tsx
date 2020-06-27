import { createContext } from "create-hook-context";
import React, { useRef } from "react";
import { useQuery, gql, Drawings, useMutation } from "magiql";
import { useDisclosure, useToast } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { useUpdateLastEdited, useSession } from "./Session";

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

export const useCreateNewDrawing = () => {
  const { changeDrawingId } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [addDrawing] = useMutation(
    gql`
      mutation createNewDrawing($name: String!, $contents: jsonb!) {
        insert_drawings_one(
          object: { name: $name, file: { data: { contents: $contents } } }
        ) {
          created_at
          file_id
          id
          last_edited
          name
          updated_at
        }
      }
    `,
    {
      onSuccess: (data: any) => {
        toast({
          title: `New drawing "${data?.insert_drawings_one?.name}" created`,
          description: `Make sure to change the title to identify the drawing later`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        changeDrawingId(data.insert_drawings_one.id);
        router.push("/");
      },
    }
  );

  return React.useCallback(
    ({ name = "Untitled Drawing", elements = [] }) =>
      addDrawing({
        name,
        contents: JSON.stringify({
          type: "excalidraw",
          version: 2,
          source: "https://excalidraw-studio.vercel.app",
          elements,
        }),
      } as any),
    [addDrawing]
  );
};

export const [StudioProvider, useStudio] = createContext(
  ({ initialDrawingId }: { initialDrawingId?: number }) => {
    const [drawingId, setDrawingId] = React.useState<number | undefined>(
      initialDrawingId
    );

    const router = useRouter();
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
        enabled: typeof window !== "undefined" && drawingId === undefined,
        refetchOnWindowFocus: false,
        onSuccess: (data: any) => {
          if (data.drawings.length) {
            const drawing = data.drawings[0];
            if (drawing.is_live) {
              setDrawingId(drawing.id);
            } else {
              router.push("/");
            }
          } else if (location.hash || location.hash.length > 1) {
            router.push("/");
          }
        },
      }
    );

    return {
      drawingId,
      ...query,
      setDrawingId,
      drawerState,
      drawerButtonRef,
    };
  },
  undefined,
  "Studio"
);
