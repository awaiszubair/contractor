import React, { Suspense } from "react";
import RegisterPage from "./RegisterPage";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}

export default Page;
