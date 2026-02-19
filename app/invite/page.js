import React, { Suspense } from "react";
import InvitePage from "./InvitePage";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvitePage />
    </Suspense>
  );
}

export default Page;
