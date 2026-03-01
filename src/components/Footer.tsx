import { Box, Text } from "ink"
import React from "react"

const Footer = ({ description }: { description: string }) => {
  return (
    <Text color="gray">{description}</Text>
  )
}

export default Footer