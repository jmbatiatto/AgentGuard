import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import './custom.css'

import MermaidDiagram from './components/MermaidDiagram.vue'
import DiagramGallery from './components/DiagramGallery.vue'
import QrShareCard from './components/QrShareCard.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('DiagramGallery', DiagramGallery)
    app.component('QrShareCard', QrShareCard)
  }
} satisfies Theme
