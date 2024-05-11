import { Loader2 } from "lucide-react"
import React from "react"

const Loading = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex flex-row gap-2">
        <span>Please wait... Loading your model</span>{" "}
        <Loader2 className="animate-spin "></Loader2>
      </div>
    </div>
  )
}

export default Loading
