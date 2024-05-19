import nacl from 'tweetnacl'
import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { TOTAL_DECIMALS, WORKER_JWT_SECRET } from '../config'
import { getNextTask } from '../db'

import { workerMiddleware } from '../middleware'
import { createSubmissionInput } from '../types'

const prismaClient = new PrismaClient()
const router = Router()

const TOTAL_SUBMISSIONS = 100

router.post('/payout', workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId

  const worker = await prismaClient.worker.findFirst({
    where: {
      id: Number(userId),
    },
  })

  if (!worker) {
    return res.status(403).json({
      message: 'User not found',
    })
  }

  const address = worker.address
  const txnId = '0x12312454'
  // logic here to create a txns
  // @solana / web3.js
  // New Transaction

  if (worker?.pending_amount) {
    const amount = worker.pending_amount

    // We should add a lock here
    await prismaClient.$transaction(async (tx) => {
      await tx.worker.update({
        where: {
          id: Number(userId),
        },
        data: {
          pending_amount: {
            decrement: worker.pending_amount,
          },
          locked_amount: {
            increment: worker.pending_amount,
          },
        },
      })

      await tx.payouts.create({
        data: {
          userId: Number(userId),
          amount: worker.pending_amount,
          status: 'Processing',
          signature: txnId,
        },
      })
    })

    res.json({
      message: 'Processing payout',
      amount: worker.pending_amount,
    })
  } else {
    res.status(411).json({
      message: 'Nothing to payout',
    })
  }
})

router.get('/balance', async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId

  const worker = await prismaClient.worker.findFirst({
    where: {
      id: Number(userId),
    },
  })

  res.json({
    pendingAmount: worker?.pending_amount,
    lockedAmount: worker?.locked_amount,
  })
})

router.post('/submission', workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: Int = Number(req.userId)
  const body = req.body
  const parsedSubmission = createSubmissionInput.safeParse(body)

  if (parsedSubmission.success) {
    const task = await getNextTask(Number(userId))
    if (!task || task?.id !== Number(parsedSubmission.data.taskId)) {
      return res.status(441).json({
        message: 'incorrect task id',
      })
    }

    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString()

    const submission = await prismaClient.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          optionId: Number(parsedSubmission.data.selection),
          workerId: userId,
          taskId: Number(parsedSubmission.data.taskId),
          amount: Number(amount),
        },
      })

      await tx.worker.update({
        where: {
          id: userId,
        },
        data: {
          pending_amount: {
            increment: Number(amount),
          },
        },
      })

      return submission
    })

    const nextTask = await getNextTask(Number(userId))

    res.json({
      nextTask,
      amount,
    })
  } else {
    res.status(411).json({
      message: 'Incorrect inputs',
    })
  }
})

router.get('/nextTask', workerMiddleware, async (req, res) => {
  // @ts-ignore
  const userId: string = req.userId

  const task = await getNextTask(Number(userId))

  if (!task) {
    res.status(411).json({
      message: 'No more tasks left for you to review',
    })
  } else {
    res.json({
      task,
    })
  }
})

router.post('/signin', async (req, res) => {
  const { publicKey, signature } = req.body
  const message = new TextEncoder().encode(
    'Sign into mechanical turks as a worker'
  )

  // const result = nacl.sign.detached.verify(
  //   message,
  //   new Uint8Array(signature.data),
  //   new PublicKey(publicKey).toBytes()
  // )

  // if (!result) {
  //   return res.status(411).json({
  //     message: 'Incorrect signature',
  //   })
  // }

  const existingUser = await prismaClient.worker.findFirst({
    where: {
      address: publicKey,
    },
  })

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      WORKER_JWT_SECRET
    )

    res.json({
      token,
      // amount: existingUser.pending_amount / TOTAL_DECIMALS,
    })
  } else {
    const user = await prismaClient.worker.create({
      data: {
        address: publicKey,
        pending_amount: 0,
        locked_amount: 0,
      },
    })

    const token = jwt.sign(
      {
        userId: user.id,
      },
      WORKER_JWT_SECRET
    )

    res.json({
      token,
      amount: 0,
    })
  }
})

export default router
