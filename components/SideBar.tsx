import { nanoid, customAlphabet } from "nanoid";
import {
  Flex,
  Editable,
  Box,
  Text,
  Image,
  EditableInput,
  Button,
  EditablePreview,
  ButtonGroup,
  IconButton,
  Drawer,
  DrawerBody,
  Divider,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  useTheme,
  PseudoBox,
} from "@chakra-ui/core";
import { Drawings, gql, useSubscription } from "magiql";
import React from "react";
import { SlNavigationMenu, SlWifiSignal1, SlSafetyVest } from "react-icons/sl";
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
      <Divider m={0} />
    </>
  );

  // <Box key={drawing.id}>{drawing.name}</Box>;
};

// function EditableControls(props: any) {
//   const { isEditing, onSubmit, onCancel, onRequestEdit } = props;
//   return isEditing ? (
//     <ButtonGroup justifyContent="center" size="sm" flexDirection="row">
//       {/* <IconButton
//         icon="check"
//         onClick={() => {
//           console.log("here");
//         }}
//         aria-label="change name"
//       /> */}
//       <IconButton icon="close" onClick={onCancel} aria-label="change name" />
//     </ButtonGroup>
//   ) : (
//     <Flex direction="column" justifyContent="center">
//       <IconButton
//         size="sm"
//         icon="edit"
//         onClick={onRequestEdit}
//         aria-label="change name"
//       />
//     </Flex>
//   );
// }

export function DrawingTitle() {
  const { drawing } = useStudio();
  return drawing ? (
    <Text fontFamily="Virgil" fontSize="2xl">
      {drawing.name}
    </Text>
  ) : null;
}

export function DrawingsMenu() {
  const {
    drawingId,
    drawerState: { isOpen, onClose, onOpen },
    drawerButtonRef,
  } = useStudio();

  const theme = useTheme();
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
              <DrawingItem
                key={drawing.id}
                drawing={drawing}
                closeDrawer={onClose}
              />
            ))}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
