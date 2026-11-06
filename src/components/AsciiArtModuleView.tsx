import React, { useEffect } from 'react';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { VideoAsciiSplitCanvas } from './generative/VideoAsciiSplitCanvas';

export const AsciiArtModuleView: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return (
    <article className="space-y-8 animate-in fade-in duration-200">
      <header className="space-y-4 border-b border-[#E1E7E1] pb-6">
        <button type="button" onClick={onBackToHome} className="inline-flex items-center gap-2 text-sm font-semibold text-[#407B5D] hover:underline cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </button>
        <div className="space-y-3 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#407B5D]">Exploraciones con Processing · Módulo ASCII</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#232A24]">Arte ASCII: del video a los caracteres</h1>
          <p className="text-sm sm:text-base text-[#59645C] leading-relaxed">
            ¿Cómo puede una imagen en movimiento convertirse en letras y símbolos? En este módulo descubrirás cómo una misma regla transforma cada fotograma del caballo de Muybridge en una composición tipográfica.
          </p>
          <p className="text-sm text-[#59645C] leading-relaxed"><strong className="text-[#232A24]">Objetivo:</strong> comprender el muestreo de una imagen, la selección de caracteres mediante el brillo y el efecto de cambiar la escala de la retícula.</p>
        </div>
        <button type="button" onClick={() => document.getElementById('ascii-exploracion')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#407B5D] hover:bg-[#33654C] text-white text-sm font-semibold cursor-pointer">
          Explorar el ejemplo <ArrowDown className="w-4 h-4" />
        </button>
      </header>

      <section className="max-w-3xl space-y-4 text-sm leading-relaxed text-[#59645C]">
        <h2 className="text-xl font-bold text-[#232A24]">De píxeles a caracteres</h2>
        <p>El arte ASCII representa imágenes mediante caracteres. Aquí cada celda de una retícula recibe un símbolo y el color de un píxel del video. Al repetir la operación en cada fotograma, los caracteres reconstruyen el movimiento.</p>
        <ol className="list-decimal pl-5 space-y-4 marker:font-bold marker:text-[#407B5D]">
          <li><strong className="text-[#232A24]">Dividir el lienzo.</strong> La variable <code>escala</code> determina el tamaño de las celdas. En un lienzo de 1280 × 720, una escala de 10 produce 128 columnas y 72 filas. Las celdas más pequeñas conservan más detalle y requieren dibujar más caracteres.</li>
          <li><strong className="text-[#232A24]">Muestrear el video.</strong> Para cada celda se calcula una posición en el fotograma y se lee el color de ese píxel. En Processing, <code>video.loadPixels()</code> permite consultar estos colores en <code>video.pixels</code>.</li>
          <li><strong className="text-[#232A24]">Convertir el brillo en una posición.</strong> El ejemplo estima el brillo con el promedio de los canales rojo, verde y azul. Ese valor, entre 0 y 255, se transforma en un índice de la cadena <code>frase</code>: los valores oscuros eligen caracteres del final y los claros, del principio.</li>
          <li><strong className="text-[#232A24]">Dibujar y repetir.</strong> Se dibuja el carácter con el color muestreado sobre un fondo negro. La barra divisoria permite comparar el video original, a la izquierda, con el resultado ASCII, a la derecha.</li>
        </ol>
        <pre className="overflow-x-auto rounded-2xl bg-[#111612] p-4 text-xs sm:text-sm text-[#E8EEE8]"><code>{`float grises = (red(c) + green(c) + blue(c)) / 3;
int indice = int(map(grises, 0, 255, frase.length() - 1, 0));
String caracter = frase.substring(indice, indice + 1);
fill(c);
text(caracter, x * escala, y * escala);`}</code></pre>
        <p>La cadena de caracteres es una decisión visual: el programa utiliza su orden, sin analizar cuánto espacio ocupa cada símbolo. Cambiarla modifica la textura del resultado, aunque el video sea el mismo.</p>
      </section>

      <section id="ascii-exploracion" className="space-y-4 scroll-mt-24">
        <div className="space-y-2 max-w-3xl">
          <h2 className="text-xl font-bold text-[#232A24]">Observa, compara y experimenta</h2>
          <p className="text-sm leading-relaxed text-[#59645C]">Arrastra la división para comparar ambas representaciones. Usa <strong>0% (Todo ASCII)</strong> para observar únicamente los caracteres y <strong>100% (Todo Video)</strong> para volver al original.</p>
        </div>
        <VideoAsciiSplitCanvas defaultVideoSrc="/video.mp4" />
        <ol className="max-w-3xl list-decimal pl-5 space-y-3 text-sm leading-relaxed text-[#59645C] marker:font-bold marker:text-[#407B5D]">
          <li><strong className="text-[#232A24]">Cambia la escala de 6 a 18.</strong> Observa cuándo reconoces mejor al caballo y cuándo predominan las letras. ¿Qué se pierde al aumentar el tamaño de las celdas?</li>
          <li><strong className="text-[#232A24]">Abre Ajustes y cambia la cadena.</strong> Prueba solo dos símbolos, como <code>.@</code>, y después una cadena más larga. Invierte el orden y compara la textura.</li>
          <li><strong className="text-[#232A24]">Prueba otra fuente.</strong> Selecciona Generativo o un video de tu computadora con Subir MP4. Comprueba qué partes del resultado dependen del video y cuáles de la regla que lo transforma.</li>
        </ol>
      </section>

      <section className="max-w-3xl space-y-4 text-sm leading-relaxed text-[#59645C]">
        <h2 className="text-xl font-bold text-[#232A24]">Llévalo a Processing Java</h2>
        <p>La versión de esta página se ejecuta en el navegador. Para trabajar en tu computadora, utiliza el ejemplo de Processing Java disponible en <strong>Ver Código Java</strong>, dentro del visor.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Crea un sketch en Processing, en modo Java, e instala la biblioteca Video desde el gestor de bibliotecas.</li>
          <li>Copia el código del visor al sketch. Su instrucción <code>import processing.video.*;</code> utiliza esa biblioteca.</li>
          <li>Guarda el video como <code>video.mp4</code> en la carpeta <code>data</code> del sketch. Puedes descargar el video del ejemplo con el enlace de abajo.</li>
          <li>Ejecuta el sketch y mueve el mouse para desplazar la división. En el código, modifica <code>escala</code> y <code>frase</code> para experimentar con otros resultados.</li>
        </ol>
        <div className="flex flex-wrap gap-4 font-semibold text-[#407B5D]">
          <a href="/video.mp4" download="video.mp4" className="underline underline-offset-2">Descargar video del ejemplo</a>
          <a href="https://processing.org/reference/libraries/video/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Referencia de la biblioteca Video</a>
        </div>
      </section>

      <section className="max-w-3xl border-t border-[#E1E7E1] pt-6 space-y-3 text-sm leading-relaxed text-[#59645C]">
        <h2 className="text-xl font-bold text-[#232A24]">Para reflexionar</h2>
        <p>¿Qué información del video conservas al representarlo con caracteres? ¿Cómo afectan la escala y la cadena a la legibilidad? Explica qué cambiaste y qué observaste: una misma regla puede generar distintas imágenes al variar sus parámetros.</p>
        <button type="button" onClick={onBackToHome} className="inline-flex items-center gap-2 text-[#407B5D] font-semibold hover:underline cursor-pointer"><ArrowLeft className="w-4 h-4" /> Volver al inicio</button>
      </section>
    </article>
  );
};
