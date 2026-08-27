import { Router, Request, Response } from 'express'
import { getAllNotifications, markNotificationRead, markAllNotificationsRead } from '../utils/firestore'

const router = Router()

// GET /api/notifications - List all notifications
router.get('/', async (_req: Request, res: Response) => {
  try {
    const notifications = await getAllNotifications()
    res.json({ notifications })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// PATCH /api/notifications/:id/read - Mark one read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    await markNotificationRead(id)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// PATCH /api/notifications/read-all - Mark all read
router.patch('/read-all', async (_req: Request, res: Response) => {
  try {
    await markAllNotificationsRead()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
