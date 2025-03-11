// src/app/api/shopping-list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cesta k JSON souboru
const filePath = path.join(process.cwd(), 'data', 'shopping-list.json');

// Zajisti existenci složky data
const dataDirectory = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
}

// Zajisti existenci JSON souboru
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ items: [] }));
}

// Typ pro položku nákupního seznamu
export type ShoppingItem = {
    id: string;
    name: string;
    quantity: number;
    description?: string;
    completed: boolean;
    createdAt: string;
};

// Typ pro celý seznam
export type ShoppingListData = {
    items: ShoppingItem[];
};

// GET handler
export async function GET() {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileContents) as ShoppingListData);
}

// POST handler
export async function POST(request: NextRequest) {
    const body = await request.json();
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents) as ShoppingListData;

    const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: body.name,
        quantity: body.quantity || 1,
        description: body.description || '',
        completed: false,
        createdAt: new Date().toISOString()
    };

    data.items.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(data));

    return NextResponse.json(newItem);
}

// PUT handler
export async function PUT(request: NextRequest) {
    const body = await request.json();
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents) as ShoppingListData;

    const itemIndex = data.items.findIndex(item => item.id === body.id);
    if (itemIndex !== -1) {
        data.items[itemIndex] = { ...data.items[itemIndex], ...body };
        fs.writeFileSync(filePath, JSON.stringify(data));
        return NextResponse.json(data.items[itemIndex]);
    } else {
        return NextResponse.json({ message: 'Položka nenalezena' }, { status: 404 });
    }
}

// DELETE handler
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'ID je povinné' }, { status: 400 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents) as ShoppingListData;

    data.items = data.items.filter(item => item.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(data));

    return NextResponse.json({ message: 'Položka smazána' });
}