import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { App } from './App'

vi.mock('../map/MapView', () => ({
  MapView: ({ onSelectFeature }: { onSelectFeature: (featureId: string) => void }) => (
    <div aria-label="Mapa moderno interactivo del centro de Granada">
      <button
        type="button"
        onClick={() => onSelectFeature('gate.elvira')}
      >
        Seleccionar la Puerta de Elvira en el mapa
      </button>
    </div>
  ),
}))

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

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
    expect(screen.getByLabelText('Contexto actual')).toBeChecked()
    expect(screen.getByLabelText('Opacidad de la superposición histórica')).toHaveValue('0.85')

    await user.click(screen.getByLabelText('Contexto actual'))
    expect(screen.getByLabelText('Contexto actual')).not.toBeChecked()

    fireEvent.change(screen.getByLabelText('Opacidad de la superposición histórica'), {
      target: { value: '0.5' },
    })
    expect(screen.getByLabelText('Opacidad de la superposición histórica')).toHaveValue('0.5')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('heading', { name: 'Capas' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Capas' })).toHaveFocus()
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
      screen.getByRole('dialog', { hidden: true }),
    ).toHaveAttribute('aria-hidden', 'true')
  })

  it('abre la ficha histórica al seleccionar una entidad del mapa', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Seleccionar la Puerta de Elvira en el mapa' }),
    )

    expect(screen.getByRole('heading', { name: 'Puerta de Elvira' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '¿Cómo lo sabemos?' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Fuentes' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Castillo de la Puerta de Elvira' })).toBeVisible()
    expect(new URL(window.location.href).searchParams.get('feature')).toBe('gate.elvira')
  })

  it('busca sin distinguir acentos y permite seleccionar con el teclado', async () => {
    const user = userEvent.setup()
    render(<App />)

    const search = screen.getByRole('combobox', {
      name: 'Buscar en la Granada histórica',
    })
    await user.type(search, 'Albayzin')

    expect(screen.getByRole('option', { name: /Albaicín nazarí/ })).toBeVisible()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Albaicín nazarí' })).toBeVisible()
    expect(new URL(window.location.href).searchParams.get('feature')).toBe('urban.albaicin')
  })

  it('restaura una selección válida desde la URL y responde al historial', async () => {
    window.history.replaceState({}, '', '/?feature=gate.elvira')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Puerta de Elvira' })).toBeVisible()

    window.history.pushState({}, '', '/?feature=water.darro')
    window.dispatchEvent(new PopStateEvent('popstate'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Río Darro' })).toBeVisible()
    })
  })
})
