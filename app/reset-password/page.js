import React, { Suspense } from "react";

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>page</div>
    </Suspense>
  );
}

export default page;
