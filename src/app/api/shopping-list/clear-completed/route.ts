// app/api/shopping-list/clear-completed/route.ts
import { NextResponse } from 'next/server'
import { getData, saveData } from '../data-service'

export async function DELETE() {
  try {
    const data = await getData()

    // Ponecháme pouze nedokončené položky
    data.items = data.items.filter((item) => !item.completed)
    await saveData(data)

    return NextResponse.json({ message: 'Dokončené položky byly smazány' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Chyba při mazání dokončených položek' }, { status: 500 })
  }
}
