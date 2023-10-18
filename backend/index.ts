import app from './app'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} with FE host ${process.env.FE_HOST}`)
})
