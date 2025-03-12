// app/api/shopping-list/clear/route.ts
import { NextResponse } from 'next/server'
import { getData, saveData } from '../data-service'

export async function DELETE() {
  try {
    const data = await getData()

    // Vymažeme všechny položky
    data.items = []
    await saveData(data)

    return NextResponse.json({ message: 'Všechny položky byly smazány' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Chyba při mazání všech položek' }, { status: 500 })
  }
}
