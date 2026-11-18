"use client"

import React from "react"
import { Dialog } from "@/components/ui/dialog"
import { ShieldCheck, AlertTriangle, Scale, CheckCircle2, X, FileText } from "lucide-react"

interface TermsModalProps {
  open: boolean
  onClose: () => void
  onAccept?: () => void
}

export function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Términos, Condiciones y Exoneración de Responsabilidad"
      hideTitle={true}
      hideCloseButton={true}
      className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-primary/20 bg-card dark:bg-[#0c0e14] shadow-2xl"
    >
      {/* Header Rediseñado con Jerarquía Visual y Botón Cerrar Elegante */}
      <div className="shrink-0 px-6 py-4 sm:py-5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.02] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Contrato & Reglamento Oficial
            </span>
            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-snug truncate">
              Términos, Condiciones y Exoneración
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              Deslinde legal de responsabilidad civil, médica y protección a menores
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="w-9 h-9 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-primary/15 hover:text-primary hover:border-primary/40 text-muted-foreground transition-all flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenido con Scroll por Rueda del Mouse SIN Barra Visual Visible */}
      <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain p-6 space-y-5 text-sm text-foreground/90">
        {/* Banner de blindaje */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-bold text-amber-500 uppercase tracking-wider">
              Aviso Legal Importante para Atletas y Representantes
            </p>
            <p className="text-muted-foreground">
              El acceso, registro y permanencia en las instalaciones de Maximum Evolution Fit implican la aceptación plena e incondicional del presente reglamento y la exoneración absoluta de cualquier responsabilidad al gimnasio, sus dueños, entrenadores y empleados.
            </p>
          </div>
        </div>

        {/* Cláusula 1 */}
        <section className="space-y-2 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Scale className="w-4 h-4 shrink-0" />
            <h4 className="text-sm uppercase tracking-wide">1. Declaración de Aptitud Física y Asunción de Riesgo</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-6">
            El atleta declara bajo juramento encontrarse en óptimas condiciones físicas y de salud para realizar actividad física de alto impacto y levantamiento de pesas. El usuario asume voluntariamente el 100% del riesgo inherente al entrenamiento deportivo, liberando de toda responsabilidad civil, médica o penal al gimnasio frente a cualquier percance, sobreesfuerzo, lesión, descompensación o daño físico acaecido en las instalaciones.
          </p>
        </section>

        {/* Cláusula 2 - Menores de edad (Blindaje total) */}
        <section className="space-y-2.5 p-4 rounded-2xl bg-primary/5 border border-primary/25 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-extrabold">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <h4 className="text-sm uppercase tracking-wide">2. Cláusula Estricta de Menores de 18 Años</h4>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2 pl-7">
            <p>
              Para todo atleta menor de 18 años de edad, su inscripción y asistencia requiere la expresa autorización, nombre, cédula y número telefónico de su padre, madre o representante legal.
            </p>
            <p className="text-foreground/90 font-medium">
              El representante legal asume en su totalidad e indivisiblemente la patria potestad, custodia, vigilancia y responsabilidad civil, médica y patrimonial por los actos y el bienestar físico del menor. 
            </p>
            <p>
              El gimnasio, sus directivos, administradores, entrenadores y personal de turno quedan <strong className="text-foreground font-bold">ABSOLUTA E IRREVOCABLEMENTE EXONERADOS</strong> de cualquier responsabilidad por lesiones, caídas, mal uso o desprendimiento de pesas o discos, incidentes musculares u osteoarticulares que sufra o cause el menor dentro de las instalaciones. El representante legal renuncia expresa e irrevocablemente a cualquier acción o demanda legal contra el centro deportivo.
            </p>
          </div>
        </section>

        {/* Cláusula 3 - Pertenencias */}
        <section className="space-y-2 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Scale className="w-4 h-4 shrink-0" />
            <h4 className="text-sm uppercase tracking-wide">3. Deslinde por Pertenencias Personales</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-6">
            El gimnasio no se hace responsable en ningún caso por la pérdida, extravío, deterioro o hurto de teléfonos celulares, dinero en efectivo, prendas, joyas, bolsos o cualquier objeto de valor ingresado a las instalaciones, áreas de lockers o sanitarios. La custodia de los bienes personales es responsabilidad exclusiva de cada usuario.
          </p>
        </section>

        {/* Cláusula 4 - Normas de Convivencia y Derecho de Expulsión */}
        <section className="space-y-2 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Scale className="w-4 h-4 shrink-0" />
            <h4 className="text-sm uppercase tracking-wide">4. Disciplina, Uso de Toalla y Derecho de Admisión</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-6">
            Es obligatorio el uso de toalla personal y calzado deportivo adecuado. Los atletas deben reubicar las mancuernas, barras y discos en sus respectivos racks tras utilizarlos. Queda estrictamente prohibido arrojar pesas al suelo de forma deliberada. El gimnasio se reserva el derecho de admisión y permanencia; cualquier conducta indebida, ofensiva o destructiva acarreará la rescisión inmediata de la membresía sin derecho a compensación o devolución.
          </p>
        </section>

        {/* Cláusula 5 - Membresías y Pagos */}
        <section className="space-y-2 p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Scale className="w-4 h-4 shrink-0" />
            <h4 className="text-sm uppercase tracking-wide">5. Membresías No Reembolsables e Intransferibles</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pl-6">
            Los planes y pagos de mensualidad son estrictamente individuales e intransferibles. Una vez procesado el pago o activada la membresía no se efectuarán reembolsos de dinero, transferencias de titularidad ni congelamientos retrospectivos de tiempo no utilizado.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 px-6 bg-muted/30 border-t border-border flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Maximum Evolution Fit &bull; Reglamento Oficial 2026
        </span>
        <div className="flex items-center gap-2">
          {onAccept ? (
            <button
              type="button"
              onClick={() => {
                onAccept()
                onClose()
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Aceptar y Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer"
            >
              Entendido y Cerrar
            </button>
          )}
        </div>
      </div>
    </Dialog>
  )
}
