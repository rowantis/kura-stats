import { useEffect, useState } from "react";

const TOKEN_PRICE_URL = 'https://d2x575fb6ivzxl.cloudfront.net/tokenPrice.json';

interface TokenPrice {
  data: {
    [key: string]: number
  },
  timestamp: number
}

export const useTokenPrices = () => {
  const [tokenPrices, setTokenPrices] = useState<TokenPrice>({
    data: {},
    timestamp: 0,
  })
  useEffect(() => {
    const fetchTokenPrices = async () => {
      const response = await fetch(TOKEN_PRICE_URL)
      const data = await response.json()
      console.log("fetchTokenPrices", data)
      setTokenPrices(data)
    }
    fetchTokenPrices()
  }, [])
  return tokenPrices
}
