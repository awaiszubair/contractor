import React, { Suspense } from "react";
import DirectoryFullPage from "./DirectoryFullPage";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DirectoryFullPage />
    </Suspense>
  );
}

export default Page;
