import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { KuraPosition } from '@/types/graphql'

interface UseKuraPositionsReturn {
  positions: KuraPosition[]
  loading: boolean
  error: any
}

export function useKuraPositions(): UseKuraPositionsReturn {
  const { loading, error, data } = useQuery(gql`
    query GetKuraPositions {
      xshadowPositions {
        stakedBalance
        vestedBalance
        x33Balance
        balance
        owner
      }
      xshadowVests {
        vestingAmount
        owner
        status
      }
    }
  `, {
    fetchPolicy: 'cache-and-network',
  })

  const positions: KuraPosition[] = data ? data.xshadowPositions.map((pos: any) => ({
    user: pos.owner,
    kura: '0', // 우선 0으로 설정
    xkura: pos.balance || '0',
    stXkura: pos.stakedBalance || '0',
    k33: pos.x33Balance || '0',
    vesting: pos.vestedBalance || '0'
  })) : []

  return {
    positions,
    loading,
    error
  }
} 