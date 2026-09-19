import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'

vi.mock('../map/MapView', () => ({
  MapView: () => <div aria-label="Mapa moderno interactivo del centro de Granada" />,
}))

describe('App', () => {
  it('identifica el mapa y el periodo histórico', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Granada Histórica' })).toBeVisible()
    expect(screen.getByText('Granada, c. 1492')).toBeVisible()
    expect(
      screen.getByLabelText('Mapa moderno interactivo del centro de Granada'),
    ).toBeVisible()
  })

  it('abre y cierra el panel de capas', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Capas' }))
    expect(screen.getByRole('heading', { name: 'Capas' })).toBeVisible()
    expect(screen.getByText('Los datos revisados empiezan en M2')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Cerrar el panel de capas' }))
    expect(screen.queryByRole('heading', { name: 'Capas' })).not.toBeInTheDocument()
  })

  it('abre y cierra el panel informativo', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Acerca del mapa' }))
    expect(
      screen.getByRole('heading', { name: 'Una ciudad reconstruida con rigor' }),
    ).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Cerrar el panel informativo' }))
    expect(
      screen.getByRole('complementary', { hidden: true }),
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
