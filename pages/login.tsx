import { Studio } from "components/Studio";
import React from "react";
import {
  getCookieToken,
  HASURA_ADMIN_SECRET_KEY,
} from "components/getCookieToken";
import { useRouter } from "next/router";
import {
  Box,
  Flex,
  Image,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
} from "@chakra-ui/core";
import Head from "next/head";
import { useForm } from "react-hook-form";

export const EXCALIDRAW_USER_NAME_KEY = "excalidraw:user_name";

export default function StudioApp() {
  const router = useRouter();
  // React.useEffect(() => {
  //   const token = getCookieToken();
  //   if (!token) {
  //     router.push("/login");
  //   }
  // }, [router]);

  const form = useForm();

  const onSubmit = form.handleSubmit((values) => {
    console.log(values);
    if (values.name && values.secret) {
      window.localStorage.setItem(EXCALIDRAW_USER_NAME_KEY, values.name);
      window.localStorage.setItem(HASURA_ADMIN_SECRET_KEY, values.secret);
      router.push("/");
    }
  });

  return (
    <>
      <Head>
        <title>Studio - Excalidraw</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📋</text></svg>"
        />
      </Head>
      <Flex
        height="100vh"
        width="100vw"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Flex flexDirection="column" width={["80%", "60%", "30%"]}>
          <Flex alignItems="center" mb={4}>
            {/* <Image src="/apple-touch-icon.png" height={[12, 12, 16]} /> */}
            <Flex direction="row">
              <Text
                fontFamily="Virgil"
                color="gray.600"
                fontSize={[20, 20, 20, 24]}
                lineHeight="1em"
                mr={2}
              >
                Excalidraw
              </Text>
              <Text color="gray.400" fontSize={[14, 14, 14, 16]} m={0}>
                Studio
              </Text>
            </Flex>
          </Flex>
          <FormControl mb={4}>
            <FormLabel htmlFor="name">Your name</FormLabel>
            <Input type="name" name="name" ref={form.register()} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel htmlFor="secret">Password</FormLabel>
            <Input type="password" ref={form.register()} name="secret" />
          </FormControl>
          <Button onClick={onSubmit}>Login</Button>
        </Flex>
      </Flex>
    </>
  );
}
