import { NextRequest, NextResponse } from 'next/server';
import { getData, saveData, ShoppingItem } from './data-service';

export async function GET() {
    try {
        const data = await getData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Chyba při získávání dat' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await getData();

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name: body.name,
            quantity: body.quantity || 1,
            description: body.description || '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        data.items.push(newItem);
        await saveData(data);

        return NextResponse.json(newItem);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Chyba při přidávání položky' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await getData();

        const itemIndex = data.items.findIndex(item => item.id === body.id);
        if (itemIndex !== -1) {
            data.items[itemIndex] = { ...data.items[itemIndex], ...body };
            await saveData(data);
            return NextResponse.json(data.items[itemIndex]);
        } else {
            return NextResponse.json({ message: 'Položka nenalezena' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Chyba při aktualizaci položky' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID je povinné' }, { status: 400 });
        }

        const data = await getData();
        data.items = data.items.filter(item => item.id !== id);
        await saveData(data);

        return NextResponse.json({ message: 'Položka smazána' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Chyba při mazání položky' }, { status: 500 });
    }
}