import { createParser } from 'eventsource-parser'
import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import type { SettingsPayload } from '@/types/provider'

const consumeWord = async(globalSettings: SettingsPayload, word_num: number, chat_id: string) => {
  const useRes = await fetch(`${import.meta.env.API_URL}/api/gpt/consumeWord`, {
    headers: {
      'Content-Type': 'application/json',
      'Token': globalSettings.authToken as string,
    },
    method: 'POST',
    body: JSON.stringify({
      model: globalSettings.model as string,
      type: 'resp',
      word_num,
      chat_id,
      app_key: import.meta.env.APP_KEY,
    }),
  })
  console.log(2)
  const res = await useRes.text()
  const resJson = JSON.parse(res)
  console.log(resJson)
  if (resJson.code !== 200)
    return resJson.message
}

export const parseStream = (rawResponse: Response, globalSettings: SettingsPayload, chat_id: string) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const rb = rawResponse.body as ReadableStream

  return new ReadableStream({
    async start(controller) {
      let res_text = ''
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            console.log(`${chat_id}DONE`)
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            res_text += text
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }
      const reader = rb.getReader()
      const parser = createParser(streamParser)
      let done = false
      while (!done) {
        const { done: isDone, value } = await reader.read()
        if (isDone) {
          done = true
          console.log(`${chat_id}done2`)
          await consumeWord(globalSettings, res_text.length, chat_id)
          console.log(`${chat_id}end`)
          controller.close()
          console.log(`${chat_id}end2`)
          return
        }
        parser.feed(decoder.decode(value, { stream: true }))
      }
    },
  })
}
