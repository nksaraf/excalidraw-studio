import { Flex, Button } from "@chakra-ui/core";
import { DrawingTitle } from "./SideBar";
import { SlSafetyVest } from "react-icons/sl";

export function DrawingHeader() {
  return (
    <Flex
      height="48px"
      bg="gray.100"
      width="100%"
      direction="row"
      alignItems="center"
      pl={3}
    >
      <Button
        aria-label="open drawings menu"
        onClick={onOpen}
        ref={btnRef}
        mr={4}
      >
        <SlNavigationMenu size={16} color={theme.colors.gray[600]} />
      </Button>
      <Flex direction="row" flex={1} justify="space-between">
        <DrawingTitle />
        <Flex direction="row">
          <Button>
            <SlSafetyVest />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
