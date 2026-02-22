import React, { Suspense } from "react";
import ResetPasswordPage from "./ResetPasswordPage";

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <div>page</div> */}
      <ResetPasswordPage />
    </Suspense>
  );
}

export default page;
