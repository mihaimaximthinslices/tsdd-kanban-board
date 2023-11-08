export const scrollToBottomOfElement = (id: string) => {
  const element = document.getElementById(id)
  element!.scrollTop = element!.scrollHeight + 400
}
