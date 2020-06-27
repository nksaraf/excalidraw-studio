import { createContext } from "create-hook-context";
import React, { useRef } from "react";
import { useQuery, gql, Drawings, useMutation } from "magiql";
import { useDisclosure, useToast } from "@chakra-ui/core";
import { useRouter } from "next/router";

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
  const { setDrawingId } = useStudio();
  const toast = useToast();
  const router = useRouter();
  const [addDrawing] = useMutation(
    gql`
    mutation MyMutation {
      insert_drawings_one(object: {name: "Untitled Drawing", file: {data: {contents: "{\"elements\": []}"}}}) {
        created_at
        file_id
        id
        last_edited
        name
        updated_at
      }
    }`,
    {
      onSuccess: (data) => {
        // if (error) {
        //   toast({
        //     title: "Couldn't create drawing",
        //     description: JSON.stringify(error),
        //     status: "error",
        //     duration: 5000,
        //     isClosable: true,
        //   });
        // } else {
        toast({
          title: "New drawing created.",
          description:
            'New drawing "Untitled Drawing" created. Make sure to change the title to identify the drawing later',
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        setDrawingId((data as any).insert_drawings_one.id);
        router.push("/");
        // }
      },
    }
  );

  return React.useCallback(() => addDrawing(), [addDrawing]);
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
        enabled: typeof window !== "undefined",
        refetchOnWindowFocus: false,
        onSuccess: (data: any) => {
          if (data.drawings.length) {
            const drawing = data.drawings[0];
            console.log(drawing);
            if (drawing.is_live) {
              setDrawingId(data.drawings[0].id);
            } else {
              router.push("/");
            }
          } else if (location.hash || location.hash.length > 1) {
            router.push("/");
          }
        },
      }
    );

    return { drawingId, setDrawingId, ...query, drawerState, drawerButtonRef };
  },
  undefined,
  "Studio"
);
