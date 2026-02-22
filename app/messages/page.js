import React, {Suspense} from 'react'
import GlobalChatPage from './ChatPage'

function Page() {
  return (
    <Suspense fallback={<div>Loading Messages...</div>}>
      <GlobalChatPage />
    </Suspense>
  )
}

export default Page