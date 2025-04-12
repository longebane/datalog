declare module "can-ndjson-stream" {
  export default function ndjsonStream(body: ReadableStream): {
    getReader(): ReadableStreamDefaultReader
  }
}
