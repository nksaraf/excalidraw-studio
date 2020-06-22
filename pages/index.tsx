import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Flex,
  Box,
  Editable,
  EditablePreview,
  EditableInput,
  ButtonGroup,
  IconButton,
  Button,
} from "@chakra-ui/core";
import { useQuery, gql, Devtools, Drawings } from "magiql";
import { ExcalidrawProps } from "excalidraw";

const Canvas = dynamic(() => import("components/Excalidraw"), {
  ssr: false,
});

const useDrawingById = ({ id }: any) => {
  const { data, loading, ...query } = useQuery<
    { drawings_by_pk: Drawings },
    { id: number }
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
        id,
      },
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
    loading,
    data,
    drawing: initialData,
  };
};

const Drawing = ({
  id,
  ...props
}: Partial<ExcalidrawProps> & { id: number }) => {
  const { loading, drawing } = useDrawingById({ id });
  return !loading ? (
    <Canvas initialData={drawing.elements} {...props} />
  ) : (
    <Box>loading</Box>
  );
};

const DrawingItem = ({ drawing }: { drawing: Drawings }) => {
  return (
    <Editable
      textAlign="left"
      defaultValue={drawing.name}
      fontSize="2xl"
      alignItems="flex-start"
      isPreviewFocusable={false}
      // submitOnBlur={false}
      onSubmit={console.log}
    >
      {(props: any) => (
        <Flex direction="row">
          {props.isEditing ? (
            <Box flex={5} pl={2} alignItems="flex-start">
              <EditableInput fontSize={14} />
            </Box>
          ) : (
            <Button flex={9} justifyContent="flex-start">
              <EditablePreview fontSize={14} />
            </Button>
          )}
          <EditableControls {...props} />
        </Flex>
      )}
    </Editable>
  );

  // <Box key={drawing.id}>{drawing.name}</Box>;
};

function EditableControls(props: any) {
  console.log(props);
  const { isEditing, onSubmit, onCancel, onRequestEdit } = props;
  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm" flexDirection="row">
      {/* <IconButton
        icon="check"
        onClick={() => {
          console.log("here");
        }}
        aria-label="change name"
      /> */}
      <IconButton icon="close" onClick={onCancel} aria-label="change name" />
    </ButtonGroup>
  ) : (
    <Flex direction="column" justifyContent="center">
      <IconButton
        size="sm"
        icon="edit"
        onClick={onRequestEdit}
        aria-label="change name"
      />
    </Flex>
  );
}

export const App = () => {
  const { data, loading } = useQuery<{ drawings: Drawings[] }, {}>(gql`
    query allDrawings {
      drawings {
        created_at
        id
        name
        updated_at
        file {
          id
          updated_at
        }
      }
    }
  `);

  return (
    <Flex height="100vh" direction="row" width="100vw" overflow="hidden">
      <Flex width={0.2} bg="gray.100" height="100%" direction="column" p={2}>
        {!loading &&
          data?.drawings.map((drawing) => (
            <DrawingItem key={drawing.id} drawing={drawing} />
          ))}
      </Flex>
      <Drawing id={2} width={0.8} />
      <Devtools />
    </Flex>
  );
};

export default App;
