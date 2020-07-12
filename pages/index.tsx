import { Studio } from "components/Studio";
import React from "react";
import { getCookieToken } from "components/getCookieToken";
import { useRouter } from "next/router";

export default function StudioApp() {
  const router = useRouter();
  React.useEffect(() => {
    const token = getCookieToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <Studio />;
}
