import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'

vi.mock('../map/MapView', () => ({
  MapView: () => <div aria-label="Interactive modern map of central Granada" />,
}))

describe('App', () => {
  it('identifies the map and historical period', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Granada Histórica' })).toBeVisible()
    expect(screen.getByText('Granada, c. 1492')).toBeVisible()
    expect(
      screen.getByLabelText('Interactive modern map of central Granada'),
    ).toBeVisible()
  })

  it('opens and closes the layer shell', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Layers' }))
    expect(screen.getByRole('heading', { name: 'Layers' })).toBeVisible()
    expect(screen.getByText('Reviewed data begins in M2')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Close layers' }))
    expect(screen.queryByRole('heading', { name: 'Layers' })).not.toBeInTheDocument()
  })

  it('opens and closes the information drawer', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'About this map' }))
    expect(
      screen.getByRole('heading', { name: 'A city, carefully reconstructed' }),
    ).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Close information panel' }))
    expect(
      screen.getByRole('complementary', { hidden: true }),
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
