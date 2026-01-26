export type MapPoolEntry = {
  mapId: string
  mapName: string
  thumbnail: string
  isActive: boolean
  lastUpdated: string
}

export type MapPoolProvider = () => Promise<MapPoolEntry[]>

const MAP_POOL_URL = '/mapPool.json'

const defaultProvider: MapPoolProvider = async () => {
  const response = await fetch(MAP_POOL_URL)
  if (!response.ok) {
    throw new Error('Map pool JSON could not be loaded.')
  }
  const data = (await response.json()) as MapPoolEntry[]
  return data
}

let activeProvider: MapPoolProvider = defaultProvider

export const MapPoolManager = {
  setProvider(provider: MapPoolProvider) {
    activeProvider = provider
  },
  async getActivePool() {
    const pool = await activeProvider()
    return pool.filter((map) => map.isActive)
  },
}
