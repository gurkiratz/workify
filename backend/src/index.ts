import express from 'express'
import cors from 'cors'
import userRouter from './routes/userRoutes'
import workerRouter from './routes/workerRoutes'

const app = express()

app.use(express.json())
app.use(cors())

app.use('/v1/user', userRouter)
app.use('/v1/worker', workerRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
