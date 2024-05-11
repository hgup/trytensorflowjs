import fs, { Stats } from "fs"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { ReadableOptions } from "stream"
import { z } from "zod"

const routeContextSchema = z.object({
  params: z.object({
    filename: z.string(),
  }),
})

function streamFile(
  path: string,
  options?: ReadableOptions
): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, options)

  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk))
      )
      downloadStream.on("end", () => controller.close())
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error)
      )
    },
    cancel() {
      downloadStream.destroy()
    },
  })
}

export async function GET(
  req: NextRequest,
  context: z.infer<typeof routeContextSchema>
): Promise<NextResponse> {
  // const uri = req.nextUrl.searchParams.get("uri");                                // Get the `uri` from the search parameters (for example, `https://google.com/download?uri=asdf` will return `asdf`)
  // const file = "/home/manjaro/Downloads/manjaro-kde-22.1.3-230529-linux61.iso";   // The manjaro iso file that I want people to download
  const file = path.join(process.cwd(), "assets", context.params.filename[0])

  const stats: Stats = await fs.promises.stat(file) // Get the file size
  const data: ReadableStream<Uint8Array> = streamFile(file) // Stream the file with a 1kb chunk
  const res = new NextResponse(data, {
    // Create a new NextResponse for the file with the given stream from the disk
    status: 200, //STATUS 200: HTTP - Ok
    headers: new Headers({
      //Headers
      "content-disposition": `attachment; filename=${path.basename(file)}`, //State that this is a file attachment
      "content-type": "application/iso", //Set the file type to an iso
      "content-length": stats.size + "", //State the file size
    }),
  })

  return res // Return the NextResponse with the file so NextJS can send the file to the user
}
