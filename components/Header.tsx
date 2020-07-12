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
  ButtonProps,
} from "@chakra-ui/core";
import { SlNavigationMenu, SlClose, SlFloppyDisk, SlBin } from "react-icons/sl";
import { useStudio, useCreateNewDrawing } from "./StudioContext";
import { useMutation, gql, useClient } from "magiql";
import { useSession } from "./Session";
import { useRef } from "react";
import { useRouter } from "next/router";

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
        client.cache?.invalidateQueries("drawingById");
      },
    }
  );

  return drawing && drawing.name ? (
    <Editable
      fontFamily="Virgil"
      fontSize={["xl", "xl", "2xl"]}
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
    <Text fontFamily="Virgil" fontSize={["xl", "xl", "2xl"]} color="gray.300">
      Loading
    </Text>
  ) : (
    <Text
      fontFamily="Virgil"
      fontSize={["l", "l", "2xl"]}
      textAlign="center"
      color="gray.300"
      display={["none", "none", "none", "block"]}
    >
      <PseudoBox
        as="span"
        cursor="pointer"
        onClick={onOpen}
        color="gray.400"
        _hover={{ borderBottom: "solid 2px " + theme.colors.gray[400] }}
      >
        Edit a drawing
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
      onSuccess: () => {
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
    <ToolbarButton
      backgroundColor="blue.500"
      _hover={{
        backgroundColor: "blue.400",
      }}
      isDisabled={status === "loading"}
      onClick={() => {
        saveDrawing({
          drawing_id: drawing?.id,
          file_id: drawing?.file?.id,
          contents: JSON.stringify({
            type: "excalidraw",
            version: 2,
            source: "https://excalidraw-studio.vercel.app",
            elements: (elementsRef.current as any)?.filter(
              (element: any) => !element.isDeleted
            ),
          }),
        } as any);
      }}
      text="Save"
      icon={<SlFloppyDisk />}
    />
  );
}

function DeleteButton() {
  const toast = useToast();
  const {
    drawing,
    drawerState: { onOpen: onDrawerOpen },
  } = useStudio();

  const { changeDrawingId } = useSession();

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
      onSuccess: () => {
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
      <ToolbarButton
        _hover={{
          backgroundColor: "red.400",
        }}
        onClick={onOpen}
        backgroundColor="red.500"
        text="Delete"
        icon={<SlBin />}
      />
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

                changeDrawingId(undefined);
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

function ToolbarButton({
  text,
  icon,
  ...props
}: Omit<ButtonProps, "children"> & {
  text: string;
  icon: React.ReactElement;
}) {
  return (
    <Button variant="solid" px={[2, 2, 3, 4]} minW={1} color="white" {...props}>
      {icon}
      <Box display={["none", "none", "none", "block"]} ml={2}>
        {text}
      </Box>
    </Button>
  );
}

function CloseButton() {
  const { changeDrawingId } = useSession();
  const {
    drawerState: { onOpen },
  } = useStudio();
  const router = useRouter();

  return (
    <>
      <ToolbarButton
        backgroundColor="gray.500"
        _hover={{
          backgroundColor: "gray.400",
        }}
        onClick={() => {
          changeDrawingId(undefined);
          router.push("/");
          onOpen();
        }}
        text="Close"
        icon={<SlClose />}
      />
    </>
  );
}

export function DrawingToolbar() {
  return (
    <Stack
      width="100%"
      justifyContent="flex-end"
      direction="row"
      spacing={[2, 2, 3, 4]}
      shouldWrapChildren={true}
    >
      <SaveButton />
      <CloseButton />
      <DeleteButton />
    </Stack>
  );
}

export function DrawingHeader() {
  const theme = useTheme();
  const {
    drawerState: { onOpen },
    drawerButtonRef,
    drawing,
  } = useStudio();

  return (
    <Grid
      height="48px"
      bg="gray.100"
      width="100%"
      gridTemplateColumns={[
        "1fr 6fr 1fr",
        "1fr 6fr 1fr",
        "1fr 6fr 1fr",
        "1fr 3fr 1fr",
      ]}
      alignItems="center"
      px={[3, 3, 4, 5]}
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
          display="flex"
          alignItems="center"
          ref={drawerButtonRef}
        >
          <SlNavigationMenu size={16} color={theme.colors.gray[600]} />
          {!drawing && (
            <>
              <Text
                // display={["none", "none", "none", "block"]}
                fontFamily="Virgil"
                color="gray.600"
                fontSize={18}
                lineHeight="1em"
                m={0}
                ml={3}
                mr={2}
              >
                Excalidraw
              </Text>
              <Text
                // display={["none", "none", "none", "block"]}
                color="gray.400"
                fontSize={14}
                m={0}
              >
                Studio
              </Text>
            </>
          )}
        </Button>
      </Stack>
      <Flex direction="row" flex={1} justify="center">
        <DrawingTitle />
      </Flex>
      {drawing && <DrawingToolbar />}
    </Grid>
  );
}
