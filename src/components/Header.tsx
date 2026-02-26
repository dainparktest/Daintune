import { Box, Text } from "ink"
import React from "react"


const Header = () => {
  return (
    <Box flexDirection="column" gap={1}>
    <Text color="green" bold>gmusic</Text>
    <Text color="gray">YouTube Music CLI Player</Text>
  </Box>
  )
}

export default Header