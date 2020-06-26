import {
  Flex,
  Text,
  Image,
  Drawer,
  DrawerBody,
  Divider,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useTheme,
  PseudoBox,
  Button,
  Box,
  useToast,
} from "@chakra-ui/core";
import { Drawings, gql, useSubscription, useMutation } from "magiql";
import React from "react";
import { SlWifiSignal1, SlAdd } from "react-icons/sl";
import { useStudio } from "./StudioContext";

// https://excalidraw.com/#room=[0-9a-f]{20},[a-zA-Z0-9_-]{22}
// const roomIdGenerator = customAlphabet("0123456789abcdef", 20);

// export const createCollaborationLink = () => {
//   const encryptionKey = nanoid(22);
//   const roomId = roomIdGenerator();
//   return `#room=${roomId},${encryptionKey}`;
// };

const DrawingItem = ({
  drawing,
  closeDrawer,
}: {
  drawing: Drawings;
  closeDrawer: any;
}) => {
  const { setDrawingId } = useStudio();
  const theme = useTheme();
  return (
    <>
      <PseudoBox
        _hover={{
          backgroundColor: "gray.50",
        }}
        onClick={() => {
          if (drawing.is_live && drawing.collaboration_link) {
            location.hash = drawing.collaboration_link;
          } else {
            location.hash = "";
          }
          setDrawingId(drawing.id);
          setDrawingId(drawing.id);

          closeDrawer();
        }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        fontSize={16}
        py={2}
        px={2}
        fontWeight="medium"
        flexDirection="row"
      >
        {drawing.name}
        {drawing.is_live && <SlWifiSignal1 color={theme.colors.green[500]} />}
      </PseudoBox>
    </>
  );
};

export function DrawingTitle() {
  const { drawing } = useStudio();
  return (
    <Text fontFamily="Virgil" fontSize="2xl">
      {drawing ? drawing.name : "Untitled"}
    </Text>
  );
}

export function DrawingsMenu() {
  const {
    drawerState: { isOpen, onClose },
    drawerButtonRef,
    setDrawingId,
  } = useStudio();

  const toast = useToast();

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
}

  `,
    {
      onSettled: (data, error) => {
        if (error) {
          toast({
            title: "Couldn't create drawing",
            description: JSON.stringify(error),
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: "New drawing created.",
            description:
              'New drawing "Untitled Drawing" created. Make sure to change the title to identify the drawing later',
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setDrawingId((data as any).insert_drawings_one.id);
        }
      },
    }
  );

  const { data, isSuccess } = useSubscription<
    { drawings: Drawings[] },
    {},
    Error
  >(gql`
    subscription liveDrawings {
      drawings {
        collaboration_link
        file_id
        id
        last_edited
        name
        is_live
      }
    }
  `);
  return (
    <Drawer
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      finalFocusRef={drawerButtonRef as any}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader mt={6}>
          <Flex alignItems="center" ml={-4}>
            <Image src="/apple-touch-icon.png" height="48px" />
            <Flex direction="column">
              <Text
                fontFamily="Virgil"
                color="gray.600"
                fontSize={24}
                lineHeight="1em"
                m={0}
              >
                Excalidraw
              </Text>
              <Text color="gray.400" fontSize={18} m={0}>
                Studio
              </Text>
            </Flex>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <Divider m={0} />
          {isSuccess &&
            data?.drawings.map((drawing: any) => (
              <>
                <DrawingItem
                  key={drawing.id}
                  drawing={drawing}
                  closeDrawer={onClose}
                />
                <Divider m={0} />
              </>
            ))}
          <Button width="100%">
            <SlAdd />
            <Box ml={3} onClick={() => addDrawing()}>
              New Drawing
            </Box>
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
