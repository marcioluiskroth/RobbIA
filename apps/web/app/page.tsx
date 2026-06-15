import { redirect } from 'next/navigation'

/** Entrada do app → surface inicial do workspace (lista de Harnesses). */
export default function Home() {
  redirect('/harnesses')
}
