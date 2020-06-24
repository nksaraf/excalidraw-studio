import { createContext } from "create-hook-context";
import React from "react";
import { useQuery, gql, Drawings } from "magiql";
import { createCollaborationLink } from "./SideBar";
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
    drawing: initialData,
  };
};

export const [StudioProvider, useStudio] = createContext(
  ({ initialDrawingId }: { initialDrawingId?: number }) => {
    const [drawingId, setDrawingId] = React.useState<number | undefined>(
      initialDrawingId
    );
    const router = useRouter();

    const query = useDrawingById({ id: drawingId });
    // React.useEffect(() => {
    // if (!router.asPath.includes("room") && drawingId) {
    //   // const link = createCollaborationLink();
    //   // router.replace("/" + link);
    // }
    // }, [drawingId, query.status]);

    return { drawingId, setDrawingId, ...query };
  },
  undefined,
  "Studio"
);
