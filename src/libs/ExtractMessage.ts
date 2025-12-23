export const extractMessagesAsync = async (errors: any): Promise<{ keyErrors: string[]; messages: string[] }> => {
  let messages: string[] = []
  let keyErrors: string[] = []

  if (errors._errors && errors._errors.length) {
    messages = messages.concat(errors._errors)
  }

  for (const key in errors) {
    if (key !== '_errors' && errors[key]._errors) {
      console.log({ key })
      for (const msg of errors[key]._errors) {
        keyErrors.push(`${key}: ${msg}`)
      }
      messages = messages.concat(errors[key]._errors)
    }
  }
  return { keyErrors, messages }
}
