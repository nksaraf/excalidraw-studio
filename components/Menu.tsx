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
  CircularProgress,
} from "@chakra-ui/core";
import { Drawings, gql, useSubscription } from "magiql";
import React from "react";
import { SlDesignToolPens, SlPencil2 } from "react-icons/sl";
import { useStudio, useCreateNewDrawing } from "./StudioContext";
import { useSession } from "./Session";

const DrawingItem = ({
  drawing,
  closeDrawer,
}: {
  drawing: Drawings;
  closeDrawer: any;
}) => {
  const { changeDrawingId } = useSession();
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
          changeDrawingId(drawing.id);
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
        {drawing.is_live && <SlPencil2 color={theme.colors.green[500]} />}
      </PseudoBox>
    </>
  );
};

export function DrawingsMenu() {
  const {
    drawerState: { isOpen, onClose },
    drawerButtonRef,
  } = useStudio();

  const createDrawing = useCreateNewDrawing();

  const { data, isSuccess, isLoading } = useSubscription<
    { drawings: Drawings[] },
    {},
    Error
  >(gql`
    subscription liveDrawings {
      drawings(order_by: { created_at: desc }) {
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
          {isLoading && (
            <Flex width="100%" justifyContent="center">
              <CircularProgress capIsRound isIndeterminate color="gray" />
            </Flex>
          )}
          {isSuccess && (
            <>
              <Divider m={0} />
              {data?.drawings.map((drawing: any) => (
                <React.Fragment key={drawing.id}>
                  <DrawingItem drawing={drawing} closeDrawer={onClose} />
                  <Divider m={0} />
                </React.Fragment>
              ))}
            </>
          )}
          <Button mt={6} width="100%" color="gray.500" onClick={createDrawing}>
            <SlDesignToolPens style={{ marginRight: 8 }} />
            Create New Drawing
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
