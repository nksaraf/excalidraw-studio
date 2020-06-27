import {
  Flex,
  Button,
  useTheme,
  Stack,
  Box,
  Text,
  Grid,
  PseudoBox,
  Editable,
  EditablePreview,
  EditableInput,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useToast,
} from "@chakra-ui/core";
import { SlNavigationMenu, SlUserSignal1 } from "react-icons/sl";
import { useStudio, useCreateNewDrawing } from "./StudioContext";
import { useMutation, gql, useClient } from "magiql";
import { useSession } from "./Session";
import { useRef } from "react";
import { Router, useRouter } from "next/router";

export function DrawingTitle() {
  const {
    drawing,
    drawingId,
    isLoading,
    drawerState: { onOpen },
  } = useStudio();
  const client = useClient();
  const createDrawing = useCreateNewDrawing();
  const theme = useTheme();
  const [setDrawingName] = useMutation(
    gql`
      mutation setDrawingName($name: String, $id: Int!) {
        update_drawings_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
          id
          name
        }
      }
    `,
    {
      onSuccess: () => {
        client.cache.invalidateQueries("drawingById");
      },
    }
  );

  return drawing && drawing.name ? (
    <Editable
      fontFamily="Virgil"
      fontSize="2xl"
      key={drawing.id}
      defaultValue={drawing.name}
      onSubmit={(val) => {
        setDrawingName({
          id: drawingId,
          name: val,
        } as any);
      }}
    >
      <EditablePreview />
      <EditableInput />
    </Editable>
  ) : isLoading ? (
    <Text fontFamily="Virgil" fontSize="2xl" color="gray.300">
      Loading
    </Text>
  ) : (
    <Text fontFamily="Virgil" fontSize="2xl" color="gray.300">
      <PseudoBox
        as="span"
        cursor="pointer"
        onClick={onOpen}
        color="gray.400"
        _hover={{ borderBottom: "solid 2px " + theme.colors.gray[400] }}
      >
        Select a drawing
      </PseudoBox>{" "}
      or{" "}
      <PseudoBox
        as="span"
        cursor="pointer"
        onClick={createDrawing}
        color="gray.400"
        _hover={{ borderBottom: "solid 2px " + theme.colors.gray[400] }}
      >
        create a new one
      </PseudoBox>
    </Text>
  );
}

function SaveButton() {
  const toast = useToast();
  const { drawing } = useStudio();

  const [saveDrawing, { status }] = useMutation(
    gql`
      mutation saveDrawing(
        $drawing_id: Int!
        $file_id: Int!
        $contents: jsonb!
      ) {
        update_drawings_by_pk(
          _set: { last_saved: "now()" }
          pk_columns: { id: $drawing_id }
        ) {
          last_saved
          name
          id
        }
        update_files_by_pk(
          pk_columns: { id: $file_id }
          _set: { contents: $contents }
        ) {
          updated_at
          created_at
        }
      }
    `,
    {
      onSuccess: (data) => {
        toast({
          title: `"${drawing?.name}"` + " saved",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const { elementsRef } = useSession();

  return (
    <Button
      variant="solid"
      backgroundColor="blue.500"
      isDisabled={status === "loading"}
      _hover={{
        backgroundColor: "blue.400",
      }}
      onClick={() => {
        saveDrawing({
          drawing_id: drawing?.id,
          file_id: drawing?.file?.id,
          contents: JSON.stringify({
            type: "excalidraw",
            version: 2,
            source: "https://excalidraw-studio.vercel.app",
            elements: elementsRef.current,
          }),
        } as any);
      }}
      color="white"
    >
      Save
    </Button>
  );
}

function DeleteButton() {
  const toast = useToast();
  const {
    drawing,
    setDrawingId,
    drawerState: { onOpen: onDrawerOpen },
  } = useStudio();

  const [deleteDrawing, { status }] = useMutation(
    gql`
      mutation deleteDrawing($drawing_id: Int!, $file_id: Int!) {
        delete_drawings_by_pk(id: $drawing_id) {
          id
        }
        delete_files_by_pk(id: $file_id) {
          id
        }
      }
    `,
    {
      onSuccess: (data) => {
        toast({
          title: `"${drawing?.name}"` + " deleted",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();
  const router = useRouter();

  return (
    <>
      <Button
        variant="solid"
        _hover={{
          backgroundColor: "red.400",
        }}
        onClick={onOpen}
        backgroundColor="red.500"
        color="white"
      >
        Delete
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="blacks">
            Delete the drawing{" "}
            <Box as="span" color="gray.500">
              {drawing?.name}
            </Box>
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variantColor="red"
              isDisabled={status === "loading"}
              onClick={async () => {
                await deleteDrawing({
                  drawing_id: drawing?.id,
                  file_id: drawing?.file?.id,
                } as any);

                setDrawingId(undefined);
                router.push("/");
                onDrawerOpen();
              }}
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DrawingToolbar() {
  return (
    <Stack
      width="100%"
      justifyContent="flex-end"
      direction="row"
      spacing={4}
      shouldWrapChildren={true}
    >
      <SaveButton />
      <Button
        variant="solid"
        backgroundColor="gray.500"
        _hover={{
          backgroundColor: "gray.400",
        }}
        color="white"
      >
        <Box mr={2}>
          <SlUserSignal1 />
        </Box>
        Refresh Session
      </Button>
      <DeleteButton />
    </Stack>
  );
}

export function DrawingHeader() {
  const theme = useTheme();
  const {
    drawerState: { onOpen },
    drawerButtonRef,
    drawingId,
    drawing,
  } = useStudio();

  return (
    <Grid
      height="48px"
      bg="gray.100"
      width="100%"
      gridTemplateColumns="1fr 2fr 1fr"
      alignItems="center"
      px={4}
    >
      <Stack
        direction="row"
        width="100%"
        justifyContent="flex-start"
        align="center"
      >
        <Button
          aria-label="open drawings menu"
          onClick={onOpen}
          ref={drawerButtonRef}
        >
          <SlNavigationMenu size={16} color={theme.colors.gray[600]} />
        </Button>
        <Text
          fontFamily="Virgil"
          color="gray.600"
          fontSize={18}
          lineHeight="1em"
          m={0}
        >
          Excalidraw
        </Text>
        <Text color="gray.400" fontSize={14} m={0}>
          Studio
        </Text>
      </Stack>
      <Flex direction="row" flex={1} justify="center">
        <DrawingTitle />
      </Flex>
      {drawing && <DrawingToolbar />}
    </Grid>
  );
}
