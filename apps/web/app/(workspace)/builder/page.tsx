import type { Metadata } from 'next'
import { BuilderWorkspace } from '@/components/builder/builder-workspace'

export const metadata: Metadata = { title: 'Builder · RobbIA' }

/**
 * Bancada do Builder — descreva na Conversa e a IA Arquiteta propõe um Harness, exibido
 * como cards (centro) + fluxo (direita) + lista acessível. Estado orquestrado pelo
 * `BuilderWorkspace` (client); a geração roda num server action.
 */
export default function BuilderPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">Builder</h1>
      <BuilderWorkspace />
    </div>
  )
}
