import React, { Suspense } from "react";

function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>Page</div>
    </Suspense>
  );
}

export default Page;
