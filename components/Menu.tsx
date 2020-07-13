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
  DrawerFooter,
  useToast,
} from "@chakra-ui/core";
import { Drawings, gql, useSubscription } from "magiql";
import React from "react";
import { SlDesignToolPens, SlPencil2, SlLogout2 } from "react-icons/sl";
import { useStudio, useCreateNewDrawing } from "./StudioContext";
import { useSession } from "./Session";
import { EXCALIDRAW_USER_NAME_KEY } from "pages/login";
import { HASURA_ADMIN_SECRET_KEY } from "./getCookieToken";
import { useRouter } from "next/router";

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
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        fontSize={["sm", "sm", "md", "md"]}
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

  // const [refresh, setRefresh] = React.useState(0);

  const createDrawing = useCreateNewDrawing();
  const router = useRouter();

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
            <Text fontSize={[12, 12, 48]} mx={3}>
              📋
            </Text>
            {/* <Image src="/apple-touch-icon.png" height={[12, 12, 16]} /> */}
            <Flex direction="column">
              <Text
                fontFamily="Virgil"
                color="gray.600"
                fontSize={[18, 18, 18, 20]}
                lineHeight="1em"
                m={0}
              >
                Excalidraw
              </Text>
              <Text color="gray.400" fontSize={[14, 14, 14, 16]} m={0}>
                Studio
              </Text>
            </Flex>
          </Flex>

          <Button
            mt={6}
            width="100%"
            variant="outline"
            justifyContent="flex-start"
            color="gray.500"
            fontSize={["sm", "sm", "md", "md"]}
          >
            🧑‍🎨{" "}
            <Text ml={3}>
              {typeof window !== "undefined"
                ? window.localStorage.getItem(EXCALIDRAW_USER_NAME_KEY) ||
                  "Excalidraw User"
                : "Excalidraw User"}
            </Text>
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <DrawingsList closeDrawer={onClose} />
          <Button
            mt={6}
            width="100%"
            variantColor="blue"
            fontSize={["sm", "sm", "md", "md"]}
            onClick={createDrawing}
          >
            <SlDesignToolPens style={{ marginRight: 8 }} />
            Create New Drawing
          </Button>
          {/* <Button
            mt={3}
            width="100%"
            variantColor="gray"
            fontSize={["sm", "sm", "md", "md"]}
            onClick={() => setRefresh((r) => r + 1)}
          >
            <SlButtonRefresh style={{ marginRight: 8 }} />
            Refresh
          </Button> */}
        </DrawerBody>
        <DrawerFooter>
          <Button
            mt={6}
            variantColor="gray"
            width="100%"
            // color="gray.500"
            fontSize={["sm", "sm", "md", "md"]}
            onClick={() => {
              window.localStorage.removeItem(HASURA_ADMIN_SECRET_KEY);
              window.localStorage.removeItem(EXCALIDRAW_USER_NAME_KEY);
              router.replace("/login");
            }}
          >
            <SlLogout2 style={{ marginRight: 8 }} />
            Logout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DrawingsList({ closeDrawer }: any) {
  const toast = useToast();

  const { data, isSuccess, isLoading } = useSubscription<
    { drawings: Drawings[] },
    {},
    Error
  >(
    gql`
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
    `,
    {
      onError: (e: any) => {
        toast({
          title: "Server error",
          description:
            e?.response?.errors
              ?.map((err: any) => err.extensions.code + ": " + err.message)
              .join("\n") ?? JSON.stringify(e),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  return (
    <>
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
              <DrawingItem drawing={drawing} closeDrawer={closeDrawer} />
              <Divider m={0} />
            </React.Fragment>
          ))}
        </>
      )}
    </>
  );
}
