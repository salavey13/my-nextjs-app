import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HackButton from '@/components/HackButton'
import { AppProvider } from '@/context/AppContext'

describe('HackButton', () => {
  it('renders correctly', () => {
    render(
      <AppProvider>
        <HackButton />
      </AppProvider>
    )
    expect(screen.getByText('Hack')).toBeInTheDocument()
  })

  it('increases coins when clicked', async () => {
    render(
      <AppProvider>
        <HackButton />
      </AppProvider>
    )
    const button = screen.getByText('Hack')
    fireEvent.click(button)
    // Add assertions to check if coins increased
    // For example:
    // await waitFor(() => {
    //   expect(screen.getByText(/Coins: \d+/)).toHaveTextContent('Coins: 1000')
    // })
  })
})