import { Router } from 'express'

const router = Router()

let cachedChinaGeo: any = null
let lastFetchTime = 0
const ONE_DAY = 24 * 60 * 60 * 1000

router.get('/china', async (req, res) => {
  try {
    if (cachedChinaGeo && Date.now() - lastFetchTime < ONE_DAY) {
      return res.json(cachedChinaGeo)
    }

    const resp = await fetch('https://geo.datav.aliyun.com/areas_v2/bound/100000_full.json')
    const json = await resp.json()

    cachedChinaGeo = json
    lastFetchTime = Date.now()

    res.json(json)
  } catch (e) {
    if (cachedChinaGeo) {
      return res.json(cachedChinaGeo)
    }
    res.status(500).json({ error: 'fetch geo failed' })
  }
})

export default router