import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import './custom.css'

import MermaidDiagram from './components/MermaidDiagram.vue'
import DiagramGallery from './components/DiagramGallery.vue'
import QrShareCard from './components/QrShareCard.vue'
import ProductReelPlayer from './components/ProductReelPlayer.vue'
import LandingShowcase from './components/LandingShowcase.vue'
import InteractivePdpDemo from './components/InteractivePdpDemo.vue'
import LocalQuickstart from './components/LocalQuickstart.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('DiagramGallery', DiagramGallery)
    app.component('QrShareCard', QrShareCard)
    app.component('ProductReelPlayer', ProductReelPlayer)
    app.component('LandingShowcase', LandingShowcase)
    app.component('InteractivePdpDemo', InteractivePdpDemo)
    app.component('LocalQuickstart', LocalQuickstart)
  }
} satisfies Theme
