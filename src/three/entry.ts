import {TCanvas} from './TCanvas'
import {qs} from './utils'

// Only create if not a mobile device
//if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  const m_canvas = new TCanvas(qs<HTMLDivElement>('.webgl-canvas__container'));

  window.addEventListener('beforeunload', () => {
    m_canvas.dispose()
  })
//} else {
//  console.log('Mobile device detected! WebGLCanvas not created.')
//}