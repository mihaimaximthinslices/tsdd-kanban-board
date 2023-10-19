import app from './app'

const PORT = process.env.PORT_BE || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
