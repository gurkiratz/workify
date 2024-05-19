'use client'
import { Appbar } from '@/components/Appbar'
import { BACKEND_URL } from '@/utils'
import axios from 'axios'
import { useEffect, useState } from 'react'

async function getTaskDetails(taskId: string) {
  const response = await axios.get(
    `${BACKEND_URL}/v1/user/task?taskId=${taskId}`,
    {
      headers: {
        Authorization: localStorage.getItem('token'),
        
      },
    }
  )
  return response.data
}

export default function Page({
  params: { taskId },
}: {
  params: { taskId: string }
}) {
  const [result, setResult] = useState<Record<
    string,
    {
      count: number
      option: {
        imageUrl: string
      }
    }
  > | null>({})
  const [taskDetails, setTaskDetails] = useState<{
    title?: string
  }>({})

  useEffect(() => {
    getTaskDetails(taskId)
      .then((data) => {
        setResult(data.result)
        setTaskDetails(data.taskDetails)
      })
      .catch((e) => {
        setResult(null)
      })
  }, [taskId])

  return (
    <div>
      <Appbar />
      {result ? (
        <>
          <div className="text-2xl pt-20 flex justify-center">
            Task #{taskId} {taskDetails.title}
          </div>
          <div className="flex justify-center pt-8">
            {Object.keys(result || {}).map((taskId) => (
              <Task
                imageUrl={result[taskId].option.imageUrl}
                votes={result[taskId].count}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-2xl pt-20 flex justify-center">
          No task available with this task id
        </div>
      )}
    </div>
  )
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
  return (
    <div>
      <img className={'p-2 w-96 rounded-md'} src={imageUrl} />
      <div className="flex justify-center">{votes}</div>
    </div>
  )
}
