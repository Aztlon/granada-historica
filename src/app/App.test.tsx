import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'

vi.mock('../map/MapView', () => ({
  MapView: ({ onSelectFeature }: { onSelectFeature: (featureId: string) => void }) => (
    <div aria-label="Mapa moderno interactivo del centro de Granada">
      <button
        type="button"
        onClick={() => onSelectFeature('religious.madraza-yusufiyya')}
      >
        Seleccionar la Madraza en el mapa
      </button>
    </div>
  ),
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
    expect(screen.getByLabelText('Superposición histórica')).toBeChecked()

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

  it('abre la ficha histórica al seleccionar una entidad del mapa', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Seleccionar la Madraza en el mapa' }),
    )

    expect(screen.getByRole('heading', { name: 'Madraza Yusufiyya' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '¿Cómo lo sabemos?' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Fuentes' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Sobre el Palacio de la Madraza' })).toBeVisible()
  })
})
