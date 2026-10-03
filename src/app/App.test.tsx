import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { internalComparisonDataset } from '../data/internalComparisonData'
import { App } from './App'

const loadInternalComparison = async () => internalComparisonDataset

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
    window.history.replaceState({}, '', '/?lang=es')
  })

  it('identifica el mapa y el periodo histórico', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Granada Histórica' })).toBeVisible()
    expect(screen.getByText('Granada, c. 1492')).toBeVisible()
    expect(
      await screen.findByLabelText('Mapa moderno interactivo del centro de Granada'),
    ).toBeVisible()
    expect(screen.queryByTestId('internal-period-selector')).not.toBeInTheDocument()
  })

  it('abre y cierra el panel de capas', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Capas' }))
    expect(screen.getByRole('heading', { name: 'Capas' })).toBeVisible()
    expect(screen.getByLabelText('Superposición histórica')).toBeChecked()
    expect(screen.getByLabelText('Contexto actual')).toBeChecked()
    const modernStrength = screen.getByRole('slider', {
      name: 'Intensidad del contexto actual',
    })
    expect(modernStrength).toHaveValue('0.55')
    expect(screen.getByLabelText('Opacidad de la superposición histórica')).toHaveValue('0.85')

    fireEvent.change(modernStrength, {
      target: { value: '0.4' },
    })
    expect(modernStrength).toHaveValue('0.4')

    await user.click(screen.getByLabelText('Contexto actual'))
    expect(screen.getByLabelText('Contexto actual')).not.toBeChecked()
    expect(modernStrength).toBeDisabled()

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
    expect(document.querySelector('.feature-drawer')).toHaveAttribute('aria-hidden', 'true')
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
    expect(new URL(window.location.href).searchParams.get('period')).toBe('c1492')
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
    window.history.replaceState({}, '', '/?feature=gate.elvira&lang=es')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Puerta de Elvira' })).toBeVisible()

    act(() => {
      window.history.pushState({}, '', '/?feature=water.darro')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Río Darro' })).toBeVisible()
    })
  })

  it('abre una parada M7 desde su URL durable y conserva la ruta al abrir la ficha', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', '/granada-historica/place/bib-rambla/?lang=es')
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Puerta de Bibarrambla' })).toBeVisible()
    expect(screen.getByText('Parada 1 de 5')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Abrir la ficha histórica completa' }))
    expect(screen.getByRole('heading', { name: 'Puerta de Bibarrambla' })).toBeVisible()
    expect(window.location.pathname).toBe('/granada-historica/place/bib-rambla/')
    expect(new URL(window.location.href).searchParams.get('feature')).toBe('gate.bib-rambla')

    await user.click(screen.getByRole('button', { name: 'Cerrar el panel informativo' }))
    expect(screen.getByText('Parada 1 de 5')).toBeVisible()
    expect(new URL(window.location.href).searchParams.has('feature')).toBe(false)
  })

  it('muestra la traducción inglesa del piloto', () => {
    window.history.replaceState({}, '', '/granada-historica/place/mezquita-mayor/?lang=en')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Great Mosque of the medina' })).toBeVisible()
    expect(screen.getByText('Stop 5 of 5')).toBeVisible()
  })

  it('restaura el idioma elegido mediante el historial', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', '/granada-historica/place/bib-rambla/?lang=es')
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Cambiar idioma a inglés' }))
    expect(screen.getByRole('heading', { name: 'Bibarrambla Gate' })).toBeVisible()
    expect(new URL(window.location.href).searchParams.get('lang')).toBe('en')

    act(() => {
      window.history.back()
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Puerta de Bibarrambla' })).toBeVisible()
    })
  })

  it('carga el corte interno solo con el flag y conserva periodo y entidad en la URL', async () => {
    const user = userEvent.setup()
    window.history.replaceState(
      {},
      '',
      '/granada-historica/?period=c1550&feature=royal.palace-charles-v&lang=es',
    )
    render(<App internalComparisonLoader={loadInternalComparison} />)

    expect(await screen.findByRole('heading', { name: 'Palacio de Carlos V' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'c. 1550' })).toBeChecked()
    expect(screen.getByText('Nueva construcción')).toBeVisible()
    expect(screen.getByText('En construcción')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Fuentes' })).toBeVisible()
    expect(screen.getByText('Estado de investigación — no aprobado para publicación')).toBeVisible()
    expect(screen.getByText(/6 de 6 aprobaciones pendientes/)).toBeVisible()
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow')

    await user.click(screen.getByRole('radio', { name: 'c. 1492' }))
    expect(screen.getByRole('heading', { name: 'Palacio de Carlos V' })).toBeVisible()
    expect(screen.getByText('Aún no presente hacia 1492')).toBeVisible()
    expect(screen.getByText('Sigues viendo c. 1492.')).toBeVisible()
    expect(new URL(window.location.href).searchParams.get('period')).toBe('c1492')
    expect(new URL(window.location.href).searchParams.get('feature')).toBe('royal.palace-charles-v')

    await user.click(screen.getByRole('button', { name: 'Ver en c. 1550' }))
    expect(await screen.findByText('En construcción')).toBeVisible()
    expect(new URL(window.location.href).searchParams.get('period')).toBe('c1550')
  })

  it('muestra Fajalauza como punto de sitio privado y en revisión en c. 1550', async () => {
    const user = userEvent.setup()
    window.history.replaceState(
      {},
      '',
      '/granada-historica/?period=c1492&feature=gate.fajalauza&lang=en',
    )
    render(<App internalComparisonLoader={loadInternalComparison} />)

    await user.click(await screen.findByRole('radio', { name: 'c. 1550' }))
    expect(screen.getByRole('heading', { name: 'Fajalauza Gate' })).toBeVisible()
    expect(screen.getByText('Research state — not approved for publication')).toBeVisible()
    expect(screen.getByText(/probably continued as an enclosure passage around 1550/)).toBeVisible()
    expect(screen.queryByText('Not represented in this review slice')).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'c. 1550' })).toBeChecked()
  })

  it('restaura periodo y entidad internos mediante el historial', async () => {
    window.history.replaceState({}, '', '/granada-historica/?period=c1492&lang=es')
    render(<App internalComparisonLoader={loadInternalComparison} />)
    await screen.findByRole('radio', { name: 'c. 1550' })

    act(() => {
      window.history.pushState(
        {},
        '',
        '/granada-historica/?period=c1550&feature=gate.puerta-granadas&lang=es',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(await screen.findByRole('heading', { name: 'Puerta de las Granadas' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'c. 1550' })).toBeChecked()
  })

  it('ignora c1550 en el modo público y no expone su selector', () => {
    window.history.replaceState(
      {},
      '',
      '/granada-historica/?period=c1550&feature=gate.elvira&lang=es',
    )
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Puerta de Elvira' })).toBeVisible()
    expect(screen.getByText('Granada, c. 1492')).toBeVisible()
    expect(screen.queryByTestId('internal-period-selector')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Comparar en c\. 1550/ })).not.toBeInTheDocument()
  })

  it('presenta una conversión como cambio material y funcional, no como demolición', async () => {
    window.history.replaceState(
      {},
      '',
      '/granada-historica/?period=c1550&feature=religious.madraza-yusufiyya&lang=es',
    )
    render(<App internalComparisonLoader={loadInternalComparison} />)

    expect(await screen.findByRole('heading', { name: 'Casa del Cabildo (antigua Madraza Yusufiyya)' })).toBeVisible()
    expect(screen.getByText('Convertido')).toBeVisible()
    expect(screen.getByText('Completo')).toBeVisible()
    expect(screen.getByText(/El mismo edificio cambió de institución/)).toBeVisible()
  })

  it('separa la identidad estable del relato de periodo en el Eje de Elvira', async () => {
    window.history.replaceState(
      {},
      '',
      '/granada-historica/?period=c1550&feature=route.elvira-axis&lang=es',
    )
    render(<App internalComparisonLoader={loadInternalComparison} />)

    expect(await screen.findByRole('heading', { name: 'Eje de Elvira' })).toBeVisible()
    expect(screen.getByText(
      'Corredor histórico de la ciudad entre el centro urbano y la Puerta de Elvira.',
    )).toHaveClass('drawer-lede')
    const periodSection = screen.getByRole('heading', { name: '¿Qué había aquí hacia 1550?' })
      .closest('section')
    expect(periodSection).toHaveTextContent('La calle Elvira conservaba hacia 1550')
    expect(screen.getByRole('heading', { name: '¿Qué función cumplía hacia 1550?' })).toBeVisible()
  })
})
