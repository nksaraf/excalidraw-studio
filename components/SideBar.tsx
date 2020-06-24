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
} from "@chakra-ui/core";
import { useQuery, Drawings, gql, useClient } from "magiql";
import React from "react";
import { SlNavigationMenu } from "react-icons/sl";

// https://excalidraw.com/#room=[0-9a-f]{20},[a-zA-Z0-9_-]{22}
const roomIdGenerator = customAlphabet("0123456789abcdef", 20);

export const createCollaborationLink = () => {
  const encryptionKey = nanoid(22);
  const roomId = roomIdGenerator();
  return `#room=${roomId},${encryptionKey}`;
};

const DrawingItem = ({ drawing }: { drawing: Drawings }) => {
  return (
    <>
      <Text fontSize={16} fontWeight="medium">
        {drawing.name}
      </Text>
      <Divider />
    </>
    // <Editable
    //   textAlign="left"
    //   defaultValue={drawing.name}
    //   fontSize="2xl"
    //   alignItems="flex-start"
    //   isPreviewFocusable={false}
    //   // submitOnBlur={false}
    //   onSubmit={console.log}
    // >
    //   {(props: any) => (
    //     <Flex direction="row">
    //       {props.isEditing ? (
    //         <Box flex={5} pl={2} alignItems="flex-start">
    //           <EditableInput fontSize={14} />
    //         </Box>
    //       ) : (
    //         <Button flex={9} justifyContent="flex-start">
    //           <EditablePreview fontSize={14} />
    //         </Button>
    //       )}
    //       <EditableControls {...props} />
    //     </Flex>
    //   )}
    // </Editable>
  );

  // <Box key={drawing.id}>{drawing.name}</Box>;
};

function EditableControls(props: any) {
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

import { SubscriptionClient } from "subscriptions-transport-ws";

let subscriptionClient: SubscriptionClient | null = null;
if (typeof window !== "undefined") {
  subscriptionClient = new SubscriptionClient(
    "ws://excalidraw.herokuapp.com/v1/graphql",
    { reconnect: true }
  );
}

export function useMountedCallback(callback: any) {
  const mounted = React.useRef(false);

  React[typeof window === "undefined" ? "useEffect" : "useLayoutEffect"](() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return React.useCallback(
    (...args) => (mounted.current ? callback(...args) : void 0),
    [callback]
  );
}

export const getOperationName = (query: string) => {
  const name = /(query|mutation|subscription) ([\w\d-_]+)/.exec(query);
  return name && name.length && name[2] ? name[2] : query;
};

const useSubscription = (
  subscription: string,
  {
    variables = {},
    operationName = getOperationName(subscription),
    ...options
  }: any = {}
) => {
  const rerender = useMountedCallback(React.useState()[1]);

  const client = useClient();

  const query = (client.cache as any).buildQuery(
    [operationName, { variables: variables }],
    () => new Promise(() => {}),
    options
  );

  const instanceRef = React.useRef();

  React.useEffect(() => {
    if (!subscriptionClient) {
      return;
    }

    instanceRef.current = query.subscribe(() => rerender({}));

    const observable = subscriptionClient.request({
      query: subscription,
      variables: variables,
    });

    const sub = observable.subscribe({
      next: (result) => {
        query.setData(result.data);
      },
      error: () => {
        sub.unsubscribe();
      },
      complete: () => {
        sub.unsubscribe();
      },
    });
    return () => {
      (instanceRef.current as any).unsubscribe();
      sub.unsubscribe();
    };
  }, [query, rerender]);

  return {
    query,
    ...query.state,
  };
};

export function DrawingsMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure(true);
  const theme = useTheme();
  const btnRef = React.useRef();
  const { data, isSuccess } = useSubscription(gql`
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
    <Flex height="48px" bg="gray.100" width="100%" direction="row" p={2}>
      <Button aria-label="open drawings menu" onClick={onOpen} ref={btnRef}>
        <SlNavigationMenu size={20} color={theme.colors.gray[600]} />
      </Button>

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef as any}
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
            <Divider />
            {isSuccess &&
              data?.drawings.map((drawing: any) => (
                <DrawingItem key={drawing.id} drawing={drawing} />
              ))}
          </DrawerBody>

          {/* <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button color="blue">Save</Button>
          </DrawerFooter> */}
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
