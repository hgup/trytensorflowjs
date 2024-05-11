"use client"
// TODO: server implementation
import Image from "next/image"
import * as tf from "@tensorflow/tfjs"
import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@ui/input"
import { Badge } from "@ui/badge"
import { Button } from "@ui/button"
import Link from "next/link"

async function trainNewModel() {
  const linearModel = new tf.Sequential()
  linearModel.add(tf.layers.dense({ units: 1, inputShape: [1] }))

  // Prepare data for training : Loss metric
  linearModel.compile({ loss: "meanSquaredError", optimizer: "sgd" })

  const xs = tf.tensor1d([
    8.233549355140523, 3.4379760094237977, 4.627551324398393,
    3.2115444752027877, 5.117556509018107, 6.8619081014080505,
    4.048616435846969, 9.38381436561152, 4.164895665710599, 3.9669413958685364,
    5.29869366964428, 5.091923551267293, 3.877002817564308, 1.9040281766541878,
    7.321022272880833, 7.405876653893624, 6.504854115742442, 3.4302647319326676,
    8.109594212694486, 2.9503232002077953,
  ])
  const ys = tf.tensor1d([
    9.461161374828595, 5.419031072351363, 2.1458674001141995, 4.026960600000182,
    5.633064203622516, 2.6899579592490106, 3.307705964523021,
    3.4273524995058047, 6.246678549055122, 1.2993759651894998,
    4.598384156892527, 3.027013421483079, 6.609468858587713, 4.5355407709202655,
    3.8729635250840855, 5.40632903154372, 8.734551966817023, 8.345922927491628,
    7.125253746630413, 2.6608954035648846,
  ])
  await linearModel.fit(xs, ys)
  console.log("model trained!")
  return linearModel
}

const formSchema = z.object({
  input: z.coerce.number(),
})

export default function Home() {
  const [training, setTraining] = React.useState(true)
  const [prediction, setPrediction] = React.useState(0)
  const linearModel = React.useRef<tf.Sequential | null>(null)
  React.useEffect(() => {
    trainNewModel().then((v) => {
      linearModel.current = v
      console.log(linearModel)
      setTraining(false)
    })
  }, [])
  function linearPrediction(val: number) {
    console.log(linearModel.current)
    const output = linearModel.current?.predict(tf.tensor2d([val], [1, 1]))
    // @ts-ignore
    const prediction = output?.arraySync()[0][0] as number
    return prediction
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: 0,
    },
  })

  return (
    <main className="w-full h-full flex flex-col justify-center items-center p-3 md:p-0">
      <Card>
        <CardHeader>
          <CardTitle>Completely useless ML prediction model</CardTitle>
          <div className="text-green-600  flex flex-row justify-between pt-3">
            <span className="text-sm">As the name suggests</span>
            {training ? (
              <Badge variant={"secondary"}>Training</Badge>
            ) : (
              <Badge className="bg-green-600 text-white">Ready</Badge>
            )}
          </div>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((val) => {
              console.log(val)
              setPrediction((v) => linearPrediction(val.input))
            })}
          >
            <CardContent className="space-y-5">
              <div className="flex flex-row gap-2 items-center mb-5">
                <span className="font-semibold">Predicted Value:</span>
                {!!prediction && <Badge variant="outline">{prediction}</Badge>}
              </div>
              <FormField
                control={form.control}
                name="input"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input</FormLabel>
                    <FormControl>
                      <Input placeholder="3.14" {...field} />
                    </FormControl>
                    <FormDescription>
                      No matter what you enter, the result will be random
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Predict</Button>
            </CardContent>
          </form>
        </Form>
      </Card>

      <span className="text-xs text-muted-foreground font-semibold uppercase mt-2">
        <div className="flex flex-col gap-3 items-center md:flex-row md:gap-1">
          <span>Tensorflow • Made with ❤️ by Hursh</span>
          <Link className="decoration underline" href="/handwriting">
            handwriting
          </Link>
        </div>
      </span>
    </main>
  )
}
