import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import {
  JWT_SECRET,
  accessKeyId,
  secretAccessKey,
  TOTAL_DECIMALS,
} from '../config'
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

import { authMiddleware } from '../middleware'
import { createTaskInput } from '../types'
const DEFAULT_TITLE = 'Select the most clickable thumbnail'

const router = Router()

const prismaClient = new PrismaClient()

const s3Client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: 'us-east-2',
})

router.get('/task', authMiddleware, async (req, res) => {
  // @ts-ignore
  const taskId: string = req.query.taskId
  // @ts-ignore
  const userId: string = req.userId

  const taskDetails = await prismaClient.task.findFirst({
    where: {
      userId: Number(userId),
      id: Number(taskId),
    },
    include: {
      options: true,
    },
  })

  if (!taskDetails) {
    return res.status(411).json({
      message: 'You dont have access to this task',
    })
  }

  // Todo: Can u make this faster?
  const responses = await prismaClient.submission.findMany({
    where: {
      taskId: Number(taskId),
    },
    include: {
      option: true,
    },
  })

  const result: Record<
    string,
    {
      votes: number
      option: {
        imageUrl: string
      }
    }
  > = {}

  taskDetails.options.forEach((option) => {
    result[option.id] = {
      votes: 0,
      option: {
        imageUrl: option.image_url,
      },
    }
  })

  responses.forEach((r) => {
    result[r.optionId].votes++
  })

  res.json({
    result,
    taskDetails,
  })
})

router.post('/task', authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId
  // validate the inputs from the user;
  const body = req.body

  const parseData = createTaskInput.safeParse(body)

  const user = await prismaClient.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (!parseData.success) {
    return res.status(411).json({
      message: "You've sent the wrong inputs",
    })
  }

  // const transaction = await connection.getTransaction(
  //   parseData.data.signature,
  //   {
  //     maxSupportedTransactionVersion: 1,
  //   }
  // )

  /**
  console.log(transaction)

  if (
    (transaction?.meta?.postBalances[1] ?? 0) -
      (transaction?.meta?.preBalances[1] ?? 0) !==
    100000000
  ) {
    return res.status(411).json({
      message: 'Transaction signature/amount incorrect',
    })
  }

  if (
    transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
    PARENT_WALLET_ADDRESS
  ) {
    return res.status(411).json({
      message: 'Transaction sent to wrong address',
    })
  }

  if (
    transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
    user?.address
  ) {
    return res.status(411).json({
      message: 'Transaction sent to wrong address',
    })
  }
  */
  // was this money paid by this user address or a different address?

  // parse the signature here to ensure the person has paid 0.1 SOL
  // const transaction = Transaction.from(parseData.data.signature);

  let response = await prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        amount: 0.1 * TOTAL_DECIMALS,
        //Todo: Signature should be unique in the table else people can reuse a signature
        signature: parseData.data.signature,
        userId,
      },
    })

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        image_url: x.imageUrl,
        taskId: response.id, // Add taskId property
      })),
    })

    return response
  })

  res.json({
    taskId: response.id,
  })
})

router.get('/presignedUrl', authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId

  const { url, fields } = await createPresignedPost(s3Client, {
    Bucket: 'decentralized-tasks',
    Key: `tasks/user${userId}/${Math.random()
      .toString(36)
      .substring(7)}/image.jpg`,
    Conditions: [
      ['content-length-range', 0, 5 * 1024 * 1024], // 5 MB max
    ],
    Fields: {
      'Content-Type': 'image/png',
    },
    Expires: 3600,
  })
  console.log({ url, fields })
  res.json({
    preSignedUrl: url,
    fields,
  })
})

// signin with wallet
// signing a message
router.post('/signin', async (req, res) => {
  // Todo: add sign verification logic here
  // const { message, address, signature } = req.body
  console.log(req.body.address)
  const existingUser = await prismaClient.user.findUnique({
    where: { address: req.body.address },
  })
  if (existingUser) {
    const token = jwt.sign({ userId: existingUser.id }, JWT_SECRET)
    res.json({ token })
  } else {
    const newUser = await prismaClient.user.create({
      data: { address: req.body.address },
    })
    console.log(newUser)
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET)
    res.json({ token })
  }
})

export default router
