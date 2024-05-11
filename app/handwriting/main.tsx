"use client"
import { Badge } from "@ui/badge"
import { Button } from "@ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card"
import React from "react"
import CanvasDraw, { type CanvasDrawProps } from "react-canvas-draw"
import * as tf from "@tensorflow/tfjs"
import clsx from "clsx"
import Link from "next/link"

async function loadModel() {
  try {
    const model = await tf.loadLayersModel(`indexeddb://drawnum-model`)
    console.log("model loaded")
    return model
  } catch {
    const model = await tf.loadLayersModel(
      `${process.env.URL}/api/file/model.json`
    )
    model.save("indexeddb://drawnum-model")
    console.log("model loaded")
    return model
  }
}
function indexOfMax(arr: number[]) {
  if (arr.length === 0) {
    return -1
  }

  var max = arr[0]
  var maxIndex = 0

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i
      max = arr[i]
    }
  }

  return maxIndex
}

export default function Main() {
  const [pred, setPred] = React.useState<number | null>(null)
  const [loaded, setLoaded] = React.useState<boolean>(false)
  const model = React.useRef<tf.LayersModel | null>(null)
  const canvasRef = React.useRef<CanvasDraw>(null)
  const thRef = React.useRef<HTMLCanvasElement>(null)
  async function predict(imageData: ImageData) {
    // tidy ensures that all tensors are released from memory when prediction is finished
    const pred = await tf.tidy(() => {
      // const pixelValues = tf.util.sizeFromShape(
      //   tf.browser.fromPixels(imageData, 1).shape
      // )
      // console.log(pixelValues)
      // const finalTensor = pixelValues.reshape([1, 28, 28, 1]).cast("float32")
      const pixelValues = tf.browser
        .fromPixels(imageData, 1)
        .reshape([1, 28, 28, 1])
        .cast("float32")
      const output = model.current?.predict(pixelValues) as any
      const prediction = output?.arraySync()
      // console.log(prediction)
      return prediction[0]
      // return [2, 3]
    })
    return pred
  }

  //   ngOnInit is basically useEffect
  React.useEffect(() => {
    loadModel()
      .then((loadedModel) => {
        model.current = loadedModel
      })
      .finally(() => setLoaded((v) => true))
    return () => {
      model.current?.dispose()
    }
  }, [])

  const getImageData = () => {
    // @ts-ignore
    const canvas = canvasRef.current?.canvas.drawing as HTMLCanvasElement
    const newCanvas = document.createElement("canvas")
    const nctx = newCanvas.getContext("2d")
    const scaled = nctx?.drawImage(canvas, 0, 0, 28, 28)
    return nctx?.getImageData(0, 0, 28, 28)
  }

  return (
    <main className="size-full flex flex-col justify-center items-center p-3 md:p-0">
      <Card className="p-3 flex flex-col-reverse md:flex-row">
        <Card>
          <div className="flex flex-col">
            <CanvasDraw
              brushRadius={7}
              onChange={() => {
                const imgDat = getImageData()
                if (imgDat) {
                  predict(imgDat).then((v) => {
                    setPred(indexOfMax(v))
                  })
                }
              }}
              ref={canvasRef}
              canvasWidth={280}
              canvasHeight={280}
              className=""
            />
            <Button
              onClick={(e) => {
                canvasRef.current?.clear()
              }}
            >
              Erase
            </Button>
          </div>
        </Card>
        <div className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Number Recognition</CardTitle>
            <CardDescription>
              Write single numbers (0-9) on the canvas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <ul className="grid gap-3">
              <li className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">Status</span>
                {!loaded ? (
                  <Badge
                    variant={"secondary"}
                    className="w-[4.2rem]  flex justify-center bg-yellow-300"
                  >
                    Loading
                  </Badge>
                ) : (
                  <Badge className="bg-green-600 text-white w-[4.2rem]  flex justify-center">
                    Ready
                  </Badge>
                )}
              </li>
            </ul>
            {/* <div className="relative"> */}
            {/* <canvas width={28} height={28} ref={thRef}></canvas> */}
            {/* </div> */}
          </CardContent>
          <CardFooter
            className={clsx("font-mono text-xl space-x-2 justify-between ", {
              "opacity-60": !loaded,
            })}
          >
            <span>I think you wrote</span>
            <Badge
              variant="outline"
              className="h-10 w-14 text-[30px] flex justify-center rounded-lg "
            >
              {pred}
            </Badge>
          </CardFooter>
        </div>
      </Card>
      <span className="text-xs text-muted-foreground font-semibold uppercase mt-2">
        Tensorflow • Made with ❤️ by Hursh •{" "}
        <Link className="decoration underline" href="/">
          useless
        </Link>
      </span>
    </main>
  )
}
